import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";

const STATUS = {
  active: { bg: "rgba(34,197,94,0.1)", color: "#22c55e", label: "Active" },
  paused: { bg: "rgba(234,179,8,0.1)", color: "#eab308", label: "Paused" },
  completed: { bg: "rgba(136,136,160,0.1)", color: "#8888a0", label: "Completed" },
};

const COLS = [
  { key: "name", label: "Campaign" },
  { key: "client", label: "Client" },
  { key: "status", label: "Status" },
  { key: "impressions", label: "Impressions" },
  { key: "clicks", label: "Clicks" },
  { key: "ctr", label: "CTR" },
  { key: "conversions", label: "Conversions" },
  { key: "spend", label: "Spend" },
  { key: "roas", label: "ROAS" },
];

function fmt(key, val) {
  if (key === "impressions" || key === "clicks") return val >= 1000000 ? (val/1000000).toFixed(1)+"M" : (val/1000).toFixed(0)+"K";
  if (key === "spend") return "$"+(val/1000).toFixed(1)+"K";
  if (key === "ctr") return val.toFixed(2)+"%";
  if (key === "roas") return val.toFixed(2)+"x";
  return val;
}

export default function CampaignTable({ campaigns, isDark }) {
  const isDarkMode = localStorage.getItem("darkMode") !== "false";
  const [sortKey, setSortKey] = useState("spend");
  const [sortDir, setSortDir] = useState("desc");
  const [filter, setFilter] = useState("");

  const enriched = campaigns.map(c => ({
    ...c,
    ctr: (c.clicks / c.impressions) * 100,
    roas: (c.conversions * 45) / c.spend,
  }));

  const filtered = enriched.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.client.toLowerCase().includes(filter.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortDir === "asc" ? av - bv : bv - av;
  });

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const surface = isDark ? "#13131a" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const textPrimary = isDark ? "#f0f0f5" : "#0f0f1a";
  const textSecondary = isDark ? "#8888a0" : "#606070";
  const textMuted = isDark ? "#55556a" : "#9090a8";
  const rowHover = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";

  return (
    <div style={{
      background: surface,
      border: `1px solid ${border}`,
      borderRadius: "14px",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 24px",
        borderBottom: `1px solid ${border}`,
        gap: "16px",
        flexWrap: "wrap",
      }}>
        <div>
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: textPrimary, letterSpacing: "-0.3px" }}>
            All Campaigns
          </h2>
          <p style={{ fontSize: "12px", color: textMuted, marginTop: "3px" }}>
            {sorted.length} campaigns
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: textMuted }} />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{
              paddingLeft: "34px",
              paddingRight: "14px",
              paddingTop: "9px",
              paddingBottom: "9px",
              borderRadius: "10px",
              border: `1px solid ${border}`,
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              color: textPrimary,
              fontSize: "13px",
              outline: "none",
              width: "220px",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr>
              {COLS.map(col => (
                <th key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: "11px",
                    fontWeight: "600",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: textMuted,
                    cursor: "pointer",
                    borderBottom: `1px solid ${border}`,
                    whiteSpace: "nowrap",
                    userSelect: "none",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {col.label}
                    {sortKey === col.key
                      ? (sortDir === "asc" ? <ArrowUp size={11} color="#7c6fff" /> : <ArrowDown size={11} color="#7c6fff" />)
                      : <ArrowUpDown size={11} style={{ opacity: 0.3 }} />
                    }
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => (
              <tr key={c.id}
                style={{
                  borderBottom: i < sorted.length - 1 ? `1px solid ${border}` : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = rowHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {COLS.map(col => (
                  <td key={col.key} style={{
                    padding: "14px 16px",
                    color: textSecondary,
                    whiteSpace: "nowrap",
                  }}>
                    {col.key === "name" ? (
                      <span style={{ fontWeight: "500", color: textPrimary }}>{c.name}</span>
                    ) : col.key === "status" ? (
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "500",
                        background: STATUS[c.status].bg,
                        color: STATUS[c.status].color,
                      }}>{STATUS[c.status].label}</span>
                    ) : (
                      fmt(col.key, c[col.key])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}