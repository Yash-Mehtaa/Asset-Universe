"use client";
import { useState } from "react";
import Link from "next/link";

const ASSET_TYPES = [
  { id: "stocks", icon: "📈", label: "Stocks", sub: "Apple, Google, Tesla...", accent: "#a78bfa" },
  { id: "etfs", icon: "📊", label: "ETFs", sub: "S&P 500, Nasdaq, Bonds...", accent: "#38bdf8" },
  { id: "crypto", icon: "₿", label: "Crypto", sub: "Bitcoin, Ethereum, Solana...", accent: "#fbbf24" },
  { id: "bonds", icon: "🏛️", label: "Bonds", sub: "Treasury, Corporate, Municipal", accent: "#34d399" },
  { id: "commodities", icon: "🥇", label: "Commodities", sub: "Gold, Silver, Oil...", accent: "#f97316" },
  { id: "custom", icon: "🔍", label: "Custom Search", sub: "Search anything investable", accent: "#94a3b8" },
];

const POPULAR: Record<string, { symbol: string; name: string }[]> = {
  stocks: [
    { symbol: "AAPL", name: "Apple" },
    { symbol: "GOOGL", name: "Alphabet" },
    { symbol: "TSLA", name: "Tesla" },
    { symbol: "NVDA", name: "NVIDIA" },
    { symbol: "MSFT", name: "Microsoft" },
    { symbol: "META", name: "Meta" },
  ],
  etfs: [
    { symbol: "SPY", name: "S&P 500 ETF" },
    { symbol: "QQQ", name: "Nasdaq 100" },
    { symbol: "VTI", name: "Total Market" },
    { symbol: "IWM", name: "Russell 2000" },
  ],
  crypto: [
    { symbol: "BTC", name: "Bitcoin" },
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "SOL", name: "Solana" },
    { symbol: "BNB", name: "BNB" },
  ],
  bonds: [
    { symbol: "TLT", name: "20-Year Treasury" },
    { symbol: "BND", name: "Total Bond Market" },
    { symbol: "AGG", name: "Core Bond ETF" },
  ],
  commodities: [
    { symbol: "GLD", name: "Gold ETF" },
    { symbol: "SLV", name: "Silver ETF" },
    { symbol: "USO", name: "Oil ETF" },
  ],
  custom: [],
};

export default function SimulatePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const cfg = selected ? ASSET_TYPES.find(a => a.id === selected) : null;
  const popular = selected ? (POPULAR[selected] || []) : [];
  const filtered = search
    ? popular.filter(p => p.symbol.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase()))
    : popular;

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <div className="section animate-fadeup">

        <div style={{ marginBottom: 8 }}>
          <span className="badge tag-neutral">STEP 3 OF 4</span>
        </div>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", marginBottom: 12 }}>
          <span className="gradient-text">Investment Simulator</span>
        </h1>
        <p style={{ color: "var(--text2)", maxWidth: 480, marginBottom: 56 }}>
          Practice with fake money and real market prices. Zero risk, full realism.
        </p>

        {/* Asset type picker */}
        {!selected ? (
          <div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20, fontFamily: "DM Mono, monospace", letterSpacing: "1px" }}>
              CHOOSE INVESTMENT TYPE
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {ASSET_TYPES.map(a => (
                <button key={a.id} onClick={() => setSelected(a.id)} style={{
                  background: "var(--surface)",
                  border: `1px solid var(--border)`,
                  borderRadius: "var(--radius)",
                  padding: "28px 24px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = a.accent;
                  (e.currentTarget as HTMLButtonElement).style.background = `${a.accent}08`;
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 30px ${a.accent}20`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "none";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}>
                  <div style={{ fontSize: 32, marginBottom: 14 }}>{a.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "Syne, sans-serif", marginBottom: 6, color: "var(--text)" }}>{a.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>{a.sub}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 32 }}>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <button onClick={() => { setSelected(null); setSearch(""); }} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                color: "var(--text2)", borderRadius: "var(--radius-sm)", padding: "10px 16px",
                fontSize: 13, cursor: "pointer", textAlign: "left",
              }}>← Back to asset types</button>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ fontSize: 28 }}>{cfg?.icon}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontFamily: "Syne, sans-serif" }}>{cfg?.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>{cfg?.sub}</div>
                  </div>
                </div>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search symbol or name..."/>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 16, fontFamily: "DM Mono, monospace" }}>YOUR BALANCE</div>
                <div style={{ fontSize: 32, fontWeight: 900, fontFamily: "Syne, sans-serif", color: "var(--purple)" }}>$10,000</div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>Simulated cash available</div>
              </div>
            </div>

            {/* Main area */}
            <div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20, fontFamily: "DM Mono, monospace" }}>
                POPULAR {cfg?.label.toUpperCase()}
              </div>

              {filtered.length === 0 && selected !== "custom" ? (
                <div style={{ color: "var(--text3)", fontSize: 14, padding: "40px 0" }}>No results for &quot;{search}&quot;</div>
              ) : selected === "custom" ? (
                <div className="card" style={{ textAlign: "center", padding: "60px 40px" }}>
                  <div style={{ fontSize: 48, marginBottom: 20 }}>🔍</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Syne, sans-serif", marginBottom: 12 }}>Search Any Asset</div>
                  <div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 28 }}>Stocks, ETFs, crypto, indices — if it has a ticker, we can find it</div>
                  <input placeholder="Enter symbol (e.g. AAPL, BTC, SPY)" style={{ maxWidth: 360, margin: "0 auto" }}/>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                  {filtered.map(p => (
                    <button key={p.symbol} style={{
                      background: "var(--surface)", border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)", padding: "20px 16px",
                      cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = cfg?.accent || "var(--purple)";
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLButtonElement).style.transform = "none";
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `${cfg?.accent}18`, border: `1px solid ${cfg?.accent}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 900, fontSize: 12, color: cfg?.accent,
                        fontFamily: "DM Mono, monospace", marginBottom: 12,
                      }}>{p.symbol.slice(0, 3)}</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>{p.symbol}</div>
                      <div style={{ fontSize: 12, color: "var(--text3)" }}>{p.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: 56 }}>
          <Link href="/my-portfolio" className="btn-ghost">View My Portfolio →</Link>
        </div>
      </div>
    </div>
  );
}
