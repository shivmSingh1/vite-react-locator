import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import type { Editor, OpenLocation } from "./index";

const execFileAsync = promisify(execFile);

const CODE_LIKE_BINARIES = ["cursor", "windsurf", "code"] as const;

type CodeLikeBinary = (typeof CODE_LIKE_BINARIES)[number];

function detectPreferredBinary(): CodeLikeBinary | null {
	const termProgram = process.env.TERM_PROGRAM?.toLowerCase() ?? "";

	if (termProgram.includes("cursor")) return "cursor";
	if (termProgram.includes("windsurf")) return "windsurf";
	if (termProgram.includes("vscode")) return "code";

	return null;
}

function orderedBinaries(): CodeLikeBinary[] {
	const preferred = detectPreferredBinary();

	return preferred ? [preferred, ...CODE_LIKE_BINARIES.filter((binary) => binary !== preferred)] : [...CODE_LIKE_BINARIES];
}

// On Windows, `code`/`cursor`/`windsurf` are installed as .cmd shim scripts,
// not real .exe files. child_process.execFile() calls CreateProcess directly
// and cannot execute .cmd/.bat files on its own — it fails with ENOENT even
// though the same command works fine when typed into a terminal, because
// only cmd.exe knows how to resolve and run a .cmd shim via PATH. Routing
// through `cmd.exe /d /s /c` (rather than execFile's own `shell: true`,
// which just string-joins args and would need us to hand-quote every path)
// lets Windows' own argv-escaping do the right thing for paths with spaces.
async function runCommand(binary: string, args: string[]): Promise<void> {
	if (process.platform === "win32") {
		await execFileAsync("cmd.exe", ["/d", "/s", "/c", binary, ...args], { windowsHide: true });
		return;
	}

	await execFileAsync(binary, args);
}

function candidateInstallPaths(binary: CodeLikeBinary): string[] {
	const home = os.homedir();

	if (process.platform === "win32") {
		const localAppData = process.env.LOCALAPPDATA ?? path.join(home, "AppData", "Local");
		const programFiles = process.env.ProgramFiles ?? "C:\\Program Files";
		const productDir: Record<CodeLikeBinary, string> = {
			code: "Microsoft VS Code",
			cursor: "cursor",
			windsurf: "Windsurf",
		};

		return [
			path.join(localAppData, "Programs", productDir[binary], "bin", `${binary}.cmd`),
			path.join(programFiles, productDir[binary], "bin", `${binary}.cmd`),
		];
	}

	if (process.platform === "darwin") {
		const appName: Record<CodeLikeBinary, string> = {
			code: "Visual Studio Code",
			cursor: "Cursor",
			windsurf: "Windsurf",
		};

		return [
			`/Applications/${appName[binary]}.app/Contents/Resources/app/bin/${binary}`,
			path.join(home, "Applications", `${appName[binary]}.app`, "Contents", "Resources", "app", "bin", binary),
		];
	}

	// Linux
	return [
		`/usr/bin/${binary}`,
		`/usr/local/bin/${binary}`,
		`/snap/bin/${binary}`,
		path.join(home, ".local", "share", "applications", binary),
	];
}

async function tryOpen(binary: string, target: string): Promise<void> {
	await runCommand(binary, ["--goto", target]);
}

async function tryOpenAtPath(binaryPath: string, target: string): Promise<void> {
	if (!existsSync(binaryPath)) throw new Error(`Not found: ${binaryPath}`);

	if (process.platform === "win32") {
		await execFileAsync("cmd.exe", ["/d", "/s", "/c", binaryPath, "--goto", target], { windowsHide: true });
		return;
	}

	await execFileAsync(binaryPath, ["--goto", target]);
}

export const codeEditor: Editor = {
	async open({ file, line, column }: OpenLocation): Promise<void> {
		const target = `${file}:${line}:${column}`;

		const order = orderedBinaries();

		let lastError: unknown;

		// First pass: rely on PATH resolution (covers the common case where the
		// editor's CLI shim was installed via the editor's own "install in
		// PATH" command).
		for (const binary of order) {
			try {
				await tryOpen(binary, target);
				return;
			} catch (error) {
				lastError = error;
			}
		}

		// Second pass: PATH resolution failed for every editor — fall back to
		// well-known per-platform install locations instead of giving up, so a
		// missing PATH entry doesn't silently break "open in editor".
		for (const binary of order) {
			for (const candidate of candidateInstallPaths(binary)) {
				try {
					await tryOpenAtPath(candidate, target);
					return;
				} catch (error) {
					lastError = error;
				}
			}
		}

		throw lastError instanceof Error
			? lastError
			: new Error("No supported editor found (VS Code, Cursor, or Windsurf).");
	},
};
