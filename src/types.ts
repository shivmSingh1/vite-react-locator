export interface ComponentDeclaration {
	name: string;
	file: string;
	line: number;
	column: number;
}

export interface ComponentUsage {
	id: string;
	name: string;
	line: number;
	column: number;
}

export interface FileMetadata {
	declarations: ComponentDeclaration[];
	usages: ComponentUsage[];
}