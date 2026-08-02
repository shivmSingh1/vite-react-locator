export interface OpenLocation {
	file: string;
	line: number;
	column: number;
}

export interface Editor {
	open(location: OpenLocation): Promise<void>;
}

import { codeEditor } from "./vscode";

export const editor: Editor = codeEditor;
