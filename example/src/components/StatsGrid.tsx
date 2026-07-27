import DashboardCard from "./DashboardCard";
const stats = [
	{ title: "Orders", value: "1,250" },
	{ title: "Users", value: "542" },
	{ title: "Revenue", value: "$18,540" },
	{ title: "Products", value: "320" },
	{ title: "Reviews", value: "1,850" },
	{ title: "Returns", value: "42" },
];
export default function StatsGrid() {

	return (
		<section className="stats-grid">
			{stats.map((item) => (
				<DashboardCard
					key={item.title}
					title={item.title}
					value={item.value}
				/>
			))}
		</section>
	);
}