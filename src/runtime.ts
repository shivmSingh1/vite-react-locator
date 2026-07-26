import { showOverlay, hideOverlay } from "./overlay";

interface LocatorMetadata {
	id: string;
	component: string;
	file: string;
	line: number;
	column: number;
}

type LocatorRegistry = Record<string, LocatorMetadata>;

let registry: LocatorRegistry = {};
let altPressed = false;
let currentLocatorId: string | null = null;
let installed = false;

export async function installRuntime() {
	if (installed) return;

	installed = true;


	try {
		const response = await fetch("/__locator");
		registry = await response.json();

	} catch (err) {
		console.error("Failed to load registry", err);
	}

	window.addEventListener("keydown", (e) => {
		if (e.key === "Alt") {
			altPressed = true;
		}
	});

	window.addEventListener("keyup", (e) => {
		if (e.key === "Alt") {
			altPressed = false;
			currentLocatorId = null;
			hideOverlay();
		}
	});

	window.addEventListener("mousemove", (event) => {
		if (!altPressed) return;

		const element = document.elementFromPoint(
			event.clientX,
			event.clientY
		) as HTMLElement | null;

		if (!element) return;

		// Walk up the DOM until we find a locator
		const target = element.closest("[data-locator-id]") as HTMLElement | null;

		if (!target) return;

		const locatorId = target.dataset.locatorId;

		if (!locatorId) return;

		if (locatorId === currentLocatorId) {
			return;
		}

		currentLocatorId = locatorId;

		const metadata = registry[locatorId];

		if (!metadata) return;

		showOverlay(
			target,
			metadata.component,
			metadata.file,
			metadata.line
		);

		console.clear();
	});

	window.addEventListener("click", async (event) => {
		if (!altPressed) return;

		const element = document.elementFromPoint(
			event.clientX,
			event.clientY
		) as HTMLElement | null;

		if (!element) return;

		const target = element.closest("[data-locator-id]") as HTMLElement | null;

		if (!target) return;

		const locatorId = target.dataset.locatorId;

		if (!locatorId) return;

		const metadata = registry[locatorId];

		if (!metadata) return;

		event.preventDefault();
		event.stopPropagation();

		await fetch("/__open", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(metadata),
		});
	});
}

installRuntime();
