import { useState } from "react";
import { CalendarDays } from "lucide-react";

const PRESETS = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "Custom", value: "custom" },
];

export default function DateRangePicker({ selected, onChange, isDark }) {
  const isDarkMode = localStorage.getItem("darkMode") !== "false";
  const [showCustom, setShowCustom] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const textMuted = isDark ? "#55556a" : "#9090a8";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
      <CalendarDays size={14} color={textMuted} />
      <div style={{
        display: "flex",
        background: isDark ? "#13131a" : "#ffffff",
        border: `1px solid ${border}`,
        borderRadius: "10px",
        padding: "3px",
        gap: "2px",
      }}>
        {PRESETS.map(p => (
          <button key={p.value}
            onClick={() => {
              onChange({ type: p.value });
              setShowCustom(p.value === "custom");
            }}
            style={{
              padding: "7px 14px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
              background: selected === p.value ? "#7c6fff" : "transparent",
              color: selected === p.value ? "#ffffff" : (isDark ? "#8888a0" : "#606070"),
            }}
          >{p.label}</button>
        ))}
      </div>

      {showCustom && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", width: "100%" }}>
          <input type="date" value={start} onChange={e => setStart(e.target.value)}
            style={{
              padding: "7px 10px", borderRadius: "8px", fontSize: "12px",
              border: `1px solid ${border}`,
              background: isDark ? "#13131a" : "#fff",
              color: isDark ? "#f0f0f5" : "#0f0f1a",
              fontFamily: "'DM Sans', sans-serif", outline: "none",
            }}
          />
          <span style={{ fontSize: "12px", color: textMuted }}>→</span>
          <input type="date" value={end} onChange={e => setEnd(e.target.value)}
            style={{
              padding: "7px 10px", borderRadius: "8px", fontSize: "12px",
              border: `1px solid ${border}`,
              background: isDark ? "#13131a" : "#fff",
              color: isDark ? "#f0f0f5" : "#0f0f1a",
              fontFamily: "'DM Sans', sans-serif", outline: "none",
            }}
          />
          <button onClick={() => onChange({ type: "custom", start, end })}
            style={{
              padding: "7px 14px", borderRadius: "8px", border: "none",
              background: "#7c6fff", color: "#fff", fontSize: "12px",
              fontWeight: "500", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}
          >Apply</button>
        </div>
      )}
    </div>
  );
}