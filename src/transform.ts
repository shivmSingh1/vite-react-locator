import type { ResolvedConfig } from "vite";
import { parse } from "@babel/parser";
import { analyzeAst } from "./analyzer";
import * as generatorModule from "@babel/generator";
import { registry } from "./registry";

const generate =
	(generatorModule as any).default?.default ??
	(generatorModule as any).default ??
	generatorModule;

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

	const ast = parse(code, {
		sourceType: "module",
		plugins: ["typescript", "jsx"],
	});

	const metadata = analyzeAst(ast, id);

	const output = generate(ast, {
		sourceMaps: true,
		sourceFileName: id,
	});

	return {
		code: output.code,
		map: output.map,
	};
}