import type { ViteDevServer } from "vite";
import { registry } from "./registry";
import { exec } from "node:child_process";
import type { IncomingMessage, ServerResponse } from "node:http";

export function installServer(server: ViteDevServer) {

	server.middlewares.use("/__locator", (_req, res) => {
		res.setHeader("Content-Type", "application/json");

		res.end(JSON.stringify(Object.fromEntries(registry)));
	});

	server.middlewares.use(
		"/__open",
		(req: IncomingMessage, res: ServerResponse) => {
			if (req.method !== "POST") {
				res.statusCode = 405;
				res.end();
				return;
			}

			let body = "";

			req.on("data", (chunk) => {
				body += chunk;
			});

			req.on("end", () => {
				try {
					const { file, line, column } = JSON.parse(body);

					exec(`code -g "${file}:${line}:${column}"`);

					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify({ success: true }));
				} catch (error) {
					console.error(error);

					res.statusCode = 500;
					res.end(JSON.stringify({ success: false }));
				}
			});
		}
	);

}