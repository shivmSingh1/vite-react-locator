export interface ComponentDeclaration {
	name: string;
	file: string;
	line: number;
	column: number;
}

export interface ComponentUsage {
	name: string;
	line: number;
	column: number;
}

export interface FileMetadata {
	declarations: ComponentDeclaration[];
	usages: ComponentUsage[];
}