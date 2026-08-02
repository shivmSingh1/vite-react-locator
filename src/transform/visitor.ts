import * as traverseModule from "@babel/traverse";
import type { NodePath, Visitor } from "@babel/traverse";
import type * as t from "@babel/types";

import type { TransformContext } from "./types";

import {
	enterArrowComponent,
	enterFunctionComponent,
	enterWrapperCallExpression,
	leaveComponentIfMatches,
} from "./component";

import { processHook } from "./hooks";

import {
	processJSXClosingElement,
	processJSXFragment,
	processJSXFragmentExit,
	processJSXOpeningElement,
} from "./jsx";

type TraverseFn = (ast: t.Node, visitor: Visitor) => void;

interface TraverseModuleShape {
	default?: TraverseModuleShape | TraverseFn;
}

const traverse =
	((traverseModule as TraverseModuleShape).default as TraverseModuleShape | undefined)?.default ??
	(traverseModule as TraverseModuleShape).default ??
	(traverseModule);

export function createVisitor(context: TransformContext): Visitor {
	return {
		FunctionDeclaration: {
			enter(path: NodePath<t.FunctionDeclaration>) {
				enterFunctionComponent(path, context);
			},

			exit(path: NodePath<t.FunctionDeclaration>) {
				leaveComponentIfMatches(context, path.node);
			},
		},

		VariableDeclarator: {
			enter(path: NodePath<t.VariableDeclarator>) {
				enterArrowComponent(path, context);
			},

			exit(path: NodePath<t.VariableDeclarator>) {
				leaveComponentIfMatches(context, path.node);
			},
		},

		CallExpression: {
			enter(path: NodePath<t.CallExpression>) {
				processHook(path, context);
				enterWrapperCallExpression(path, context);
			},

			exit(path: NodePath<t.CallExpression>) {
				leaveComponentIfMatches(context, path.node);
			},
		},

		JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
			processJSXOpeningElement(path, context);
		},

		JSXClosingElement() {
			processJSXClosingElement(context);
		},

		JSXFragment: {
			enter(path: NodePath<t.JSXFragment>) {
				processJSXFragment(path, context);
			},

			exit() {
				processJSXFragmentExit(context);
			},
		},
	};
}

export function runVisitor(ast: t.File, context: TransformContext): void {
	(traverse as TraverseFn)(ast, createVisitor(context));
}
