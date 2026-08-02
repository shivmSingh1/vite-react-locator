import type {
	LocatorMetadata,
} from "../shared/types";

import type {
	TransformContext,
} from "./types";

export function enterLocator(
	context: TransformContext,
	locator: LocatorMetadata,
) {
	const parent =
		context.locatorStack.at(-1);

	if (parent) {
		locator.parent = parent.id;

		locator.depth =
			parent.depth + 1;

		parent.children.push(
			locator.id,
		);
	} else {
		locator.parent = null;

		locator.depth = 0;
	}

	context.locatorStack.push(
		locator,
	);

	context.registry.set(
		locator.id,
		locator,
	);
}

export function leaveLocator(
	context: TransformContext,
) {
	if (
		context.locatorStack.length
	) {
		context.locatorStack.pop();
	}
}

export function currentLocator(
	context: TransformContext,
) {
	return context.locatorStack.at(
		-1,
	);
}

export function currentParent(
	context: TransformContext,
) {
	return currentLocator(
		context,
	);
}

export function hasParent(
	context: TransformContext,
) {
	return (
		context.locatorStack.length >
		0
	);
}

export function resetHierarchy(
	context: TransformContext,
) {
	context.locatorStack.length = 0;
}

export function getDepth(
	context: TransformContext,
) {
	return (
		context.locatorStack.length
	);
}

export function getRootLocator(
	context: TransformContext,
) {
	return (
		context.locatorStack[0] ??
		null
	);
}