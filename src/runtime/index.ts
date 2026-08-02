import { DEFAULT_ACTIVATION_KEY, LOCATOR_ENDPOINT, OPTIONS_ENDPOINT } from "../shared/constants";

import type { LocatorMetadata } from "../shared/types";

import { installEvents } from "./events";

export interface RuntimeOptions {
	enabled: boolean;
	activationKey: string;
}

export interface RuntimeState {
	registry: Map<string, LocatorMetadata>;
	activationKey: string;
	initialized: boolean;
}

export const runtime: RuntimeState = {
	registry: new Map(),
	activationKey: DEFAULT_ACTIVATION_KEY,
	initialized: false,
};

let pendingRefresh: Promise<void> | null = null;

async function loadRegistry(): Promise<void> {
	const response = await fetch(LOCATOR_ENDPOINT, { cache: "no-store" });

	const data = (await response.json()) as Record<string, LocatorMetadata>;

	runtime.registry.clear();

	for (const value of Object.values(data)) {
		runtime.registry.set(value.id, value);
	}
}

export function refreshRegistry(): Promise<void> {
	pendingRefresh ??= loadRegistry().finally(() => {
		pendingRefresh = null;
	});

	return pendingRefresh;
}

async function loadOptions(): Promise<void> {
	const response = await fetch(OPTIONS_ENDPOINT, { cache: "no-store" });

	const options = (await response.json()) as Partial<RuntimeOptions>;

	runtime.activationKey = options.activationKey ?? DEFAULT_ACTIVATION_KEY;
}

export async function installRuntime(): Promise<void> {
	if (runtime.initialized) return;

	await Promise.all([refreshRegistry(), loadOptions()]);

	installEvents(runtime);

	runtime.initialized = true;
}

void installRuntime();

export default runtime;
