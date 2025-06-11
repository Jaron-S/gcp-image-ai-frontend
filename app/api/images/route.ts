// app/api/images/route.ts

import { Firestore } from "@google-cloud/firestore";
import { Storage } from "@google-cloud/storage";
import { NextRequest, NextResponse } from "next/server";

// --- NEW DEBUGGING AND AUTHENTICATION LOGIC ---
let firestore: Firestore;
let storage: Storage;
let authError: string | null = null; // We'll store any startup error here

try {
	// This code runs when the function is initialized (the "cold start")
	console.log("Initializing Google Cloud clients...");

	if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
		console.log("Found GCP_SERVICE_ACCOUNT_KEY environment variable.");

		// This is the most likely point of failure. Let's wrap it.
		const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY);
		console.log("Successfully parsed credentials from environment variable.");

		// Check if the parsed object looks like a service account key
		if (!credentials.project_id || !credentials.private_key) {
			throw new Error(
				"Parsed credentials do not look like a valid service account key."
			);
		}
		console.log(`Initializing clients for project: ${credentials.project_id}`);

		firestore = new Firestore({ credentials });
		storage = new Storage({ credentials });

		console.log("Google Cloud clients initialized successfully.");
	} else {
		// This error will be thrown if the variable is missing entirely.
		throw new Error("GCP_SERVICE_ACCOUNT_KEY environment variable not found.");
	}
} catch (e) {
	// If ANY of the above steps fail, we catch the error here.
	const errorMessage = e instanceof Error ? e.message : String(e);
	authError = `Failed to initialize Google Cloud clients during cold start: ${errorMessage}`;
	console.error("!!! CRITICAL AUTHENTICATION ERROR !!!");
	console.error(authError);
}
// --- END OF NEW LOGIC ---

// IMPORTANT: Replace with your BUCKET name that contains the processed images
const BUCKET_NAME = "js-image-landing"; // <-- Make sure this is correct

export async function GET(request: NextRequest) {
	console.log("--- /api/images GET endpoint hit ---");

	// If authentication failed when the function started, return an error immediately.
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
		const imagesCollection = firestore.collection("images");
		const snapshot = await imagesCollection
			.orderBy("processedTimestamp", "desc")
			.limit(6)
			.get();

		if (snapshot.empty) {
			return NextResponse.json([]);
		}

		const images = await Promise.all(
			snapshot.docs.map(async (doc) => {
				const data = doc.data();
				const file = storage.bucket(BUCKET_NAME).file(data.fileName);

				const [url] = await file.getSignedUrl({
					action: "read",
					expires: Date.now() + 60 * 60 * 1000, // 1 hour
				});

				return {
					id: doc.id,
					...data,
					imageUrl: url,
				};
			})
		);

		return NextResponse.json(images);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error("Error fetching images from Firestore:", errorMessage);
		return NextResponse.json(
			{ error: "Failed to fetch images", details: errorMessage },
			{ status: 500 }
		);
	}
}
