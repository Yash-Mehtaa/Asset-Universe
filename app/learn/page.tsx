import Link from "next/link";

const ASSETS = [
  {
    icon: "📈", name: "Stocks", tagline: "Own a piece of a company",
    risk: 4, riskLabel: "High",
    returns: "8–12% avg/year",
    goodFor: "Long-term growth",
    watchOut: "Can drop 30%+ in crashes",
    accent: "#a78bfa",
    desc: "When you buy a stock, you become a part-owner of a company. Your investment grows as the company grows, and shrinks when it struggles.",
  },
  {
    icon: "📊", name: "ETFs", tagline: "A basket of stocks in one purchase",
    risk: 2, riskLabel: "Medium",
    returns: "6–10% avg/year",
    goodFor: "Instant diversification",
    watchOut: "Less upside than stock-picking",
    accent: "#38bdf8",
    desc: "ETFs hold dozens or hundreds of stocks at once. Great risk management — if one company tanks, the others hold you up.",
  },
  {
    icon: "🏛️", name: "Govt Bonds", tagline: "Loan money to the government",
    risk: 1, riskLabel: "Low",
    returns: "3–5% avg/year",
    goodFor: "Safe, predictable income",
    watchOut: "Low returns, loses to inflation",
    accent: "#34d399",
    desc: "Government bonds are IOUs from the government. Extremely safe but the returns barely keep up with inflation long-term.",
  },
  {
    icon: "🏢", name: "Corporate Bonds", tagline: "Loan money to companies",
    risk: 2, riskLabel: "Medium",
    returns: "4–7% avg/year",
    goodFor: "Higher yield than govt bonds",
    watchOut: "Company could default",
    accent: "#34d399",
    desc: "Similar to government bonds but issued by companies. Higher returns reflect higher risk — companies can go bankrupt.",
  },
  {
    icon: "₿", name: "Crypto", tagline: "Digital currencies like Bitcoin",
    risk: 5, riskLabel: "Very High",
    returns: "Highly variable",
    goodFor: "Massive upside potential",
    watchOut: "Can lose 80%+ in downturns",
    accent: "#fbbf24",
    desc: "Highly speculative. Some people made fortunes, many lost everything. Only invest what you'd be comfortable losing entirely.",
  },
  {
    icon: "🏦", name: "High-Yield Savings", tagline: "Savings account with better rates",
    risk: 0, riskLabel: "None",
    returns: "4–5% currently",
    goodFor: "Zero risk, instant access",
    watchOut: "Barely beats inflation",
    accent: "#94a3b8",
    desc: "The safest option. Your money is FDIC-insured and accessible any time. Best for your emergency fund or short-term savings.",
  },
];

function RiskBar({ level }: { level: number }) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{
          width: 20, height: 6, borderRadius: 3,
          background: i <= level
            ? (level <= 1 ? "var(--green)" : level <= 2 ? "var(--blue)" : level <= 3 ? "var(--amber)" : "var(--red)")
            : "var(--surface2)",
          transition: "background 0.2s",
        }}/>
      ))}
    </div>
  );
}

export default function LearnPage() {
  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <div className="section animate-fadeup">

        <div style={{ marginBottom: 8 }}>
          <span className="badge tag-neutral">STEP 2 OF 4</span>
        </div>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", marginBottom: 12 }}>
          <span className="gradient-text">Learn About Assets</span>
        </h1>
        <p style={{ color: "var(--text2)", maxWidth: 500, marginBottom: 56 }}>
          Understand your options before investing. No jargon, just clarity.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {ASSETS.map(a => (
            <div key={a.name} className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${a.accent}18`,
                    border: `1px solid ${a.accent}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, flexShrink: 0,
                  }}>{a.icon}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontFamily: "Syne, sans-serif", fontSize: 16 }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>{a.tagline}</div>
                  </div>
                </div>
                <span className="badge" style={{
                  background: `${a.accent}18`, color: a.accent,
                  border: `1px solid ${a.accent}40`, whiteSpace: "nowrap", flexShrink: 0,
                }}>
                  {a.returns}
                </span>
              </div>

              {/* Description */}
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{a.desc}</p>

              {/* Risk */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "DM Mono, monospace" }}>RISK</span>
                <RiskBar level={a.risk}/>
                <span style={{ fontSize: 12, fontWeight: 700, color: a.accent }}>{a.riskLabel}</span>
              </div>

              {/* Good for / Watch out */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: "var(--green)", marginBottom: 4, fontFamily: "DM Mono, monospace", fontWeight: 700 }}>✓ GOOD FOR</div>
                  <div style={{ fontSize: 12, color: "var(--text2)" }}>{a.goodFor}</div>
                </div>
                <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: "var(--red)", marginBottom: 4, fontFamily: "DM Mono, monospace", fontWeight: 700 }}>⚠ WATCH OUT</div>
                  <div style={{ fontSize: 12, color: "var(--text2)" }}>{a.watchOut}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 56 }}>
          <Link href="/simulate" className="btn-primary">Try the Simulator →</Link>
          <Link href="/ai-investors" className="btn-ghost">Watch AI Investors</Link>
        </div>
      </div>
    </div>
  );
}
