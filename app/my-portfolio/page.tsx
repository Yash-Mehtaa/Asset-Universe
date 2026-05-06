"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Footer } from "../components/Footer";

type Holding = {
  symbol: string;
  name: string;
  type: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
};

type Trade = {
  id: number;
  symbol: string;
  name: string;
  side: "buy" | "sell";
  shares: number;
  price: number;
  total: number;
  timestamp: string;
};

type Portfolio = {
  holdings: Holding[];
  trades: Trade[];
};

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function MyPortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio>({ holdings: [], trades: [] });
  const [tab, setTab] = useState<"holdings" | "trades">("holdings");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("au_portfolio");
      if (raw) setPortfolio(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  const holdingsValue = portfolio.holdings.reduce((s, h) => s + h.shares * h.currentPrice, 0);
  const totalInvested = portfolio.trades
    .filter(t => t.side === "buy")
    .reduce((s, t) => s + t.total, 0);
  const totalSold = portfolio.trades
    .filter(t => t.side === "sell")
    .reduce((s, t) => s + t.total, 0);
  const pnl = holdingsValue + totalSold - totalInvested;
  const isUp = pnl >= 0;

  const resetPortfolio = () => {
    if (!confirm("Reset your portfolio? This cannot be undone.")) return;
    const fresh: Portfolio = { holdings: [], trades: [] };
    localStorage.setItem("au_portfolio", JSON.stringify(fresh));
    setPortfolio(fresh);
  };

  if (!loaded) return null;

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
        </div>
      </section>

      <section className="section">
        {portfolio.trades.length === 0 ? (
          <>
            <div className="card" style={{ textAlign: "center", padding: "80px 40px", borderStyle: "dashed" }}>
              <div style={{ fontSize: 56, marginBottom: 24, opacity: 0.5 }}>📊</div>
              <h2 style={{ fontSize: 36, marginBottom: 16 }}>
                No trades <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>yet</em>
              </h2>
              <p style={{ fontSize: 16, maxWidth: 380, margin: "0 auto 32px" }}>
                Head to the simulator to make your first trade. Unlimited simulated capital, real market prices.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <Link href="/simulate" className="btn btn-primary">Start simulating →</Link>
                <Link href="/learn" className="btn btn-ghost">Learn first</Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 32 }}>
              {[
                { label: "Portfolio value", value: `$${fmt(holdingsValue)}`, color: "var(--accent)" },
                { label: "Total P&L", value: `${isUp ? "+" : ""}$${fmt(pnl)}`, color: isUp ? "var(--green)" : "var(--red)" },
                { label: "Total invested", value: `$${fmt(totalInvested)}`, color: "var(--text)" },
                { label: "Open positions", value: `${portfolio.holdings.length}`, color: "var(--text)" },
                { label: "Total trades", value: `${portfolio.trades.length}`, color: "var(--text)" },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 24px" }}>
                  <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--border)" }}>
              {(["holdings", "trades"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: "10px 20px", fontSize: 14, fontWeight: 500,
                  color: tab === t ? "var(--accent)" : "var(--text-2)",
                  borderBottom: `2px solid ${tab === t ? "var(--accent)" : "transparent"}`,
                  marginBottom: -1, transition: "all 0.2s", textTransform: "capitalize",
                }}>{t}</button>
              ))}
            </div>

            {tab === "holdings" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {portfolio.holdings.length === 0 ? (
                  <div style={{ color: "var(--text-3)", fontSize: 14, padding: "40px 0", textAlign: "center" }}>
                    No open positions. <Link href="/simulate" style={{ color: "var(--accent)" }}>Buy something →</Link>
                  </div>
                ) : portfolio.holdings.map(h => {
                  const value = h.shares * h.currentPrice;
                  const gainPct = ((h.currentPrice - h.avgCost) / h.avgCost) * 100;
                  return (
                    <div key={h.symbol} style={{
                      display: "grid", gridTemplateColumns: "auto 1fr auto",
                      gap: 20, alignItems: "center",
                      padding: "16px 20px", background: "var(--surface)",
                      border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: "var(--radius)",
                        background: "var(--accent-soft)", border: "1px solid var(--accent-strong)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color: "var(--accent)",
                      }}>{h.symbol.slice(0, 3)}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{h.symbol}</div>
                        <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{h.name}</div>
                        <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                          {h.shares.toFixed(4)} shares · avg ${fmt(h.avgCost)}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="mono" style={{ fontSize: 16, fontWeight: 600 }}>${fmt(value)}</div>
                        <div className="mono" style={{ fontSize: 12, color: gainPct >= 0 ? "var(--green)" : "var(--red)", marginTop: 4 }}>
                          {gainPct >= 0 ? "+" : ""}{gainPct.toFixed(2)}%
                        </div>
                        <Link href="/simulate" style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--mono)", display: "block", marginTop: 6 }}>
                          Trade →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "trades" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {portfolio.trades.map(t => (
                  <div key={t.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px", background: "var(--surface)",
                    border: "1px solid var(--border)", borderRadius: "var(--radius)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className={`tag ${t.side === "buy" ? "tag-up" : "tag-down"}`}>{t.side.toUpperCase()}</span>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{t.symbol}</span>
                        <span style={{ color: "var(--text-2)", fontSize: 12, marginLeft: 8 }}>
                          {t.shares.toFixed(4)} sh @ ${fmt(t.price)}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="mono" style={{ fontSize: 14, fontWeight: 600 }}>${fmt(t.total)}</div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{timeAgo(t.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={resetPortfolio} style={{
              marginTop: 40, fontSize: 12, color: "var(--text-3)",
              fontFamily: "var(--mono)", cursor: "pointer",
            }}>Reset portfolio →</button>
          </>
        )}

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
              <h3 style={{ fontSize: 22, margin: "12px 0 6px" }}>Watch AI investors trade in real time</h3>
              <p style={{ fontSize: 14 }}>Three autonomous agents using real strategies on simulated capital.</p>
            </div>
            <Link href="/ai-investors" className="btn btn-primary">View AI investors →</Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
