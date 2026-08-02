import { describe, expect, it } from "vitest";

import { createHash } from "../shared/hash";
import { HASH_LENGTH } from "../shared/constants";

describe("createHash", () => {
	it("produces a deterministic hash for the same input", () => {
		expect(createHash("a:1:2:div")).toBe(createHash("a:1:2:div"));
	});

	it("produces different hashes for different inputs", () => {
		expect(createHash("a:1:2:div")).not.toBe(createHash("a:1:2:span"));
	});

	it("respects the configured hash length", () => {
		expect(createHash("anything")).toHaveLength(HASH_LENGTH);
	});

	it("only contains hex characters", () => {
		expect(createHash("anything")).toMatch(/^[0-9a-f]+$/);
	});
});
