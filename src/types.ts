export interface ComponentDeclaration {
	name: string;
	file: string;
	line: number;
	column: number;
}


export interface FileMetadata {
	declarations: ComponentDeclaration[];
}

export interface LocatorMetadata {
	id: string;
	component: string;
	file: string;
	line: number;
	column: number;
}

export interface LocatorOptions {
	activationKey?: string;
}

export const DEFAULT_OPTIONS: Required<LocatorOptions> = {
	activationKey: "Alt",
};