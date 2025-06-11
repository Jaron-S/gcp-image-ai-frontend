import { Firestore } from "@google-cloud/firestore";
import { Storage } from "@google-cloud/storage";
import { NextRequest, NextResponse } from "next/server";

let firestore: Firestore;
let storage: Storage;

// Check if the special environment variable is available
if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
	const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY);
	firestore = new Firestore({ credentials });
	storage = new Storage({ credentials });
} else {
	// Fallback for local development if the env var isn't set
	console.warn(
		"GCP credentials not found in environment variables. Falling back to default authentication."
	);
	firestore = new Firestore();
	storage = new Storage();
}

const BUCKET_NAME = "js-image-landing";

export async function GET(request: NextRequest) {
	try {
		const imagesCollection = firestore.collection("images");

		const snapshot = await imagesCollection
			.orderBy("processedTimestamp", "desc")
			.limit(4)
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
		console.error("Error fetching images:", error);
		return NextResponse.json(
			{ error: "Failed to fetch images" },
			{ status: 500 }
		);
	}
}
