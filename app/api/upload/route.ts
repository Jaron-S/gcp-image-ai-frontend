import { Storage } from "@google-cloud/storage";
import { NextRequest, NextResponse } from "next/server";

const storage = new Storage({
	keyFilename:
		process.env.NODE_ENV === "production"
			? undefined
			: "./service-account-key.json",
});

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
