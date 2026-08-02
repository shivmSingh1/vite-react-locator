import type { RuntimeState } from "./index";

import { refreshRegistry } from "./index";

import { LOCATOR_ATTRIBUTE, OPEN_ENDPOINT } from "../shared/constants";

import type { LocatorMetadata } from "../shared/types";

import { hideOverlay, showOverlay } from "./overlay";

let currentLocatorId: string | null = null;

// Ids we've tried to resolve but the registry didn't have yet, with the
// timestamp of the last attempt. Distinct from currentLocatorId: a failed
// lookup must NOT block retrying on the next hover pass over the same
// element, otherwise the only way to recover is a full page reload (which
// happens to reset all of this in-memory state and buy Vite more time to
// finish transforming the module). A short cooldown just prevents hammering
// the server on every mousemove tick while still self-healing quickly.
const pendingLookups = new Map<string, number>();

const RETRY_COOLDOWN_MS = 400;

function shouldAttemptLookup(locatorId: string): boolean {
	const lastAttempt = pendingLookups.get(locatorId);
	const now = Date.now();

	if (lastAttempt !== undefined && now - lastAttempt < RETRY_COOLDOWN_MS) return false;

	pendingLookups.set(locatorId, now);

	return true;
}

const MODIFIER_CHECKS: Record<string, (event: MouseEvent | KeyboardEvent) => boolean> = {
	Ctrl: (event) => event.ctrlKey,
	Alt: (event) => event.altKey,
	Shift: (event) => event.shiftKey,
	Meta: (event) => event.metaKey,
};

function isActivationPressed(event: MouseEvent, activationKey: string): boolean {
	const modifiers = activationKey.split("+");

	return modifiers.every((modifier) => MODIFIER_CHECKS[modifier]?.(event) ?? false);
}

function isAnyModifierPressed(event: KeyboardEvent): boolean {
	return event.ctrlKey || event.altKey || event.shiftKey || event.metaKey;
}

function findLocatorElement(x: number, y: number): HTMLElement | null {
	const element = document.elementFromPoint(x, y);

	if (!element) return null;

	return element.closest(`[${LOCATOR_ATTRIBUTE}]`);
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_RESOLVE_ATTEMPTS = 5;
const RESOLVE_RETRY_DELAY_MS = 200;

async function resolveMetadata(
	runtime: RuntimeState,
	locatorId: string,
): Promise<LocatorMetadata | undefined> {
	const cached = runtime.registry.get(locatorId);

	if (cached) return cached;

	// The registry is fetched once at startup, racing Vite's own module graph.
	// Components transformed after that initial fetch (async imports, routes
	// visited later, anything below the fold that Vite hadn't served yet) are
	// missing from the cached snapshot even though their DOM already carries a
	// valid data-locator-id. A single retry can still lose that race if the
	// module is still mid-transform, so retry a bounded number of times with
	// a short delay rather than giving up after one attempt.
	for (let attempt = 0; attempt < MAX_RESOLVE_ATTEMPTS; attempt += 1) {
		await refreshRegistry();

		const resolved = runtime.registry.get(locatorId);

		if (resolved) return resolved;

		if (attempt < MAX_RESOLVE_ATTEMPTS - 1) {
			await delay(RESOLVE_RETRY_DELAY_MS);
		}
	}

	return undefined;
}

export function installEvents(runtime: RuntimeState): void {
	window.addEventListener(
		"keyup",
		(event: KeyboardEvent) => {
			if (!isAnyModifierPressed(event)) {
				currentLocatorId = null;
				hideOverlay();
			}
		},
		true,
	);

	window.addEventListener(
		"mousemove",
		(event: MouseEvent) => {
			if (!isActivationPressed(event, runtime.activationKey)) {
				hideOverlay();
				currentLocatorId = null;
				return;
			}

			const element = findLocatorElement(event.clientX, event.clientY);

			if (!element) {
				hideOverlay();
				currentLocatorId = null;
				return;
			}

			const locatorId = element.getAttribute(LOCATOR_ATTRIBUTE);

			if (!locatorId) {
				hideOverlay();
				currentLocatorId = null;
				return;
			}

			const cached = runtime.registry.get(locatorId);

			if (cached) {
				pendingLookups.delete(locatorId);

				if (locatorId !== currentLocatorId) {
					currentLocatorId = locatorId;
					showOverlay(element, cached.component, cached.file, cached.line);
				}

				return;
			}

			// Not cached yet. This must be retried on every hover pass (subject
			// to a short cooldown) rather than only once — the transform for this
			// element's module may still be in flight, so a single retry can
			// still lose the race. currentLocatorId is intentionally NOT set here
			// on failure, so the next mousemove over the same still-unresolved
			// element tries again instead of getting stuck.
			if (!shouldAttemptLookup(locatorId)) return;

			void resolveMetadata(runtime, locatorId).then((metadata) => {
				// The pointer may have moved to a different element while the
				// registry refresh was in flight — only render if this is still
				// the element currently being hovered.
				if (!metadata) return;

				pendingLookups.delete(locatorId);

				const stillHovering = findLocatorElement(event.clientX, event.clientY);

				if (stillHovering?.getAttribute(LOCATOR_ATTRIBUTE) !== locatorId) return;

				currentLocatorId = locatorId;
				showOverlay(element, metadata.component, metadata.file, metadata.line);
			});
		},
		true,
	);

	window.addEventListener(
		"click",
		(event: MouseEvent) => {
			if (!isActivationPressed(event, runtime.activationKey)) return;

			const element = findLocatorElement(event.clientX, event.clientY);

			if (!element) return;

			const locatorId = element.getAttribute(LOCATOR_ATTRIBUTE);

			if (!locatorId) return;

			// This element is genuinely locator-tagged (the DOM attribute proves
			// the transform ran on it); stop the default click/navigation now,
			// even if the registry metadata for it hasn't been cached yet.
			event.preventDefault();
			event.stopPropagation();

			void resolveMetadata(runtime, locatorId).then((metadata) => {
				if (!metadata) {
					console.error(
						`[vite-react-locator] Could not resolve locator metadata for "${locatorId}". ` +
							"The element has a data-locator-id but the dev server registry never returned it.",
					);
					return;
				}

				void fetch(OPEN_ENDPOINT, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						file: metadata.file,
						line: metadata.line,
						column: metadata.column,
					}),
				})
					.then(async (response) => {
						if (response.ok) return;

						const body = (await response.json().catch(() => null)) as { error?: string } | null;

						console.error(
							`[vite-react-locator] Failed to open ${metadata.file}:${metadata.line}:${metadata.column} — ` +
								(body?.error ?? `server responded with ${String(response.status)}`),
						);
					})
					.catch((error: unknown) => {
						console.error("[vite-react-locator] Failed to reach the dev server to open the file.", error);
					});
			});
		},
		true,
	);
}
