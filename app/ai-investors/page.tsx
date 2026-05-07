"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Footer } from "../components/Footer";

const API = "https://asset-universe-ai-production.up.railway.app";

type Agent = {
  id: number; name: string; horizon: string;
  cash: number; holdings_value: number; total_value: number;
  starting_capital: number; pnl: number; pnl_pct: number;
  strategy_template: string; strategy_plain_english: string;
  last_trade_at: string | null; last_review_at: string | null;
};
type Trade = { id: number; symbol: string; side: string; quantity: number; price: number; notional: number; rationale: string; realized_pnl?: number | null; ai_reasoning?: string | null; executed_at: string };
type Decision = { id: number; action: string; reasoning: string; created_at: string };
type Holding = { symbol: string; quantity: number; avg_cost: number; current_price: number; value: number; pnl_pct: number };
type PerfPoint = { date: string; value: number; pnl_pct: number };
type TimelineItem = { type: "trade" | "decision"; agent_name: string; symbol?: string; side?: string; price?: number; notional?: number; rationale?: string; ai_reasoning?: string | null; realized_pnl?: number | null; action?: string; reasoning?: string; triggered_by?: string; timestamp: string };
type CalcAllocation = { symbol: string; name: string; amount: number; pct: number; reason: string };
type CalcResult = { allocations: CalcAllocation[]; summary: string; error?: string };
type RunResult = { n_trades: number; trades: { symbol: string; side: string; price: number; notional: number; rationale: string; realized_pnl: number | null; ai_reasoning: string | null }[]; no_trade_reason: string | null };

const META = {
  short_term: { num: "01", label: "Short-Term", strategy: "Momentum", cadence: "Trades every 30 minutes during market hours", review: "Weekly self-review", color: "var(--accent)" },
  mid_term: { num: "02", label: "Mid-Term", strategy: "Trend Following", cadence: "Trades daily after market close", review: "Monthly self-review", color: "var(--green)" },
  long_term: { num: "03", label: "Long-Term", strategy: "Risk Parity", cadence: "Rebalances weekly", review: "Quarterly self-review", color: "var(--blue)" },
};

function fmt(n: number, d = 2) { return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }); }
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function MiniChart({ points, isUp }: { points: PerfPoint[]; isUp: boolean }) {
  if (points.length < 2) return <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: 12, fontFamily: "var(--mono)" }}>Awaiting data...</div>;
  const vals = points.map(p => p.value);
  const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1;
  const w = 400, h = 80, pad = 6;
  const pts = points.map((p, i) => `${pad + (i / (points.length - 1)) * (w - 2 * pad)},${h - pad - ((p.value - min) / range) * (h - 2 * pad)}`);
  const fillPts = `${pad},${h - pad} ${pts.join(" ")} ${w - pad},${h - pad}`;
  const color = isUp ? "var(--green)" : "var(--red)";
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      <polygon points={fillPts} fill={isUp ? "rgba(127,168,134,0.1)" : "rgba(201,133,112,0.1)"} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RunResultPanel({ result, onClose }: { result: RunResult; onClose: () => void }) {
  const traded = result.n_trades > 0;
  return (
    <div style={{ background: traded ? "rgba(127,168,134,0.06)" : "rgba(201,168,117,0.06)", border: `1px solid ${traded ? "rgba(127,168,134,0.3)" : "rgba(201,168,117,0.3)"}`, borderRadius: "var(--radius-lg)", padding: 20, position: "relative" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 12, right: 14, fontSize: 16, color: "var(--text-3)", cursor: "pointer", background: "none", border: "none" }}>✕</button>
      <div style={{ marginBottom: 16 }}>
        <span className="mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: traded ? "var(--green)" : "var(--accent)" }}>
          {traded ? `✓ ${result.n_trades} TRADE${result.n_trades > 1 ? "S" : ""} EXECUTED` : "⏸ NO TRADES THIS CYCLE"}
        </span>
      </div>
      {traded ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {result.trades.map((t, i) => (
            <div key={i} style={{ background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius)", padding: "14px 16px", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={`tag ${t.side === "buy" ? "tag-up" : "tag-down"}`}>{t.side.toUpperCase()}</span>
                  <span style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 500 }}>{t.symbol}</span>
                  <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>${fmt(t.price)}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 700 }}>${fmt(t.notional)}</div>
                  {t.realized_pnl !== null && t.realized_pnl !== undefined && <div className="mono" style={{ fontSize: 11, color: t.realized_pnl >= 0 ? "var(--green)" : "var(--red)", marginTop: 2 }}>Realized: {t.realized_pnl >= 0 ? "+" : ""}${fmt(t.realized_pnl)}</div>}
                </div>
              </div>
              {t.ai_reasoning && <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.65, whiteSpace: "pre-line" }}>{t.ai_reasoning}</div>}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>{result.no_trade_reason}</div>
      )}
    </div>
  );
}

function AgentCard({ agent, onRun }: { agent: Agent; onRun: () => void }) {
  const meta = META[agent.name as keyof typeof META];
  const [tab, setTab] = useState<"overview" | "trades" | "decisions">("overview");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [perf, setPerf] = useState<PerfPoint[]>([]);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const isUp = agent.pnl_pct >= 0;

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/agents/${agent.name}/portfolio`).then(r => r.json()).catch(() => ({ holdings: [] })),
      fetch(`${API}/api/agents/${agent.name}/trades?limit=8`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/agents/${agent.name}/decisions?limit=5`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/agents/${agent.name}/performance`).then(r => r.json()).catch(() => ({ series: [] })),
    ]).then(([port, t, d, p]) => {
      setHoldings(port.holdings || []);
      setTrades(Array.isArray(t) ? t : []);
      setDecisions(Array.isArray(d) ? d : []);
      setPerf((p.series || []).slice(-30));
    });
  }, [agent.name]);

  const handleRun = async () => {
    setRunning(true); setRunResult(null);
    try {
      const res = await fetch(`${API}/api/run/${agent.name}`, { method: "POST" });
      const data = await res.json();
      setRunResult(data);
      setTimeout(() => onRun(), 1000);
    } catch {
      setRunResult({ n_trades: 0, trades: [], no_trade_reason: "Could not connect to the AI backend. Try again in a moment." });
    } finally { setRunning(false); }
  };

  return (
    <article style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 32, display: "flex", flexDirection: "column", gap: 24, transition: "border-color 0.25s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>
      <header>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>{meta.num}</span>
          <span className={`tag ${isUp ? "tag-up" : "tag-down"}`}>{isUp ? "▲" : "▼"} {isUp ? "+" : ""}{fmt(agent.pnl_pct * 100)}%</span>
        </div>
        <h2 style={{ fontSize: 32, marginBottom: 6 }}>{meta.label}</h2>
        <span className="eyebrow" style={{ fontSize: 11 }}>{meta.strategy}</span>
      </header>

      <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span className="eyebrow" style={{ fontSize: 10 }}>30-day performance</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: isUp ? "var(--green)" : "var(--red)" }}>{isUp ? "+" : ""}${fmt(Math.abs(agent.pnl))}</span>
        </div>
        <MiniChart points={perf} isUp={isUp} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[{ label: "Total", value: `$${fmt(agent.total_value, 0)}` }, { label: "Cash", value: `$${fmt(agent.cash, 0)}` }, { label: "Holdings", value: `${holdings.length}` }].map(s => (
          <div key={s.label} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "12px 14px" }}>
            <div className="eyebrow" style={{ fontSize: 9, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 500 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "14px 18px" }}>
        <div className="eyebrow" style={{ fontSize: 10, marginBottom: 6 }}>Strategy</div>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--text)" }}>{agent.strategy_plain_english}</p>
      </div>

      {runResult && <RunResultPanel result={runResult} onClose={() => setRunResult(null)} />}

      <div>
        <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid var(--border)" }}>
          {(["overview", "trades", "decisions"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 14px", fontSize: 13, fontWeight: 500, color: tab === t ? "var(--accent)" : "var(--text-2)", borderBottom: `2px solid ${tab === t ? "var(--accent)" : "transparent"}`, marginBottom: -1, transition: "all 0.2s", textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>
        <div style={{ minHeight: 180 }}>
          {tab === "overview" && (holdings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 4 }}>No positions yet</p>
              <p className="mono" style={{ fontSize: 11, color: "var(--accent)" }}>{meta.cadence}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {holdings.map(h => (
                <div key={h.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{h.symbol}</div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{h.quantity.toFixed(3)} sh</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 14 }}>${fmt(h.value)}</div>
                    <div className="mono" style={{ fontSize: 11, color: h.pnl_pct >= 0 ? "var(--green)" : "var(--red)", marginTop: 2 }}>{h.pnl_pct >= 0 ? "+" : ""}{fmt(h.pnl_pct * 100)}%</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {tab === "trades" && (trades.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-3)", fontSize: 13 }}>No trades yet</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {trades.map(t => (
                <div key={t.id} style={{ padding: "12px 14px", background: "var(--bg)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className={`tag ${t.side === "buy" ? "tag-up" : "tag-down"}`}>{t.side.toUpperCase()}</span>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{t.symbol}</span>
                      <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>${fmt(t.notional)}</span>
                      {t.realized_pnl !== null && t.realized_pnl !== undefined && <span className="mono" style={{ fontSize: 11, color: t.realized_pnl >= 0 ? "var(--green)" : "var(--red)" }}>{t.realized_pnl >= 0 ? "+" : ""}${fmt(t.realized_pnl)}</span>}
                    </div>
                    <span className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>{timeAgo(t.executed_at)}</span>
                  </div>
                  {t.ai_reasoning ? <p style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{t.ai_reasoning}</p> : <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{t.rationale}</p>}
                </div>
              ))}
            </div>
          ))}
          {tab === "decisions" && (decisions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 4 }}>No reviews yet</p>
              <p className="mono" style={{ fontSize: 11, color: "var(--accent)" }}>{meta.review}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {decisions.map(d => (
                <div key={d.id} style={{ padding: "12px 14px", background: "var(--bg)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span className="tag tag-accent">{d.action.toUpperCase()}</span>
                    <span className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>{timeAgo(d.created_at)}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.55 }}>{d.reasoning}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <footer style={{ paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="live-dot" /> LIVE</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span>{agent.last_trade_at ? `Last trade ${timeAgo(agent.last_trade_at)}` : "Awaiting first cycle"}</span>
          <button onClick={handleRun} disabled={running} style={{ padding: "4px 12px", borderRadius: "var(--radius)", background: running ? "var(--surface-2)" : "var(--accent-soft)", border: `1px solid ${running ? "var(--border)" : "var(--accent-strong)"}`, color: running ? "var(--text-3)" : "var(--accent)", fontSize: 11, cursor: running ? "not-allowed" : "pointer", fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: "0.05em", transition: "all 0.2s" }}>
            {running ? "RUNNING..." : "RUN NOW"}
          </button>
        </div>
      </footer>
    </article>
  );
}

function Ticker({ agents }: { agents: Agent[] }) {
  if (!agents.length) return null;
  const items = agents.flatMap(a => {
    const m = META[a.name as keyof typeof META];
    return [`${m.label} · ${a.pnl_pct >= 0 ? "+" : ""}${(a.pnl_pct * 100).toFixed(2)}%`, `Total $${a.total_value.toFixed(0)}`];
  });
  const all = [...items, ...items];
  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "12px 0", background: "var(--surface)" }}>
      <div style={{ display: "flex", gap: 64, animation: "ticker 30s linear infinite", whiteSpace: "nowrap" }}>
        {all.map((item, i) => <span key={i} className="mono" style={{ fontSize: 12, color: "var(--text-2)", letterSpacing: "0.05em" }}>{item}</span>)}
      </div>
    </div>
  );
}

function DecisionTimeline() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/timeline?limit=30`).then(r => r.json()).then(setItems).catch(() => []).finally(() => setLoading(false));
    const id = setInterval(() => fetch(`${API}/api/timeline?limit=30`).then(r => r.json()).then(setItems).catch(() => {}), 60000);
    return () => clearInterval(id);
  }, []);

  const agentLabel = (name: string) => META[name as keyof typeof META]?.label || name;
  const agentColor = (name: string) => META[name as keyof typeof META]?.color || "var(--accent)";

  return (
    <section className="section">
      <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 48, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>III.</span>
        <div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 6 }}>Live decision feed</h2>
          <p style={{ fontSize: 15, color: "var(--text-2)" }}>Every trade and strategy review across all three agents, in real time.</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span className="live-dot" />
          <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>LIVE</span>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[0,1,2,3].map(i => <div key={i} style={{ height: 80, borderRadius: "var(--radius)", background: "linear-gradient(90deg, var(--surface) 25%, var(--surface-2) 50%, var(--surface) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />)}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-3)", fontSize: 14 }}>No activity yet — agents will start populating this feed as they trade.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 20, alignItems: "start", padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", transition: "border-color 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-strong)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingTop: 2 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: agentColor(item.agent_name), flexShrink: 0 }} />
                {i < items.length - 1 && <div style={{ width: 1, height: 40, background: "var(--border)" }} />}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: agentColor(item.agent_name), fontWeight: 700 }}>{agentLabel(item.agent_name)}</span>
                  {item.type === "trade" ? (
                    <>
                      <span className={`tag ${item.side === "buy" ? "tag-up" : "tag-down"}`}>{item.side?.toUpperCase()}</span>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{item.symbol}</span>
                      <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>${fmt(item.notional || 0)}</span>
                      {item.realized_pnl !== null && item.realized_pnl !== undefined && <span className="mono" style={{ fontSize: 11, color: item.realized_pnl >= 0 ? "var(--green)" : "var(--red)" }}>{item.realized_pnl >= 0 ? "+" : ""}${fmt(item.realized_pnl)}</span>}
                    </>
                  ) : (
                    <>
                      <span className="tag tag-accent">{item.action?.toUpperCase()}</span>
                      <span style={{ fontSize: 13, color: "var(--text-2)" }}>Strategy review</span>
                    </>
                  )}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>
                  {item.type === "trade" ? (item.ai_reasoning || item.rationale) : item.reasoning}
                </p>
              </div>
              <span className="mono" style={{ fontSize: 10, color: "var(--text-3)", whiteSpace: "nowrap", paddingTop: 2 }}>{timeAgo(item.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Leaderboard({ agents }: { agents: Agent[] }) {
  const [userName, setUserName] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("au_username") || "";
    return "";
  });
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const getUserPortfolio = () => {
    if (typeof window === "undefined") return { holdings: [], trades: [] };
    try { return JSON.parse(localStorage.getItem("au_portfolio") || "{}"); } catch { return { holdings: [], trades: [] }; }
  };

  const userPortfolio = getUserPortfolio();
  const userHoldingsValue = (userPortfolio.holdings || []).reduce((s: number, h: any) => s + h.quantity * h.currentPrice, 0);
  const userTotalInvested = (userPortfolio.trades || []).filter((t: any) => t.side === "buy").reduce((s: number, t: any) => s + t.total, 0);
  const userTotalSold = (userPortfolio.trades || []).filter((t: any) => t.side === "sell").reduce((s: number, t: any) => s + t.total, 0);
  const userPnl = userHoldingsValue + userTotalSold - userTotalInvested;
  const userPnlPct = userTotalInvested > 0 ? (userPnl / userTotalInvested) * 100 : 0;

  const entries = [
    { name: userName || "You", pnlPct: userPnlPct, pnl: userPnl, isUser: true },
    ...agents.map(a => ({ name: META[a.name as keyof typeof META]?.label + " Agent", pnlPct: a.pnl_pct * 100, pnl: a.pnl, isUser: false })),
  ].sort((a, b) => b.pnlPct - a.pnlPct);

  const saveName = () => {
    localStorage.setItem("au_username", nameInput);
    setUserName(nameInput);
    setEditingName(false);
  };

  return (
    <section className="section">
      <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 48, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>IV.</span>
        <div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 6 }}>Can you beat the AI?</h2>
          <p style={{ fontSize: 15, color: "var(--text-2)" }}>Your simulated portfolio vs the three AI agents. Ranked by return.</p>
        </div>
      </div>

      {!userName && !editingName ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "32px 40px", textAlign: "center", marginBottom: 32 }}>
          <h3 style={{ fontSize: 24, marginBottom: 12 }}>Enter your name to join the leaderboard</h3>
          <p style={{ color: "var(--text-2)", marginBottom: 24, fontSize: 14 }}>Your simulated portfolio from the simulator will be compared to the AI agents.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <input value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Your name" style={{ maxWidth: 260, textAlign: "center" }} onKeyDown={e => e.key === "Enter" && saveName()} />
            <button className="btn btn-primary" onClick={saveName}>Join →</button>
          </div>
        </div>
      ) : editingName ? (
        <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
          <input value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Your name" style={{ maxWidth: 260 }} onKeyDown={e => e.key === "Enter" && saveName()} />
          <button className="btn btn-primary" onClick={saveName}>Save</button>
          <button className="btn btn-ghost" onClick={() => setEditingName(false)}>Cancel</button>
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {entries.map((e, i) => (
          <div key={e.name} style={{
            display: "grid", gridTemplateColumns: "40px 1fr auto auto",
            gap: 20, alignItems: "center",
            padding: "16px 24px",
            background: e.isUser ? "var(--accent-soft)" : "var(--surface)",
            border: `1px solid ${e.isUser ? "var(--accent-strong)" : "var(--border)"}`,
            borderRadius: "var(--radius-lg)",
          }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 500, color: i === 0 ? "var(--accent)" : "var(--text-3)" }}>
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                {e.name}
                {e.isUser && <span className="tag tag-accent" style={{ fontSize: 9 }}>YOU</span>}
              </div>
              {e.isUser && <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2, fontFamily: "var(--mono)" }}>
                <button onClick={() => { setNameInput(userName); setEditingName(true); }} style={{ color: "var(--accent)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 11, background: "none", border: "none" }}>change name</button>
              </div>}
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: e.pnl >= 0 ? "var(--green)" : "var(--red)", textAlign: "right" }}>
              {e.pnl >= 0 ? "+" : ""}${fmt(Math.abs(e.pnl))}
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, color: e.pnlPct >= 0 ? "var(--green)" : "var(--red)", textAlign: "right", minWidth: 80 }}>
              {e.pnlPct >= 0 ? "+" : ""}{e.pnlPct.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {userTotalInvested === 0 && (
        <div style={{ marginTop: 20, padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--text-2)", textAlign: "center" }}>
          Your portfolio is empty. <Link href="/simulate" style={{ color: "var(--accent)" }}>Go to the simulator →</Link> to make some trades and appear on the leaderboard.
        </div>
      )}
    </section>
  );
}

function AICalculator() {
  const [amount, setAmount] = useState("10000");
  const [strategy, setStrategy] = useState("momentum");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalcResult | null>(null);

  const calculate = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await fetch(`${API}/api/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount) || 10000, strategy }),
      });
      setResult(await res.json());
    } catch {
      setResult({ allocations: [], summary: "Could not connect. Try again.", error: "network" });
    } finally { setLoading(false); }
  };

  return (
    <section className="section">
      <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 48, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>V.</span>
        <div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 6 }}>What would the AI buy?</h2>
          <p style={{ fontSize: 15, color: "var(--text-2)" }}>Enter any amount. Claude searches today's market, picks stocks, and explains every decision with real news.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, marginBottom: 32, alignItems: "end" }}>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 8, fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>AMOUNT TO INVEST</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", fontFamily: "var(--mono)" }}>$</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ paddingLeft: 28 }} placeholder="10000" />
          </div>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "var(--text-3)", marginBottom: 8, fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>STRATEGY</label>
          <select value={strategy} onChange={e => setStrategy(e.target.value)}>
            <option value="momentum">Momentum — buy top movers</option>
            <option value="trend_following">Trend Following — buy uptrends</option>
            <option value="risk_parity">Risk Parity — diversify by volatility</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button className="btn btn-primary" onClick={calculate} disabled={loading} style={{ width: "100%", justifyContent: "center", opacity: loading ? 0.7 : 1 }}>
            {loading ? "AI is thinking..." : "Ask the AI →"}
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <div className="mono" style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 8 }}>Searching today's market...</div>
          <div style={{ fontSize: 12, color: "var(--text-3)" }}>Claude is reading current news and analyzing prices. This takes 10-15 seconds.</div>
        </div>
      )}

      {result && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {result.error && !result.allocations?.length ? (
            <div style={{ color: "var(--red)", fontSize: 14 }}>Error: {result.summary}</div>
          ) : (
            <>
              <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-strong)", borderRadius: "var(--radius-lg)", padding: "18px 22px" }}>
                <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>AI Summary</div>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--text)" }}>{result.summary}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.allocations?.map((a, i) => (
                  <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px 24px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 16, alignItems: "center", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "var(--radius)", background: "var(--accent-soft)", border: "1px solid var(--accent-strong)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{a.symbol.slice(0, 3)}</div>
                        <div>
                          <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500 }}>{a.symbol}</div>
                          <div style={{ fontSize: 12, color: "var(--text-3)" }}>{a.name}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 500, color: "var(--accent)" }}>${a.amount.toLocaleString()}</div>
                        <div className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{a.pct}% of portfolio</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>{a.reason}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default function AIInvestorsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => { fetch(`${API}/api/agents`).then(r => r.json()).then(setAgents).catch(() => {}).finally(() => setLoading(false)); };

  useEffect(() => { load(); const id = setInterval(load, 30000); return () => clearInterval(id); }, []);

  const totalValue = agents.reduce((s, a) => s + a.total_value, 0);
  const totalPnl = agents.reduce((s, a) => s + a.pnl, 0);

  return (
    <>
      <section style={{ padding: "60px 40px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="fadeup" style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
            <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>06 / 06</span>
            <div style={{ width: 40, height: 1, background: "var(--border)" }} />
            <span className="eyebrow"><span className="live-dot" style={{ display: "inline-block", marginRight: 8, verticalAlign: "middle" }} /> Live · Simulated capital</span>
          </div>
          <h1 className="fadeup-delay-1" style={{ fontSize: "clamp(40px, 7vw, 96px)", marginBottom: 24, maxWidth: 1100 }}>
            Three AI investors. <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>Zero secrets.</em>
          </h1>
          <p className="fadeup-delay-2" style={{ fontSize: 18, maxWidth: 580, lineHeight: 1.65 }}>
            Three autonomous agents using textbook quant strategies — momentum, trend-following, risk parity. They trade on real market data, review their own performance, and adapt over time. Every decision is logged.
          </p>
        </div>
      </section>

      {!loading && agents.length > 0 && (
        <section style={{ padding: "0 40px 40px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            {[
              { label: "Combined value", value: `$${fmt(totalValue, 0)}` },
              { label: "Combined P&L", value: `${totalPnl >= 0 ? "+" : ""}$${fmt(totalPnl)}`, color: totalPnl >= 0 ? "var(--green)" : "var(--red)" },
              { label: "Strategies", value: "3" },
              { label: "Reviews", value: "Auto" },
            ].map(s => (
              <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 24px" }}>
                <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: s.color || "var(--text)" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Ticker agents={agents} />

      <section className="section">
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
            {[0, 1, 2].map(i => <div key={i} style={{ height: 540, borderRadius: "var(--radius-lg)", background: "linear-gradient(90deg, var(--surface) 25%, var(--surface-2) 50%, var(--surface) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", border: "1px solid var(--border)" }} />)}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
            {agents.map(a => <AgentCard key={a.id} agent={a} onRun={load} />)}
          </div>
        )}
      </section>

      <DecisionTimeline />
      <Leaderboard agents={agents} />
      <AICalculator />

      <section className="section">
        <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 48, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
          <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>VI.</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)" }}>How it works</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
          {[
            { num: "01", title: "Real strategies", body: "Momentum, trend-following, and risk parity — published quant strategies used by professional funds." },
            { num: "02", title: "Live market data", body: "Real prices from Finnhub and CoinGecko. The same data as the simulator. No fake numbers." },
            { num: "03", title: "Claude-powered review", body: "At each cadence, Anthropic's Claude API reviews performance and proposes strategy adjustments." },
            { num: "04", title: "Full transparency", body: "Every trade, every review, every reasoning — all logged here. Nothing hidden." },
          ].map(s => (
            <div key={s.num}>
              <div className="mono" style={{ fontSize: 11, color: "var(--accent)", marginBottom: 12 }}>{s.num}</div>
              <h3 style={{ fontSize: 22, marginBottom: 12 }}>{s.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.65 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
