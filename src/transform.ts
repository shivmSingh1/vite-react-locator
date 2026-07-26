import type { ResolvedConfig } from "vite";
import { parse } from "@babel/parser";
import { analyzeAst } from "./analyzer";

export function transformReactFile(
	code: string,
	id: string,
	_config: ResolvedConfig
) {
	if (
		(!id.endsWith(".tsx") && !id.endsWith(".jsx")) ||
		id.endsWith("main.tsx") ||
		id.endsWith("main.jsx")
	) {
		return null;
	}

	console.log("📄 Transforming:", id);

	const ast = parse(code, {
		sourceType: "module",
		plugins: ["typescript", "jsx"],
	});

	const metadata = analyzeAst(ast, id);

	console.log("📊 Metadata");
	console.table(metadata.declarations);
	console.table(metadata.usages);

	return {
		code,
		map: null,
	};
}