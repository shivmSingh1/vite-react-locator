let overlay: HTMLDivElement | null = null;
let tooltip: HTMLDivElement | null = null;

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

function createTooltip() {
	if (tooltip) return tooltip;

	tooltip = document.createElement("div");

	Object.assign(tooltip.style, {
		position: "fixed",
		background: "#111827",
		color: "white",
		padding: "8px 10px",
		borderRadius: "6px",
		fontSize: "12px",
		fontFamily: "system-ui",
		pointerEvents: "none",
		zIndex: "1000000",
		display: "none",
		whiteSpace: "nowrap",
		boxShadow: "0 4px 10px rgba(0,0,0,.25)",
	});

	document.body.appendChild(tooltip);

	return tooltip;
}

export function showOverlay(
	element: HTMLElement,
	component: string,
	file: string,
	line: number
) {
	const overlay = createOverlay();
	const tooltip = createTooltip();

	const rect = element.getBoundingClientRect();

	// Overlay
	overlay.style.display = "block";
	overlay.style.left = `${rect.left}px`;
	overlay.style.top = `${rect.top}px`;
	overlay.style.width = `${rect.width}px`;
	overlay.style.height = `${rect.height}px`;

	// Tooltip
	const filename = file.split(/[\\/]/).pop();

	tooltip.innerHTML = `
		<div style="font-weight:600">${component}</div>
		<div>${filename}:${line}</div>
	`;

	tooltip.style.display = "block";


	let left = rect.left;
	let top = rect.top - 45;

	if (top < 8) {
		top = rect.bottom + 8;
	}

	tooltip.style.left = `${left}px`;
	tooltip.style.top = `${top}px`;
}

export function hideOverlay() {
	if (overlay) {
		overlay.style.display = "none";
	}

	if (tooltip) {
		tooltip.style.display = "none";
	}
}

