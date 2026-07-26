import type { Plugin, ResolvedConfig } from "vite";
import { transformReactFile } from "./transform";


import { registry } from "./registry";

export interface LocatorOptions {
	enabled?: boolean;
}

export function locator(
	options: LocatorOptions = {}
): Plugin {

	console.log("✅ locator() called");

	let config: ResolvedConfig;

	return {
		name: "vite-react-locator",
		enforce: "pre",
		apply: "serve",

		configResolved(resolvedConfig) {
			config = resolvedConfig;
			console.log("🚀 vite-react-locator loaded");
		},

		async transform(code, id) {
			console.log("🔥 transform", id);

			if (!(options.enabled ?? true)) return;

			return transformReactFile(code, id, config);
		},

		configureServer(server) {
			server.middlewares.use("/__locator", (_req, res) => {
				res.setHeader("Content-Type", "application/json");

				res.end(
					JSON.stringify(Object.fromEntries(registry))
				);
			});
		},
	};
}

export default locator;