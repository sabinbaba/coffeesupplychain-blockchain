import { useState } from "react";

export default function Layout({ account, roleName, isAdmin, activePage, setActivePage, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const shortAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const navItems = [
    { id: "dashboard", label: "Dashboard",      icon: "⊞" },
    { id: "trace",     label: "Traceability",   icon: "🔗" },
    ...(isAdmin ? [{ id: "admin", label: "Admin Panel", icon: "🔑" }] : []),
  ];

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">☕</span>
          {sidebarOpen && <span className="logo-text">CoffeeChain</span>}
        </div>

        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "←" : "→"}
        </button>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? "nav-active" : ""}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && account && (
          <div className="sidebar-footer">
            <span className={`sidebar-role-badge role-color-${roleName.toLowerCase()}`}>
              {roleName}
            </span>
            <span className="sidebar-address">{shortAddress(account)}</span>
          </div>
        )}
      </aside>

      {/* ── Main area ── */}
      <div className="layout-main">

        {/* ── Top header ── */}
        <header className="topbar">
          <div className="topbar-left">
            <h2 className="topbar-title">
              {activePage === "dashboard"  && `${roleName} Dashboard`}
              {activePage === "trace"      && "Batch Traceability"}
              {activePage === "admin"      && "Admin Panel"}
            </h2>
          </div>
          <div className="topbar-right">
            {account && (
              <div className="topbar-wallet">
                <div className="wallet-dot" />
                <span className="topbar-address">{shortAddress(account)}</span>
                <span className="topbar-network">Sepolia</span>
              </div>
            )}
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="layout-content">
          {children}
        </main>

      </div>
    </div>
  );
}
