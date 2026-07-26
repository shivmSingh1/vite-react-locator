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