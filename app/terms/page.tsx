import React from "react";

export default function TermsOfServicePage() {
	return (
		// A neutral, soft background provides contrast for the main content card.
		<div className="bg-slate-50 font-sans antialiased text-slate-800">
			<div className="container mx-auto max-w-4xl px-4 py-12 md:px-16">
				{/* The main content card with more padding and larger rounded corners. */}
				<div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg">
					{/* Page Header */}
					<div className="pb-6 border-b border-slate-200">
						<h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
							Terms of Service
						</h1>
						<p className="mt-2 text-base font-medium text-slate-500">
							Last Updated: June 11, 2025
						</p>
					</div>

					<div className="space-y-10 mt-10">
						<section>
							<h2 className="text-2xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-4">
								1. Acceptance of Terms
							</h2>
							<p className="text-slate-600 leading-relaxed">
								By accessing and using Cloud Vision Showcase (the
								&quot;Service&quot;), you accept and agree to be bound by the
								terms and provision of this agreement.
							</p>

							{/* This callout block makes the key purpose stand out. */}
							<div className="mt-6 border-l-4 border-amber-500 bg-amber-50 p-4 rounded-r-lg">
								<p className="font-semibold text-amber-800">
									This Service is provided for portfolio and demonstrative
									purposes only. It is not intended for commercial or production
									use.
								</p>
							</div>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-4">
								2. User Conduct and Responsibilities
							</h2>
							<p className="text-slate-600 leading-relaxed mb-5">
								You are solely responsible for the images you upload
								(&quot;Content&quot;). You agree not to upload any Content that:
							</p>
							<ul className="list-disc list-outside pl-5 space-y-3 text-slate-600">
								<li>
									Is illegal, harmful, threatening, abusive, defamatory,
									obscene, or otherwise objectionable.
								</li>
								<li>
									Infringes on any third party&apos;s intellectual property
									rights, including copyright, trademark, or patent.
								</li>
								<li>
									Contains software viruses or any other computer code, files,
									or programs designed to interrupt, destroy, or limit the
									functionality of any computer software or hardware.
								</li>
							</ul>
							<p className="text-slate-600 leading-relaxed mt-5">
								We reserve the right to remove any Content and terminate user
								access for any reason, without notice.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-4">
								3. Content Rights and License
							</h2>
							<p className="text-slate-600 leading-relaxed">
								You retain all ownership rights to the Content you upload.
								However, by uploading Content, you grant us a worldwide,
								non-exclusive, royalty-free license to use, reproduce, and
								process the Content solely for the purpose of operating the
								Service (e.g., sending it to the Google Vision API and
								displaying the results back to you). We will not sell,
								redistribute, or use your Content for any commercial purposes.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-4">
								4. Data Deletion
							</h2>
							<p className="text-slate-600 leading-relaxed">
								As this is a demonstrative project, we do not guarantee
								long-term storage of your Content. Uploaded images and their
								associated data may be deleted periodically at our sole
								discretion.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-4">
								5. Disclaimer of Warranties
							</h2>
							<p className="text-slate-600 leading-relaxed">
								The Service is provided &quot;as is&quot; and &quot;as
								available&quot; without any warranties of any kind, either
								express or implied. We do not warrant that the service will be
								uninterrupted or error-free.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-4">
								6. Limitation of Liability
							</h2>
							<p className="text-slate-600 leading-relaxed">
								In no event shall the owner of this Service be liable for any
								indirect, incidental, special, consequential or punitive
								damages, including without limitation, loss of profits, data, or
								other intangibles, resulting from your access to or use of, or
								inability to access or use, the Service.
							</p>
						</section>

						<section>
							<h2 className="text-2xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-4">
								7. Governing Law
							</h2>
							<p className="text-slate-600 leading-relaxed">
								These Terms shall be governed by the laws of the Province of
								Alberta and the federal laws of Canada applicable therein,
								without regard to its conflict of law provisions.
							</p>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}
