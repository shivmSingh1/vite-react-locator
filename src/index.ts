import type { Plugin, ResolvedConfig } from "vite";
import { transformReactFile } from "./transform";

export interface LocatorOptions {
	enabled?: boolean;
}

export function locator(
	options: LocatorOptions = {}
): Plugin {
	let config: ResolvedConfig;

	return {
		name: "vite-react-locator",

		apply: "serve",

		configResolved(resolvedConfig) {
			config = resolvedConfig;

			console.log("🚀 vite-react-locator loaded");
		},

		async transform(code, id) {
			if (!(options.enabled ?? true)) return;

			return transformReactFile(code, id, config);
		},
	};
}

export default locator;