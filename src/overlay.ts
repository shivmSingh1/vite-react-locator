let overlay: HTMLDivElement | null = null;

export function createOverlay() {
	if (overlay) return overlay;

	overlay = document.createElement("div");

	Object.assign(overlay.style, {
		position: "fixed",
		border: "2px solid #3b82f6",
		background: "rgba(59,130,246,0.08)",
		pointerEvents: "none",
		zIndex: "999999",
		display: "none",
		boxSizing: "border-box",
	});

	document.body.appendChild(overlay);

	return overlay;
}

export function showOverlay(element: HTMLElement) {
	const overlay = createOverlay();

	const rect = element.getBoundingClientRect();

	overlay.style.display = "block";
	overlay.style.left = `${rect.left}px`;
	overlay.style.top = `${rect.top}px`;
	overlay.style.width = `${rect.width}px`;
	overlay.style.height = `${rect.height}px`;
}

export function hideOverlay() {
	if (!overlay) return;

	overlay.style.display = "none";
}