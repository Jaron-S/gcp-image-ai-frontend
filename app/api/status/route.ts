import { Firestore } from "@google-cloud/firestore";
import { NextRequest, NextResponse } from "next/server";

let firestore: Firestore;
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
	} else {
		// This handles production on GCP/Cloud Run with an attached service account
		// AND local development using `gcloud auth application-default login`
		console.log(
			"GCP_SERVICE_ACCOUNT_KEY not found. Using Application Default Credentials."
		);
		firestore = new Firestore();
	}
	console.log("Google Cloud clients initialized successfully.");
} catch (e) {
	authError = `Failed to initialize Google Cloud clients: ${
		e instanceof Error ? e.message : String(e)
	}`;
	console.error("!!! CRITICAL AUTHENTICATION ERROR !!!", authError);
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
