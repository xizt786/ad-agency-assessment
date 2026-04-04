import { useOutletContext } from "react-router-dom";
import campaignData from "../data/campaigns.json";
import KPICards from "../components/dashboard/KPICards.jsx";
import PerformanceChart from "../components/dashboard/PerformanceChart.jsx";
import CampaignTable from "../components/dashboard/CampaignTable.jsx";
import DateRangePicker from "../components/dashboard/DateRangePicker.jsx";
import { useState } from "react";

export default function Dashboard() {
  const { isDark } = useOutletContext();
  const [dateRange, setDateRange] = useState("30d");
  const campaigns = campaignData.campaigns;

  return (
    <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", flexWrap: "wrap",
        gap: "16px", marginBottom: "32px",
      }}>
        <div>
          <h1 style={{
            fontSize: "24px", fontWeight: "600",
            color: isDark ? "#f0f0f5" : "#0f0f1a",
            letterSpacing: "-0.5px", lineHeight: 1.2,
          }}>Campaign Dashboard</h1>
          <p style={{
            fontSize: "14px",
            color: isDark ? "#8888a0" : "#606070",
            marginTop: "6px",
          }}>
            Tracking {campaigns.length} campaigns across {new Set(campaigns.map(c => c.client)).size} clients
          </p>
        </div>
        <DateRangePicker selected={dateRange} onChange={(r) => setDateRange(r.type)} isDark={isDark} />
      </div>

      <KPICards campaigns={campaigns} isDark={isDark} />
      <PerformanceChart trendData={campaignData.trend_data} isDark={isDark} />
      <CampaignTable campaigns={campaigns} isDark={isDark} />
    </div>
  );
}