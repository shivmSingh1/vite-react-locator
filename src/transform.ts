import type { ResolvedConfig } from "vite";

export function transformReactFile(
	code: string,
	id: string,
	_config: ResolvedConfig
) {
	if (
		!id.endsWith(".jsx") &&
		!id.endsWith(".tsx")
	) {
		return null;
	}

	console.log("📄 Transforming:", id);

	return {
		code,
		map: null,
	};
}