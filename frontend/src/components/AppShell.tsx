import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/sessions", label: "Sessions" },
  { to: "/confidence", label: "Confidence" },
  { to: "/progress", label: "Progress" },
];

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="TrackRanker dashboard">
          <img
            className="brand-logo"
            src="/TrackRankerLogo.png"
            alt="TrackRanker logo"
          />
          <span>TrackRanker</span>
        </a>
        <nav aria-label="Primary navigation">
          <ul className="nav-list">
            {navigation.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) => isActive ? "active" : undefined}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="page-content">
        <Outlet />
      </main>
      <footer>
        <p>Built for purposeful training and steady progress.</p>
      </footer>
    </div>
  );
}
