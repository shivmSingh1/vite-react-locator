import type { IncomingMessage, ServerResponse } from "node:http";

import type { ViteDevServer } from "vite";

import { OPEN_ENDPOINT } from "../shared/constants";

import { editor } from "./editors";

interface OpenRequestBody {
	file: string;
	line: number;
	column: number;
}

function isOpenRequestBody(value: unknown): value is OpenRequestBody {
	if (typeof value !== "object" || value === null) return false;

	const candidate = value as Record<string, unknown>;

	return (
		typeof candidate.file === "string" &&
		typeof candidate.line === "number" &&
		typeof candidate.column === "number"
	);
}

export function installOpenRoute(server: ViteDevServer): void {
	server.middlewares.use(OPEN_ENDPOINT, (req: IncomingMessage, res: ServerResponse) => {
		if (req.method !== "POST") {
			res.statusCode = 405;
			res.end();
			return;
		}

		let body = "";

		req.on("data", (chunk: Buffer) => {
			body += chunk.toString("utf-8");
		});

		req.on("end", () => {
			void (async () => {
				res.setHeader("Content-Type", "application/json");

				try {
					const payload: unknown = JSON.parse(body);

					if (!isOpenRequestBody(payload)) {
						res.statusCode = 400;
						res.end(JSON.stringify({ success: false, error: "Invalid request body" }));
						return;
					}

					await editor.open(payload);

					res.statusCode = 200;
					res.end(JSON.stringify({ success: true }));
				} catch (error) {
					res.statusCode = 500;
					res.end(
						JSON.stringify({
							success: false,
							error: error instanceof Error ? error.message : "Unknown error",
						}),
					);
				}
			})();
		});
	});
}
