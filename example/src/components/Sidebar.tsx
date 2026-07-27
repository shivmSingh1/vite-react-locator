const menus = [
	"Dashboard",
	"Analytics",
	"Users",
	"Orders",
	"Settings",
];

export default function Sidebar() {
	return (
		<aside className="sidebar">
			{menus.map((item) => (
				<button key={item}>{item}</button>
			))}
		</aside>
	);
}