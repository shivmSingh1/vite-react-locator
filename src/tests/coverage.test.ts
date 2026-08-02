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

describe("edge-case render pattern coverage", () => {
	beforeEach(() => {
		locatorRegistry.clear();
	});

	it("tags elements inside Context.Provider / Context.Consumer", () => {
		run(`
			import { ThemeContext } from "./theme";
			export function App() {
				return (
					<ThemeContext.Provider value="dark">
						<ThemeContext.Consumer>
							{(theme) => <div>{theme}</div>}
						</ThemeContext.Consumer>
					</ThemeContext.Provider>
				);
			}
		`);

		const entries = entriesFor("/project/src/App.tsx");
		expect(entries.find((e) => e.tag === "ThemeContext.Provider")).toBeTruthy();
		expect(entries.find((e) => e.tag === "ThemeContext.Consumer")).toBeTruthy();
		expect(entries.find((e) => e.tag === "div")).toBeTruthy();
	});

	it("tags elements passed as props.children", () => {
		run(`
			export function Card({ children }) {
				return <div className="card">{children}</div>;
			}
			export function App() {
				return <Card><span>hello</span></Card>;
			}
		`);

		const entries = entriesFor("/project/src/App.tsx");
		expect(entries.find((e) => e.tag === "Card")).toBeTruthy();
		expect(entries.find((e) => e.tag === "span")).toBeTruthy();
	});

	it("tags elements rendered via React.Children.map", () => {
		run(`
			export function List({ children }) {
				return <ul>{React.Children.map(children, (child) => <li>{child}</li>)}</ul>;
			}
		`);

		const entries = entriesFor("/project/src/App.tsx");
		expect(entries.find((e) => e.tag === "ul")).toBeTruthy();
		expect(entries.find((e) => e.tag === "li")?.generatedBy).toBe("map");
	});

	it("tags elements passed to cloneElement", () => {
		run(`
			import { cloneElement } from "react";
			export function App({ icon }) {
				return cloneElement(<span className="wrap">{icon}</span>, { extra: true });
			}
		`);

		const entries = entriesFor("/project/src/App.tsx");
		expect(entries.find((e) => e.tag === "span")).toBeTruthy();
	});

	it("tags img, picture, and source elements", () => {
		run(`
			export function Hero() {
				return (
					<picture>
						<source srcSet="a.avif" type="image/avif" />
						<source srcSet="a.webp" type="image/webp" />
						<img src="a.png" alt="hero" />
					</picture>
				);
			}
		`, "/project/src/Hero.tsx");

		const entries = entriesFor("/project/src/Hero.tsx");
		expect(entries.find((e) => e.tag === "picture")?.kind).toBe("html");
		expect(entries.filter((e) => e.tag === "source").length).toBe(2);
		expect(entries.find((e) => e.tag === "img")).toBeTruthy();
	});

	it("tags nested arrays and nested map() calls", () => {
		run(`
			export function Grid({ rows }) {
				return (
					<div>
						{rows.map((row) => (
							<div key={row.id}>
								{row.cells.map((cell) => <span key={cell.id}>{cell.value}</span>)}
							</div>
						))}
					</div>
				);
			}
		`, "/project/src/Grid.tsx");

		const entries = entriesFor("/project/src/Grid.tsx");
		const outerDivs = entries.filter((e) => e.tag === "div" && e.generatedBy === "map");
		const innerSpans = entries.filter((e) => e.tag === "span" && e.generatedBy === "map");
		expect(outerDivs.length).toBe(1);
		expect(innerSpans.length).toBe(1);
	});

	it("tags elements inside a helper function that returns JSX (not itself a component)", () => {
		run(`
			function renderRow(user) {
				return <tr key={user.id}><td>{user.name}</td></tr>;
			}
			export function Table({ users }) {
				return <table><tbody>{users.map(renderRow)}</tbody></table>;
			}
		`, "/project/src/Table.tsx");

		const entries = entriesFor("/project/src/Table.tsx");
		expect(entries.find((e) => e.tag === "tr")).toBeTruthy();
		expect(entries.find((e) => e.tag === "td")).toBeTruthy();
	});

	it("tags memo(forwardRef(...)) composed components", () => {
		run(`
			import { memo, forwardRef } from "react";
			const Input = memo(forwardRef((props, ref) => <input ref={ref} {...props} />));
		`, "/project/src/Input.tsx");

		const entries = entriesFor("/project/src/Input.tsx");
		const input = entries.find((e) => e.tag === "input");
		expect(input).toBeTruthy();
		expect(input?.component).toBe("Input");
	});

	it("tags elements inside Suspense fallback and children", () => {
		run(`
			import { Suspense, lazy } from "react";
			const Lazy = lazy(() => import("./Lazy"));
			export function App() {
				return (
					<Suspense fallback={<div className="spinner" />}>
						<Lazy />
					</Suspense>
				);
			}
		`);

		const entries = entriesFor("/project/src/App.tsx");
		expect(entries.find((e) => e.tag === "Suspense")).toBeTruthy();
		expect(entries.find((e) => e.tag === "div" && e.kind === "html")).toBeTruthy();
		expect(entries.find((e) => e.tag === "Lazy")).toBeTruthy();
	});

	it("never resolves component to Unknown for a lowercase helper function returning JSX", () => {
		run(`
			function renderRow(user) {
				return <tr key={user.id}><td>{user.name}</td></tr>;
			}
			export function Table({ users }) {
				return <table><tbody>{users.map(renderRow)}</tbody></table>;
			}
		`, "/project/src/Table.tsx");

		const entries = entriesFor("/project/src/Table.tsx");
		expect(entries.some((e) => e.component === "Unknown")).toBe(false);
		expect(entries.find((e) => e.tag === "tr")?.component).toBe("renderRow");
		expect(entries.find((e) => e.tag === "td")?.component).toBe("renderRow");
	});

	it("never resolves component to Unknown for a render function passed as a prop", () => {
		run(`
			function renderCard(item) {
				return <div className="card">{item.name}</div>;
			}
			export function List({ items }) {
				return <Section products={items} renderCard={renderCard} />;
			}
		`, "/project/src/List.tsx");

		const entries = entriesFor("/project/src/List.tsx");
		expect(entries.some((e) => e.component === "Unknown")).toBe(false);
		expect(entries.find((e) => e.tag === "div")?.component).toBe("renderCard");
	});

	it("never resolves component to Unknown for an anonymous memo(forwardRef()) default export", () => {
		run(`
			import { memo, forwardRef } from "react";
			export default memo(forwardRef((props, ref) => <input ref={ref} {...props} />));
		`, "/project/src/Input.tsx");

		const entries = entriesFor("/project/src/Input.tsx");
		expect(entries.some((e) => e.component === "Unknown")).toBe(false);
		const input = entries.find((e) => e.tag === "input");
		expect(input?.component).toBe("Input");
		expect(input?.component).not.toBe("Unknown");
	});

	it("falls back to a filename-derived name (never Unknown) for truly top-level JSX", () => {
		run(`export const ICON = <svg><path d="M0 0" /></svg>;`, "/project/src/icons.tsx");

		const entries = entriesFor("/project/src/icons.tsx");
		expect(entries.some((e) => e.component === "Unknown")).toBe(false);
		expect(entries.every((e) => e.component === "icons")).toBe(true);
	});
});
