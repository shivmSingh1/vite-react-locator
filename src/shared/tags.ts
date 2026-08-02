export const SVG_TAGS: ReadonlySet<string> = new Set([
	"svg",
	"path",
	"circle",
	"rect",
	"g",
	"defs",
	"clipPath",
	"linearGradient",
	"radialGradient",
	"stop",
	"polygon",
	"polyline",
	"ellipse",
	"line",
	"text",
	"tspan",
	"textPath",
	"use",
	"mask",
	"pattern",
	"symbol",
	"marker",
	"foreignObject",
	"image",
	"filter",
	"feGaussianBlur",
	"feColorMatrix",
	"feBlend",
	"feOffset",
	"feMerge",
	"feMergeNode",
]);

export const FRAGMENT_TAGS: ReadonlySet<string> = new Set([
	"Fragment",
	"React.Fragment",
]);

export function isComponentName(name: string): boolean {
	return /^[A-Z]/.test(name) || name.includes(".");
}

export function isHtmlTag(name: string): boolean {
	return /^[a-z][a-zA-Z0-9-]*$/.test(name) && !isSvgTag(name);
}

export function isSvgTag(name: string): boolean {
	return SVG_TAGS.has(name);
}

export function isFragmentTag(name: string): boolean {
	return FRAGMENT_TAGS.has(name);
}
