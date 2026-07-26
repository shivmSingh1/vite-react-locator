import type { ResolvedConfig } from "vite";
import { parse } from "@babel/parser";
import { analyzeAst } from "./analyzer";
import * as generatorModule from "@babel/generator";

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

	console.log("📄 Transforming:", id);

	const ast = parse(code, {
		sourceType: "module",
		plugins: ["typescript", "jsx"],
	});

	const metadata = analyzeAst(ast, id);

	console.log("📊 Metadata");
	console.table(metadata.declarations);
	console.table(metadata.usages);

	const output = generate(ast, {
		sourceMaps: true,
		sourceFileName: id,
	});

	console.log(output.code);

	return {
		code: output.code,
		map: output.map,
	};
}