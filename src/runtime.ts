import type { ActivationKey } from "./index";
import { showOverlay, hideOverlay } from "./overlay";

interface LocatorMetadata {
	id: string;
	component: string;
	file: string;
	line: number;
	column: number;
}

interface RuntimeOptions {
	activationKey: ActivationKey;
}

interface ParsedActivationKey {
	ctrl: boolean;
	alt: boolean;
	shift: boolean;
	meta: boolean;
}

let activation: ParsedActivationKey = {
	ctrl: true,
	alt: false,
	shift: false,
	meta: false,
};


type LocatorRegistry = Record<string, LocatorMetadata>;

let registry: LocatorRegistry = {};
let runtimeOptions: RuntimeOptions = {
	activationKey: "Ctrl",
};
let currentLocatorId: string | null = null;
let installed = false;

function parseActivationKey(
	key: ActivationKey
): ParsedActivationKey {
	const keys = key
		.split("+")
		.map((k) => k.trim().toLowerCase());

	return {
		ctrl: keys.includes("ctrl"),
		alt: keys.includes("alt"),
		shift: keys.includes("shift"),
		meta: keys.includes("meta"),
	};
}

function isActivationPressed(
	e: Pick<
		KeyboardEvent | MouseEvent,
		"ctrlKey" | "altKey" | "shiftKey" | "metaKey"
	>
) {
	return (
		e.ctrlKey === activation.ctrl &&
		e.altKey === activation.alt &&
		e.shiftKey === activation.shift &&
		e.metaKey === activation.meta
	);
}


function hasModifierKey(
	e: Pick<
		KeyboardEvent | MouseEvent,
		"ctrlKey" | "altKey" | "shiftKey" | "metaKey"
	>
) {
	return e.ctrlKey || e.altKey || e.shiftKey || e.metaKey;
}

export async function installRuntime() {
	if (installed) return;

	installed = true;

	try {
		const [registryResponse, optionsResponse] = await Promise.all([
			fetch("/__locator"),
			fetch("/__locator-options"),
		]);

		registry = await registryResponse.json();
		runtimeOptions = await optionsResponse.json();
		activation = parseActivationKey(runtimeOptions.activationKey);
	} catch (err) {
		console.error("Failed to load locator runtime", err);
	}


	window.addEventListener("keyup", (e) => {
		if (!hasModifierKey(e)) {
			currentLocatorId = null;
			hideOverlay();
		}
	});

	window.addEventListener("mousemove", (event) => {
		if (!isActivationPressed(event)) return;

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

	});

	window.addEventListener("click", async (event) => {
		if (!isActivationPressed(event)) return;

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
