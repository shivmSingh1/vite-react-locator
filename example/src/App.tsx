import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import StatsGrid from "./components/StatsGrid";
import UserProfile from "./components/UserProfile";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Navbar />

      <main className="layout">
        <Sidebar />

        <section className="content">
          <h1>Dashboard</h1>

          <p>
            Hold <strong>Ctrl</strong> and click any component to
            open its source.
          </p>

          <StatsGrid />

          <UserProfile />
        </section>
      </main>

      <Footer />
    </>
  );
}