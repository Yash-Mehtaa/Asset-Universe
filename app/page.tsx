"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Footer } from "./components/Footer";

const API = "https://asset-universe-ai-production.up.railway.app";

const STEPS = [
  { num: "01", title: "Plan", href: "/dashboard", label: "Budget Calculator", body: "Figure out exactly how much you can safely invest each month. After expenses, after emergencies, what's left for the future." },
  { num: "02", title: "Learn", href: "/learn", label: "Asset Library", body: "Stocks, ETFs, bonds, crypto, commodities. Every asset class explained without jargon, with real numbers and honest risk levels." },
  { num: "03", title: "Practice", href: "/simulate", label: "Live Simulator", body: "Trade with unlimited simulated cash and real-time market prices. Make every mistake on the practice field." },
  { num: "04", title: "Watch", href: "/ai-investors", label: "AI Investors", body: "Three autonomous AI agents trade on real strategies. Watch them think, trade, and adapt — every decision logged." },
];

const META: Record<string, string> = { short_term: "Short-Term Agent", mid_term: "Mid-Term Agent", long_term: "Long-Term Agent" };

function fmt(n: number, d = 2) { return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }); }

export default function HomePage() {
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/api/agents`).then(r => r.json()).then(setAgents).catch(() => {});
  }, []);

  const getUserPnlPct = () => {
    if (typeof window === "undefined") return 0;
    try {
      const p = JSON.parse(localStorage.getItem("au_portfolio") || "{}");
      const holdingsValue = (p.holdings || []).reduce((s: number, h: any) => s + h.shares * h.currentPrice, 0);
      const invested = (p.trades || []).filter((t: any) => t.side === "buy").reduce((s: number, t: any) => s + t.total, 0);
      const sold = (p.trades || []).filter((t: any) => t.side === "sell").reduce((s: number, t: any) => s + t.total, 0);
      const pnl = holdingsValue + sold - invested;
      return invested > 0 ? (pnl / invested) * 100 : 0;
    } catch { return 0; }
  };

  const leaderboard = [
    { name: "You", pnlPct: getUserPnlPct(), isUser: true },
    ...agents.map(a => ({ name: META[a.name] || a.name, pnlPct: a.pnl_pct * 100, isUser: false })),
  ].sort((a, b) => b.pnlPct - a.pnlPct);

  return (
    <>
      <section style={{ padding: "100px 40px 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="fadeup" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
            <span className="live-dot" />
            <span className="eyebrow">Free · No account · Real market data</span>
          </div>
          <h1 className="fadeup-delay-1" style={{ fontSize: "clamp(48px, 9vw, 120px)", fontWeight: 500, lineHeight: 0.95, letterSpacing: "-0.04em", marginBottom: 36, maxWidth: 1100 }}>
            Master <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--accent)" }}>investing</em> before risking real money.
          </h1>
          <p className="fadeup-delay-2" style={{ fontSize: "clamp(17px, 2vw, 21px)", lineHeight: 1.55, maxWidth: 620, marginBottom: 48, color: "var(--text-2)" }}>
            A patient, transparent place to plan your budget, understand every asset class, practice with live market data, and watch autonomous AI investors evolve over time.
          </p>
          <div className="fadeup-delay-3" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/dashboard" className="btn btn-primary">Begin the journey →</Link>
            <Link href="/ai-investors" className="btn btn-ghost">Watch AI investors</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 48, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
          <span className="mono" style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: "0.1em" }}>I.</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)" }}>The journey</h2>
          <div style={{ flex: 1, height: 1 }} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.15em" }}>FOUR PARTS</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {STEPS.map((s, i) => (
            <Link key={s.num} href={s.href} style={{ display: "grid", gridTemplateColumns: "auto 1fr 2fr auto", gap: 40, alignItems: "center", padding: "40px 0", borderBottom: i < STEPS.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.3s, padding 0.3s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.paddingLeft = "20px"; const a = e.currentTarget.querySelector('.arrow') as HTMLSpanElement; if (a) { a.style.color = "var(--accent)"; a.style.transform = "translateX(8px)"; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.paddingLeft = "0"; const a = e.currentTarget.querySelector('.arrow') as HTMLSpanElement; if (a) { a.style.color = "var(--text-3)"; a.style.transform = "translateX(0)"; } }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text-3)", letterSpacing: "0.1em", minWidth: 32 }}>{s.num}</div>
              <div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 500, lineHeight: 1 }}>{s.title}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 6 }}>{s.label}</div>
              </div>
              <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.6 }}>{s.body}</p>
              <span className="arrow" style={{ fontSize: 24, color: "var(--text-3)", transition: "all 0.3s" }}>→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Leaderboard teaser */}
      <section className="section">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
          <div>
            <span className="mono" style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: "0.1em" }}>II.</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", margin: "12px 0 16px" }}>
              Can you beat <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>the AI?</em>
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 28, maxWidth: 400 }}>
              Your simulated portfolio competes live against three autonomous AI trading agents. See where you rank right now.
            </p>
            <Link href="/my-portfolio" className="btn btn-primary">See your rank →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {leaderboard.slice(0, 4).map((e, i) => (
              <div key={e.name} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 20px",
                background: e.isUser ? "var(--accent-soft)" : "var(--surface)",
                border: `1px solid ${e.isUser ? "var(--accent-strong)" : "var(--border)"}`,
                borderRadius: "var(--radius)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-3)", minWidth: 20 }}>#{i + 1}</span>
                  <span style={{ fontWeight: e.isUser ? 700 : 500, color: e.isUser ? "var(--accent)" : "var(--text)" }}>{e.name}</span>
                  {e.isUser && <span className="tag tag-accent" style={{ fontSize: 9 }}>YOU</span>}
                </div>
                <span className="mono" style={{ fontSize: 13, color: e.pnlPct >= 0 ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
                  {e.pnlPct >= 0 ? "+" : ""}{e.pnlPct.toFixed(2)}%
                </span>
              </div>
            ))}
            {leaderboard.length === 0 && [1,2,3,4].map(i => (
              <div key={i} style={{ height: 48, borderRadius: "var(--radius)", background: "var(--surface)", border: "1px solid var(--border)", animation: "shimmer 1.5s infinite" }} />
            ))}
          </div>
        </div>
      </section>

      {/* AI Calculator teaser */}
      <section className="section">
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "60px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <span className="mono" style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: "0.1em", display: "block", marginBottom: 12 }}>III.</span>
            <h3 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 20 }}>
              What would the AI <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>buy?</em>
            </h3>
            <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 28, maxWidth: 400 }}>
              Enter any amount. Claude searches today's market, picks stocks, and explains every decision with real current news and timestamps.
            </p>
            <Link href="/ai-investors" className="btn btn-primary">Try the calculator →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { symbol: "NVDA", pct: 35, reason: "Strong momentum, AI chip demand surge" },
              { symbol: "GOOGL", pct: 30, reason: "Positive trend, cloud growth beat estimates" },
              { symbol: "TSLA", pct: 20, reason: "Recovery momentum after delivery numbers" },
              { symbol: "SPY", pct: 15, reason: "Risk parity hedge against single-stock risk" },
            ].map(a => (
              <div key={a.symbol} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "var(--radius)", background: "var(--accent-soft)", border: "1px solid var(--accent-strong)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "var(--accent)", flexShrink: 0 }}>{a.symbol.slice(0, 3)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.symbol} <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{a.pct}%</span></div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{a.reason}</div>
                </div>
              </div>
            ))}
            <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--mono)", textAlign: "center", marginTop: 4 }}>Example only — real AI picks are live on the calculator</div>
          </div>
        </div>
      </section>

      {/* AI Investors promo */}
      <section className="section">
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "60px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <span className="tag tag-accent" style={{ marginBottom: 20 }}><span className="live-dot" /> LIVE NOW</span>
            <h3 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginTop: 16, marginBottom: 20 }}>
              Three AI investors. <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>Zero secrets.</em>
            </h3>
            <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 28, maxWidth: 460 }}>
              Autonomous agents using textbook quant strategies on simulated capital. They trade, review their own performance, and adapt — and you get to watch every decision.
            </p>
            <Link href="/ai-investors" className="btn btn-primary">Watch them now →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[{ num: "30m", label: "Trade cadence" }, { num: "$300k", label: "Total capital" }, { num: "100%", label: "Transparent" }].map(s => (
              <div key={s.label} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 16px", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 500, color: "var(--accent)", marginBottom: 4 }}>{s.num}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--mono)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
