let overlay: HTMLDivElement | null = null;
let tooltip: HTMLDivElement | null = null;

function createOverlay() {
	if (overlay) return;

	overlay = document.createElement("div");

	Object.assign(overlay.style, {
		position: "fixed",
		boxSizing: "border-box",
		border: "2px solid #2563eb",
		background: "rgba(37,99,235,.08)",
		pointerEvents: "none",
		zIndex: "2147483647",
		display: "none",
	});

	tooltip = document.createElement("div");

	Object.assign(tooltip.style, {
		position: "fixed",
		background: "#2563eb",
		color: "#fff",
		fontFamily:
			"Inter,Segoe UI,Arial,sans-serif",
		fontSize: "12px",
		fontWeight: "600",
		padding: "6px 10px",
		borderRadius: "6px",
		pointerEvents: "none",
		zIndex: "2147483647",
		whiteSpace: "nowrap",
		display: "none",
		boxShadow:
			"0 8px 24px rgba(0,0,0,.15)",
	});

	document.body.appendChild(overlay);
	document.body.appendChild(tooltip);
}

export function showOverlay(
	element: HTMLElement,
	component: string,
	file: string,
	line: number,
) {
	createOverlay();

	if (!overlay || !tooltip) return;

	const rect =
		element.getBoundingClientRect();

	overlay.style.display = "block";

	overlay.style.left =
		`${rect.left}px`;

	overlay.style.top =
		`${rect.top}px`;

	overlay.style.width =
		`${rect.width}px`;

	overlay.style.height =
		`${rect.height}px`;

	tooltip.style.display = "block";

	tooltip.textContent =
		`${component} • ${file}:${line}`;

	requestAnimationFrame(() => {

		if (!tooltip) return;

		const width =
			tooltip.offsetWidth;

		const height =
			tooltip.offsetHeight;

		let x = rect.left;

		let y =
			rect.top - height - 8;

		if (y < 8) {
			y =
				rect.bottom + 8;
		}

		if (
			x + width >
			window.innerWidth - 8
		) {
			x =
				window.innerWidth -
				width -
				8;
		}

		if (x < 8) {
			x = 8;
		}

		tooltip.style.left =
			`${x}px`;

		tooltip.style.top =
			`${y}px`;

	});

}

export function hideOverlay() {

	if (overlay) {
		overlay.style.display =
			"none";
	}

	if (tooltip) {
		tooltip.style.display =
			"none";
	}

}

export function destroyOverlay() {

	overlay?.remove();

	tooltip?.remove();

	overlay = null;

	tooltip = null;

}