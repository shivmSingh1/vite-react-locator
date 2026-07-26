export async function installRuntime() {
	console.log("🚀 Vite React Locator Runtime Started");

	try {
		const response = await fetch("/__locator");

		if (!response.ok) {
			throw new Error("Failed to fetch locator registry");
		}

		const registry = await response.json();

		console.log("📦 Locator Registry");
		console.table(registry);
	} catch (err) {
		console.error(err);
	}
}