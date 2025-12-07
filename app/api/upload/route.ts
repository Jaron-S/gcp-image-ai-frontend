import { Storage } from "@google-cloud/storage";
import { NextRequest, NextResponse } from "next/server";

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
		storage = new Storage({ credentials });
	} else {
		// This handles production on GCP/Cloud Run with an attached service account
		// AND local development using `gcloud auth application-default login`
		console.log(
			"GCP_SERVICE_ACCOUNT_KEY not found. Using Application Default Credentials."
		);
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

export async function POST(request: NextRequest) {
	try {
		const { filename, contentType } = await request.json();

		const options = {
			version: "v4" as const,
			action: "write" as const,
			expires: Date.now() + 15 * 60 * 1000, // 15 minutes
			contentType: contentType,
		};

		const [url] = await storage
			.bucket(BUCKET_NAME)
			.file(filename)
			.getSignedUrl(options);

		return NextResponse.json({ url });
	} catch (error) {
		console.error("Error creating signed URL:", error);
		return NextResponse.json(
			{ error: "Failed to create signed URL" },
			{ status: 500 }
		);
	}
}
