import * as traverseModule from "@babel/traverse";
import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type { FileMetadata } from "./types";
import { registry } from "./registry";

let idCounter = 1;
let currentComponent = "";

const traverse =
	(traverseModule as any).default?.default ??
	(traverseModule as any).default ??
	traverseModule;

export function analyzeAst(ast: t.File, id: string): FileMetadata {
	const metadata: FileMetadata = {
		declarations: [],
	};

	traverse(ast, {
		FunctionDeclaration: {
			enter(path: NodePath<t.FunctionDeclaration>) {
				const node = path.node;

				if (!node.id) return;

				if (!/^[A-Z]/.test(node.id.name)) return;

				currentComponent = node.id.name;

				metadata.declarations.push({
					name: node.id.name,
					file: id,
					line: node.loc?.start.line ?? 0,
					column: node.loc?.start.column ?? 0,
				});
			},

			exit() {
				currentComponent = "";
			},
		},

		ReturnStatement(path: NodePath<t.ReturnStatement>) {
			const argument = path.node.argument;

			if (!argument) return;

			if (t.isJSXElement(argument)) {
				const openingElement = argument.openingElement;

				const locatorId = `root_${idCounter++}`;

				registry.set(locatorId, {
					id: locatorId,
					component: currentComponent,
					file: id,
					line: path.node.loc?.start.line ?? 0,
					column: path.node.loc?.start.column ?? 0,
				});

				openingElement.attributes.push(
					t.jsxAttribute(
						t.jsxIdentifier("data-locator-id"),
						t.stringLiteral(locatorId)
					)
				);
			}
		}
	});

	return metadata;
}