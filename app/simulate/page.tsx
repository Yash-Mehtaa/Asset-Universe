"use client";
import { useState } from "react";
import Link from "next/link";
import { Footer } from "../components/Footer";

const TYPES = [
  { id: "stocks", num: "01", icon: "📈", label: "Stocks", sub: "Apple, Google, Tesla, NVIDIA…" },
  { id: "etfs", num: "02", icon: "📊", label: "ETFs", sub: "S&P 500, Nasdaq, Total Market…" },
  { id: "crypto", num: "03", icon: "₿", label: "Crypto", sub: "Bitcoin, Ethereum, Solana…" },
  { id: "bonds", num: "04", icon: "🏛️", label: "Bonds", sub: "Treasury, Corporate, Municipal" },
  { id: "commodities", num: "05", icon: "🥇", label: "Commodities", sub: "Gold, Silver, Oil, copper…" },
  { id: "custom", num: "06", icon: "🔍", label: "Custom search", sub: "Search anything investable" },
];

const POPULAR: Record<string, { symbol: string; name: string }[]> = {
  stocks: [{ symbol: "AAPL", name: "Apple" }, { symbol: "GOOGL", name: "Alphabet" }, { symbol: "TSLA", name: "Tesla" }, { symbol: "NVDA", name: "NVIDIA" }, { symbol: "MSFT", name: "Microsoft" }, { symbol: "META", name: "Meta" }, { symbol: "AMZN", name: "Amazon" }, { symbol: "JPM", name: "JPMorgan" }],
  etfs: [{ symbol: "SPY", name: "S&P 500 ETF" }, { symbol: "QQQ", name: "Nasdaq 100" }, { symbol: "VTI", name: "Total Market" }, { symbol: "IWM", name: "Russell 2000" }, { symbol: "VOO", name: "Vanguard S&P" }, { symbol: "DIA", name: "Dow Jones" }],
  crypto: [{ symbol: "BTC", name: "Bitcoin" }, { symbol: "ETH", name: "Ethereum" }, { symbol: "SOL", name: "Solana" }, { symbol: "BNB", name: "BNB" }, { symbol: "XRP", name: "Ripple" }, { symbol: "ADA", name: "Cardano" }],
  bonds: [{ symbol: "TLT", name: "20-Year Treasury" }, { symbol: "BND", name: "Total Bond Market" }, { symbol: "AGG", name: "Core Bond ETF" }],
  commodities: [{ symbol: "GLD", name: "Gold ETF" }, { symbol: "SLV", name: "Silver ETF" }, { symbol: "USO", name: "Oil ETF" }, { symbol: "CPER", name: "Copper ETF" }],
  custom: [],
};

export default function SimulatePage() {
  const [sel, setSel] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const cfg = sel ? TYPES.find(t => t.id === sel) : null;
  const popular = sel ? (POPULAR[sel] || []) : [];
  const filtered = search
    ? popular.filter(p => p.symbol.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase()))
    : popular;

  return (
    <>
      <section style={{ padding: "60px 40px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="fadeup" style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
            <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>04 / 06</span>
            <div style={{ width: 40, height: 1, background: "var(--border)" }} />
            <span className="eyebrow">Step 04 — Practice</span>
          </div>
          <h1 className="fadeup-delay-1" style={{ fontSize: "clamp(40px, 6vw, 72px)", marginBottom: 20, maxWidth: 900 }}>
            Practice with <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>real prices.</em> Make every mistake here first.
          </h1>
          <p className="fadeup-delay-2" style={{ fontSize: 18, maxWidth: 580 }}>
            $10,000 of simulated cash. Live market data from Finnhub, Alpha Vantage, and CoinGecko. Zero risk to your real money.
          </p>
        </div>
      </section>

      <section className="section">
        {!sel ? (
          <>
            <div className="eyebrow" style={{ marginBottom: 24 }}>Choose investment type</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {TYPES.map(t => (
                <button key={t.id} onClick={() => setSel(t.id)} className="card" style={{
                  textAlign: "left", padding: 28, cursor: "pointer", display: "block", width: "100%",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: "var(--radius)",
                      background: "var(--accent-soft)", border: "1px solid var(--accent-strong)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
                    }}>{t.icon}</div>
                    <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>{t.num}</span>
                  </div>
                  <h3 style={{ fontSize: 22, marginBottom: 6 }}>{t.label}</h3>
                  <p style={{ fontSize: 13, color: "var(--text-2)" }}>{t.sub}</p>
                  <div style={{ marginTop: 16, fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent)" }}>Browse →</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 32 }}>
            <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <button onClick={() => { setSel(null); setSearch(""); }} className="btn btn-ghost" style={{ justifyContent: "flex-start" }}>← Back to types</button>
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "var(--radius)",
                    background: "var(--accent-soft)", border: "1px solid var(--accent-strong)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                  }}>{cfg?.icon}</div>
                  <div>
                    <h3 style={{ fontSize: 19 }}>{cfg?.label}</h3>
                    <p style={{ fontSize: 12, color: "var(--text-3)" }}>{cfg?.sub}</p>
                  </div>
                </div>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search symbol or name…" />
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Available cash</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 500, color: "var(--accent)" }}>$10,000</div>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>Simulated balance</div>
              </div>
            </aside>

            <div>
              <div className="eyebrow" style={{ marginBottom: 24 }}>
                Popular {cfg?.label.toLowerCase()}
              </div>
              {sel === "custom" ? (
                <div className="card" style={{ textAlign: "center", padding: "60px 40px" }}>
                  <div style={{ fontSize: 48, marginBottom: 24 }}>🔍</div>
                  <h3 style={{ fontSize: 24, marginBottom: 12 }}>Search any asset</h3>
                  <p style={{ fontSize: 14, marginBottom: 28, maxWidth: 380, margin: "0 auto 28px" }}>
                    Stocks, ETFs, crypto, indices — if it has a ticker, we can find it.
                  </p>
                  <input placeholder="Enter symbol (AAPL, BTC, SPY…)" style={{ maxWidth: 360, margin: "0 auto" }} />
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ color: "var(--text-3)", padding: "40px 0", fontSize: 14 }}>No results for &quot;{search}&quot;</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                  {filtered.map(p => (
                    <button key={p.symbol} className="card" style={{ padding: 20, textAlign: "left", cursor: "pointer", display: "block", width: "100%" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "var(--radius)",
                        background: "var(--accent-soft)", border: "1px solid var(--accent-strong)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color: "var(--accent)",
                        marginBottom: 14,
                      }}>{p.symbol.slice(0, 3)}</div>
                      <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 2 }}>{p.symbol}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)" }}>{p.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 60 }}>
          <Link href="/my-portfolio" className="btn btn-primary">View portfolio →</Link>
          <Link href="/ai-investors" className="btn btn-ghost">Watch AI investors</Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
