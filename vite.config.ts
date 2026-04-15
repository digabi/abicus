/// <reference types="vite/client" />
/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import * as child from "child_process";

const commitHash =
	process.env.GIT_REF ||
	child.execSync("git describe --exact-match --tags 2> /dev/null || git rev-parse --short HEAD").toString();

// https://vitejs.dev/config/
export default defineConfig(async () => ({
	plugins: [
		tsconfigPaths(),
		react({
			babel: {
				plugins: [
					/** See `./src/_clsx-jsx.d.ts` for more details on these two plugins */
					["transform-jsx-classnames", { attributes: ["x"] }],
					["babel-plugin-rename-jsx-attribute", { attributes: { x: "className" } }],
				],
			},
		}),
	],

	define: {
		__GIT_REF__: JSON.stringify(commitHash),
	},
	
	test: {
		globals: true,
		exclude: ["**/playwright/**", "**/node_modules/**"],
	},
}));
