import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ChevronRight, ChevronLeft, Sparkles, Download, Check } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const STEPS = ["Client Details", "Campaign Objective", "Creative Preferences", "Review & Submit"];

const INITIAL = {
  clientName: "", industry: "", website: "", competitors: "",
  objective: "awareness", targetAudience: "", budget: "",
  tone: "", imageryStyle: "", colorDirection: "", dos: "", donts: "",
};

export default function BriefBuilder() {
  const { isDark } = useOutletContext();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const surface = isDark ? "#13131a" : "#ffffff";
  const surface2 = isDark ? "#1c1c26" : "#f5f5fa";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const textPrimary = isDark ? "#f0f0f5" : "#0f0f1a";
  const textSecondary = isDark ? "#8888a0" : "#606070";
  const textMuted = isDark ? "#55556a" : "#9090a8";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "10px",
    border: `1px solid ${border}`, background: inputBg,
    color: textPrimary, fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block", fontSize: "13px", fontWeight: "500",
    color: textSecondary, marginBottom: "6px",
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const loginRes = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: "demo@adflow.io",
          password: "demo123456",
        }),
      });

      if (!loginRes.ok) {
        const errText = await loginRes.text();
        throw new Error(`Login failed: ${errText}`);
      }

      const { access_token } = await loginRes.json();

      const res = await fetch("http://localhost:8000/generate/brief", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          clientName: form.clientName,
          industry: form.industry,
          website: form.website,
          competitors: form.competitors,
          objective: form.objective,
          targetAudience: form.targetAudience,
          budget: form.budget,
          tone: form.tone,
          imageryStyle: form.imageryStyle,
          colorDirection: form.colorDirection,
          dos: form.dos,
          donts: form.donts,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Generation failed");
      }

      const data = await res.json();
      setResult(data);
      setStep(5);

    } catch (e) {
      setError("Error: " + e.message);
    }
    setLoading(false);
  };

  const exportPDF = async () => {
    const el = document.getElementById("brief-result");
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${form.clientName}-creative-brief.pdf`);
  };

  const renderStep = () => {
    if (step === 0) return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={labelStyle}>Client Name *</label>
          <input style={inputStyle} value={form.clientName}
            onChange={e => set("clientName", e.target.value)}
            placeholder="e.g. Lumiere Skincare" />
        </div>
        <div>
          <label style={labelStyle}>Industry *</label>
          <input style={inputStyle} value={form.industry}
            onChange={e => set("industry", e.target.value)}
            placeholder="e.g. Beauty & Skincare" />
        </div>
        <div>
          <label style={labelStyle}>Website</label>
          <input style={inputStyle} value={form.website}
            onChange={e => set("website", e.target.value)}
            placeholder="e.g. lumiere.com" />
        </div>
        <div>
          <label style={labelStyle}>Key Competitors</label>
          <input style={inputStyle} value={form.competitors}
            onChange={e => set("competitors", e.target.value)}
            placeholder="e.g. The Ordinary, CeraVe" />
        </div>
      </div>
    );

    if (step === 1) return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={labelStyle}>Campaign Objective *</label>
          <div style={{ display: "flex", gap: "10px" }}>
            {["awareness", "consideration", "conversion"].map(obj => (
              <button key={obj} onClick={() => set("objective", obj)}
                style={{
                  flex: 1, padding: "12px", borderRadius: "10px",
                  border: `1px solid ${form.objective === obj ? "#7c6fff" : border}`,
                  background: form.objective === obj ? "rgba(124,111,255,0.1)" : inputBg,
                  color: form.objective === obj ? "#7c6fff" : textSecondary,
                  fontSize: "13px", fontWeight: "500", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", textTransform: "capitalize",
                }}>{obj}</button>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>Target Audience *</label>
          <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
            value={form.targetAudience}
            onChange={e => set("targetAudience", e.target.value)}
            placeholder="e.g. Women 25-40, urban professionals" />
        </div>
        <div>
          <label style={labelStyle}>Campaign Budget</label>
          <input style={inputStyle} value={form.budget}
            onChange={e => set("budget", e.target.value)}
            placeholder="e.g. $50,000" />
        </div>
      </div>
    );

    if (step === 2) return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={labelStyle}>Tone of Voice *</label>
          <input style={inputStyle} value={form.tone}
            onChange={e => set("tone", e.target.value)}
            placeholder="e.g. Sophisticated, warm, empowering" />
        </div>
        <div>
          <label style={labelStyle}>Imagery Style</label>
          <input style={inputStyle} value={form.imageryStyle}
            onChange={e => set("imageryStyle", e.target.value)}
            placeholder="e.g. Clean, minimal, natural lighting" />
        </div>
        <div>
          <label style={labelStyle}>Color Direction</label>
          <input style={inputStyle} value={form.colorDirection}
            onChange={e => set("colorDirection", e.target.value)}
            placeholder="e.g. Soft pastels, cream and gold" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Do's</label>
            <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={form.dos} onChange={e => set("dos", e.target.value)}
              placeholder="e.g. Show real skin, diverse models" />
          </div>
          <div>
            <label style={labelStyle}>Don'ts</label>
            <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={form.donts} onChange={e => set("donts", e.target.value)}
              placeholder="e.g. No heavy filters" />
          </div>
        </div>
      </div>
    );

    if (step === 3) return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {[
          ["Client", form.clientName], ["Industry", form.industry],
          ["Website", form.website], ["Competitors", form.competitors],
          ["Objective", form.objective], ["Target Audience", form.targetAudience],
          ["Budget", form.budget], ["Tone", form.tone],
          ["Imagery", form.imageryStyle], ["Colors", form.colorDirection],
          ["Do's", form.dos], ["Don'ts", form.donts],
        ].map(([label, val]) => val ? (
          <div key={label} style={{
            display: "flex", gap: "16px", padding: "12px 16px",
            borderRadius: "10px", background: surface2,
            border: `1px solid ${border}`,
          }}>
            <span style={{ fontSize: "13px", fontWeight: "500", color: textMuted, minWidth: "120px" }}>{label}</span>
            <span style={{ fontSize: "13px", color: textPrimary, textTransform: label === "Objective" ? "capitalize" : "none" }}>{val}</span>
          </div>
        ) : null)}
      </div>
    );
  };

  if (step === 5 && result) return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "600", color: textPrimary, letterSpacing: "-0.5px" }}>
            Creative Brief
          </h1>
          <p style={{ fontSize: "14px", color: textSecondary, marginTop: "4px" }}>
            AI-generated for {form.clientName}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => { setStep(0); setResult(null); }}
            style={{
              padding: "10px 18px", borderRadius: "10px",
              border: `1px solid ${border}`, background: "transparent",
              color: textSecondary, fontSize: "13px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}>Start Over</button>
          <button onClick={exportPDF}
            style={{
              padding: "10px 18px", borderRadius: "10px",
              border: "none", background: "#7c6fff", color: "#ffffff",
              fontSize: "13px", fontWeight: "500", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>

     <div id="brief-result" style={{
  background: isDark ? "#13131a" : "#ffffff",
  color: isDark ? "#f0f0f5" : "#0f0f1a",
  borderRadius: "16px", padding: "40px",
  border: `1px solid ${border}`,
}}>
        <div style={{ borderBottom: "2px solid #7c6fff", paddingBottom: "20px", marginBottom: "28px" }}>
          <p style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", color: "#7c6fff", textTransform: "uppercase", marginBottom: "8px" }}>Campaign Title</p>
          <h2 style={{ fontSize: "28px", fontWeight: "700", background: isDark ? "#1c1c26" : "#f5f5fa", letterSpacing: "-0.5px" }}>{result.campaignTitle}</h2>
        </div>

        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", color: "#7c6fff", textTransform: "uppercase", marginBottom: "14px" }}>Headline Options</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {result.headlines?.map((h, i) => (
              <div key={i} style={{
                padding: "14px 18px", borderRadius: "10px",
                background: "rgba(124,111,255,0.06)",
                border: "1px solid rgba(124,111,255,0.15)",
                fontSize: "15px", fontWeight: "500", color: isDark ? "#f0f0f5" : "#0f0f1a",
              }}>
                <span style={{ color: "#7c6fff", marginRight: "10px", fontSize: "12px" }}>0{i + 1}</span>{h}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
          <div style={{ padding: "20px", borderRadius: "12px", background: isDark ? "#1c1c26" : "#f5f5fa", border: `1px solid ${border}` }}>
            <p style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", color: "#7c6fff", textTransform: "uppercase", marginBottom: "10px" }}>Tone of Voice</p>
            <p style={{ fontSize: "14px", color: isDark ? "#f0f0f5" : "#0f0f1a", lineHeight: 1.6 }}>{result.toneOfVoice}</p>
          </div>
          <div style={{ padding: "20px", borderRadius: "12px", background: isDark ? "#1c1c26" : "#f5f5fa", border: `1px solid ${border}` }}>
            <p style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", color: "#7c6fff", textTransform: "uppercase", marginBottom: "10px" }}>Hero Image Concept</p>
            <p style={{ fontSize: "14px", color: isDark ? "#f0f0f5" : "#0f0f1a", lineHeight: 1.6 }}>{result.heroImageConcept}</p>
          </div>
        </div>

        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", color: "#7c6fff", textTransform: "uppercase", marginBottom: "14px" }}>Recommended Channels</p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {result.channels?.map((ch, i) => (
              <div key={i} style={{
                padding: "10px 16px", borderRadius: "10px",
                background: "rgba(124,111,255,0.08)",
                border: "1px solid rgba(124,111,255,0.15)",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <span style={{ fontSize: "13px", fontWeight: "500", color: isDark ? "#f0f0f5" : "#0f0f1a" }}>{ch.name}</span>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#7c6fff" }}>{ch.allocation}%</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", color: "#7c6fff", textTransform: "uppercase", marginBottom: "14px" }}>Key Messages</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {result.keyMessages?.map((msg, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  background: "rgba(124,111,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: "2px",
                }}>
                  <Check size={11} color="#7c6fff" />
                </div>
                <p style={{ fontSize: "14px", color: isDark ? "#f0f0f5" : "#0f0f1a", lineHeight: 1.6 }}>{msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "600", color: textPrimary, letterSpacing: "-0.5px" }}>
          AI Brief Builder
        </h1>
        <p style={{ fontSize: "14px", color: textSecondary, marginTop: "6px" }}>
          Fill in the details and get an AI-generated creative direction document
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: "600",
              background: i < step ? "#7c6fff" : i === step ? "rgba(124,111,255,0.15)" : inputBg,
              color: i < step ? "#ffffff" : i === step ? "#7c6fff" : textMuted,
              border: i === step ? "2px solid #7c6fff" : `1px solid ${border}`,
            }}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: "1px", margin: "0 8px", background: i < step ? "#7c6fff" : border }} />
            )}
          </div>
        ))}
      </div>

      <div style={{
        background: surface, borderRadius: "16px",
        border: `1px solid ${border}`, padding: "32px", marginBottom: "20px",
      }}>
        <h2 style={{ fontSize: "16px", fontWeight: "600", color: textPrimary, marginBottom: "24px" }}>
          Step {step + 1}: {STEPS[step]}
        </h2>
        {renderStep()}
      </div>

      {error && (
        <div style={{
          padding: "12px 16px", borderRadius: "10px", marginBottom: "16px",
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
          color: "#ef4444", fontSize: "13px",
        }}>{error}</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
          style={{
            padding: "11px 20px", borderRadius: "10px",
            border: `1px solid ${border}`, background: "transparent",
            color: step === 0 ? textMuted : textSecondary,
            fontSize: "13px", fontWeight: "500",
            cursor: step === 0 ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
          <ChevronLeft size={15} /> Back
        </button>

        {step < 3 ? (
          <button onClick={() => setStep(s => s + 1)}
            style={{
              padding: "11px 20px", borderRadius: "10px",
              border: "none", background: "#7c6fff", color: "#ffffff",
              fontSize: "13px", fontWeight: "500", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
            Next <ChevronRight size={15} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading}
            style={{
              padding: "11px 24px", borderRadius: "10px",
              border: "none", background: loading ? "#555" : "#7c6fff",
              color: "#ffffff", fontSize: "13px", fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
            {loading ? "Generating..." : <><Sparkles size={14} /> Generate Brief</>}
          </button>
        )}
      </div>
    </div>
  );
}