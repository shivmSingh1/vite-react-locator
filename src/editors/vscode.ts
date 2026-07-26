import { exec } from "node:child_process";
import type { Editor, Location } from "./types";

export class VSCodeEditor implements Editor {
	open(location: Location): Promise<void> {
		return new Promise((resolve, reject) => {
			const { file, line, column } = location;

			exec(
				`code -g "${file}:${line}:${column}"`,
				(error) => {
					if (error) {
						reject(error);
						return;
					}

					resolve();
				}
			);
		});
	}
}