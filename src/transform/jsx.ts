import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";

import type { GeneratorKind, LocatorKind } from "../shared/types";

import { isFragmentTag, isHtmlTag, isSvgTag } from "../shared/tags";

import type { TransformContext } from "./types";

import { createLocator } from "./registry";
import { enterLocator, leaveLocator } from "./hierarchy";
import { injectLocator } from "./inject";

const ARRAY_METHODS = new Set(["map", "flatMap"]);

export function processJSXOpeningElement(
	path: NodePath<t.JSXOpeningElement>,
	context: TransformContext,
): void {
	const tag = getTagName(path.node.name);

	const locator = createLocator(context, {
		node: path.node,
		tag,
		kind: path.parentPath && isPortalCall(path.parentPath) ? "portal" : classifyTag(tag),
		generatedBy: classifyGeneratedBy(path),
		attributes: collectAttributes(path.node.attributes),
	});

	enterLocator(context, locator);

	injectLocator(path.node, locator);

	if (path.node.selfClosing) {
		leaveLocator(context);
	}
}

export function processJSXClosingElement(context: TransformContext): void {
	leaveLocator(context);
}

export function processJSXFragment(path: NodePath<t.JSXFragment>, context: TransformContext): void {
	const locator = createLocator(context, {
		node: path.node,
		tag: "Fragment",
		kind: "fragment",
		generatedBy: classifyGeneratedBy(path),
	});

	enterLocator(context, locator);
}

export function processJSXFragmentExit(context: TransformContext): void {
	leaveLocator(context);
}

export function classifyTag(tag: string): LocatorKind {
	if (isFragmentTag(tag)) return "fragment";

	if (isSvgTag(tag)) return "svg";

	if (isHtmlTag(tag)) return "html";

	return "component";
}

type JSXTagName = t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName;

export function getTagName(name: JSXTagName): string {
	if (t.isJSXIdentifier(name)) {
		return name.name;
	}

	if (t.isJSXMemberExpression(name)) {
		return `${getTagName(name.object)}.${name.property.name}`;
	}

	if (t.isJSXNamespacedName(name)) {
		return `${name.namespace.name}:${name.name.name}`;
	}

	return "Unknown";
}

export function collectAttributes(
	attributes: readonly (t.JSXAttribute | t.JSXSpreadAttribute)[],
): string[] {
	const result: string[] = [];

	for (const attribute of attributes) {
		if (t.isJSXAttribute(attribute) && t.isJSXIdentifier(attribute.name)) {
			result.push(attribute.name.name);
		}
	}

	return result;
}

function isCreatePortalCallee(callee: t.Expression): boolean {
	if (t.isIdentifier(callee)) {
		return callee.name === "createPortal";
	}

	if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
		return callee.property.name === "createPortal";
	}

	return false;
}

function isPortalCall(path: NodePath<t.Node>): boolean {
	const parent = path.parentPath;

	if (!parent || !t.isCallExpression(parent.node)) return false;

	if (!t.isExpression(parent.node.callee)) return false;

	if (!isCreatePortalCallee(parent.node.callee)) return false;

	return parent.node.arguments[0] === path.node;
}

const MAX_GENERATOR_WALK = 24;

export function classifyGeneratedBy(path: NodePath<t.Node>): GeneratorKind {
	let current: NodePath<t.Node> | null = path;
	let steps = 0;

	while (current && steps < MAX_GENERATOR_WALK) {
		const node = current.node;
		const parentPath: NodePath<t.Node> | null = current.parentPath;

		if (!parentPath) break;

		const parentNode = parentPath.node;

		if (t.isCallExpression(parentNode) && t.isMemberExpression(parentNode.callee)) {
			const property = parentNode.callee.property;

			if (t.isIdentifier(property) && ARRAY_METHODS.has(property.name)) {
				return "map";
			}

			if (t.isIdentifier(property) && property.name === "filter") {
				return "array";
			}
		}

		if (t.isArrayExpression(parentNode)) {
			return "array";
		}

		if (t.isLogicalExpression(parentNode) && parentNode.operator === "&&" && parentNode.right === node) {
			return "logical";
		}

		if (
			t.isConditionalExpression(parentNode) &&
			(parentNode.consequent === node || parentNode.alternate === node)
		) {
			return "ternary";
		}

		if (t.isSwitchCase(parentNode)) {
			return "conditional";
		}

		if (t.isFunctionDeclaration(parentNode) || t.isVariableDeclarator(parentNode)) {
			break;
		}

		current = parentPath;
		steps += 1;
	}

	return "normal";
}
