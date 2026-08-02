export type LocatorKind =
	| "html"
	| "component"
	| "fragment"
	| "svg"
	| "portal";

export type GeneratorKind =
	| "normal"
	| "map"
	| "conditional"
	| "logical"
	| "ternary"
	| "array"
	| "memo";

export interface SourceLocation {
	file: string;
	line: number;
	column: number;
}

export interface HookInfo {
	name: string;
	line: number;
	column: number;
}

export interface ComponentInfo {
	id: string;
	name: string;
	displayName: string;
	file: string;
	line: number;
	column: number;

	memo: boolean;
	forwardRef: boolean;
	lazy: boolean;

	hooks: HookInfo[];
}

export interface LocatorMetadata {
	id: string;

	tag: string;

	component: string;

	displayName: string;

	kind: LocatorKind;

	file: string;

	line: number;

	column: number;

	parent: string | null;

	children: string[];

	depth: number;

	generatedBy: GeneratorKind;

	hooks: HookInfo[];

	attributes: string[];
}