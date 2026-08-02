import type { ViteDevServer } from "vite";

import type { LocatorOptions } from "../index";

import { installOpenRoute } from "./open";
import { installRegistryRoute } from "./registry";

export function installServer(server: ViteDevServer, options: LocatorOptions): void {
	installRegistryRoute(server, options);
	installOpenRoute(server);
}
