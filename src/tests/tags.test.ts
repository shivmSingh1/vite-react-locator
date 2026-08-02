import { describe, expect, it } from "vitest";

import { isComponentName, isFragmentTag, isHtmlTag, isSvgTag } from "../shared/tags";

describe("isComponentName", () => {
	it("treats capitalized identifiers as components", () => {
		expect(isComponentName("Navbar")).toBe(true);
	});

	it("treats namespaced member tags as components", () => {
		expect(isComponentName("motion.div")).toBe(true);
	});

	it("treats lowercase identifiers as non-components", () => {
		expect(isComponentName("div")).toBe(false);
	});
});

describe("isHtmlTag", () => {
	it("recognizes standard html tags", () => {
		expect(isHtmlTag("div")).toBe(true);
		expect(isHtmlTag("button")).toBe(true);
	});

	it("excludes svg tags", () => {
		expect(isHtmlTag("circle")).toBe(false);
	});

	it("excludes capitalized component names", () => {
		expect(isHtmlTag("Navbar")).toBe(false);
	});
});

describe("isSvgTag", () => {
	it("recognizes svg elements", () => {
		expect(isSvgTag("svg")).toBe(true);
		expect(isSvgTag("path")).toBe(true);
		expect(isSvgTag("circle")).toBe(true);
	});

	it("rejects non-svg elements", () => {
		expect(isSvgTag("div")).toBe(false);
	});
});

describe("isFragmentTag", () => {
	it("recognizes shorthand and explicit fragments", () => {
		expect(isFragmentTag("Fragment")).toBe(true);
		expect(isFragmentTag("React.Fragment")).toBe(true);
	});

	it("rejects other tags", () => {
		expect(isFragmentTag("div")).toBe(false);
	});
});
