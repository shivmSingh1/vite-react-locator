import type { ViteDevServer } from "vite";
import { registry } from "./registry";
import { editor } from "./editors";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { LocatorOptions } from "./index";

export function installServer(server: ViteDevServer, options: LocatorOptions) {

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

			req.on("end", async () => {
				try {
					const { file, line, column } = JSON.parse(body);

					await editor.open({
						file,
						line,
						column,
					});

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

	server.middlewares.use("/__locator-options", (_req, res) => {
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify(options));
	});

}