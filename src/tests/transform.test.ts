import { beforeEach, describe, expect, it } from "vitest";
import type { ResolvedConfig } from "vite";

import { locatorRegistry, transformReactFile } from "../transform";
import type { LocatorMetadata } from "../shared/types";

const config = { root: "/project" } as ResolvedConfig;

function run(code: string, file = "/project/src/App.tsx") {
	const result = transformReactFile(code, file, config);
	if (!result) throw new Error("Transform returned null");
	return result.code;
}

function entriesFor(file: string): LocatorMetadata[] {
	return [...locatorRegistry.values()].filter((entry) => entry.file === file);
}

describe("transformReactFile", () => {
	beforeEach(() => {
		locatorRegistry.clear();
	});

	it("ignores non jsx/tsx files", () => {
		const result = transformReactFile("const a = 1;", "/project/src/util.ts", config);
		expect(result).toBeNull();
	});

	it("ignores node_modules files", () => {
		const result = transformReactFile(
			"export const A = () => <div />;",
			"/project/node_modules/pkg/src/A.tsx",
			config,
		);
		expect(result).toBeNull();
	});

	it("injects a stable locator id on every html element", () => {
		const code = run(`export function App() { return <div><span>x</span></div>; }`);

		const matches = code.match(/data-locator-id="[0-9a-f]{12}"/g) ?? [];

		expect(matches.length).toBe(2);
	});

	it("does not duplicate the locator attribute if run twice", () => {
		const once = run(`export function App() { return <div>x</div>; }`);
		locatorRegistry.clear();
		const twice = run(once);

		expect(twice.match(/data-locator-id/g)?.length).toBe(1);
	});

	it("detects function declaration components", () => {
		run(`export function App() { return <div />; }`);

		const [entry] = entriesFor("/project/src/App.tsx");
		expect(entry.component).toBe("App");
	});

	it("detects arrow function components", () => {
		run(`export const App = () => <div />;`);

		const [entry] = entriesFor("/project/src/App.tsx");
		expect(entry.component).toBe("App");
	});

	it("detects memo-wrapped components", () => {
		run(`
			import { memo } from "react";
			const App = memo(() => <div />);
		`);

		const [entry] = entriesFor("/project/src/App.tsx");
		expect(entry.component).toBe("App");
	});

	it("does not misclassify lowercase variables as components", () => {
		run(`
			export function App() {
				const helper = () => 1;
				return <div>{helper()}</div>;
			}
		`);

		const entries = entriesFor("/project/src/App.tsx");
		expect(entries.every((entry) => entry.component === "App")).toBe(true);
	});

	it("builds correct parent/child hierarchy", () => {
		run(`export function App() { return <div><span>x</span></div>; }`);

		const entries = entriesFor("/project/src/App.tsx");
		const root = entries.find((entry) => entry.tag === "div")!;
		const child = entries.find((entry) => entry.tag === "span")!;

		expect(root.parent).toBeNull();
		expect(root.depth).toBe(0);
		expect(root.children).toContain(child.id);
		expect(child.parent).toBe(root.id);
		expect(child.depth).toBe(1);
	});

	it("classifies svg tags", () => {
		run(`export function Icon() { return <svg><circle r={1} /></svg>; }`, "/project/src/Icon.tsx");

		const entries = entriesFor("/project/src/Icon.tsx");
		expect(entries.find((entry) => entry.tag === "svg")?.kind).toBe("svg");
		expect(entries.find((entry) => entry.tag === "circle")?.kind).toBe("svg");
	});

	it("classifies shorthand fragments", () => {
		run(`export function App() { return <><div /><div /></>; }`);

		const entries = entriesFor("/project/src/App.tsx");
		expect(entries.some((entry) => entry.kind === "fragment")).toBe(true);
	});

	it("classifies React.Fragment as a fragment", () => {
		run(`
			import React from "react";
			export function App() { return <React.Fragment><div /></React.Fragment>; }
		`);

		const entries = entriesFor("/project/src/App.tsx");
		expect(entries.some((entry) => entry.tag === "React.Fragment" && entry.kind === "fragment")).toBe(true);
	});

	it("marks elements rendered from .map() calls", () => {
		run(`
			export function List({ items }) {
				return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
			}
		`, "/project/src/List.tsx");

		const entries = entriesFor("/project/src/List.tsx");
		expect(entries.find((entry) => entry.tag === "li")?.generatedBy).toBe("map");
	});

	it("marks elements rendered from && expressions", () => {
		run(`export function App({ ok }) { return <div>{ok && <span>yes</span>}</div>; }`);

		const entries = entriesFor("/project/src/App.tsx");
		expect(entries.find((entry) => entry.tag === "span")?.generatedBy).toBe("logical");
	});

	it("marks elements rendered from ternary expressions", () => {
		run(`export function App({ ok }) { return <div>{ok ? <span /> : <em />}</div>; }`);

		const entries = entriesFor("/project/src/App.tsx");
		expect(entries.find((entry) => entry.tag === "span")?.generatedBy).toBe("ternary");
		expect(entries.find((entry) => entry.tag === "em")?.generatedBy).toBe("ternary");
	});

	it("marks elements rendered inside switch cases", () => {
		run(`
			export function App({ status }) {
				switch (status) {
					case "a":
						return <div>a</div>;
					default:
						return <span>b</span>;
				}
			}
		`);

		const entries = entriesFor("/project/src/App.tsx");
		expect(entries.every((entry) => entry.generatedBy === "conditional")).toBe(true);
	});

	it("marks portal elements", () => {
		run(`
			import { createPortal } from "react-dom";
			export function App() { return createPortal(<div>portal</div>, document.body); }
		`);

		const entries = entriesFor("/project/src/App.tsx");
		expect(entries.find((entry) => entry.tag === "div")?.kind).toBe("portal");
	});

	it("tracks hooks used within a component", () => {
		run(`
			import { useState } from "react";
			export function App() {
				const [count] = useState(0);
				return <div>{count}</div>;
			}
		`);

		const [entry] = entriesFor("/project/src/App.tsx");
		expect(entry.hooks.some((hook) => hook.name === "useState")).toBe(true);
	});

	it("tracks custom hooks (use-prefixed)", () => {
		run(`
			function useCustom() { return 1; }
			export function App() {
				const value = useCustom();
				return <div>{value}</div>;
			}
		`);

		const [entry] = entriesFor("/project/src/App.tsx");
		expect(entry.hooks.some((hook) => hook.name === "useCustom")).toBe(true);
	});

	it("handles self-closing elements without breaking hierarchy", () => {
		run(`export function App() { return <div><input /><span>x</span></div>; }`);

		const entries = entriesFor("/project/src/App.tsx");
		const root = entries.find((entry) => entry.tag === "div")!;
		const input = entries.find((entry) => entry.tag === "input")!;
		const span = entries.find((entry) => entry.tag === "span")!;

		expect(input.parent).toBe(root.id);
		expect(span.parent).toBe(root.id);
		expect(root.children).toEqual([input.id, span.id]);
	});

	it("clears stale entries for a file when it is re-transformed", () => {
		run(`export function App() { return <div><span /></div>; }`);
		expect(entriesFor("/project/src/App.tsx").length).toBe(2);

		run(`export function App() { return <div />; }`);
		expect(entriesFor("/project/src/App.tsx").length).toBe(1);
	});

	it("keeps entries from other files intact when transforming a new file", () => {
		run(`export function App() { return <div />; }`, "/project/src/App.tsx");
		run(`export function Other() { return <span />; }`, "/project/src/Other.tsx");

		expect(entriesFor("/project/src/App.tsx").length).toBe(1);
		expect(entriesFor("/project/src/Other.tsx").length).toBe(1);
	});
});
