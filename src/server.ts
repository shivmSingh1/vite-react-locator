import type { ViteDevServer } from "vite";
import { registry } from "./registry";

export function installServer(server: ViteDevServer) {
	server.middlewares.use("/__locator", (_req, res) => {
		res.setHeader("Content-Type", "application/json");

		res.end(JSON.stringify(Object.fromEntries(registry)));
	});
}