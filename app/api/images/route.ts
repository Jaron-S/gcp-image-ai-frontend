import { Firestore } from "@google-cloud/firestore";
import { Storage } from "@google-cloud/storage";
import { NextResponse } from "next/server";

let firestore: Firestore;
let storage: Storage;
let authError: string | null = null;

try {
	console.log("Initializing Google Cloud clients...");

	// This check handles Netlify and local development via .env.local
	if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
		console.log(
			"Found GCP_SERVICE_ACCOUNT_KEY, initializing with credentials object."
		);
		const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY);
		firestore = new Firestore({ credentials });
		storage = new Storage({ credentials });
	} else {
		// This handles production on GCP/Cloud Run with an attached service account
		// AND local development using `gcloud auth application-default login`
		console.log(
			"GCP_SERVICE_ACCOUNT_KEY not found. Using Application Default Credentials."
		);
		firestore = new Firestore();
		storage = new Storage();
	}
	console.log("Google Cloud clients initialized successfully.");
} catch (e) {
	authError = `Failed to initialize Google Cloud clients: ${
		e instanceof Error ? e.message : String(e)
	}`;
	console.error("!!! CRITICAL AUTHENTICATION ERROR !!!", authError);
}

const BUCKET_NAME = "js-image-landing";

export async function GET() {
	console.log(
		`--- /api/images GET endpoint hit at ${new Date().toISOString()} ---`
	);

	if (authError || !firestore || !storage) {
		return NextResponse.json(
			{
				error:
					"Server configuration error. Could not initialize backend services.",
				details: authError,
			},
			{ status: 500 }
		);
	}

	try {
		console.log("Step 1: Querying Firestore for image documents...");
		const imagesCollection = firestore.collection("images");
		const snapshot = await imagesCollection
			.orderBy("processedTimestamp", "desc")
			.limit(4)
			.get();
		console.log(
			`Step 2: Firestore query successful. Found ${snapshot.size} documents.`
		);

		if (snapshot.empty) {
			return NextResponse.json([]);
		}

		console.log("Step 3: Generating Signed URLs for each document...");
		const images = await Promise.all(
			snapshot.docs.map(async (doc) => {
				const data = doc.data();
				const file = storage.bucket(BUCKET_NAME).file(data.fileName);

				const [url] = await file.getSignedUrl({
					action: "read",
					expires: Date.now() + 15 * 60 * 1000,
				});

				return {
					id: doc.id,
					...data,
					imageUrl: url,
				};
			})
		);

		console.log("Step 4: Successfully generated all signed URLs.");
		return NextResponse.json(images);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error("!!! ERROR inside GET handler !!!", errorMessage);
		return NextResponse.json(
			{ error: "Failed to fetch images", details: errorMessage },
			{ status: 500 }
		);
	}
}
