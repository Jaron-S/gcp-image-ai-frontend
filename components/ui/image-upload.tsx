"use client";

import {
	AlertCircle,
	CheckCircle,
	FileCheck2,
	Loader2,
	UploadCloud,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./card";

type ImageUploadProps = {
	onUploadSuccess: () => void;
};

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";

export function ImageUpload({ onUploadSuccess }: ImageUploadProps) {
	const [file, setFile] = useState<File | null>(null);
	const [status, setStatus] = useState<UploadStatus>("idle");
	const [message, setMessage] = useState("");
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const cleanupPolling = () => {
		if (intervalRef.current) clearInterval(intervalRef.current);
	};

	const resetState = () => {
		setFile(null);
		setStatus("idle");
		setMessage("");
		cleanupPolling();
	};

	const onDrop = useCallback((acceptedFiles: File[]) => {
		resetState();
		if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { "image/jpeg": [], "image/png": [] },
		multiple: false,
	});

	const pollForProcessing = (filename: string) => {
		setStatus("processing");
		setMessage("Upload complete! The AI is now analyzing your image...");

		let attempts = 0;
		const maxAttempts = 20;

		intervalRef.current = setInterval(async () => {
			attempts++;
			try {
				const response = await fetch(`/api/status?filename=${filename}`);
				const data = await response.json();

				if (response.ok && data.status === "processed") {
					cleanupPolling();
					setStatus("success");
					setMessage("Analysis complete!");
					onUploadSuccess();
					setTimeout(resetState, 2000);
				} else if (attempts > maxAttempts) {
					throw new Error("Processing took too long.");
				}
			} catch (error) {
				cleanupPolling();
				setStatus("error");
				setMessage(
					error instanceof Error ? error.message : "An error occurred."
				);
			}
		}, 2500);
	};

	const handleUpload = async () => {
		if (!file) return;
		setStatus("uploading");
		setMessage("Preparing secure upload...");

		try {
			const response = await fetch("/api/upload", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ filename: file.name, contentType: file.type }),
			});
			if (!response.ok) throw new Error("Failed to get signed URL.");
			const { url } = await response.json();

			setMessage("Uploading image...");
			const uploadResponse = await fetch(url, {
				method: "PUT",
				headers: { "Content-Type": file.type },
				body: file,
			});
			if (!uploadResponse.ok)
				throw new Error("Upload to cloud storage failed.");

			pollForProcessing(file.name);
		} catch (error) {
			setStatus("error");
			setMessage(error instanceof Error ? error.message : "Upload failed.");
		}
	};

	useEffect(() => {
		return () => cleanupPolling();
	}, []);

	// This component provides clear, text-based status updates
	const StatusIndicator = () => {
		if (status === "idle" || !message) return null;

		const iconMap = {
			uploading: <Loader2 className="mr-2 h-4 w-4 animate-spin" />,
			processing: <Loader2 className="mr-2 h-4 w-4 animate-spin" />,
			success: <CheckCircle className="mr-2 h-4 w-4 text-green-500" />,
			error: <AlertCircle className="mr-2 h-4 w-4 text-red-500" />,
			idle: null,
		};

		return (
			<div className="flex items-center justify-center text-sm text-gray-600">
				{iconMap[status]}
				<span>{message}</span>
			</div>
		);
	};

	return (
		<Card className="w-full max-w-xl mx-auto shadow-md">
			<CardHeader>
				<CardTitle>Image Uploader</CardTitle>
				<CardDescription>
					Drag and drop an image or click to select a file.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{!file && (
					<div
						{...getRootProps()}
						className={`w-full p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors duration-300 ${
							isDragActive
								? "border-blue-500 bg-blue-50"
								: "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
						}`}
					>
						<input {...getInputProps()} />
						<div className="flex flex-col items-center justify-center text-gray-500">
							<UploadCloud className="w-16 h-16 mb-4" />
							<p className="text-xl font-semibold">Drop an image here</p>
							<p className="text-sm">or click to browse</p>
						</div>
					</div>
				)}

				{file && (
					<div className="w-full space-y-4">
						<div className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg">
							<div className="flex items-center gap-3 min-w-0">
								<FileCheck2 className="w-8 h-8 text-blue-500 flex-shrink-0" />
								<span className="font-medium truncate block">{file.name}</span>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={resetState}
								className="hover:cursor-pointer"
							>
								<X className="w-5 h-5" />
							</Button>
						</div>

						<div className="h-6 text-center">
							<StatusIndicator />
						</div>

						<Button
							onClick={handleUpload}
							disabled={status !== "idle"}
							className="w-full hover:cursor-pointer"
						>
							{status === "idle" ? "Analyze Image" : "Processing..."}
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
