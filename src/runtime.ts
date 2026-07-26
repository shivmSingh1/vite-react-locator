export async function installRuntime() {
	const response = await fetch("/__locator");

	const registry = await response.json();

	console.log("📦 Runtime Registry");
	console.table(registry);
}