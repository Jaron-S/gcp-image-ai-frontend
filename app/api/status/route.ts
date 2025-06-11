import { Firestore } from "@google-cloud/firestore";
import { NextRequest, NextResponse } from "next/server";

let firestore: Firestore;

// Check if the special environment variable is available
if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
	const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY);
	firestore = new Firestore({ credentials });
} else {
	// Fallback for local development if the env var isn't set
	console.warn(
		"GCP credentials not found in environment variables. Falling back to default authentication."
	);
	firestore = new Firestore();
}

export async function GET(request: NextRequest) {
	// Get the filename from the URL query, e.g., /api/status?filename=my-photo.jpg
	const { searchParams } = new URL(request.url);
	const filename = searchParams.get("filename");

	if (!filename) {
		return NextResponse.json(
			{ error: "Filename is required" },
			{ status: 400 }
		);
	}

	try {
		const docRef = firestore.collection("images").doc(filename);
		const doc = await docRef.get();

		if (doc.exists) {
			// The document exists, meaning processing is complete
			return NextResponse.json({ status: "processed" });
		} else {
			// The document does not exist yet
			return NextResponse.json({ status: "pending" });
		}
	} catch (error) {
		console.error("Error checking document status:", error);
		return NextResponse.json(
			{ error: "Failed to check status" },
			{ status: 500 }
		);
	}
}
