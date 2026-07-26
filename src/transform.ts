import type { ResolvedConfig } from "vite";
import { parse } from "@babel/parser";
import * as traverseModule from "@babel/traverse";
import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type { FileMetadata } from "./types";

const traverse =
	(traverseModule as any).default?.default ??
	(traverseModule as any).default ??
	traverseModule;

export function transformReactFile(
	code: string,
	id: string,
	_config: ResolvedConfig
) {
	// Ignore non React files and entry files
	if (
		(!id.endsWith(".tsx") && !id.endsWith(".jsx")) ||
		id.endsWith("main.tsx") ||
		id.endsWith("main.jsx")
	) {
		return null;
	}

	console.log("📄 Transforming:", id);

	const metadata: FileMetadata = {
		declarations: [],
		usages: [],
	};

	const ast = parse(code, {
		sourceType: "module",
		plugins: ["typescript", "jsx"],
	});

	traverse(ast, {
		FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
			const node = path.node;

			if (!node.id) return;

			if (!/^[A-Z]/.test(node.id.name)) return;

			metadata.declarations.push({
				name: node.id.name,
				file: id,
				line: node.loc?.start.line ?? 0,
				column: node.loc?.start.column ?? 0,
			});
		},

		JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
			const name = path.node.name;

			if (!t.isJSXIdentifier(name)) return;

			if (!/^[A-Z]/.test(name.name)) return;

			metadata.usages.push({
				name: name.name,
				line: path.node.loc?.start.line ?? 0,
				column: path.node.loc?.start.column ?? 0,
			});
		},
	});

	console.log("📊 Metadata");
	console.table(metadata.declarations);

	console.table(metadata.usages);

	return {
		code,
		map: null,
	};
}