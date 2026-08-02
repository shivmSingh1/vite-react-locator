import * as t from "@babel/types";

import {
	LOCATOR_ATTRIBUTE,
} from "../shared/constants";

import type {
	LocatorMetadata,
} from "../shared/types";

export function injectLocator(
	node: t.JSXOpeningElement,
	locator: LocatorMetadata,
) {
	if (hasLocator(node)) {
		updateLocator(
			node,
			locator.id,
		);
		return;
	}

	node.attributes.push(
		t.jsxAttribute(
			t.jsxIdentifier(
				LOCATOR_ATTRIBUTE,
			),
			t.stringLiteral(
				locator.id,
			),
		),
	);
}

export function hasLocator(
	node: t.JSXOpeningElement,
): boolean {
	return node.attributes.some(
		(attribute) =>
			t.isJSXAttribute(
				attribute,
			) &&
			t.isJSXIdentifier(
				attribute.name,
			) &&
			attribute.name.name ===
			LOCATOR_ATTRIBUTE,
	);
}

export function updateLocator(
	node: t.JSXOpeningElement,
	id: string,
) {
	for (const attribute of node.attributes) {
		if (
			!t.isJSXAttribute(
				attribute,
			)
		)
			continue;

		if (
			!t.isJSXIdentifier(
				attribute.name,
			)
		)
			continue;

		if (
			attribute.name.name !==
			LOCATOR_ATTRIBUTE
		)
			continue;

		attribute.value =
			t.stringLiteral(id);

		return;
	}
}

export function removeLocator(
	node: t.JSXOpeningElement,
) {
	node.attributes =
		node.attributes.filter(
			(attribute) => {

				if (
					!t.isJSXAttribute(
						attribute,
					)
				)
					return true;

				if (
					!t.isJSXIdentifier(
						attribute.name,
					)
				)
					return true;

				return (
					attribute.name.name !==
					LOCATOR_ATTRIBUTE
				);

			},
		);
}

export function getLocatorAttribute(
	node: t.JSXOpeningElement,
): string | null {
	for (const attribute of node.attributes) {
		if (
			!t.isJSXAttribute(
				attribute,
			)
		)
			continue;

		if (
			!t.isJSXIdentifier(
				attribute.name,
			)
		)
			continue;

		if (
			attribute.name.name !==
			LOCATOR_ATTRIBUTE
		)
			continue;

		if (
			t.isStringLiteral(
				attribute.value,
			)
		) {
			return attribute.value.value;
		}
	}

	return null;
}