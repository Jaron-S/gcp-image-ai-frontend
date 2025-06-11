import { Image as ImageIcon, Palette, Tag } from "lucide-react";
import Image from "next/image";
import { Badge } from "./badge";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

// Define the type for the image data props
type ImageCardProps = {
	fileName: string;
	detectedLabels: string[];
	dominantColors: {
		red: number;
		green: number;
		blue: number;
	}[];
	imageUrl: string;
};

export function ImageCard({
	fileName,
	detectedLabels,
	dominantColors,
	imageUrl,
}: ImageCardProps) {
	return (
		<Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
			<CardHeader className="p-0">
				<div className="relative aspect-video">
					<Image
						src={imageUrl}
						alt={fileName}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				</div>
			</CardHeader>
			<CardContent className="p-4 md:p-6">
				<CardTitle className="truncate mb-4 flex items-center gap-2">
					<ImageIcon className="w-5 h-5 text-gray-500" />
					{fileName}
				</CardTitle>
				<div className="mb-4">
					<h3 className="font-semibold mb-2 flex items-center gap-2 text-sm text-gray-600">
						<Tag className="w-4 h-4" /> Detected Labels
					</h3>
					<div className="flex flex-wrap gap-2">
						{detectedLabels.map((label) => (
							<Badge key={label} variant="secondary">
								{label}
							</Badge>
						))}
					</div>
				</div>
				<div>
					<h3 className="font-semibold mb-2 flex items-center gap-2 text-sm text-gray-600">
						<Palette className="w-4 h-4" /> Dominant Colors
					</h3>
					<div className="flex flex-wrap gap-2">
						{dominantColors.slice(0, 5).map((color, index) => (
							<div
								key={index}
								className="w-8 h-8 rounded-full border-2 border-white shadow"
								style={{
									backgroundColor: `rgb(${color.red}, ${color.green}, ${color.blue})`,
								}}
								title={`RGB(${color.red}, ${color.green}, ${color.blue})`}
							/>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
