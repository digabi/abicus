/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				"abi-lblue": "#CCDFFD",
				"abi-dblue": "#365488",
				"abi-lgrey": "#E5EAF1",
				"abi-dgrey": "#C5C5C5",
			},
		},
	},
	plugins: [],
};
