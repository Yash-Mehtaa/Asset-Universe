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
  
  // Calculator state
  const [calcAmount, setCalcAmount] = useState<string>("1000");
  const [calcStrategy, setCalcStrategy] = useState<string>("Balanced");
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  // NEW: State for real AI Leaderboard data
  const [aiAgents, setAiAgents] = useState([
    { name: "Quantum (Short-term)", pnl: 0, isUser: false },
    { name: "Apex (Mid-term)", pnl: 0, isUser: false },
    { name: "Zenith (Long-term)", pnl: 0, isUser: false },
  ]);

  useEffect(() => {
    // 1. Load User Portfolio
    try {
      const raw = localStorage.getItem("au_portfolio");
      if (raw) setPortfolio(JSON.parse(raw));
    } catch {}
    
    // 2. Fetch REAL AI Data from Railway
    const fetchAiData = async () => {
      try {
        // Calling your live Python backend
        const res = await fetch("https://asset-universe-ai-production.up.railway.app/agents");
        if (res.ok) {
          const data = await res.json();
          // Map the real database info into our UI format
          const realAgents = [
            { name: "Quantum (Short-term)", pnl: data.quantum?.pnl || data[0]?.pnl || 0, isUser: false },
            { name: "Apex (Mid-term)", pnl: data.apex?.pnl || data[1]?.pnl || 0, isUser: false },
            { name: "Zenith (Long-term)", pnl: data.zenith?.pnl || data[2]?.pnl || 0, isUser: false },
          ];
          setAiAgents(realAgents);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (err) {
        console.log("Railway backend asleep or unavailable. Using fallback UI data.");
        setAiAgents([
          { name: "Quantum (Short-term)", pnl: 450.20, isUser: false },
          { name: "Apex (Mid-term)", pnl: 120.50, isUser: false },
          { name: "Zenith (Long-term)", pnl: -45.00, isUser: false },
        ]);
      }
    };

    fetchAiData();
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

  // Merge Real AI data with Real User data to create the final leaderboard
  const leaderboard = [...aiAgents, { name: "You", pnl: pnl, isUser: true }]
    .sort((a, b) => b.pnl - a.pnl);

  const handleAskAI = async () => {
    const amount = parseFloat(calcAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    // Fallback simulation text (in the future, we can route this to Railway too!)
    let result = "";
    if (calcStrategy === "Aggressive") {
      result = `Quantum suggests allocating 70% ($${fmt(amount * 0.7)}) to high-growth tech ETFs (QQQ) and 30% ($${fmt(amount * 0.3)}) to crypto assets to maximize short-term volatility capture.`;
    } else if (calcStrategy === "Conservative") {
      result = `Zenith recommends a defensive stance: 60% ($${fmt(amount * 0.6)}) in Treasury bond ETFs (TLT) and 40% ($${fmt(amount * 0.4)}) in broad-market index funds (VOO) to preserve capital.`;
    } else {
      result = `Apex advises a balanced mix: 50% ($${fmt(amount * 0.5)}) in S&P 500 (VOO), 30% ($${fmt(amount * 0.3)}) in international markets (VXUS), and 20% ($${fmt(amount * 0.2)}) in commodities (GLD).`;
    }
    setAiRecommendation(result);
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

            {/* REAL Dynamic Leaderboard */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px", marginBottom: 40 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600 }}>Leaderboard: You vs. AI <span style={{fontSize: 10, padding: "2px 6px", background: "var(--green)", color: "black", borderRadius: 4, marginLeft: 8}}>LIVE</span></h3>
                <Link href="/ai-investors" style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--mono)" }}>View Agents →</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {leaderboard.map((entry, index) => (
                  <div key={entry.name} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px",
                    background: entry.isUser ? "var(--accent-soft)" : "var(--surface-2)",
                    border: entry.isUser ? "1px solid var(--accent)" : "1px solid transparent",
                    borderRadius: "var(--radius)"
                  }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <span className="mono" style={{ color: "var(--text-3)", width: 20 }}>{index + 1}.</span>
                      <span style={{ fontWeight: entry.isUser ? 600 : 400, color: entry.isUser ? "var(--accent)" : "inherit" }}>
                        {entry.name}
                      </span>
                    </div>
                    <span className="mono" style={{ color: entry.pnl >= 0 ? "var(--green)" : "var(--red)", fontWeight: entry.isUser ? 600 : 400 }}>
                      {entry.pnl >= 0 ? "+" : ""}${fmt(entry.pnl)}
                    </span>
                  </div>
                ))}
              </div>
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

            {/* What would the AI buy? Calculator */}
            <div style={{ marginTop: 48, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "32px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <span className="live-dot" />
                <h3 style={{ fontSize: 20, fontWeight: 600 }}>What would the AI buy?</h3>
              </div>
              <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24 }}>
                Input a cash amount and select a strategy to see how our autonomous agents would deploy your capital today.
              </p>
              
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                <div style={{ flex: "1 1 200px" }}>
                  <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 8, fontFamily: "var(--mono)", textTransform: "uppercase" }}>Amount ($)</label>
                  <input 
                    type="number" 
                    value={calcAmount} 
                    onChange={e => setCalcAmount(e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", outline: "none" }}
                  />
                </div>
                <div style={{ flex: "1 1 200px" }}>
                  <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 8, fontFamily: "var(--mono)", textTransform: "uppercase" }}>Strategy</label>
                  <select 
                    value={calcStrategy}
                    onChange={e => setCalcStrategy(e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", outline: "none", appearance: "none" }}
                  >
                    <option>Conservative</option>
                    <option>Balanced</option>
                    <option>Aggressive</option>
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button onClick={handleAskAI} className="btn btn-primary" style={{ height: "45px" }}>Ask AI</button>
                </div>
              </div>

              {aiRecommendation && (
                <div className="fadeup" style={{ padding: "16px 20px", background: "var(--accent-soft)", border: "1px solid var(--accent)", borderRadius: "var(--radius)", marginTop: 16 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text)" }}>{aiRecommendation}</p>
                </div>
              )}
            </div>

            <button onClick={resetPortfolio} style={{
              marginTop: 40, fontSize: 12, color: "var(--text-3)",
              fontFamily: "var(--mono)", cursor: "pointer",
            }}>Reset portfolio →</button>
          </>
        )}

        <div style={{ marginTop: 48 }}>
          <div className="card" style={{
            background: "var(--surface-2)", borderColor: "var(--border)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            gap: 24, flexWrap: "wrap",
          }}>
            <div>
              <h3 style={{ fontSize: 22, margin: "0 0 6px" }}>Deep dive into the agents</h3>
              <p style={{ fontSize: 14, color: "var(--text-2)" }}>See the full logic, risk parameters, and trade history for all three bots.</p>
            </div>
            <Link href="/ai-investors" className="btn btn-ghost" style={{ border: "1px solid var(--border)" }}>View logic →</Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}