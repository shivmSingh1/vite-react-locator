import { parse } from "@babel/parser";
import * as generatorModule from "@babel/generator";
import type { GeneratorOptions, GeneratorResult } from "@babel/generator";
import type { File } from "@babel/types";
import type { ResolvedConfig } from "vite";

import { REACT_FILE_PATTERN } from "../shared/constants";
import type { LocatorMetadata } from "../shared/types";
import { isNodeModules } from "../shared/utils";

import { runVisitor } from "./visitor";
import type { TransformContext } from "./types";
import { clearFileEntries } from "./registry";

type GenerateFn = (ast: File, opts: GeneratorOptions, code: string) => GeneratorResult;

interface GeneratorModuleShape {
	default?: GeneratorModuleShape | GenerateFn;
}

const generate =
	((generatorModule as GeneratorModuleShape).default as GeneratorModuleShape | undefined)?.default ??
	(generatorModule as GeneratorModuleShape).default ??
	(generatorModule);

export const locatorRegistry = new Map<string, LocatorMetadata>();

export interface TransformOutput {
	code: string;
	map: GeneratorResult["map"];
}

export function transformReactFile(code: string, id: string, config: ResolvedConfig): TransformOutput | null {
	if (!REACT_FILE_PATTERN.test(id)) return null;

	if (isNodeModules(id)) return null;

	const ast = parse(code, {
		sourceType: "module",
		sourceFilename: id,
		plugins: ["jsx", "typescript"],
	});

	clearFileEntries(locatorRegistry, id);

	const context: TransformContext = {
		file: id,
		root: config.root,
		registry: locatorRegistry,
		componentStack: [],
		componentNodeStack: [],
		locatorStack: [],
	};

	runVisitor(ast, context);

	const output = (generate as GenerateFn)(
		ast,
		{
			sourceMaps: true,
			sourceFileName: id,
			retainLines: true,
		},
		code,
	);

	return {
		code: output.code,
		map: output.map,
	};
}
