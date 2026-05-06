"use client";
import Link from "next/link";
import { Footer } from "../components/Footer";

export default function MyPortfolioPage() {
  return (
    <>
      <section style={{ padding: "60px 40px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="fadeup" style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
            <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>05 / 06</span>
            <div style={{ width: 40, height: 1, background: "var(--border)" }} />
            <span className="eyebrow">Step 05 — Track</span>
          </div>
          <h1 className="fadeup-delay-1" style={{ fontSize: "clamp(40px, 6vw, 72px)", marginBottom: 20 }}>
            Your <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>portfolio</em>.
          </h1>
          <p className="fadeup-delay-2" style={{ fontSize: 18, maxWidth: 580 }}>
            Track every simulated trade you've made. Watch your performance over time and learn from every decision.
          </p>
        </div>
      </section>

      <section className="section">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 32 }}>
          {[
            { label: "Total value", value: "$10,000", color: "var(--accent)" },
            { label: "Total P&L", value: "$0.00", color: "var(--text-3)" },
            { label: "Positions", value: "0", color: "var(--text-3)" },
            { label: "Trades", value: "0", color: "var(--text-3)" },
          ].map(s => (
            <div key={s.label} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "24px 28px",
            }}>
              <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 500, color: s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ textAlign: "center", padding: "100px 40px", borderStyle: "dashed" }}>
          <div style={{ fontSize: 64, marginBottom: 28, opacity: 0.6 }}>📊</div>
          <h2 style={{ fontSize: 36, marginBottom: 16 }}>No investments <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>yet</em></h2>
          <p style={{ fontSize: 16, maxWidth: 420, margin: "0 auto 32px" }}>
            Head to the simulator to make your first trade with $10,000 of simulated cash. Every move is logged here.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/simulate" className="btn btn-primary">Start simulating →</Link>
            <Link href="/learn" className="btn btn-ghost">Learn first</Link>
          </div>
        </div>

        <div style={{ marginTop: 48 }}>
          <div className="card" style={{
            background: "var(--accent-soft)", borderColor: "var(--accent-strong)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            gap: 24, flexWrap: "wrap",
          }}>
            <div>
              <span className="tag tag-accent" style={{ marginBottom: 12 }}>
                <span className="live-dot" /> LIVE
              </span>
              <h3 style={{ fontSize: 24, margin: "12px 0 6px" }}>Watch AI investors trade in real time</h3>
              <p style={{ fontSize: 14 }}>Compare your portfolio to three autonomous AI agents.</p>
            </div>
            <Link href="/ai-investors" className="btn btn-primary">View AI investors →</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
