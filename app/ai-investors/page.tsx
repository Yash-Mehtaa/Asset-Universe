"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Footer } from "../components/Footer";

const API = "https://asset-universe-ai-production.up.railway.app";
const RATE_LIMIT = 3;

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
type CatalystEvent = { rank: number; symbol: string | null; event_type: string; title: string; description: string; expected_impact: string; date_of_event: string | null; scan_date: string };
type ReviewSummary = { available: boolean; last_review_date?: string; next_review_date?: string; performance_analysis?: string; changes_made?: { agent: string; action: string; changes: Record<string, unknown> | null }[]; market_outlook?: { symbol: string; direction: string; reason: string }[] };
type BudgetStatus = { monthly_spend_usd: number; monthly_cap_usd: number; remaining_usd: number; projected_monthly_usd: number; within_budget: boolean; pct_used: number };
type StrategyHistoryItem = { id: number; template: string; params: Record<string, unknown>; changed_at: string; triggered_by: string };

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

function getRateLimitKey(agentName: string) { return `run_limit_${agentName}_${new Date().toISOString().slice(0, 10)}`; }
function getRunCount(agentName: string): number { try { return parseInt(localStorage.getItem(getRateLimitKey(agentName)) || "0", 10); } catch { return 0; } }
function incrementRunCount(agentName: string): number { try { const key = getRateLimitKey(agentName); const next = getRunCount(agentName) + 1; localStorage.setItem(key, String(next)); return next; } catch { return 1; } }
function canRun(agentName: string): boolean { return getRunCount(agentName) < RATE_LIMIT; }

function calcPureStrategy(amount: number, strategy: string): CalcResult {
  const pools: Record<string, { symbols: string[]; weights: number[] }> = {
    momentum: { symbols: ["NVDA", "MSFT", "AAPL", "META", "AMZN"], weights: [0.30, 0.25, 0.20, 0.15, 0.10] },
    trend_following: { symbols: ["SPY", "QQQ", "AAPL", "MSFT", "GOOGL"], weights: [0.28, 0.24, 0.20, 0.16, 0.12] },
    risk_parity: { symbols: ["SPY", "BND", "GLD", "QQQ", "VTI"], weights: [0.25, 0.25, 0.20, 0.15, 0.15] },
  };
  const names: Record<string, string> = { NVDA: "NVIDIA Corp", MSFT: "Microsoft", AAPL: "Apple", META: "Meta Platforms", AMZN: "Amazon", SPY: "S&P 500 ETF", QQQ: "Nasdaq 100 ETF", GOOGL: "Alphabet", BND: "Total Bond ETF", GLD: "Gold ETF", VTI: "Total Stock Market ETF" };
  const reasons: Record<string, Record<string, string>> = {
    momentum: { NVDA: "Highest recent momentum in the universe — AI infrastructure demand continues to drive outperformance.", MSFT: "Strong daily trend with cloud and AI tailwinds sustaining above-average price momentum.", AAPL: "Consistent upward momentum backed by services growth and robust cash flow generation.", META: "Advertising revenue acceleration and AI monetization driving strong price momentum.", AMZN: "AWS growth and e-commerce recovery creating positive price trend across multiple timeframes." },
    trend_following: { SPY: "Broad market in confirmed uptrend — 50-day above 200-day moving average, higher highs and lows.", QQQ: "Tech-heavy index showing strongest trend signal with price above all major moving averages.", AAPL: "Clean uptrend structure with consistent higher highs — trend following signal is clear.", MSFT: "Price above 20, 50, and 200-day MAs with no sign of trend reversal.", GOOGL: "Recovering uptrend after consolidation — trend following entry signal confirmed." },
    risk_parity: { SPY: "Equity allocation weighted by inverse volatility — lower vol gets higher weight in risk parity.", BND: "Bond allocation provides portfolio ballast and offsets equity drawdown risk.", GLD: "Gold's low correlation to equities reduces overall portfolio volatility and tail risk.", QQQ: "Growth allocation sized smaller given higher volatility relative to broad market.", VTI: "Total market diversification smooths idiosyncratic stock risk at the portfolio level." },
  };
  const pool = pools[strategy] || pools.momentum;
  const stratReasons = reasons[strategy] || reasons.momentum;
  const allocations: CalcAllocation[] = pool.symbols.map((sym, i) => ({ symbol: sym, name: names[sym] || sym, amount: Math.round(amount * pool.weights[i]), pct: Math.round(pool.weights[i] * 100), reason: stratReasons[sym] || "Allocated based on strategy weighting." }));
  const summaries: Record<string, string> = {
    momentum: "Momentum strategy concentrates in the strongest recent performers. Highest-momentum names get the largest allocations based on recent price strength.",
    trend_following: "Trend following allocates to assets in confirmed uptrends using moving average signals. Positions are sized equally across confirmed trends.",
    risk_parity: "Risk parity sizes each position by inverse volatility so every asset contributes equal risk to the portfolio, rather than equal capital.",
  };
  return { allocations, summary: summaries[strategy] || summaries.momentum };
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
  const [tab, setTab] = useState<"overview" | "trades" | "decisions" | "history">("overview");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [perf, setPerf] = useState<PerfPoint[]>([]);
  const [history, setHistory] = useState<StrategyHistoryItem[]>([]);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [runCount, setRunCount] = useState(0);
  const [rollingBack, setRollingBack] = useState<number | null>(null);
  const isUp = agent.pnl_pct >= 0;

  useEffect(() => {
    setRunCount(getRunCount(agent.name));
    Promise.all([
      fetch(`${API}/api/agents/${agent.name}/portfolio`).then(r => r.json()).catch(() => ({ holdings: [] })),
      fetch(`${API}/api/agents/${agent.name}/trades?limit=8`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/agents/${agent.name}/decisions?limit=5`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/agents/${agent.name}/performance`).then(r => r.json()).catch(() => ({ series: [] })),
      fetch(`${API}/api/agents/${agent.name}/strategy/history`).then(r => r.json()).catch(() => []),
    ]).then(([port, t, d, p, h]) => {
      setHoldings(port.holdings || []);
      setTrades(Array.isArray(t) ? t : []);
      setDecisions(Array.isArray(d) ? d : []);
      setPerf((p.series || []).slice(-30));
      setHistory(Array.isArray(h) ? h : []);
    });
  }, [agent.name]);

  const handleRun = async () => {
    if (!canRun(agent.name)) return;
    setRunning(true); setRunResult(null);
    try {
      const res = await fetch(`${API}/api/run/${agent.name}`, { method: "POST" });
      const data = await res.json();
      setRunResult(data);
      const newCount = incrementRunCount(agent.name);
      setRunCount(newCount);
      setTimeout(() => onRun(), 1000);
    } catch {
      setRunResult({ n_trades: 0, trades: [], no_trade_reason: "Could not connect to the AI backend. Try again in a moment." });
    } finally { setRunning(false); }
  };

  const handleRollback = async (histId: number) => {
    if (!confirm("Roll back to this strategy version?")) return;
    setRollingBack(histId);
    try {
      await fetch(`${API}/api/agents/${agent.name}/strategy/rollback/${histId}`, { method: "POST" });
      onRun();
      const h = await fetch(`${API}/api/agents/${agent.name}/strategy/history`).then(r => r.json()).catch(() => []);
      setHistory(Array.isArray(h) ? h : []);
    } catch { alert("Rollback failed. Try again."); }
    finally { setRollingBack(null); }
  };

  const runsLeft = RATE_LIMIT - runCount;
  const rateLimited = !canRun(agent.name);

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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "Total Value", value: `$${fmt(agent.total_value, 0)}` },
          { label: "Cash", value: `$${fmt(agent.cash, 0)}` },
          { label: "Last Trade", value: agent.last_trade_at ? timeAgo(agent.last_trade_at) : "None yet" },
          { label: "Last Review", value: agent.last_review_at ? timeAgo(agent.last_review_at) : "None yet" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--bg)", borderRadius: "var(--radius)", padding: "12px 14px" }}>
            <div className="eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>{s.label}</div>
            <div className="mono" style={{ fontSize: 13 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {agent.strategy_plain_english && (
        <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-strong)", borderRadius: "var(--radius)", padding: "12px 16px", fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
          {agent.strategy_plain_english}
        </div>
      )}

      <div>
        <button
          className="btn btn-primary"
          onClick={handleRun}
          disabled={running || rateLimited}
          style={{ width: "100%", justifyContent: "center", opacity: running || rateLimited ? 0.5 : 1, cursor: rateLimited ? "not-allowed" : "pointer" }}
        >
          {running ? "Running..." : rateLimited ? "Limit reached (3/day)" : `Run Now${runsLeft < RATE_LIMIT ? ` (${runsLeft} left)` : ""}`}
        </button>
        {rateLimited && (
          <div style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center", marginTop: 8 }}>
            Daily limit of {RATE_LIMIT} manual runs reached. Resets at midnight.
          </div>
        )}
      </div>

      {runResult && <RunResultPanel result={runResult} onClose={() => setRunResult(null)} />}

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
          {(["overview", "trades", "decisions", "history"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 12px", borderRadius: "var(--radius)", fontSize: 12, fontFamily: "var(--mono)", border: "1px solid", borderColor: tab === t ? "var(--accent)" : "var(--border)", background: tab === t ? "var(--accent-soft)" : "transparent", color: tab === t ? "var(--accent)" : "var(--text-3)", cursor: "pointer", letterSpacing: "0.04em" }}>
              {t}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {holdings.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text-3)", padding: "12px 0" }}>No open positions yet.</div>
            ) : holdings.map(h => (
              <div key={h.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                <div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600 }}>{h.symbol}</span>
                  <span style={{ fontSize: 11, color: "var(--text-3)", marginLeft: 10 }}>{h.quantity.toFixed(4)} shares</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 13 }}>${fmt(h.value, 0)}</div>
                  <div className="mono" style={{ fontSize: 11, color: h.pnl_pct >= 0 ? "var(--green)" : "var(--red)" }}>{h.pnl_pct >= 0 ? "+" : ""}{fmt(h.pnl_pct * 100)}%</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "trades" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {trades.length === 0 ? <div style={{ fontSize: 13, color: "var(--text-3)" }}>No trades yet.</div> : trades.map(t => (
              <div key={t.id} style={{ padding: "10px 14px", background: "var(--bg)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className={`tag ${t.side === "buy" ? "tag-up" : "tag-down"}`} style={{ fontSize: 10 }}>{t.side.toUpperCase()}</span>
                    <span className="mono" style={{ fontSize: 13 }}>{t.symbol}</span>
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>${fmt(t.price)}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>{timeAgo(t.executed_at)}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{t.rationale}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "decisions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {decisions.length === 0 ? <div style={{ fontSize: 13, color: "var(--text-3)" }}>No reviews yet.</div> : decisions.map(d => (
              <div key={d.id} style={{ padding: "12px 14px", background: "var(--bg)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: d.action === "keep" ? "var(--text-3)" : "var(--accent)", letterSpacing: "0.06em" }}>{d.action.toUpperCase()}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{timeAgo(d.created_at)}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>{d.reasoning.slice(0, 200)}{d.reasoning.length > 200 ? "..." : ""}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {history.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text-3)" }}>No strategy changes yet.</div>
            ) : history.map(h => (
              <div key={h.id} style={{ padding: "12px 14px", background: "var(--bg)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{h.template}</span>
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginLeft: 10 }}>{h.triggered_by}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{new Date(h.changed_at).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleRollback(h.id)}
                      disabled={rollingBack === h.id}
                      style={{ padding: "4px 10px", fontSize: 11, fontFamily: "var(--mono)", borderRadius: "var(--radius)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-2)", cursor: "pointer", opacity: rollingBack === h.id ? 0.5 : 1 }}
                    >
                      {rollingBack === h.id ? "Rolling back..." : "Rollback"}
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--mono)" }}>
                  {Object.entries(h.params).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function Ticker({ agents }: { agents: Agent[] }) {
  const items = agents.flatMap(a => [`${META[a.name as keyof typeof META]?.label} · $${(a.total_value / 1000).toFixed(1)}k · ${a.pnl_pct >= 0 ? "+" : ""}${(a.pnl_pct * 100).toFixed(2)}%`]);
  if (!items.length) return null;
  const text = items.join("   ·   ");
  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "10px 0" }}>
      <div style={{ display: "flex", gap: 60, animation: "ticker 30s linear infinite", whiteSpace: "nowrap", fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-3)" }}>
        {[text, text, text].map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  );
}

function DecisionTimeline() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  useEffect(() => { fetch(`${API}/api/timeline?limit=20`).then(r => r.json()).then(setItems).catch(() => {}); }, []);
  return (
    <section className="section">
      <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 48, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>II.</span>
        <div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 6 }}>Decision Timeline</h2>
          <p style={{ fontSize: 15, color: "var(--text-2)" }}>Every trade and review across all three agents, in real time.</p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.length === 0 ? (
          <div style={{ fontSize: 14, color: "var(--text-3)", padding: "20px 0" }}>No activity yet. Hit Run Now on an agent to start.</div>
        ) : items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 20, padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", alignItems: "flex-start" }}>
            <div style={{ minWidth: 64 }}>
              <span className={`tag ${item.type === "trade" ? (item.side === "buy" ? "tag-up" : "tag-down") : "tag-neutral"}`} style={{ fontSize: 10 }}>
                {item.type === "trade" ? (item.side || "").toUpperCase() : "REVIEW"}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{item.type === "trade" ? item.symbol : META[item.agent_name as keyof typeof META]?.label || item.agent_name}</span>
                  {item.type === "trade" && item.notional && <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>${fmt(item.notional, 0)}</span>}
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{META[item.agent_name as keyof typeof META]?.label || item.agent_name}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{timeAgo(item.timestamp)}</span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{item.type === "trade" ? (item.ai_reasoning || item.rationale || "") : (item.reasoning || "").slice(0, 200)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Leaderboard({ agents }: { agents: Agent[] }) {
  const sorted = [...agents].sort((a, b) => b.pnl_pct - a.pnl_pct);
  return (
    <section className="section">
      <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 48, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>III.</span>
        <div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 6 }}>Leaderboard</h2>
          <p style={{ fontSize: 15, color: "var(--text-2)" }}>Ranked by return. Updated live.</p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((a, i) => {
          const meta = META[a.name as keyof typeof META];
          const isUp = a.pnl_pct >= 0;
          return (
            <div key={a.id} style={{ display: "grid", gridTemplateColumns: "32px 1fr auto auto", gap: 20, alignItems: "center", padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
              <span className="mono" style={{ fontSize: 13, color: i === 0 ? "var(--accent)" : "var(--text-3)", fontWeight: i === 0 ? 700 : 400 }}>#{i + 1}</span>
              <div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 18, marginBottom: 2 }}>{meta.label}</div>
                <div className="eyebrow" style={{ fontSize: 10 }}>{meta.strategy}</div>
              </div>
              <div className="mono" style={{ fontSize: 14, textAlign: "right" }}>${fmt(a.total_value, 0)}</div>
              <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: isUp ? "var(--green)" : "var(--red)", textAlign: "right", minWidth: 72 }}>{isUp ? "+" : ""}{fmt(a.pnl_pct * 100)}%</div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 20, padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--text-2)", textAlign: "center" }}>
        <Link href="/simulate" style={{ color: "var(--accent)" }}>Go to the simulator →</Link> to make trades and appear on the leaderboard.
      </div>
    </section>
  );
}

function CatalystWatchlist() {
  const [events, setEvents] = useState<CatalystEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanDate, setScanDate] = useState<string | null>(null);

  const load = () => {
    fetch(`${API}/api/catalyst`)
      .then(r => r.json())
      .then((data: CatalystEvent[]) => { setEvents(Array.isArray(data) ? data : []); if (data.length > 0) setScanDate(data[0].scan_date); })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const triggerScan = async () => {
    setScanning(true);
    try { await fetch(`${API}/api/catalyst/scan`, { method: "POST" }); await load(); } catch { }
    finally { setScanning(false); }
  };

  const impactColor = (impact: string) => impact === "bullish" ? "var(--green)" : impact === "bearish" ? "var(--red)" : "var(--text-3)";

  return (
    <section className="section">
      <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 48, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>IV.</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 6 }}>Market Catalysts</h2>
              <p style={{ fontSize: 15, color: "var(--text-2)" }}>Claude scans the web daily for the top 5 upcoming market-moving events. Updates at 6 AM ET.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              {scanDate && <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>Last scan: {timeAgo(scanDate)}</span>}
              <button onClick={triggerScan} disabled={scanning} className="btn" style={{ fontSize: 12, padding: "8px 16px", opacity: scanning ? 0.6 : 1 }}>{scanning ? "Scanning..." : "Scan Now"}</button>
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <div style={{ color: "var(--text-3)", fontSize: 14 }}>Loading catalyst data...</div>
      ) : events.length === 0 ? (
        <div style={{ padding: "32px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 12 }}>No catalyst data yet. The daily scan runs at 6 AM ET, or click Scan Now.</div>
          <button onClick={triggerScan} disabled={scanning} className="btn btn-primary" style={{ fontSize: 13 }}>{scanning ? "Scanning the web..." : "Run First Scan"}</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {events.map((e, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "32px 1fr auto", gap: 20, alignItems: "flex-start", padding: "20px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
              <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>#{e.rank}</span>
              <div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                  {e.symbol && <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{e.symbol}</span>}
                  <span className="eyebrow" style={{ fontSize: 10 }}>{e.event_type.replace("_", " ")}</span>
                  {e.date_of_event && <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{e.date_of_event}</span>}
                </div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 17, marginBottom: 8, lineHeight: 1.4 }}>{e.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>{e.description}</div>
              </div>
              <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: impactColor(e.expected_impact) }}>{e.expected_impact === "bullish" ? "▲" : e.expected_impact === "bearish" ? "▼" : "—"} {e.expected_impact}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function WeeklyReviewSection() {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [budget, setBudget] = useState<BudgetStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/review-summary`).then(r => r.json()).catch(() => ({ available: false })),
      fetch(`${API}/api/budget`).then(r => r.json()).catch(() => null),
    ]).then(([s, b]) => { setSummary(s); setBudget(b); setLoading(false); });
  }, []);

  const dirColor = (dir: string) => dir === "up" ? "var(--green)" : dir === "down" ? "var(--red)" : "var(--accent)";
  const dirSymbol = (dir: string) => dir === "up" ? "▲" : dir === "down" ? "▼" : "↕";

  return (
    <section className="section">
      <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 48, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>V.</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 6 }}>Weekly Review</h2>
              <p style={{ fontSize: 15, color: "var(--text-2)" }}>Claude reviews all three agents every Sunday, tunes strategy parameters, and flags the top expected movers.</p>
            </div>
            {budget && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "12px 16px", minWidth: 200 }}>
                <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>Claude API Budget</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span className="mono" style={{ fontSize: 12 }}>${budget.monthly_spend_usd.toFixed(3)} spent</span>
                  <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>/ ${budget.monthly_cap_usd} cap</span>
                </div>
                <div style={{ background: "var(--bg)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{ background: budget.within_budget ? "var(--green)" : "var(--red)", height: "100%", width: `${Math.min(budget.pct_used, 100)}%`, transition: "width 0.4s" }} />
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>{budget.pct_used}% used · ${budget.remaining_usd.toFixed(2)} remaining</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-3)", fontSize: 14 }}>Loading review data...</div>
      ) : !summary?.available ? (
        <div style={{ padding: "32px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", textAlign: "center", fontSize: 14, color: "var(--text-3)" }}>
          No weekly review has run yet. The first review runs this Sunday at 10 PM ET.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {[
              { label: "Last Review", value: summary.last_review_date ? new Date(summary.last_review_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A" },
              { label: "Next Review", value: summary.next_review_date ? new Date(summary.next_review_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A" },
              { label: "Changes Made", value: summary.changes_made?.filter(c => c.action !== "keep").length ? `${summary.changes_made.filter(c => c.action !== "keep").length} agent${summary.changes_made.filter(c => c.action !== "keep").length > 1 ? "s" : ""} updated` : "No changes" },
            ].map(s => (
              <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
                <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 20 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {summary.performance_analysis && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px 28px" }}>
              <div className="eyebrow" style={{ fontSize: 10, marginBottom: 16 }}>Claude's Performance Analysis</div>
              {summary.performance_analysis.split("\n\n").filter(Boolean).map((para, i) => (
                <p key={i} style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 12 }}>{para}</p>
              ))}
            </div>
          )}

          {summary.changes_made && summary.changes_made.length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px 28px" }}>
              <div className="eyebrow" style={{ fontSize: 10, marginBottom: 16 }}>Strategy Changes This Week</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {summary.changes_made.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 14px", background: "var(--bg)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                    <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: c.action === "keep" ? "var(--text-3)" : "var(--accent)", minWidth: 48 }}>{c.action.toUpperCase()}</span>
                    <span style={{ fontSize: 13, color: "var(--text-2)" }}>{META[c.agent as keyof typeof META]?.label || c.agent}</span>
                    {c.changes && <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{JSON.stringify(c.changes).slice(0, 80)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary.market_outlook && summary.market_outlook.length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px 28px" }}>
              <div className="eyebrow" style={{ fontSize: 10, marginBottom: 16 }}>Market Outlook — Top 5 Expected Movers This Week</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {summary.market_outlook.map((m, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr auto", gap: 16, alignItems: "flex-start", padding: "12px 16px", background: "var(--bg)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                    <span className="mono" style={{ fontSize: 14, fontWeight: 700 }}>{m.symbol}</span>
                    <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>{m.reason}</span>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: dirColor(m.direction) }}>{dirSymbol(m.direction)} {m.direction}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function AICalculator() {
  const [amount, setAmount] = useState("10000");
  const [strategy, setStrategy] = useState("momentum");
  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await fetch(`${API}/api/calculate-strategy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount) || 10000, strategy }),
      });
      setResult(await res.json());
    } catch {
      setResult({ allocations: [], summary: "Could not connect to backend. Try again.", error: "network" });
    } finally { setLoading(false); }
  };

  return (
    <section className="section">
      <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 48, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>VI.</span>
        <div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 6 }}>What would the AI buy?</h2>
          <p style={{ fontSize: 15, color: "var(--text-2)" }}>Enter any amount. The strategy algorithm shows the allocation instantly — no API call, no wait.</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, marginBottom: 32, alignItems: "end" }}>
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
          <button className="btn btn-primary" onClick={calculate} disabled={loading} style={{ width: "100%", justifyContent: "center", opacity: loading ? 0.7 : 1 }}>{loading ? "Running strategy..." : "Calculate →"}</button>
        </div>
      </div>
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-strong)", borderRadius: "var(--radius-lg)", padding: "18px 22px" }}>
            <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>Strategy Summary</div>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--text)" }}>{result.summary}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {result.allocations.map((a, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px 24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center", marginBottom: 12 }}>
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
      <CatalystWatchlist />
      <WeeklyReviewSection />
      <AICalculator />

      <section className="section">
        <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 48, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
          <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>VII.</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)" }}>How it works</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
          {[
            { num: "01", title: "Real strategies", body: "Momentum, trend-following, and risk parity — published quant strategies used by professional funds." },
            { num: "02", title: "Live market data", body: "Real prices from Finnhub and CoinGecko. The same data as the simulator. No fake numbers." },
            { num: "03", title: "Claude-powered review", body: "Every Sunday, Claude reviews all three agents, tunes parameters, and forces a change if nothing has updated in 30 days." },
            { num: "04", title: "Full transparency", body: "Every trade, every review, every reasoning — all logged here. Strategy history and rollback available on every agent." },
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
