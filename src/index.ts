import type { Plugin, ResolvedConfig } from "vite";
import { transformReactFile } from "./transform";
import { installServer } from "./server";

export interface LocatorOptions {
	enabled?: boolean;
}

export function locator(
	options: LocatorOptions = {}
): Plugin {


	let config: ResolvedConfig;

	return {
		name: "vite-react-locator",
		enforce: "pre",
		apply: "serve",

		configResolved(resolvedConfig) {
			config = resolvedConfig;
		},

		async transform(code, id) {

			if (!(options.enabled ?? true)) return;

			return transformReactFile(code, id, config);
		},

		configureServer(server) {
			installServer(server);
		},

	};
}

export default locator;
