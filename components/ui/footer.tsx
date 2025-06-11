import Link from "next/link";

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="w-full mt-24 border-t border-gray-200 py-8">
			<div className="container mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
				<p>&copy; {currentYear} Jaron Schoorlemmer. All Rights Reserved.</p>
				<div className="flex gap-4 mt-4 sm:mt-0">
					<Link href="/terms" className="hover:text-gray-900 transition-colors">
						Terms of Service
					</Link>
					<Link
						href="/privacy"
						className="hover:text-gray-900 transition-colors"
					>
						Privacy Policy
					</Link>
				</div>
			</div>
		</footer>
	);
}
