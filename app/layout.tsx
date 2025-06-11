// app/layout.tsx

import { Footer } from "@/components/ui/footer";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Cloud Vision Showcase",
	description: "AI Image Analysis Portfolio",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={cn("min-h-screen font-sans antialiased", inter.className)}
			>
				<div className="relative min-h-screen w-full bg-main-background bg-cover bg-center bg-no-repeat">
					<div className="absolute inset-0 bg-white/40" />
					<main className="relative z-10">
						{children}
						<Footer />
					</main>
				</div>
			</body>
		</html>
	);
}
