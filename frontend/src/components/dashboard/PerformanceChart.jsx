import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function PerformanceChart({ trendData, isDark }) {
  const isDarkMode = localStorage.getItem("darkMode") !== "false";

  return (
    <div style={{
      background: isDark ? "#13131a" : "#ffffff",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
      borderRadius: "14px",
      padding: "24px",
      marginBottom: "24px",
    }}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{
          fontSize: "15px",
          fontWeight: "600",
          color: isDark ? "#f0f0f5" : "#0f0f1a",
          letterSpacing: "-0.3px",
        }}>30-Day Performance Trend</h2>
        <p style={{
          fontSize: "13px",
          color: isDark ? "#55556a" : "#9090a8",
          marginTop: "4px",
        }}>Impressions, clicks and conversions over time</p>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? "#55556a" : "#9090a8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: isDark ? "#55556a" : "#9090a8" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? v/1000+"K" : v} />
          <Tooltip
            contentStyle={{
              background: isDark ? "#1c1c26" : "#ffffff",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
              borderRadius: "10px",
              fontSize: "12px",
              color: isDark ? "#f0f0f5" : "#0f0f1a",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "16px", color: isDark ? "#8888a0" : "#606070" }} />
          <Line type="monotone" dataKey="impressions" stroke="#7c6fff" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#7c6fff" }} />
          <Line type="monotone" dataKey="clicks" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#22c55e" }} />
          <Line type="monotone" dataKey="conversions" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#f97316" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}