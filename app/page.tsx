"use client";
import Link from "next/link";
import { Footer } from "./components/Footer";

const STEPS = [
  {
    num: "01",
    title: "Plan",
    href: "/dashboard",
    label: "Budget Calculator",
    body: "Figure out exactly how much you can safely invest each month. After expenses, after emergencies, what's left for the future.",
  },
  {
    num: "02",
    title: "Learn",
    href: "/learn",
    label: "Asset Library",
    body: "Stocks, ETFs, bonds, crypto, commodities. Every asset class explained without jargon, with real numbers and honest risk levels.",
  },
  {
    num: "03",
    title: "Practice",
    href: "/simulate",
    label: "Live Simulator",
    body: "Trade with $10,000 of simulated cash and real-time market prices. Make every mistake on the practice field.",
  },
  {
    num: "04",
    title: "Watch",
    href: "/ai-investors",
    label: "AI Investors",
    body: "Three autonomous AI agents trade on real strategies. Watch them think, trade, and adapt — every decision logged.",
  },
];

export default function HomePage() {
  return (
    <>
      <section style={{ padding: "100px 40px 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="fadeup" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
            <span className="live-dot" />
            <span className="eyebrow">Free · No account · Real market data</span>
          </div>

          <h1 className="fadeup-delay-1" style={{
            fontSize: "clamp(48px, 9vw, 120px)",
            fontWeight: 500,
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
            marginBottom: 36,
            maxWidth: 1100,
          }}>
            Master <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--accent)" }}>investing</em> before risking real money.
          </h1>

          <p className="fadeup-delay-2" style={{
            fontSize: "clamp(17px, 2vw, 21px)",
            lineHeight: 1.55,
            maxWidth: 620,
            marginBottom: 48,
            color: "var(--text-2)",
          }}>
            A patient, transparent place to plan your budget, understand every asset class, practice with live market data, and watch autonomous AI investors evolve over time.
          </p>

          <div className="fadeup-delay-3" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/dashboard" className="btn btn-primary">Begin the journey →</Link>
            <Link href="/ai-investors" className="btn btn-ghost">Watch AI investors</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div style={{
          display: "flex", alignItems: "baseline", gap: 24, marginBottom: 48,
          paddingBottom: 24, borderBottom: "1px solid var(--border)",
        }}>
          <span className="mono" style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: "0.1em" }}>I.</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)" }}>The journey</h2>
          <div style={{ flex: 1, height: 1 }} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.15em" }}>
            FOUR PARTS
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {STEPS.map((s, i) => (
            <Link key={s.num} href={s.href} style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr 2fr auto",
              gap: 40,
              alignItems: "center",
              padding: "40px 0",
              borderBottom: i < STEPS.length - 1 ? "1px solid var(--border)" : "none",
              transition: "background 0.3s, padding 0.3s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.paddingLeft = "20px";
              const arrow = e.currentTarget.querySelector('.arrow') as HTMLSpanElement;
              if (arrow) { arrow.style.color = "var(--accent)"; arrow.style.transform = "translateX(8px)"; }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.paddingLeft = "0";
              const arrow = e.currentTarget.querySelector('.arrow') as HTMLSpanElement;
              if (arrow) { arrow.style.color = "var(--text-3)"; arrow.style.transform = "translateX(0)"; }
            }}>
              <div style={{
                fontFamily: "var(--mono)", fontSize: 13, color: "var(--text-3)",
                letterSpacing: "0.1em", minWidth: 32,
              }}>{s.num}</div>
              <div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 500, lineHeight: 1 }}>
                  {s.title}
                </div>
                <div style={{
                  fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)",
                  letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 6,
                }}>{s.label}</div>
              </div>
              <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.6 }}>{s.body}</p>
              <span className="arrow" style={{
                fontSize: 24, color: "var(--text-3)",
                transition: "all 0.3s",
              }}>→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "60px 48px",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center",
        }}>
          <div>
            <span className="tag tag-accent" style={{ marginBottom: 20 }}>
              <span className="live-dot" /> LIVE NOW
            </span>
            <h3 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginTop: 16, marginBottom: 20 }}>
              Three AI investors. <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>Zero secrets.</em>
            </h3>
            <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 28, maxWidth: 460 }}>
              Autonomous agents using textbook quant strategies on simulated capital. They trade, review their own performance, and adapt — and you get to watch every decision.
            </p>
            <Link href="/ai-investors" className="btn btn-primary">Watch them now →</Link>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
          }}>
            {[
              { num: "30m", label: "Trade cadence" },
              { num: "$30k", label: "Total capital" },
              { num: "100%", label: "Transparent" },
            ].map(s => (
              <div key={s.label} style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "20px 16px",
                textAlign: "center",
              }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 500, color: "var(--accent)", marginBottom: 4 }}>
                  {s.num}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--mono)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
