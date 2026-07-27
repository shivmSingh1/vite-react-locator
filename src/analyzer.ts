import * as traverseModule from "@babel/traverse";
import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type { FileMetadata } from "./types";
import { registry } from "./registry";

let idCounter = 1;
function getComponentName(
	path: NodePath<t.JSXOpeningElement>
): string | null {

	const component = path.findParent((parent) => {

		// function Home() {}
		if (parent.isFunctionDeclaration()) {
			return !!parent.node.id &&
				/^[A-Z]/.test(parent.node.id.name);
		}

		// const Home = () => {}
		if (parent.isVariableDeclarator()) {
			const { id, init } = parent.node;

			if (!t.isIdentifier(id)) return false;

			if (!/^[A-Z]/.test(id.name)) return false;

			if (
				t.isArrowFunctionExpression(init) ||
				t.isFunctionExpression(init)
			) {
				return true;
			}

			if (t.isCallExpression(init)) {
				const callee =
					t.isIdentifier(init.callee)
						? init.callee.name
						: t.isMemberExpression(init.callee) &&
							t.isIdentifier(init.callee.property)
							? init.callee.property.name
							: "";

				if (callee === "memo" || callee === "forwardRef") {
					return true;
				}
			}

			return false;
		}

		return false;
	});

	if (!component) return null;

	if (component.isFunctionDeclaration()) {
		return component.node.id?.name ?? null;
	}

	if (component.isVariableDeclarator()) {
		const id = component.node.id;

		if (t.isIdentifier(id)) {
			return id.name;
		}
	}

	return null;
}

const traverse =
	(traverseModule as any).default?.default ??
	(traverseModule as any).default ??
	traverseModule;

export function analyzeAst(ast: t.File, id: string): FileMetadata {
	const metadata: FileMetadata = {
		declarations: [],
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

		VariableDeclarator(path: NodePath<t.FunctionDeclaration>) {

			const idNode = path.node.id;

			if (!t.isIdentifier(idNode)) return;

			if (!/^[A-Z]/.test(idNode.name)) return;

			metadata.declarations.push({
				name: idNode.name,
				file: id,
				line: path.node.loc?.start.line ?? 0,
				column: path.node.loc?.start.column ?? 0,
			});
		},
		// ReturnStatement(path: NodePath<t.ReturnStatement>) {
		// 	const argument = path.node.argument;

		// 	if (!argument) return;

		// 	if (t.isJSXElement(argument)) {
		// 		const openingElement = argument.openingElement;

		// 		const locatorId = `root_${idCounter++}`;

		// 		registry.set(locatorId, {
		// 			id: locatorId,
		// 			component: currentComponent,
		// 			file: id,
		// 			line: path.node.loc?.start.line ?? 0,
		// 			column: path.node.loc?.start.column ?? 0,
		// 		});

		// 		openingElement.attributes.push(
		// 			t.jsxAttribute(
		// 				t.jsxIdentifier("data-locator-id"),
		// 				t.stringLiteral(locatorId)
		// 			)
		// 		);
		// 	}
		// },

		JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {

			const component = getComponentName(path);

			if (!component) return;

			const locatorId = `node_${idCounter++}`;

			registry.set(locatorId, {
				id: locatorId,
				component,
				file: id,
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