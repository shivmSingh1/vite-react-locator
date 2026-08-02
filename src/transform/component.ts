import * as t from "@babel/types";

import type { NodePath } from "@babel/traverse";

import type { ComponentInfo } from "../shared/types";

import { deriveNameFromFile } from "../shared/utils";

import type { TransformContext } from "./types";

import { createComponentId } from "./ids";

function createComponent(name: string, file: string, node: t.Node): ComponentInfo {
	const line = node.loc?.start.line ?? 0;
	const column = node.loc?.start.column ?? 0;

	return {
		id: createComponentId(file, name, line, column),
		name,
		displayName: name,
		file,
		line,
		column,
		memo: false,
		forwardRef: false,
		lazy: false,
		hooks: [],
	};
}

function pushComponent(context: TransformContext, node: t.Node, component: ComponentInfo): void {
	context.componentNodeStack.push(node);
	context.componentStack.push(component);
}

function classifyWrapperCallee(callee: t.Expression): "memo" | "forwardRef" | "lazy" | null {
	if (t.isIdentifier(callee)) {
		if (callee.name === "memo" || callee.name === "forwardRef" || callee.name === "lazy") {
			return callee.name;
		}
		return null;
	}

	if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
		const name = callee.property.name;
		if (name === "memo" || name === "forwardRef" || name === "lazy") {
			return name;
		}
	}

	return null;
}

function unwrapComponentInitializer(
	init: t.Expression,
): { fn: t.ArrowFunctionExpression | t.FunctionExpression; wrapper: "memo" | "forwardRef" | "lazy" | null } | null {
	if (t.isArrowFunctionExpression(init) || t.isFunctionExpression(init)) {
		return { fn: init, wrapper: null };
	}

	if (t.isCallExpression(init) && t.isExpression(init.callee)) {
		const wrapper = classifyWrapperCallee(init.callee);

		if (!wrapper) return null;

		const [firstArgument] = init.arguments;

		if (firstArgument && (t.isArrowFunctionExpression(firstArgument) || t.isFunctionExpression(firstArgument))) {
			return { fn: firstArgument, wrapper };
		}

		if (firstArgument && t.isCallExpression(firstArgument)) {
			const nested = unwrapComponentInitializer(firstArgument);
			if (nested) return { fn: nested.fn, wrapper };
		}

		return null;
	}

	return null;
}

// A "component" here is really "the nearest named render scope" — anything
// that can lexically own JSX: a real React component, a helper function that
// merely returns JSX (`function renderRow() { return <tr>...</tr>; }`), or a
// plain named callback. We intentionally do NOT gate this on capitalization:
// the goal is that every locator resolves to *something* meaningful instead
// of "Unknown", and plenty of legitimate render helpers are lowercase
// (`renderCard`, `renderRow`, passed as `.map(renderRow)` or as a prop like
// `renderCard={renderHiddenActionsCard}`). Tag-level component/html/svg
// classification (jsx.ts / shared/tags.ts) is unaffected by this — that's
// about the JSX tag name, not the enclosing function's name.
export function enterFunctionComponent(path: NodePath<t.FunctionDeclaration>, context: TransformContext): void {
	const name = path.node.id?.name;

	if (!name) return;

	pushComponent(context, path.node, createComponent(name, context.file, path.node));
}

export function enterArrowComponent(path: NodePath<t.VariableDeclarator>, context: TransformContext): void {
	if (!t.isIdentifier(path.node.id)) return;

	const name = path.node.id.name;

	const init = path.node.init;

	if (!init) return;

	const unwrapped = unwrapComponentInitializer(init);

	if (!unwrapped) return;

	const component = createComponent(name, context.file, path.node);

	component.memo = unwrapped.wrapper === "memo";
	component.forwardRef = unwrapped.wrapper === "forwardRef";
	component.lazy = unwrapped.wrapper === "lazy";

	pushComponent(context, path.node, component);
}

function isWrapperCallExpression(node: t.Node): node is t.CallExpression {
	return t.isCallExpression(node) && t.isExpression(node.callee) && classifyWrapperCallee(node.callee) !== null;
}

// Covers memo()/forwardRef()/lazy() used WITHOUT being assigned to a
// variable at all — e.g. `export default memo(forwardRef((props, ref) =>
// <input ref={ref} />))`. enterArrowComponent only fires for
// VariableDeclarator, so this pattern would otherwise never push a component
// and every element inside it would resolve to "Unknown".
export function enterWrapperCallExpression(path: NodePath<t.CallExpression>, context: TransformContext): void {
	if (t.isVariableDeclarator(path.parent)) return;

	if (path.parentPath && isWrapperCallExpression(path.parentPath.node)) return;

	if (!t.isExpression(path.node.callee)) return;

	if (!classifyWrapperCallee(path.node.callee)) return;

	const unwrapped = unwrapComponentInitializer(path.node);

	if (!unwrapped) return;

	const innerName = t.isFunctionExpression(unwrapped.fn) ? (unwrapped.fn.id?.name ?? null) : null;

	const name = innerName ?? deriveNameFromFile(context.file);

	const component = createComponent(name, context.file, path.node);

	component.memo = unwrapped.wrapper === "memo";
	component.forwardRef = unwrapped.wrapper === "forwardRef";
	component.lazy = unwrapped.wrapper === "lazy";

	pushComponent(context, path.node, component);
}

export function leaveComponentIfMatches(context: TransformContext, node: t.Node): void {
	if (context.componentNodeStack.at(-1) !== node) return;

	context.componentNodeStack.pop();
	context.componentStack.pop();
}

export function currentComponent(context: TransformContext): ComponentInfo | undefined {
	return context.componentStack.at(-1);
}

export function hasCurrentComponent(context: TransformContext): boolean {
	return context.componentStack.length > 0;
}

export function resetComponents(context: TransformContext): void {
	context.componentStack.length = 0;
	context.componentNodeStack.length = 0;
}
