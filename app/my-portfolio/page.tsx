\"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Footer } from "../components/Footer";

const API = "https://asset-universe-ai-production.up.railway.app";

type Holding = { symbol: string; name: string; type: string; shares: number; avgCost: number; currentPrice: number };
type Trade = { id: number; symbol: string; name: string; side: "buy" | "sell"; shares: number; price: number; total: number; timestamp: string };
type Portfolio = { holdings: Holding[]; trades: Trade[] };
type CalcAllocation = { symbol: string; name: string; amount: number; pct: number; reason: string };
type CalcResult = { allocations: CalcAllocation[]; summary: string; error?: string };

const META: Record<string, string> = { short_term: "Short-Term Agent", mid_term: "Mid-Term Agent", long_term: "Long-Term Agent" };

function fmt(n: number, d = 2) {
  if (isNaN(n)) return "0";
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
  const [agents, setAgents] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [calcAmount, setCalcAmount] = useState("10000");
  const [calcStrategy, setCalcStrategy] = useState("momentum");
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("au_portfolio");
      if (raw) setPortfolio(JSON.parse(raw));
      setUserName(localStorage.getItem("au_username") || "");
    } catch {}

    setLoaded(true);

    fetch(`${API}/api/agents`).then(r => r.json()).then(setAgents).catch(() => {});

    const refreshPrices = () => {
      try {
        const raw = localStorage.getItem("au_portfolio");
        if (!raw) return;
        const parsed: Portfolio = JSON.parse(raw);
        if (parsed.holdings.length === 0) return;

        Promise.all(
          parsed.holdings.map((h) =>
            fetch(`/api/search?q=${encodeURIComponent(h.symbol)}`)
              .then((r) => r.json())
              .then((data) => {
                const match = data.results?.find((r: any) => r.symbol === h.symbol);
                return { symbol: h.symbol, price: match?.price || h.currentPrice };
              })
              .catch(() => ({ symbol: h.symbol, price: h.currentPrice }))
          )
        ).then((prices) => {
          const updated = { ...parsed };
          updated.holdings = parsed.holdings.map((h) => {
            const live = prices.find((p) => p.symbol === h.symbol);
            return { ...h, currentPrice: live?.price || h.currentPrice };
          });
          setPortfolio(updated);
          localStorage.setItem("au_portfolio", JSON.stringify(updated));
        });
      } catch {}
    };

    refreshPrices();
    const interval = setInterval(refreshPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const holdings = portfolio.holdings || [];
  const trades = portfolio.trades || [];
  const holdingsValue = holdings.reduce((s, h) => s + (h.shares || 0) * (h.currentPrice || 0), 0);
  const totalInvested = trades.filter(t => t.side === "buy").reduce((s, t) => s + (t.total || 0), 0);
  const totalSold = trades.filter(t => t.side === "sell").reduce((s, t) => s + (t.total || 0), 0);
  const pnl = holdingsValue + totalSold - totalInvested;
  const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
  const isUp = pnl >= 0;

  const leaderboard = [
    { name: userName || "You", pnlPct: isNaN(pnlPct) ? 0 : pnlPct, pnl: isNaN(pnl) ? 0 : pnl, isUser: true },
    ...agents.map(a => ({ name: META[a.name] || a.name, pnlPct: (a.pnl_pct || 0) * 100, pnl: a.pnl || 0, isUser: false })),
  ].sort((a, b) => b.pnlPct - a.pnlPct);

  const saveName = () => { localStorage.setItem("au_username", nameInput); setUserName(nameInput); setEditingName(false); };

  const calculate = async () => {
    setCalcLoading(true); setCalcResult(null);
    try {
      const res = await fetch(`${API}/api/calculate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: parseFloat(calcAmount) || 10000, strategy: calcStrategy }) });
      setCalcResult(await res.json());
    } catch { setCalcResult({ allocations: [], summary: "Could not connect. Try again.", error: "network" }); }
    finally { setCalcLoading(false); }
  };

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
        {trades.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "80px 40px", borderStyle: "dashed" }}>
            <div style={{ fontSize: 56, marginBottom: 24, opacity: 0.5 }}>📊</div>
            <h2 style={{ fontSize: 36, marginBottom: 16 }}>No trades <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>yet</em></h2>
            <p style={{ fontSize: 16, maxWidth: 380, margin: "0 auto 32px" }}>Head to the simulator to make your first trade. Unlimited simulated capital, real market prices.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link href="/simulate" className="btn btn-primary">Start simulating →</Link>
              <Link href="/learn" className="btn btn-ghost">Learn first</Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 32 }}>
              {[
                { label: "Portfolio value", value: `$${fmt(holdingsValue)}`, color: "var(--accent)" },
                { label: "Total P&L", value: `${isUp ? "+" : ""}$${fmt(pnl)}`, color: isUp ? "var(--green)" : "var(--red)" },
                { label: "Return", value: `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`, color: isUp ? "var(--green)" : "var(--red)" },
                { label: "Total invested", value: `$${fmt(totalInvested)}`, color: "var(--text)" },
                { label: "Total trades", value: `${trades.length}`, color: "var(--text)" },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 24px" }}>
                  <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--border)" }}>
              {(["holdings", "trades"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", fontSize: 14, fontWeight: 500, color: tab === t ? "var(--accent)" : "var(--text-2)", borderBottom: `2px solid ${tab === t ? "var(--accent)" : "transparent"}`, marginBottom: -1, transition: "all 0.2s", textTransform: "capitalize" }}>{t}</button>
              ))}
            </div>

            {tab === "holdings" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {holdings.length === 0 ? (
                  <div style={{ color: "var(--text-3)", fontSize: 14, padding: "40px 0", textAlign: "center" }}>No open positions. <Link href="/simulate" style={{ color: "var(--accent)" }}>Buy something →</Link></div>
                ) : holdings.map(h => {
                  const value = h.shares * h.currentPrice;
                  const gainPct = h.avgCost > 0 ? ((h.currentPrice - h.avgCost) / h.avgCost) * 100 : 0;
                  return (
                    <div key={h.symbol} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 20, alignItems: "center", padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "var(--radius)", background: "var(--accent-soft)", border: "1px solid var(--accent-strong)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{h.symbol.slice(0, 3)}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{h.symbol}</div>
                        <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{h.name}</div>
                        <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{h.shares.toFixed(4)} shares · avg ${fmt(h.avgCost)}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="mono" style={{ fontSize: 16, fontWeight: 600 }}>${fmt(value)}</div>
                        <div className="mono" style={{ fontSize: 12, color: gainPct >= 0 ? "var(--green)" : "var(--red)", marginTop: 4 }}>{gainPct >= 0 ? "+" : ""}{gainPct.toFixed(2)}%</div>
                        <Link href="/simulate" style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--mono)", display: "block", marginTop: 6 }}>Trade →</Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "trades" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {trades.map(t => (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className={`tag ${t.side === "buy" ? "tag-up" : "tag-down"}`}>{t.side.toUpperCase()}</span>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{t.symbol}</span>
                        <span style={{ color: "var(--text-2)", fontSize: 12, marginLeft: 8 }}>{t.shares.toFixed(4)} sh @ ${fmt(t.price)}</span>
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
            <button onClick={resetPortfolio} style={{ marginTop: 40, fontSize: 12, color: "var(--text-3)", fontFamily: "var(--mono)", cursor: "pointer" }}>Reset portfolio →</button>
          </>
        )}

        <div style={{ marginTop: 60, paddingTop: 48, borderTop: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", marginBottom: 8 }}>Can you beat <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>the AI?</em></h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 32 }}>Your portfolio vs the three AI agents. Ranked by % return.</p>

          {!userName && !editingName ? (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "28px 32px", marginBottom: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Enter your name to appear on the leaderboard</div>
                <div style={{ fontSize: 13, color: "var(--text-3)" }}>Your simulated portfolio will be compared to the AI agents.</div>
              </div>
              <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
                <input value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Your name" style={{ maxWidth: 200 }} onKeyDown={e => e.key === "Enter" && saveName()} />
                <button className="btn btn-primary" onClick={saveName}>Join</button>
              </div>
            </div>
          ) : editingName ? (
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <input value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Your name" style={{ maxWidth: 200 }} onKeyDown={e => e.key === "Enter" && saveName()} />
              <button className="btn btn-primary" onClick={saveName}>Save</button>
              <button className="btn btn-ghost" onClick={() => setEditingName(false)}>Cancel</button>
            </div>
          ) : null}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {leaderboard.map((e, i) => (
              <div key={e.name} style={{ display: "grid", gridTemplateColumns: "48px 1fr auto auto", gap: 16, alignItems: "center", padding: "16px 24px", background: e.isUser ? "var(--accent-soft)" : "var(--surface)", border: `1px solid ${e.isUser ? "var(--accent-strong)" : "var(--border)"}`, borderRadius: "var(--radius-lg)" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: i === 0 ? "var(--accent)" : "var(--text-3)" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{e.name}</span>
                  {e.isUser && <span className="tag tag-accent" style={{ fontSize: 9 }}>YOU</span>}
                  {e.isUser && <button onClick={() => { setNameInput(userName); setEditingName(true); }} style={{ fontSize: 11, color: "var(--text-3)", cursor: "pointer", fontFamily: "var(--mono)", background: "none", border: "none" }}>edit</button>}
                </div>
                <div className="mono" style={{ fontSize: 14, color: e.pnl >= 0 ? "var(--green)" : "var(--red)", textAlign: "right" }}>{e.pnl >= 0 ? "+" : ""}${fmt(Math.abs(e.pnl))}</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 500, color: e.pnlPct >= 0 ? "var(--green)" : "var(--red)", textAlign: "right", minWidth: 80 }}>{e.pnlPct >= 0 ? "+" : ""}{e.pnlPct.toFixed(2)}%</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 60, paddingTop: 48, borderTop: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", marginBottom: 8 }}>What would the AI <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>buy?</em></h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 32 }}>Enter any amount. Claude searches today&#39;s market and explains every pick with real news.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, marginBottom: 32, alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "var(--text-3)", marginBottom: 8, fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>AMOUNT</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", fontFamily: "var(--mono)" }}>$</span>
                <input type="number" value={calcAmount} onChange={e => setCalcAmount(e.target.value)} style={{ paddingLeft: 28 }} placeholder="10000" />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "var(--text-3)", marginBottom: 8, fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>STRATEGY</label>
              <select value={calcStrategy} onChange={e => setCalcStrategy(e.target.value)}>
                <option value="momentum">Momentum</option>
                <option value="trend_following">Trend Following</option>
                <option value="risk_parity">Risk Parity</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={calculate} disabled={calcLoading} style={{ opacity: calcLoading ? 0.7 : 1 }}>
              {calcLoading ? "Thinking..." : "Ask AI →"}
            </button>
          </div>

          {calcLoading && <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-3)", fontSize: 13, fontFamily: "var(--mono)" }}>Claude is searching today&#39;s market... this takes ~15 seconds</div>}

          {calcResult && !calcLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {calcResult.summary && <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-strong)", borderRadius: "var(--radius-lg)", padding: "16px 20px", fontSize: 14, lineHeight: 1.65 }}>{calcResult.summary}</div>}
              {calcResult.allocations?.map((a, i) => (
                <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "18px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "var(--radius)", background: "var(--accent-soft)", border: "1px solid var(--accent-strong)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>{a.symbol.slice(0, 3)}</div>
                      <div>
                        <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 500 }}>{a.symbol}</div>
                        <div style={{ fontSize: 12, color: "var(--text-3)" }}>{a.name}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--accent)" }}>${a.amount.toLocaleString()}</div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{a.pct}%</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>{a.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 60 }}>
          <div className="card" style={{ background: "var(--accent-soft)", borderColor: "var(--accent-strong)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div>
              <span className="tag tag-accent" style={{ marginBottom: 12 }}><span className="live-dot" /> LIVE</span>
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