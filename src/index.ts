import type { HtmlTagDescriptor, Plugin, ResolvedConfig } from "vite";

import {
	DEFAULT_ACTIVATION_KEY,
	RESOLVED_VIRTUAL_CLIENT_MODULE_ID,
	RUNTIME_ENTRY_SPECIFIER,
	VIRTUAL_CLIENT_MODULE_ID,
} from "./shared/constants";

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
	activationKey: DEFAULT_ACTIVATION_KEY,
};

export function locator(options: LocatorOptions = {}): Plugin {
	const resolvedOptions: Required<LocatorOptions> = {
		...DEFAULT_OPTIONS,
		...options,
	};

	let config: ResolvedConfig;

	return {
		name: "vite-react-locator",

		apply: "serve",

		enforce: "pre",

		configResolved(resolvedConfig) {
			config = resolvedConfig;
		},

		transform(code, id) {
			if (!resolvedOptions.enabled) return null;

			return transformReactFile(code, id, config);
		},

		resolveId(id) {
			if (id === VIRTUAL_CLIENT_MODULE_ID) {
				return RESOLVED_VIRTUAL_CLIENT_MODULE_ID;
			}

			return null;
		},

		load(id) {
			if (id === RESOLVED_VIRTUAL_CLIENT_MODULE_ID) {
				return `import "${RUNTIME_ENTRY_SPECIFIER}";`;
			}

			return null;
		},

		transformIndexHtml(): HtmlTagDescriptor[] {
			if (!resolvedOptions.enabled) return [];

			return [
				{
					tag: "script",
					attrs: {
						type: "module",
						src: `/@id/${VIRTUAL_CLIENT_MODULE_ID}`,
					},
					injectTo: "body",
				},
			];
		},

		configureServer(server) {
			installServer(server, resolvedOptions);
		},
	};
}

export default locator;
