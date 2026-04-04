import { TrendingUp, MousePointer, Eye, ShoppingCart, DollarSign, BarChart2 } from "lucide-react";

const kpiConfig = [
  { label: "Total Impressions", key: "impressions", icon: Eye, color: "#3b82f6", bg: "rgba(59,130,246,0.1)", format: (v) => v >= 1000000 ? (v/1000000).toFixed(1)+"M" : (v/1000).toFixed(0)+"K" },
  { label: "Total Clicks", key: "clicks", icon: MousePointer, color: "#7c6fff", bg: "rgba(124,111,255,0.1)", format: (v) => v >= 1000000 ? (v/1000000).toFixed(1)+"M" : (v/1000).toFixed(0)+"K" },
  { label: "Avg CTR", key: "ctr", icon: TrendingUp, color: "#22c55e", bg: "rgba(34,197,94,0.1)", format: (v) => v.toFixed(2)+"%" },
  { label: "Conversions", key: "conversions", icon: ShoppingCart, color: "#f97316", bg: "rgba(249,115,22,0.1)", format: (v) => v.toLocaleString() },
  { label: "Total Spend", key: "spend", icon: DollarSign, color: "#ec4899", bg: "rgba(236,72,153,0.1)", format: (v) => "$"+(v/1000).toFixed(1)+"K" },
  { label: "Avg ROAS", key: "roas", icon: BarChart2, color: "#eab308", bg: "rgba(234,179,8,0.1)", format: (v) => v.toFixed(2)+"x" },
];

export default function KPICards({ campaigns, isDark }) {
  const isDarkMode = localStorage.getItem("darkMode") !== "false";

  const totals = campaigns.reduce((acc, c) => ({
    impressions: acc.impressions + c.impressions,
    clicks: acc.clicks + c.clicks,
    conversions: acc.conversions + c.conversions,
    spend: acc.spend + c.spend,
  }), { impressions: 0, clicks: 0, conversions: 0, spend: 0 });

  const ctr = (totals.clicks / totals.impressions) * 100;
  const roas = (totals.conversions * 45) / totals.spend;
  const data = { ...totals, ctr, roas };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      gap: "16px",
      marginBottom: "24px",
    }}>
      {kpiConfig.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div key={kpi.key} style={{
            background: isDark ? "#13131a" : "#ffffff",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
            borderRadius: "14px",
            padding: "20px",
            transition: "border-color 0.1s",
          }}>
            <div style={{
              width: "36px", height: "36px",
              borderRadius: "10px",
              background: kpi.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "14px",
            }}>
              <Icon size={17} color={kpi.color} />
            </div>
            <p style={{
              fontSize: "22px",
              fontWeight: "600",
              color: isDark ? "#f0f0f5" : "#0f0f1a",
              letterSpacing: "-0.5px",
              lineHeight: 1,
              marginBottom: "6px",
            }}>{kpi.format(data[kpi.key])}</p>
            <p style={{
              fontSize: "12px",
              color: isDark ? "#55556a" : "#9090a8",
              fontWeight: "400",
            }}>{kpi.label}</p>
          </div>
        );
      })}
    </div>
  );
}