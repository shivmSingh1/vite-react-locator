import * as traverseModule from "@babel/traverse";
import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type { FileMetadata } from "./types";

let idCounter = 1;

const traverse =
	(traverseModule as any).default?.default ??
	(traverseModule as any).default ??
	traverseModule;

export function analyzeAst(ast: t.File, id: string): FileMetadata {
	const metadata: FileMetadata = {
		declarations: [],
		usages: [],
	};

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

			const locatorId = `cmp_${idCounter++}`;

			metadata.usages.push({
				id: locatorId,
				name: name.name,
				line: path.node.loc?.start.line ?? 0,
				column: path.node.loc?.start.column ?? 0,
			});

			path.node.attributes.push(
				t.jsxAttribute(
					t.jsxIdentifier("data-locator-id"),
					t.stringLiteral(locatorId)
				)
			);
		}
	});

	return metadata;
}