import type * as t from "@babel/types";

import type { GeneratorKind, LocatorKind, LocatorMetadata } from "../shared/types";

import { deriveNameFromFile } from "../shared/utils";

import type { TransformContext } from "./types";

import { createLocatorId } from "./ids";

import { currentComponent } from "./component";

export interface CreateLocatorOptions {
	node: t.Node;

	tag: string;

	kind: LocatorKind;

	generatedBy?: GeneratorKind;

	attributes?: string[];
}

export function createLocator(context: TransformContext, options: CreateLocatorOptions): LocatorMetadata {
	const component = currentComponent(context);

	// currentComponent() covers every named function/component/wrapper scope
	// (see transform/component.ts). The only way to reach this fallback is
	// genuinely top-level JSX with no enclosing function at all (e.g. a bare
	// module-scope `const ICON = <svg />;`) — rare, but still resolve to the
	// file it lives in rather than a bare "Unknown".
	const fallbackName = deriveNameFromFile(context.file);

	return {
		id: createLocatorId(options.node, context.file, options.tag),
		tag: options.tag,
		kind: options.kind,
		component: component?.name ?? fallbackName,
		displayName: component?.displayName ?? fallbackName,
		file: context.file,
		line: options.node.loc?.start.line ?? 0,
		column: options.node.loc?.start.column ?? 0,
		parent: null,
		children: [],
		depth: 0,
		generatedBy: options.generatedBy ?? "normal",
		hooks: component ? [...component.hooks] : [],
		attributes: options.attributes ? [...options.attributes] : [],
	};
}

export function registerLocator(context: TransformContext, locator: LocatorMetadata): void {
	context.registry.set(locator.id, locator);
}

export function unregisterLocator(context: TransformContext, id: string): void {
	context.registry.delete(id);
}

export function getLocator(context: TransformContext, id: string): LocatorMetadata | undefined {
	return context.registry.get(id);
}

export function hasLocator(context: TransformContext, id: string): boolean {
	return context.registry.has(id);
}

export function getAllLocators(context: TransformContext): LocatorMetadata[] {
	return [...context.registry.values()];
}

export function clearRegistry(context: TransformContext): void {
	context.registry.clear();
}

export function clearFileEntries(registry: Map<string, LocatorMetadata>, file: string): void {
	for (const [id, locator] of registry) {
		if (locator.file === file) {
			registry.delete(id);
		}
	}
}
