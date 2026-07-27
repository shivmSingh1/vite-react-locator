export default function UserProfile() {
	const userInfo = [
		{ label: "Email", value: "john@example.com" },
		{ label: "Phone", value: "+1 555 123 4567" },
		{ label: "Location", value: "New York" },
		{ label: "Department", value: "Engineering" },
	];
	return (
		<section className="profile">
			<h2>John Doe</h2>
			<p>Frontend Developer</p>

			<div className="profile-info">
				{userInfo.map((item) => (
					<p key={item.label}>
						<strong>{item.label}:</strong> {item.value}
					</p>
				))}
			</div>
		</section>
	);
}