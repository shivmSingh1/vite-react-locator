import crypto from "node:crypto";

import { HASH_LENGTH } from "./constants";

export function createHash(value: string): string {
	return crypto
		.createHash("sha1")
		.update(value)
		.digest("hex")
		.slice(0, HASH_LENGTH);
}
