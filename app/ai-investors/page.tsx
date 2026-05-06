"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Footer } from "../components/Footer";

const API = "https://asset-universe-ai-production.up.railway.app";

type Agent = {
  id: number;
  name: string;
  horizon: string;
  cash: number;
  holdings_value: number;
  total_value: number;
  starting_capital: number;
  pnl: number;
  pnl_pct: number;
  strategy_template: string;
  strategy_plain_english: string;
  last_trade_at: string | null;
  last_review_at: string | null;
};

type Trade = { id: number; symbol: string; side: string; quantity: number; price: number; notional: number; rationale: string; executed_at: string };
type Decision = { id: number; action: string; reasoning: string; created_at: string };
type Holding = { symbol: string; quantity: number; avg_cost: number; current_price: number; value: number; pnl_pct: number };
type PerfPoint = { date: string; value: number; pnl_pct: number };

const META = {
  short_term: { num: "01", label: "Short-Term", strategy: "Momentum", cadence: "Trades every 30 minutes during market hours", review: "Weekly self-review" },
  mid_term: { num: "02", label: "Mid-Term", strategy: "Trend Following", cadence: "Trades daily after market close", review: "Monthly self-review" },
  long_term: { num: "03", label: "Long-Term", strategy: "Risk Parity", cadence: "Rebalances weekly", review: "Quarterly self-review" },
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

function MiniChart({ points, isUp }: { points: PerfPoint[]; isUp: boolean }) {
  if (points.length < 2) return (
    <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: 12, fontFamily: "var(--mono)" }}>
      Awaiting data...
    </div>
  );
  const vals = points.map(p => p.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const w = 400, h = 80, pad = 6;
  const pts = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((p.value - min) / range) * (h - 2 * pad);
    return `${x},${y}`;
  });
  const fillPts = `${pad},${h - pad} ${pts.join(" ")} ${w - pad},${h - pad}`;
  const color = isUp ? "var(--green)" : "var(--red)";
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      <polygon points={fillPts} fill={isUp ? "rgba(127,168,134,0.1)" : "rgba(201,133,112,0.1)"} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const meta = META[agent.name as keyof typeof META];
  const [tab, setTab] = useState<"overview" | "trades" | "decisions">("overview");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [perf, setPerf] = useState<PerfPoint[]>([]);
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

  return (
    <article style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: 32,
      display: "flex", flexDirection: "column", gap: 24,
      transition: "border-color 0.25s",
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>

      <header>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>{meta.num}</span>
          <span className={`tag ${isUp ? "tag-up" : "tag-down"}`}>
            {isUp ? "▲" : "▼"} {isUp ? "+" : ""}{fmt(agent.pnl_pct * 100)}%
          </span>
        </div>
        <h2 style={{ fontSize: 32, marginBottom: 6 }}>{meta.label}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="eyebrow" style={{ fontSize: 11 }}>{meta.strategy}</span>
        </div>
      </header>

      <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span className="eyebrow" style={{ fontSize: 10 }}>30-day performance</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: isUp ? "var(--green)" : "var(--red)" }}>
            {isUp ? "+" : ""}${fmt(Math.abs(agent.pnl))}
          </span>
        </div>
        <MiniChart points={perf} isUp={isUp} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { label: "Total", value: `$${fmt(agent.total_value, 0)}` },
          { label: "Cash", value: `$${fmt(agent.cash, 0)}` },
          { label: "Holdings", value: `${holdings.length}` },
        ].map(s => (
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

      <div>
        <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid var(--border)" }}>
          {(["overview", "trades", "decisions"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "10px 14px",
              fontSize: 13, fontWeight: 500,
              color: tab === t ? "var(--accent)" : "var(--text-2)",
              borderBottom: `2px solid ${tab === t ? "var(--accent)" : "transparent"}`,
              marginBottom: -1,
              transition: "all 0.2s",
              textTransform: "capitalize",
            }}>{t}</button>
          ))}
        </div>

        <div style={{ minHeight: 180 }}>
          {tab === "overview" && (
            holdings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 4 }}>No positions yet</p>
                <p className="mono" style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.05em" }}>{meta.cadence}</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {holdings.map(h => (
                  <div key={h.symbol} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", background: "var(--bg)", borderRadius: "var(--radius)", border: "1px solid var(--border)",
                  }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{h.symbol}</div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{h.quantity.toFixed(3)} sh</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 14 }}>${fmt(h.value)}</div>
                      <div className="mono" style={{ fontSize: 11, color: h.pnl_pct >= 0 ? "var(--green)" : "var(--red)", marginTop: 2 }}>
                        {h.pnl_pct >= 0 ? "+" : ""}{fmt(h.pnl_pct * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
          {tab === "trades" && (
            trades.length === 0 ? (
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
                      </div>
                      <span className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>{timeAgo(t.executed_at)}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{t.rationale}</p>
                  </div>
                ))}
              </div>
            )
          )}
          {tab === "decisions" && (
            decisions.length === 0 ? (
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
            )
          )}
        </div>
      </div>

      <footer style={{
        paddingTop: 16, borderTop: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="live-dot" /> LIVE
        </span>
        <span>{agent.last_trade_at ? `Last trade ${timeAgo(agent.last_trade_at)}` : "Awaiting first cycle"}</span>
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
        {all.map((item, i) => (
          <span key={i} className="mono" style={{ fontSize: 12, color: "var(--text-2)", letterSpacing: "0.05em" }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

export default function AIInvestorsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      fetch(`${API}/api/agents`).then(r => r.json()).then(setAgents).catch(() => {}).finally(() => setLoading(false));
    };
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

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
            {[0, 1, 2].map(i => (
              <div key={i} style={{ height: 540, borderRadius: "var(--radius-lg)", background: "linear-gradient(90deg, var(--surface) 25%, var(--surface-2) 50%, var(--surface) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", border: "1px solid var(--border)" }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
            {agents.map(a => <AgentCard key={a.id} agent={a} />)}
          </div>
        )}
      </section>

      <section className="section">
        <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 48, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
          <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>II.</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)" }}>How it works</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
          {[
            { num: "01", title: "Real strategies", body: "Momentum, trend-following, and risk parity — published quant strategies used by professional funds." },
            { num: "02", title: "Live market data", body: "Real prices from Finnhub and Alpha Vantage. The same data as the simulator. No fake numbers." },
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
