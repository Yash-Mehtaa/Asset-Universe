import Link from "next/link";
import { Footer } from "../components/Footer";

const ASSETS = [
  { num: "01", icon: "📈", name: "Stocks", tagline: "Own a piece of a company", risk: 4, riskLabel: "High", returns: "8–12% avg/year", goodFor: "Long-term growth", watchOut: "Can drop 30%+ in crashes", desc: "When you buy a stock, you become a part-owner of a company. Your investment grows as the company grows — and shrinks when it struggles." },
  { num: "02", icon: "📊", name: "ETFs", tagline: "A basket of assets in one purchase", risk: 2, riskLabel: "Medium", returns: "6–10% avg/year", goodFor: "Instant diversification", watchOut: "Less upside than stock-picking", desc: "ETFs hold dozens or hundreds of stocks at once. Great risk management — if one company tanks, the others hold you up." },
  { num: "03", icon: "🏛️", name: "Government Bonds", tagline: "Loan money to the government", risk: 1, riskLabel: "Low", returns: "3–5% avg/year", goodFor: "Safe, predictable income", watchOut: "Low returns, loses to inflation", desc: "Government bonds are essentially IOUs from the government. Extremely safe but the returns barely keep up with inflation." },
  { num: "04", icon: "🏢", name: "Corporate Bonds", tagline: "Loan money to companies", risk: 2, riskLabel: "Medium", returns: "4–7% avg/year", goodFor: "Higher yield than govt bonds", watchOut: "Company could default", desc: "Similar to government bonds but issued by companies. Higher returns reflect higher risk — companies can go bankrupt." },
  { num: "05", icon: "₿", name: "Crypto", tagline: "Digital currencies like Bitcoin", risk: 5, riskLabel: "Very High", returns: "Highly variable", goodFor: "Massive upside potential", watchOut: "Can lose 80%+ in downturns", desc: "Highly speculative. Some people made fortunes, many lost everything. Only invest what you'd be comfortable losing entirely." },
  { num: "06", icon: "🏦", name: "High-Yield Savings", tagline: "Savings account with better rates", risk: 0, riskLabel: "None", returns: "4–5% currently", goodFor: "Zero risk, instant access", watchOut: "Barely beats inflation", desc: "The safest option. Your money is FDIC-insured and accessible any time. Best for your emergency fund or short-term savings." },
];

function RiskBar({ level }: { level: number }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{
          width: 24, height: 4, borderRadius: 2,
          background: i <= level
            ? (level <= 1 ? "var(--green)" : level <= 2 ? "var(--blue)" : level <= 3 ? "var(--accent)" : "var(--red)")
            : "var(--surface-2)",
        }} />
      ))}
    </div>
  );
}

export default function LearnPage() {
  return (
    <>
      <section style={{ padding: "60px 40px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="fadeup" style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
            <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>03 / 06</span>
            <div style={{ width: 40, height: 1, background: "var(--border)" }} />
            <span className="eyebrow">Step 03 — Learn</span>
          </div>
          <h1 className="fadeup-delay-1" style={{ fontSize: "clamp(40px, 6vw, 72px)", marginBottom: 20, maxWidth: 900 }}>
            Every asset class, <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>honestly</em> explained.
          </h1>
          <p className="fadeup-delay-2" style={{ fontSize: 18, maxWidth: 580 }}>
            Six asset classes. Six honest summaries. Real numbers, real risk, real context — no hype, no gatekeeping.
          </p>
        </div>
      </section>

      <section className="section">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
          {ASSETS.map(a => (
            <article key={a.name} className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.1em" }}>{a.num}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                    <span style={{ fontSize: 28 }}>{a.icon}</span>
                    <div>
                      <h3 style={{ fontSize: 22 }}>{a.name}</h3>
                      <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>{a.tagline}</p>
                    </div>
                  </div>
                </div>
                <span className="tag tag-accent" style={{ whiteSpace: "nowrap" }}>{a.returns}</span>
              </div>

              <p style={{ fontSize: 14, lineHeight: 1.65 }}>{a.desc}</p>

              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span className="eyebrow" style={{ fontSize: 10 }}>Risk</span>
                <RiskBar level={a.risk} />
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: a.risk <= 1 ? "var(--green)" : a.risk <= 2 ? "var(--blue)" : a.risk <= 3 ? "var(--accent)" : "var(--red)" }}>{a.riskLabel}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: "auto" }}>
                <div style={{ background: "var(--green-soft)", border: "1px solid rgba(127,168,134,0.2)", padding: "10px 12px", borderRadius: "var(--radius)" }}>
                  <div className="mono" style={{ fontSize: 9, color: "var(--green)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>+ Good for</div>
                  <div style={{ fontSize: 12, color: "var(--text)" }}>{a.goodFor}</div>
                </div>
                <div style={{ background: "var(--red-soft)", border: "1px solid rgba(201,133,112,0.2)", padding: "10px 12px", borderRadius: "var(--radius)" }}>
                  <div className="mono" style={{ fontSize: 9, color: "var(--red)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>− Watch out</div>
                  <div style={{ fontSize: 12, color: "var(--text)" }}>{a.watchOut}</div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 60 }}>
          <Link href="/simulate" className="btn btn-primary">Try the simulator →</Link>
          <Link href="/ai-investors" className="btn btn-ghost">Watch AI investors</Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
