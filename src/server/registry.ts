import type { ViteDevServer } from "vite";

import { LOCATOR_ENDPOINT, OPTIONS_ENDPOINT } from "../shared/constants";
import type { LocatorOptions } from "../index";

import { locatorRegistry } from "../transform";

export function installRegistryRoute(server: ViteDevServer, options: LocatorOptions): void {
	server.middlewares.use(LOCATOR_ENDPOINT, (_req, res) => {
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify(Object.fromEntries(locatorRegistry)));
	});

	server.middlewares.use(OPTIONS_ENDPOINT, (_req, res) => {
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify(options));
	});
}
