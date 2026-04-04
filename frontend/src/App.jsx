import { Outlet, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { LayoutDashboard, FileText, Settings, Sun, Moon, Zap } from "lucide-react";
import NotificationBell from "./components/dashboard/NotificationBell.jsx";

export default function App() {
  const [isDark, setIsDark] = useState(true);

  // Sync on mount from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) setIsDark(JSON.parse(saved));
  }, []);

  const toggle = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem("darkMode", JSON.stringify(next));
      return next;
    });
  };

  const nav = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/brief", label: "Brief Builder", icon: FileText },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  const bg = isDark ? "#0a0a0f" : "#f0f0f8";
  const sidebarBg = isDark ? "#13131a" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const textPrimary = isDark ? "#f0f0f5" : "#0f0f1a";
  const textMuted = isDark ? "#55556a" : "#9090a8";
  const textSecondary = isDark ? "#8888a0" : "#606070";

  return (
    <div style={{ display: "flex", height: "100vh", background: bg, fontFamily: "'DM Sans', sans-serif", overflow: "hidden", transition: "background 0.2s" }}>

      {/* SIDEBAR */}
      <aside style={{
        width: "260px", minWidth: "260px", height: "100vh",
        background: sidebarBg,
        borderRight: `1px solid ${border}`,
        display: "flex", flexDirection: "column",
        justifyContent: "space-between",
        padding: "28px 16px",
        transition: "background 0.1s, border-color 0.1s",
      }}>

        {/* Top */}
        <div>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 8px", marginBottom: "36px" }}>
            <div style={{
              width: "34px", height: "34px",
              background: "linear-gradient(135deg, #7c6fff, #a78bfa)",
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Zap size={16} color="white" fill="white" />
            </div>
            <span style={{ fontSize: "17px", fontWeight: "600", color: textPrimary, letterSpacing: "-0.3px" }}>
              AdFlow
            </span>
          </div>

          {/* Nav label */}
          <p style={{
            fontSize: "10px", fontWeight: "600",
            letterSpacing: "0.1em", color: textMuted,
            textTransform: "uppercase", padding: "0 8px", marginBottom: "6px",
          }}>Main Menu</p>

          {/* Nav links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === "/"}
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "10px",
                  fontSize: "14px", fontWeight: isActive ? "500" : "400",
                  textDecoration: "none",
                  color: isActive ? "#7c6fff" : textSecondary,
                  background: isActive ? "rgba(124,111,255,0.1)" : "transparent",
                  transition: "all 0.1s ease",
                })}
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: `1px solid ${border}`, paddingTop: "16px" }}>
          {/* User pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "8px 10px", borderRadius: "10px",
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            marginBottom: "8px",
          }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: "linear-gradient(135deg, #7c6fff, #06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: "600", color: "white", flexShrink: 0,
            }}>FA</div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: "500", color: textPrimary, lineHeight: 1.2 }}>Farhan Azhar</p>
              <p style={{ fontSize: "11px", color: textMuted }}>Account Manager</p>
            </div>
          </div>

          {/* Toggle */}
          <button onClick={toggle}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              width: "100%", padding: "10px 12px", borderRadius: "10px",
              border: "none", cursor: "pointer",
              fontSize: "13px", fontWeight: "400",
              color: textSecondary, background: "transparent",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.1s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            {isDark ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </aside>

      
    {/* MAIN */}
<main style={{
  flex: 1, overflowY: "auto",
  padding: "36px 40px",
  background: bg,
  transition: "background 0.2s",
}}>
  {/* Top bar with notification bell */}
  <div style={{
    display: "flex", justifyContent: "flex-end",
    marginBottom: "24px",
  }}>
    <NotificationBell isDark={isDark} />
  </div>

  {/* Page content */}
  <Outlet context={{ isDark }} />
</main>
    </div>
  );
}