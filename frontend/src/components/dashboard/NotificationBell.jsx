import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, CheckCheck, AlertTriangle, AlertCircle } from "lucide-react";
import { io } from "socket.io-client";

export default function NotificationBell({ isDark }) {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const dropdownRef = useRef(null);

  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const surface = isDark ? "#1c1c26" : "#ffffff";
  const textPrimary = isDark ? "#f0f0f5" : "#0f0f1a";
  const textSecondary = isDark ? "#8888a0" : "#606070";
  const textMuted = isDark ? "#55556a" : "#9090a8";

  const unreadCount = alerts.filter(a => !a.is_read).length;

  // Connect to WebSocket
  useEffect(() => {
    socketRef.current = io("http://localhost:8002", {
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      setConnected(true);
      // Simulate checking campaigns on connect
      socketRef.current.emit("check_campaign", {
        id: "c001",
        name: "Lumiere Summer Launch",
        budget: 50000,
        spend: 46000,
        impressions: 2400000,
        clicks: 20000,
        ctr: 0.83,
      });
    });

    socketRef.current.on("disconnect", () => setConnected(false));

    socketRef.current.on("alert", (alert) => {
      setAlerts(prev => {
        const exists = prev.find(a => a.id === alert.id);
        if (exists) return prev;
        return [alert, ...prev];
      });
    });

    // Load existing alerts from REST
    fetch("http://localhost:8002/alerts")
      .then(r => r.json())
      .then(data => setAlerts(data))
      .catch(() => {});

    return () => socketRef.current?.disconnect();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (id) => {
    await fetch(`http://localhost:8002/alerts/${id}/read`, { method: "PUT" });
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
  };

  const markAllRead = async () => {
    await fetch("http://localhost:8002/alerts/read-all", { method: "PUT" });
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
  };

  const SeverityIcon = ({ severity }) => severity === "critical"
    ? <AlertCircle size={14} color="#ef4444" />
    : <AlertTriangle size={14} color="#eab308" />;

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>

      {/* Bell Button */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          position: "relative",
          width: "36px", height: "36px",
          borderRadius: "10px",
          border: `1px solid ${border}`,
          background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: textSecondary,
        }}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: "-4px", right: "-4px",
            width: "18px", height: "18px",
            borderRadius: "50%",
            background: "#ef4444",
            color: "#ffffff",
            fontSize: "10px",
            fontWeight: "600",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          top: "44px", right: "0",
          width: "360px",
          background: surface,
          border: `1px solid ${border}`,
          borderRadius: "14px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          zIndex: 1000,
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px",
            borderBottom: `1px solid ${border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: textPrimary }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span style={{
                  padding: "2px 8px", borderRadius: "20px",
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444", fontSize: "11px", fontWeight: "600",
                }}>{unreadCount} new</span>
              )}
              {/* Connection dot */}
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: connected ? "#22c55e" : "#ef4444",
                display: "inline-block",
              }} />
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  fontSize: "12px", color: "#7c6fff",
                  background: "none", border: "none",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          {/* Alerts list */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {alerts.length === 0 ? (
              <div style={{
                padding: "32px", textAlign: "center",
                color: textMuted, fontSize: "13px",
              }}>
                <Bell size={24} style={{ marginBottom: "8px", opacity: 0.3 }} />
                <p>No notifications yet</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id}
                  style={{
                    padding: "14px 18px",
                    borderBottom: `1px solid ${border}`,
                    background: alert.is_read
                      ? "transparent"
                      : isDark ? "rgba(124,111,255,0.05)" : "rgba(124,111,255,0.03)",
                    display: "flex", gap: "12px", alignItems: "flex-start",
                  }}
                >
                  <div style={{ marginTop: "2px", flexShrink: 0 }}>
                    <SeverityIcon severity={alert.severity} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: "13px", color: textPrimary,
                      fontWeight: alert.is_read ? "400" : "500",
                      lineHeight: 1.4, marginBottom: "4px",
                    }}>{alert.message}</p>
                    <p style={{ fontSize: "11px", color: textMuted }}>
                      {new Date(alert.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  {!alert.is_read && (
                    <button onClick={() => markRead(alert.id)}
                      style={{
                        flexShrink: 0, background: "none", border: "none",
                        cursor: "pointer", color: textMuted, padding: "2px",
                      }}>
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}