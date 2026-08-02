import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";

import type { ComponentInfo, LocatorMetadata } from "../shared/types";

export interface TransformContext {
	file: string;

	root: string;

	registry: Map<string, LocatorMetadata>;

	componentStack: ComponentInfo[];

	componentNodeStack: t.Node[];

	locatorStack: LocatorMetadata[];
}

export type JSXOpeningPath = NodePath<t.JSXOpeningElement>;

export type JSXClosingPath = NodePath<t.JSXClosingElement>;

export type JSXFragmentPath = NodePath<t.JSXFragment>;

export type FunctionDeclarationPath = NodePath<t.FunctionDeclaration>;

export type VariableDeclaratorPath = NodePath<t.VariableDeclarator>;

export type CallExpressionPath = NodePath<t.CallExpression>;
