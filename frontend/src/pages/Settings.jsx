import { useOutletContext } from "react-router-dom";
import { User, Bell, Shield, Palette } from "lucide-react";

export default function Settings() {
  const { isDark } = useOutletContext();

  const surface = isDark ? "#13131a" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const textPrimary = isDark ? "#f0f0f5" : "#0f0f1a";
  const textSecondary = isDark ? "#8888a0" : "#606070";
  const textMuted = isDark ? "#55556a" : "#9090a8";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: `1px solid ${border}`,
    background: inputBg,
    color: textPrimary,
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    boxSizing: "border-box",
  };

  const sections = [
    {
      icon: User,
      title: "Profile",
      description: "Manage your account details",
      fields: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: textSecondary, marginBottom: "6px" }}>Full Name</label>
              <input style={inputStyle} defaultValue="Farhan Azhar" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: textSecondary, marginBottom: "6px" }}>Role</label>
              <input style={inputStyle} defaultValue="Account Manager" />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: textSecondary, marginBottom: "6px" }}>Email</label>
            <input style={inputStyle} defaultValue="farhan@adflow.io" type="email" />
          </div>
        </div>
      )
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Configure alert thresholds and preferences",
      fields: (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[
            { label: "CTR drops below (%)", defaultValue: "1.0" },
            { label: "Budget spend exceeds (%)", defaultValue: "90" },
            { label: "ROAS drops below (x)", defaultValue: "1.5" },
          ].map(item => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderRadius: "10px",
              background: inputBg,
              border: `1px solid ${border}`,
            }}>
              <span style={{ fontSize: "13px", color: textSecondary }}>{item.label}</span>
              <input
                style={{ ...inputStyle, width: "80px", textAlign: "center", padding: "6px 10px" }}
                defaultValue={item.defaultValue}
                type="number"
              />
            </div>
          ))}
        </div>
      )
    },
    {
      icon: Shield,
      title: "Security",
      description: "Update your password and security settings",
      fields: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: textSecondary, marginBottom: "6px" }}>Current Password</label>
            <input style={inputStyle} type="password" placeholder="••••••••" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: textSecondary, marginBottom: "6px" }}>New Password</label>
              <input style={inputStyle} type="password" placeholder="••••••••" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: textSecondary, marginBottom: "6px" }}>Confirm Password</label>
              <input style={inputStyle} type="password" placeholder="••••••••" />
            </div>
          </div>
        </div>
      )
    },
    {
      icon: Palette,
      title: "Appearance",
      description: "Customize your dashboard experience",
      fields: (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { label: "Dark Mode", desc: "Use dark theme across the dashboard", enabled: isDark },
            { label: "Compact View", desc: "Reduce spacing in tables and cards", enabled: false },
            { label: "Email Alerts", desc: "Receive campaign alerts via email", enabled: true },
            { label: "Real-time Updates", desc: "Enable WebSocket live notifications", enabled: true },
          ].map(item => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderRadius: "10px",
              background: inputBg,
              border: `1px solid ${border}`,
            }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: "500", color: textPrimary }}>{item.label}</p>
                <p style={{ fontSize: "12px", color: textMuted, marginTop: "2px" }}>{item.desc}</p>
              </div>
              {/* Toggle */}
              <div style={{
                width: "40px", height: "22px",
                borderRadius: "11px",
                background: item.enabled ? "#7c6fff" : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
                position: "relative", cursor: "pointer",
                transition: "background 0.2s",
              }}>
                <div style={{
                  width: "16px", height: "16px",
                  borderRadius: "50%", background: "#ffffff",
                  position: "absolute",
                  top: "3px",
                  left: item.enabled ? "21px" : "3px",
                  transition: "left 0.2s",
                }} />
              </div>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{
          fontSize: "24px", fontWeight: "600",
          color: textPrimary, letterSpacing: "-0.5px",
        }}>Settings</h1>
        <p style={{ fontSize: "14px", color: textSecondary, marginTop: "6px" }}>
          Manage your account and dashboard preferences
        </p>
      </div>

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {sections.map(({ icon: Icon, title, description, fields }) => (
          <div key={title} style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: "14px",
            overflow: "hidden",
          }}>
            {/* Section header */}
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "20px 24px",
              borderBottom: `1px solid ${border}`,
            }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "10px",
                background: "rgba(124,111,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={16} color="#7c6fff" />
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: "600", color: textPrimary }}>{title}</p>
                <p style={{ fontSize: "12px", color: textMuted }}>{description}</p>
              </div>
            </div>

            {/* Section fields */}
            <div style={{ padding: "20px 24px" }}>
              {fields}
            </div>

            {/* Save button */}
            <div style={{
              padding: "14px 24px",
              borderTop: `1px solid ${border}`,
              display: "flex", justifyContent: "flex-end",
            }}>
              <button style={{
                padding: "9px 20px", borderRadius: "10px",
                border: "none", background: "#7c6fff",
                color: "#ffffff", fontSize: "13px",
                fontWeight: "500", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}>Save Changes</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}