import type { Config } from "tailwindcss";

const config = {
	theme: {
		container: {},
		extend: {
			backgroundImage: {
				"main-background": "url('/background.svg')",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
