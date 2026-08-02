import type * as t from "@babel/types";

import { createHash } from "../shared/hash";

export function createLocatorId(node: t.Node, file: string, tag: string): string {
	const line = node.loc?.start.line ?? 0;
	const column = node.loc?.start.column ?? 0;

	return createHash(`${file}:${line}:${column}:${tag}`);
}

export function createComponentId(file: string, name: string, line: number, column: number): string {
	return createHash(`${file}:${name}:${line}:${column}`);
}

export function createHookId(file: string, name: string, line: number, column: number): string {
	return createHash(`${file}:${name}:${line}:${column}`);
}
