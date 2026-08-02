import * as t from "@babel/types";

import type {
	NodePath,
} from "@babel/traverse";

import type {
	HookInfo,
} from "../shared/types";

import type {
	TransformContext,
} from "./types";

const BUILTIN_HOOKS = new Set([
	"useState",
	"useEffect",
	"useLayoutEffect",
	"useInsertionEffect",
	"useMemo",
	"useCallback",
	"useRef",
	"useReducer",
	"useContext",
	"useImperativeHandle",
	"useDeferredValue",
	"useTransition",
	"useId",
	"useSyncExternalStore",
	"useOptimistic",
	"useActionState",
]);

export function processHook(
	path: NodePath<t.CallExpression>,
	context: TransformContext,
) {

	const component =
		context.componentStack.at(-1);

	if (!component)
		return;

	const hook =
		getHookInfo(path.node);

	if (!hook)
		return;

	if (
		component.hooks.some(
			(existing) =>
				existing.name ===
				hook.name &&
				existing.line ===
				hook.line &&
				existing.column ===
				hook.column,
		)
	) {
		return;
	}

	component.hooks.push(hook);

}

export function getHookInfo(
	node: t.CallExpression,
): HookInfo | null {

	const name =
		getHookName(node);

	if (!name)
		return null;

	return {

		name,

		line:
			node.loc?.start.line ??
			0,

		column:
			node.loc?.start.column ??
			0,

	};

}

export function getHookName(
	node: t.CallExpression,
): string | null {

	if (
		t.isIdentifier(
			node.callee,
		)
	) {

		const name =
			node.callee.name;

		if (
			BUILTIN_HOOKS.has(
				name,
			)
		) {
			return name;
		}

		if (
			name.startsWith(
				"use",
			)
		) {
			return name;
		}

	}

	if (
		t.isMemberExpression(
			node.callee,
		)
	) {

		if (
			!t.isIdentifier(
				node.callee.property,
			)
		)
			return null;

		const name =
			node.callee.property
				.name;

		if (
			BUILTIN_HOOKS.has(
				name,
			)
		) {
			return name;
		}

		if (
			name.startsWith(
				"use",
			)
		) {
			return name;
		}

	}

	return null;

}

export function clearHooks(
	context: TransformContext,
) {

	for (const component of context.componentStack) {

		component.hooks.length = 0;

	}

}

export function isHookCall(
	node: t.CallExpression,
) {

	return (
		getHookName(node) !==
		null
	);

}

export function hasHooks(
	context: TransformContext,
) {

	const component =
		context.componentStack.at(-1);

	if (!component)
		return false;

	return (
		component.hooks.length >
		0
	);

}