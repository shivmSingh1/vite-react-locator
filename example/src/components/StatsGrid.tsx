import DashboardCard from "./DashboardCard";

export default function StatsGrid() {
	return (
		<section className="stats-grid">
			<DashboardCard title="Orders" value="1,250" />
			<DashboardCard title="Users" value="542" />
			<DashboardCard title="Revenue" value="$18,540" />
		</section>
	);
}