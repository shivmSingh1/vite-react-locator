export interface LocatorRegistry {
	[id: string]: {
		id: string;
		component: string;
		file: string;
		line: number;
		column: number;
	};
}

let registry: LocatorRegistry = {};
let altPressed = false;

export async function installRuntime() {
	console.log("🚀 Runtime started");

	try {
		const response = await fetch("/__locator");

		registry = await response.json();

		console.log("📦 Registry Loaded");
		console.table(registry);
	} catch (error) {
		console.error("Failed to load locator registry", error);
	}

	window.addEventListener("keydown", (event) => {
		if (event.key === "Alt") {
			altPressed = true;
			console.log("🟢 Alt Pressed");
		}
	});

	window.addEventListener("keyup", (event) => {
		if (event.key === "Alt") {
			altPressed = false;
			console.log("🔴 Alt Released");
		}
	});
}