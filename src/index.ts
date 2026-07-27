import type { Plugin, ResolvedConfig } from "vite";
import { transformReactFile } from "./transform";
import { installServer } from "./server";

export type ActivationKey =
	| "Alt"
	| "Ctrl"
	| "Shift"
	| "Meta"
	| "Ctrl+Shift"
	| "Ctrl+Alt"
	| "Ctrl+Meta"
	| "Alt+Shift"
	| "Alt+Meta"
	| "Shift+Meta"
	| "Ctrl+Alt+Shift"
	| "Ctrl+Alt+Meta"
	| "Ctrl+Shift+Meta"
	| "Alt+Shift+Meta"
	| "Ctrl+Alt+Shift+Meta";

export interface LocatorOptions {
	enabled?: boolean;
	activationKey?: ActivationKey;
}

const DEFAULT_OPTIONS: Required<LocatorOptions> = {
	enabled: true,
	activationKey: "Ctrl",
};

export function locator(
	options: LocatorOptions = {}
): Plugin {


	const resolvedOptions = {
		...DEFAULT_OPTIONS,
		...options,
	};

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
			installServer(server, resolvedOptions);
		},

	};
}

export default locator;
