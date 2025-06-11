import { Firestore } from "@google-cloud/firestore";
import { NextRequest, NextResponse } from "next/server";

const firestore = new Firestore({
	keyFilename:
		process.env.NODE_ENV === "production"
			? undefined
			: "./service-account-key.json",
});

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
