"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

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

type Trade = {
  id: number;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  notional: number;
  rationale: string;
  executed_at: string;
};

type Decision = {
  id: number;
  action: string;
  reasoning: string;
  triggered_by: string;
  created_at: string;
};

type Holding = {
  symbol: string;
  quantity: number;
  avg_cost: number;
  current_price: number;
  value: number;
  pnl_pct: number;
};

type PerfPoint = { date: string; value: number; pnl_pct: number };

const AGENTS_META = {
  short_term: {
    label: "Short-Term",
    sublabel: "MOMENTUM",
    cadence: "Trades every 30 min",
    review: "Reviews weekly",
    accent: "#a78bfa",
    accentDim: "rgba(167,139,250,0.12)",
    accentBorder: "rgba(167,139,250,0.25)",
    glow: "0 0 60px rgba(167,139,250,0.15), 0 0 120px rgba(167,139,250,0.06)",
    icon: "⚡",
    gradient: "linear-gradient(135deg, rgba(167,139,250,0.2) 0%, rgba(109,40,217,0.05) 100%)",
  },
  mid_term: {
    label: "Mid-Term",
    sublabel: "TREND FOLLOWING",
    cadence: "Trades daily",
    review: "Reviews monthly",
    accent: "#38bdf8",
    accentDim: "rgba(56,189,248,0.12)",
    accentBorder: "rgba(56,189,248,0.25)",
    glow: "0 0 60px rgba(56,189,248,0.15), 0 0 120px rgba(56,189,248,0.06)",
    icon: "📡",
    gradient: "linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(14,116,144,0.05) 100%)",
  },
  long_term: {
    label: "Long-Term",
    sublabel: "RISK PARITY",
    cadence: "Rebalances weekly",
    review: "Reviews quarterly",
    accent: "#34d399",
    accentDim: "rgba(52,211,153,0.12)",
    accentBorder: "rgba(52,211,153,0.25)",
    glow: "0 0 60px rgba(52,211,153,0.15), 0 0 120px rgba(52,211,153,0.06)",
    icon: "🏔️",
    gradient: "linear-gradient(135deg, rgba(52,211,153,0.2) 0%, rgba(6,95,70,0.05) 100%)",
  },
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

function MiniChart({ points, accent }: { points: PerfPoint[]; accent: string }) {
  if (points.length < 2) return (
    <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>Awaiting data...</span>
    </div>
  );
  const vals = points.map(p => p.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const w = 300, h = 60, pad = 4;
  const pts = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((p.value - min) / range) * (h - 2 * pad);
    return `${x},${y}`;
  });
  const fillPts = `${pad},${h - pad} ${pts.join(" ")} ${w - pad},${h - pad}`;
  const last = points[points.length - 1];
  const isUp = last.pnl_pct >= 0;
  const color = isUp ? accent : "#f87171";
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`fill-${accent.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#fill-${accent.replace("#","")})`}/>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {(() => {
        const lastPt = pts[pts.length - 1].split(",");
        return <circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill={color}/>;
      })()}
    </svg>
  );
}

function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string }[] = [];
    const colors = ["rgba(167,139,250,", "rgba(56,189,248,", "rgba(52,211,153,", "rgba(255,255,255,"];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.opacity + ")";
        ctx.fill();
      });
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(167,139,250,${0.06 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}/>;
}

function AgentCard({ agent }: { agent: Agent }) {
  const meta = AGENTS_META[agent.name as keyof typeof AGENTS_META];
  const [tab, setTab] = useState<"overview" | "trades" | "decisions">("overview");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [perf, setPerf] = useState<PerfPoint[]>([]);
  const [hover, setHover] = useState(false);
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
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        background: "rgba(10,12,20,0.85)",
        backdropFilter: "blur(24px)",
        border: `1px solid ${hover ? meta.accent : meta.accentBorder}`,
        borderRadius: 24,
        padding: 0,
        overflow: "hidden",
        transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s",
        transform: hover ? "translateY(-4px)" : "none",
        boxShadow: hover ? meta.glow : "none",
        cursor: "default",
      }}
    >
      {/* Gradient top strip */}
      <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${meta.accent}, transparent)` }}/>

      {/* Animated background mesh */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        background: meta.gradient,
        opacity: hover ? 1 : 0.6,
        transition: "opacity 0.3s",
      }}/>

      <div style={{ position: "relative", zIndex: 1, padding: "24px 24px 20px" }}>

        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: meta.accentDim,
                border: `1px solid ${meta.accentBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>{meta.icon}</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.3px" }}>
                  {meta.label}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: meta.accent, letterSpacing: "1.5px" }}>
                  {meta.sublabel}
                </div>
              </div>
            </div>
          </div>

          {/* Live P&L badge */}
          <div style={{
            background: isUp ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)",
            border: `1px solid ${isUp ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
            borderRadius: 12,
            padding: "8px 14px",
            textAlign: "right",
          }}>
            <div style={{
              fontSize: 22, fontWeight: 800,
              color: isUp ? "#34d399" : "#f87171",
              letterSpacing: "-0.5px",
              fontVariantNumeric: "tabular-nums",
            }}>
              {isUp ? "+" : ""}{fmt(agent.pnl_pct * 100)}%
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
              ${fmt(agent.total_value)} total
            </div>
          </div>
        </div>

        {/* Mini chart */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          borderRadius: 14,
          padding: "10px 12px 6px",
          marginBottom: 16,
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          <MiniChart points={perf} accent={meta.accent}/>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>30-day performance</span>
            <span style={{ fontSize: 10, color: isUp ? "#34d399" : "#f87171", fontWeight: 600 }}>
              {isUp ? "▲" : "▼"} ${fmt(Math.abs(agent.pnl))}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Cash", value: `$${fmt(agent.cash, 0)}` },
            { label: "Invested", value: `$${fmt(agent.holdings_value, 0)}` },
            { label: "Holdings", value: `${holdings.length}` },
          ].map(s => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10, padding: "10px 0", textAlign: "center",
            }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 4, letterSpacing: "0.5px" }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Strategy pill */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          border: `1px solid ${meta.accentBorder}`,
          borderRadius: 10,
          padding: "10px 14px",
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
        }}>
          <span style={{ color: meta.accent, fontSize: 11, fontWeight: 700, marginTop: 1, whiteSpace: "nowrap" }}>STRATEGY</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{agent.strategy_plain_english}</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {(["overview", "trades", "decisions"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "7px 0", borderRadius: 9, border: "none",
              fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.3px",
              background: tab === t ? meta.accent : "rgba(255,255,255,0.05)",
              color: tab === t ? "#000" : "rgba(255,255,255,0.4)",
              transition: "all 0.2s", textTransform: "uppercase",
            }}>{t}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ minHeight: 160 }}>
          {tab === "overview" && (
            <div>
              {holdings.length === 0 ? (
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", padding: "32px 0", gap: 8,
                }}>
                  <div style={{ fontSize: 28, opacity: 0.3 }}>📊</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
                    First trade fires at next scheduled cycle
                  </div>
                  <div style={{ fontSize: 11, color: meta.accent, opacity: 0.6 }}>{meta.cadence}</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {holdings.map(h => (
                    <div key={h.symbol} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 10, padding: "8px 12px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: meta.accentDim, border: `1px solid ${meta.accentBorder}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 800, color: meta.accent,
                        }}>{h.symbol.slice(0, 2)}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{h.symbol}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{h.quantity.toFixed(3)} shares</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>${fmt(h.value)}</div>
                        <div style={{ fontSize: 11, color: h.pnl_pct >= 0 ? "#34d399" : "#f87171", fontWeight: 600 }}>
                          {h.pnl_pct >= 0 ? "+" : ""}{fmt(h.pnl_pct * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "trades" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {trades.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
                  No trades yet
                </div>
              ) : trades.map(t => (
                <div key={t.id} style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10, padding: "10px 12px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6, letterSpacing: "0.5px",
                        background: t.side === "buy" ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
                        color: t.side === "buy" ? "#34d399" : "#f87171",
                        border: `1px solid ${t.side === "buy" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
                      }}>{t.side.toUpperCase()}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{t.symbol}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>${fmt(t.notional)}</span>
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{timeAgo(t.executed_at)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{t.rationale}</div>
                </div>
              ))}
            </div>
          )}

          {tab === "decisions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {decisions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>
                    No reviews yet
                  </div>
                  <div style={{ fontSize: 11, color: meta.accent, opacity: 0.6 }}>{meta.review}</div>
                </div>
              ) : decisions.map(d => (
                <div key={d.id} style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10, padding: "10px 12px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                      background: meta.accentDim, color: meta.accent,
                      border: `1px solid ${meta.accentBorder}`, letterSpacing: "0.5px",
                    }}>{d.action.toUpperCase()}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{timeAgo(d.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{d.reasoning}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 16, paddingTop: 12,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: meta.accent, animation: "pulse 2s infinite" }}/>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>LIVE</span>
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
            {agent.last_trade_at ? `Last trade ${timeAgo(agent.last_trade_at)}` : meta.cadence}
          </span>
        </div>
      </div>
    </div>
  );
}

function ScrollingTicker({ agents }: { agents: Agent[] }) {
  const tickers = agents.flatMap(a => {
    const meta = AGENTS_META[a.name as keyof typeof AGENTS_META];
    const isUp = a.pnl_pct >= 0;
    return [`${meta.icon} ${meta.label}: ${isUp ? "+" : ""}${(a.pnl_pct * 100).toFixed(2)}%`, `$${a.total_value.toFixed(0)} total`];
  });
  const items = [...tickers, ...tickers, ...tickers];
  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.4)", padding: "8px 0" }}>
      <div style={{ display: "flex", gap: 48, animation: "ticker 20s linear infinite", whiteSpace: "nowrap" }}>
        {items.map((item, i) => (
          <span key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", letterSpacing: "0.5px" }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

export default function AIInvestorsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const load = () => {
      fetch(`${API}/api/agents`)
        .then(r => r.json())
        .then(setAgents)
        .catch(() => {})
        .finally(() => setLoading(false));
    };
    load();
    const interval = setInterval(() => { load(); setTick(t => t + 1); }, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalValue = agents.reduce((s, a) => s + a.total_value, 0);
  const totalPnl = agents.reduce((s, a) => s + a.pnl, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#050810", color: "#f1f5f9", fontFamily: "system-ui, -apple-system, sans-serif", overflowX: "hidden" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-33.33%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      <ParticleCanvas/>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(5,8,16,0.8)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 32px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #a78bfa, #38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#000" }}>AU</div>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#f1f5f9" }}>Asset Universe</span>
        </Link>
        <div style={{ display: "flex", gap: 2 }}>
          {[
            { href: "/dashboard", label: "Budget" },
            { href: "/learn", label: "Learn" },
            { href: "/simulate", label: "Simulate" },
            { href: "/my-portfolio", label: "My Portfolio" },
            { href: "/ai-investors", label: "AI Investors", active: true },
            { href: "/profile", label: "Profile" },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 13, textDecoration: "none",
              color: l.active ? "#a78bfa" : "rgba(255,255,255,0.45)",
              background: l.active ? "rgba(167,139,250,0.1)" : "transparent",
              fontWeight: l.active ? 700 : 400,
              border: l.active ? "1px solid rgba(167,139,250,0.2)" : "1px solid transparent",
              transition: "all 0.2s",
            }}>{l.label}</Link>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: "relative", zIndex: 1, padding: "80px 32px 60px", maxWidth: 1200, margin: "0 auto", animation: "fadeUp 0.8s ease" }}>

        {/* Big headline */}
        <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", animation: "pulse 1.5s infinite" }}/>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#34d399", letterSpacing: "2px" }}>LIVE · SIMULATED CAPITAL · REAL STRATEGIES</span>
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 72px)",
          fontWeight: 900,
          letterSpacing: "-2px",
          lineHeight: 1.0,
          marginBottom: 24,
          background: "linear-gradient(135deg, #f8fafc 0%, rgba(167,139,250,0.9) 50%, #38bdf8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Three AI investors.<br/>Zero secrets.
        </h1>

        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", maxWidth: 520, lineHeight: 1.7, marginBottom: 40 }}>
          Autonomous agents using textbook quant strategies. They trade, review their own performance, and adapt. Watch them think in real time.
        </p>

        {/* Total stats */}
        {!loading && agents.length > 0 && (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
            {[
              { label: "Total Simulated Capital", value: `$${fmt(totalValue)}`, color: "#a78bfa" },
              { label: "Combined P&L", value: `${totalPnl >= 0 ? "+" : ""}$${fmt(totalPnl)}`, color: totalPnl >= 0 ? "#34d399" : "#f87171" },
              { label: "Active Strategies", value: "3", color: "#38bdf8" },
              { label: "Auto-Reviews", value: "Weekly · Monthly · Quarterly", color: "rgba(255,255,255,0.4)" },
            ].map(s => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "14px 20px",
                minWidth: 140,
              }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 6, letterSpacing: "0.5px" }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color, letterSpacing: "-0.5px" }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticker */}
      {agents.length > 0 && <ScrollingTicker agents={agents}/>}

      {/* Cards */}
      <div style={{ position: "relative", zIndex: 1, padding: "48px 32px 80px", maxWidth: 1200, margin: "0 auto" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                height: 500, borderRadius: 24,
                background: "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
                border: "1px solid rgba(255,255,255,0.06)",
              }}/>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
            {agents.map(a => <AgentCard key={a.id} agent={a}/>)}
          </div>
        )}
      </div>

      {/* How it works */}
      <div style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "64px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }}/>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "2px", fontWeight: 700 }}>HOW IT WORKS</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }}/>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
          {[
            { n: "01", icon: "📐", title: "Real strategies", body: "Momentum, trend-following, and risk parity — published quant strategies used by professional funds." },
            { n: "02", icon: "📡", title: "Live market data", body: "Real prices from Finnhub and Alpha Vantage. Same data as the simulator. No fake numbers." },
            { n: "03", icon: "🧠", title: "Claude-powered review", body: "At each cadence, the Anthropic Claude API reviews performance and proposes strategy adjustments." },
            { n: "04", icon: "🔍", title: "Full transparency", body: "Every trade, every review, every reasoning is logged here. The AI has no secrets." },
          ].map(s => (
            <div key={s.n} style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16, padding: "20px 20px",
              transition: "border-color 0.2s",
            }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontSize: 11, color: "rgba(167,139,250,0.7)", fontWeight: 700, marginBottom: 6, letterSpacing: "0.5px" }}>{s.n}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{s.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ position: "relative", zIndex: 1, padding: "0 32px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          background: "rgba(234,179,8,0.05)",
          border: "1px solid rgba(234,179,8,0.15)",
          borderRadius: 14, padding: "16px 20px",
          fontSize: 12, color: "rgba(234,179,8,0.6)", lineHeight: 1.6,
        }}>
          ⚠️ These agents trade simulated currency only — no real money is involved. This feature is for education. The AI evolves its strategy using real market data and Claude's reasoning, but nothing here constitutes financial advice. Always consult a qualified advisor before making real investment decisions.
        </div>
      </div>
    </div>
  );
}
