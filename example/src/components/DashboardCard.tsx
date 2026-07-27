interface DashboardCardProps {
	title: string;
	value: string;
}

export default function DashboardCard({
	title,
	value,
}: DashboardCardProps) {
	return (
		<div className="card">
			<h3>{title}</h3>
			<p>{value}</p>
		</div>
	);
}