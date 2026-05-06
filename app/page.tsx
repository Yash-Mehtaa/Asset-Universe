import Link from "next/link";

const FEATURES = [
  { icon: "💰", title: "Smart Budget", desc: "Know exactly what you can safely invest each month after expenses and emergency fund.", href: "/dashboard", accent: "#a78bfa" },
  { icon: "📚", title: "Learn Simply", desc: "Stocks, ETFs, crypto, bonds — explained without jargon. Real numbers, real context.", href: "/learn", accent: "#38bdf8" },
  { icon: "📊", title: "Live Simulator", desc: "Practice with fake money and real-time market prices. No risk, full realism.", href: "/simulate", accent: "#34d399" },
  { icon: "🤖", title: "AI Investors", desc: "Three autonomous AI agents trading on real strategies. Watch them evolve in real time.", href: "/ai-investors", accent: "#fbbf24" },
];

const STATS = [
  { value: "10K+", label: "Assets tracked" },
  { value: "Live", label: "Market prices" },
  { value: "$0", label: "Risk required" },
  { value: "3", label: "AI strategies" },
];

export default function HomePage() {
  return (
    <div style={{ position: "relative", zIndex: 1 }}>

      {/* Hero */}
      <section style={{ padding: "100px 32px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div className="animate-fadeup" style={{ marginBottom: 20 }}>
          <span className="badge tag-neutral">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block", animation: "pulse 1.5s infinite" }}/>
            Free · No account · Real market data
          </span>
        </div>

        <h1 className="animate-fadeup" style={{
          fontSize: "clamp(40px, 7vw, 80px)",
          lineHeight: 1.0,
          marginBottom: 28,
        }}>
          <span className="gradient-text">Master investing</span>
          <br />
          <span style={{ color: "var(--text)" }}>before risking</span>
          <br />
          <span style={{ color: "var(--text2)" }}>real money.</span>
        </h1>

        <p className="animate-fadeup-delay" style={{
          fontSize: 18, color: "var(--text2)",
          maxWidth: 480, lineHeight: 1.7, marginBottom: 40,
        }}>
          Calculate your budget, understand every asset class, practice with our live simulator, and watch autonomous AI investors in action.
        </p>

        <div className="animate-fadeup-delay" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 80 }}>
          <Link href="/dashboard" className="btn-primary">
            Get Started — It&apos;s Free →
          </Link>
          <Link href="/ai-investors" className="btn-ghost">
            Watch AI Investors
          </Link>
        </div>

        {/* Stats */}
        <div className="animate-fadeup-delay2" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 12,
        }}>
          {STATS.map(s => (
            <div key={s.label} className="stat-card">
              <div className="label">{s.label}</div>
              <div className="value" style={{ color: "var(--purple)" }}>{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "0 32px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div className="divider"><span>WHAT YOU GET</span></div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}>
          {FEATURES.map(f => (
            <Link key={f.href} href={f.href} style={{ textDecoration: "none" }}>
              <div className="card" style={{
                height: "100%",
                borderColor: "var(--border)",
                cursor: "pointer",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = f.accent;
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px ${f.accent}18`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, marginBottom: 10, fontFamily: "Syne, sans-serif" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>{f.desc}</p>
                <div style={{ marginTop: 16, fontSize: 13, color: f.accent, fontWeight: 700 }}>
                  Explore →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section style={{ padding: "0 32px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          background: "rgba(251,191,36,0.05)",
          border: "1px solid rgba(251,191,36,0.15)",
          borderRadius: "var(--radius)",
          padding: "20px 24px",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--amber)", marginBottom: 8, letterSpacing: "0.5px", fontFamily: "DM Mono, monospace" }}>
            ⚠️ IMPORTANT DISCLAIMER
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
            Asset Universe is for educational purposes only. This platform does not provide financial, investment, tax, or legal advice. All simulations use fake money. Past performance does not guarantee future results. Market data may be delayed. Always consult a qualified financial advisor before making real investment decisions.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "32px",
        textAlign: "center",
        color: "var(--text3)",
        fontSize: 12,
        fontFamily: "DM Mono, monospace",
      }}>
        © 2026 Asset Universe · Educational platform only · Not a registered investment advisor
        <br />
        <span style={{ marginTop: 6, display: "block" }}>
          Market data by Finnhub, CoinGecko, Alpha Vantage
        </span>
      </footer>
    </div>
  );
}
