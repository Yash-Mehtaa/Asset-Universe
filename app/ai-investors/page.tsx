"use client";
import Link from "next/link";

export default function MyPortfolioPage() {
  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <div className="section animate-fadeup">

        <div style={{ marginBottom: 8 }}>
          <span className="badge tag-neutral">STEP 4 OF 4</span>
        </div>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", marginBottom: 12 }}>
          <span className="gradient-text">My Portfolio</span>
        </h1>
        <p style={{ color: "var(--text2)", maxWidth: 480, marginBottom: 56 }}>
          Track your simulated investment performance over time.
        </p>

        {/* Empty state */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 40 }}>
          {[
            { label: "Total Value", value: "$10,000", color: "var(--purple)" },
            { label: "Total P&L", value: "$0.00", color: "var(--text3)" },
            { label: "Positions", value: "0", color: "var(--text3)" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="label">{s.label}</div>
              <div className="value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ textAlign: "center", padding: "80px 40px", borderStyle: "dashed" }}>
          <div style={{ fontSize: 56, marginBottom: 24, animation: "float 3s ease-in-out infinite" }}>📊</div>
          <h2 style={{ fontSize: 24, marginBottom: 12, fontFamily: "Syne, sans-serif" }}>No investments yet</h2>
          <p style={{ color: "var(--text2)", fontSize: 15, maxWidth: 360, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Head to the simulator to make your first trade with $10,000 of simulated cash.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/simulate" className="btn-primary">Start Simulating →</Link>
            <Link href="/ai-investors" className="btn-ghost">Watch AI Investors</Link>
          </div>
        </div>

        {/* AI investors promo */}
        <div style={{ marginTop: 32 }}>
          <div className="card" style={{
            background: "var(--purple-dim)", borderColor: "var(--purple-border)",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", animation: "pulse 1.5s infinite" }}/>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", letterSpacing: "1px", fontFamily: "DM Mono, monospace" }}>LIVE</span>
              </div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, marginBottom: 6 }}>Watch AI investors trade in real time</h3>
              <p style={{ fontSize: 13, color: "var(--text2)" }}>Three autonomous agents using real strategies. See how they compare to your portfolio.</p>
            </div>
            <Link href="/ai-investors" className="btn-primary" style={{ whiteSpace: "nowrap" }}>
              View AI Investors →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
