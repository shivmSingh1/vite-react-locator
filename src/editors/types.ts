export interface Location {
	file: string;
	line: number;
	column: number;
}

export interface Editor {
	open(location: Location): Promise<void>;
}