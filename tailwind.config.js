/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				"abi-blue-3": "#EDF6FE",
				"abi-blue-2": "#CCDFFD",
				"abi-blue-1": "#365488",
				"abi-lgrey": "#E5EAF1",
				"abi-dgrey": "#C5C5C5",
			},
		},
	},
	plugins: [],
};
