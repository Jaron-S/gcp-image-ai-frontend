"use client";

import { ImageCard } from "@/components/ui/image-card";
import { ImageUpload } from "@/components/ui/image-upload";
import { AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type ImageData = {
	id: string;
	fileName: string;
	detectedLabels: string[];
	dominantColors: { red: number; green: number; blue: number }[];
	imageUrl: string;
};

export default function HomePage() {
	const [images, setImages] = useState<ImageData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// We've wrapped the fetching logic in a useCallback so we can pass it down
	// without causing unnecessary re-renders.
	const fetchImages = useCallback(async () => {
		try {
			const response = await fetch("/api/images");
			if (!response.ok) {
				throw new Error("Failed to fetch images.");
			}
			const data = await response.json();
			setImages(data);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "An unknown error occurred."
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchImages();
	}, [fetchImages]);

	return (
		<main className="container mx-auto px-4 py-8 md:px-8 md:py-12">
			<header className="text-center mb-12">
				<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
					Cloud Vision Showcase
				</h1>
				<p className="mt-3 max-w-2xl mx-auto text-lg md:text-xl text-gray-500">
					Upload an image to see it analyzed by Google&apos;s AI in real-time.
				</p>
			</header>

			<section className="mb-16">
				<ImageUpload onUploadSuccess={fetchImages} />
			</section>

			<div className="max-w-xl mx-auto mb-16 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
				<div className="flex items-center">
					<div className="flex-shrink-0">
						<AlertTriangle
							className="h-5 w-5 text-amber-500"
							aria-hidden="true"
						/>
					</div>
					<div className="ml-3">
						<p className="text-sm text-amber-800">
							<strong>Public Display Notice:</strong> For demonstration
							purposes, recently uploaded images are publicly visible to all
							visitors on this page.
						</p>
					</div>
				</div>
			</div>

			<section>
				<h2 className="text-3xl font-bold text-center mb-8">
					Processed Images
				</h2>
				{isLoading && <p className="text-center">Loading images...</p>}
				{error && <p className="text-center text-red-500">{error}</p>}
				{!isLoading && !error && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
						{images.map((image) => (
							<ImageCard
								key={image.id}
								fileName={image.fileName}
								detectedLabels={image.detectedLabels}
								dominantColors={image.dominantColors}
								imageUrl={image.imageUrl}
							/>
						))}
						{images.length === 0 && (
							<p className="text-center col-span-full">
								No images processed yet. Try uploading one!
							</p>
						)}
					</div>
				)}
			</section>
		</main>
	);
}
