export function toPosixPath(value: string): string {
	return value.split("\\").join("/");
}

export function toRelativePath(file: string, root: string): string {
	const posixFile = toPosixPath(file);
	const posixRoot = toPosixPath(root);

	if (posixFile.startsWith(posixRoot)) {
		const relative = posixFile.slice(posixRoot.length);
		return relative.startsWith("/") ? relative.slice(1) : relative;
	}

	return posixFile;
}

export function isNodeModules(file: string): boolean {
	return toPosixPath(file).includes("/node_modules/");
}

export function deriveNameFromFile(file: string): string {
	const posixFile = toPosixPath(file);
	const base = posixFile.slice(posixFile.lastIndexOf("/") + 1);
	const withoutExtension = base.replace(/\.(jsx|tsx|js|ts)$/, "");

	return withoutExtension || "Module";
}
