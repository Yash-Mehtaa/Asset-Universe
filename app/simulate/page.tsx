"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Footer } from "../components/Footer";

type Holding = {
  symbol: string;
  name: string;
  type: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
};

type Trade = {
  id: number;
  symbol: string;
  name: string;
  side: "buy" | "sell";
  shares: number;
  price: number;
  total: number;
  timestamp: string;
};

type Portfolio = {
  holdings: Holding[];
  trades: Trade[];
};

type SearchResult = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  type: string;
};

const POPULAR: Record<string, { symbol: string; name: string }[]> = {
  stocks: [
    { symbol: "AAPL", name: "Apple" }, { symbol: "GOOGL", name: "Alphabet" },
    { symbol: "TSLA", name: "Tesla" }, { symbol: "NVDA", name: "NVIDIA" },
    { symbol: "MSFT", name: "Microsoft" }, { symbol: "META", name: "Meta" },
    { symbol: "AMZN", name: "Amazon" }, { symbol: "JPM", name: "JPMorgan" },
  ],
  etfs: [
    { symbol: "SPY", name: "S&P 500 ETF" }, { symbol: "QQQ", name: "Nasdaq 100" },
    { symbol: "VTI", name: "Total Market" }, { symbol: "IWM", name: "Russell 2000" },
    { symbol: "VOO", name: "Vanguard S&P" }, { symbol: "DIA", name: "Dow Jones" },
  ],
  crypto: [
    { symbol: "BTC", name: "Bitcoin" }, { symbol: "ETH", name: "Ethereum" },
    { symbol: "SOL", name: "Solana" }, { symbol: "BNB", name: "BNB" },
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
};

const TYPES = [
  { id: "stocks", icon: "📈", label: "Stocks", sub: "Apple, Google, Tesla…" },
  { id: "etfs", icon: "📊", label: "ETFs", sub: "S&P 500, Nasdaq, Total Market…" },
  { id: "crypto", icon: "₿", label: "Crypto", sub: "Bitcoin, Ethereum, Solana…" },
  { id: "bonds", icon: "🏛️", label: "Bonds", sub: "Treasury, Corporate, Municipal" },
  { id: "commodities", icon: "🥇", label: "Commodities", sub: "Gold, Silver, Oil…" },
  { id: "search", icon: "🔍", label: "Search", sub: "Find any ticker or name" },
];

function getPortfolio(): Portfolio {
  if (typeof window === "undefined") return { holdings: [], trades: [] };
  try {
    const raw = localStorage.getItem("au_portfolio");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { holdings: [], trades: [] };
}

function savePortfolio(p: Portfolio) {
  localStorage.setItem("au_portfolio", JSON.stringify(p));
}

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function SimulatePage() {
  const [tab, setTab] = useState<"browse" | "trade">("browse");
  const [assetType, setAssetType] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [shares, setShares] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [portfolio, setPortfolio] = useState<Portfolio>({ holdings: [], trades: [] });
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  useEffect(() => { setPortfolio(getPortfolio()); }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (searchQ) search(searchQ); else setSearchResults([]); }, 500);
    return () => clearTimeout(t);
  }, [searchQ, search]);

  const fetchAndSelect = async (symbol: string, name: string, type: string) => {
    setLoadingPrice(true);
    setTab("trade");
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(symbol)}`);
      const data = await res.json();
      const found = data.results?.find((r: SearchResult) => r.symbol === symbol) || data.results?.[0];
      setSelected(found || { id: symbol.toLowerCase(), symbol, name, price: 0, change: 0, type });
    } catch {
      setSelected({ id: symbol.toLowerCase(), symbol, name, price: 0, change: 0, type });
    } finally { setLoadingPrice(false); }
  };

  const executeTrade = () => {
    if (!selected || !shares) return;
    const numShares = parseFloat(shares);
    if (isNaN(numShares) || numShares <= 0) {
      setMsg({ text: "Enter a valid number of shares.", ok: false }); return;
    }
    if (selected.price <= 0) {
      setMsg({ text: "Could not get a valid price. Try again.", ok: false }); return;
    }

    const total = numShares * selected.price;
    const p = getPortfolio();

    if (side === "buy") {
      // No cash limit — unlimited simulated capital
      const existing = p.holdings.find(h => h.symbol === selected.symbol);
      if (existing) {
        existing.avgCost = (existing.avgCost * existing.shares + total) / (existing.shares + numShares);
        existing.shares += numShares;
        existing.currentPrice = selected.price;
      } else {
        p.holdings.push({
          symbol: selected.symbol, name: selected.name, type: selected.type,
          shares: numShares, avgCost: selected.price, currentPrice: selected.price,
        });
      }
    } else {
      const existing = p.holdings.find(h => h.symbol === selected.symbol);
      if (!existing || existing.shares < numShares - 0.0001) {
        setMsg({ text: "You don't hold enough shares to sell.", ok: false }); return;
      }
      existing.shares -= numShares;
      existing.currentPrice = selected.price;
      if (existing.shares <= 0.0001) p.holdings = p.holdings.filter(h => h.symbol !== selected.symbol);
    }

    p.trades.unshift({
      id: Date.now(), symbol: selected.symbol, name: selected.name,
      side, shares: numShares, price: selected.price, total,
      timestamp: new Date().toISOString(),
    });

    savePortfolio(p);
    setPortfolio({ ...p });
    setShares("");
    setMsg({
      text: `${side === "buy" ? "Bought" : "Sold"} ${numShares} share${numShares !== 1 ? "s" : ""} of ${selected.symbol} at $${fmt(selected.price)}.`,
      ok: true,
    });
    setTimeout(() => setMsg(null), 4000);
  };

  const holding = selected ? portfolio.holdings.find(h => h.symbol === selected.symbol) : null;
  const cost = selected && shares ? parseFloat(shares) * selected.price : 0;
  const popular = assetType ? (POPULAR[assetType] || []) : [];

  return (
    <>
      <section style={{ padding: "60px 40px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="fadeup" style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
            <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>04 / 06</span>
            <div style={{ width: 40, height: 1, background: "var(--border)" }} />
            <span className="eyebrow">Step 04 — Practice</span>
          </div>
          <h1 className="fadeup-delay-1" style={{ fontSize: "clamp(40px, 6vw, 72px)", marginBottom: 20 }}>
            Practice with <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>real prices.</em>
          </h1>
          <p className="fadeup-delay-2" style={{ fontSize: 18, maxWidth: 580 }}>
            Unlimited simulated capital. Real-time market prices. Zero risk to your real money.
          </p>
        </div>
      </section>

      <section className="section">
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 32, alignItems: "start" }}>

          {/* Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 90 }}>
            <div className="card" style={{ padding: 24 }}>
              <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>Simulated capital</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 500, color: "var(--accent)" }}>
                Unlimited
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>
                Practice without limits
              </div>
            </div>

            {portfolio.holdings.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <div className="eyebrow" style={{ fontSize: 10, marginBottom: 14 }}>
                  Holdings ({portfolio.holdings.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {portfolio.holdings.map(h => (
                    <div key={h.symbol} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 12px", background: "var(--bg)", borderRadius: "var(--radius)",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setSelected({ id: h.symbol.toLowerCase(), symbol: h.symbol, name: h.name, price: h.currentPrice, change: 0, type: h.type });
                      setTab("trade"); setSide("sell");
                    }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{h.symbol}</div>
                        <div className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>{h.shares.toFixed(3)} sh</div>
                      </div>
                      <div className="mono" style={{ fontSize: 12 }}>${fmt(h.shares * h.currentPrice)}</div>
                    </div>
                  ))}
                </div>
                <Link href="/my-portfolio" style={{ display: "block", marginTop: 12, fontSize: 12, color: "var(--accent)", fontFamily: "var(--mono)" }}>
                  View full portfolio →
                </Link>
              </div>
            )}

            <Link href="/my-portfolio" className="btn btn-ghost" style={{ justifyContent: "center" }}>
              My Portfolio →
            </Link>
          </aside>

          {/* Main */}
          <div>
            <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--border)" }}>
              {(["browse", "trade"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: "10px 20px", fontSize: 14, fontWeight: 500,
                  color: tab === t ? "var(--accent)" : "var(--text-2)",
                  borderBottom: `2px solid ${tab === t ? "var(--accent)" : "transparent"}`,
                  marginBottom: -1, transition: "all 0.2s", textTransform: "capitalize",
                }}>{t}</button>
              ))}
            </div>

            {tab === "browse" && (
              <div>
                <div style={{ marginBottom: 32 }}>
                  <input
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder="Search any symbol or name (AAPL, Bitcoin, Gold…)"
                    style={{ fontSize: 16, padding: "14px 18px" }}
                  />
                  {searching && (
                    <div className="mono" style={{ fontSize: 12, color: "var(--text-3)", marginTop: 8 }}>Searching…</div>
                  )}
                  {searchResults.length > 0 && (
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                      {searchResults.map(r => (
                        <div key={r.id} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "12px 16px", background: "var(--surface)",
                          border: "1px solid var(--border)", borderRadius: "var(--radius)",
                          cursor: "pointer", transition: "border-color 0.2s",
                        }}
                        onClick={() => { setSelected(r); setTab("trade"); setSide("buy"); setSearchQ(""); setSearchResults([]); }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)"}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontWeight: 600, fontSize: 15 }}>{r.symbol}</span>
                            <span style={{ color: "var(--text-2)", fontSize: 13 }}>{r.name}</span>
                            <span className="tag tag-accent" style={{ fontSize: 10 }}>{r.type}</span>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div className="mono" style={{ fontWeight: 600 }}>${fmt(r.price)}</div>
                            <div className="mono" style={{ fontSize: 11, color: r.change >= 0 ? "var(--green)" : "var(--red)" }}>
                              {r.change >= 0 ? "+" : ""}{fmt(r.change)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!assetType ? (
                  <>
                    <div className="eyebrow" style={{ marginBottom: 16 }}>Browse by category</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                      {TYPES.map(t => (
                        <button key={t.id} onClick={() => setAssetType(t.id)} className="card"
                          style={{ padding: 20, textAlign: "left", cursor: "pointer", display: "block", width: "100%" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; }}>
                          <div style={{ fontSize: 28, marginBottom: 12 }}>{t.icon}</div>
                          <div style={{ fontFamily: "var(--serif)", fontSize: 18, marginBottom: 4 }}>{t.label}</div>
                          <div style={{ fontSize: 12, color: "var(--text-3)" }}>{t.sub}</div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                      <div className="eyebrow">Popular {assetType}</div>
                      <button onClick={() => setAssetType(null)} className="mono" style={{ fontSize: 12, color: "var(--text-2)", cursor: "pointer" }}>← All categories</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                      {popular.map(p => (
                        <button key={p.symbol} className="card"
                          style={{ padding: 18, textAlign: "left", cursor: "pointer", display: "block", width: "100%" }}
                          onClick={() => fetchAndSelect(p.symbol, p.name, assetType)}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: "var(--radius)",
                            background: "var(--accent-soft)", border: "1px solid var(--accent-strong)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "var(--accent)",
                            marginBottom: 12,
                          }}>{p.symbol.slice(0, 3)}</div>
                          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{p.symbol}</div>
                          <div style={{ fontSize: 12, color: "var(--text-3)" }}>{p.name}</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === "trade" && (
              <div>
                {!selected ? (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>📈</div>
                    <p style={{ color: "var(--text-3)" }}>Search or browse an asset to trade</p>
                    <button onClick={() => setTab("browse")} className="btn btn-ghost" style={{ marginTop: 20 }}>Browse assets →</button>
                  </div>
                ) : (
                  <div style={{ maxWidth: 520 }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                      padding: "20px 24px", background: "var(--surface)",
                      border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", marginBottom: 24,
                    }}>
                      <div>
                        <div style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 500 }}>{selected.symbol}</div>
                        <div style={{ fontSize: 14, color: "var(--text-2)", marginTop: 2 }}>{selected.name}</div>
                        <span className="tag tag-accent" style={{ marginTop: 8 }}>{selected.type}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {loadingPrice ? (
                          <div className="mono" style={{ color: "var(--text-3)" }}>Loading…</div>
                        ) : (
                          <>
                            <div className="mono" style={{ fontSize: 28, fontWeight: 700 }}>${fmt(selected.price)}</div>
                            <div className="mono" style={{ fontSize: 12, color: selected.change >= 0 ? "var(--green)" : "var(--red)", marginTop: 4 }}>
                              {selected.change >= 0 ? "▲" : "▼"} {Math.abs(selected.change).toFixed(2)}% today
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {holding && (
                      <div style={{
                        padding: "12px 16px", background: "var(--accent-soft)",
                        border: "1px solid var(--accent-strong)", borderRadius: "var(--radius)", marginBottom: 20, fontSize: 13,
                      }}>
                        You hold <strong>{holding.shares.toFixed(4)} shares</strong> at avg cost ${fmt(holding.avgCost)}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                      {(["buy", "sell"] as const).map(s => (
                        <button key={s} onClick={() => setSide(s)} style={{
                          flex: 1, padding: "12px 0", borderRadius: "var(--radius)",
                          fontSize: 14, fontWeight: 600, textTransform: "capitalize", transition: "all 0.2s",
                          background: side === s ? (s === "buy" ? "var(--green-soft)" : "var(--red-soft)") : "var(--surface)",
                          border: `1px solid ${side === s ? (s === "buy" ? "var(--green)" : "var(--red)") : "var(--border)"}`,
                          color: side === s ? (s === "buy" ? "var(--green)" : "var(--red)") : "var(--text-2)",
                        }}>{s}</button>
                      ))}
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: "block", fontSize: 13, color: "var(--text-2)", marginBottom: 8 }}>Number of shares</label>
                      <input
                        type="number" min="0" step="any"
                        value={shares} onChange={e => setShares(e.target.value)}
                        placeholder="0" style={{ fontSize: 18, padding: "14px 16px" }}
                      />
                      {shares && selected.price > 0 && (
                        <div className="mono" style={{ marginTop: 8, fontSize: 13, color: "var(--text-2)" }}>
                          Total: <strong style={{ color: "var(--text)" }}>${fmt(cost)}</strong>
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                      {[100, 500, 1000, 5000, 10000].map(amt => (
                        <button key={amt} onClick={() => setShares(selected.price > 0 ? (amt / selected.price).toFixed(4) : "0")} style={{
                          padding: "6px 14px", borderRadius: "var(--radius)", fontSize: 12,
                          background: "var(--surface)", border: "1px solid var(--border)",
                          color: "var(--text-2)", cursor: "pointer", fontFamily: "var(--mono)",
                        }}>${amt.toLocaleString()}</button>
                      ))}
                    </div>

                    <button
                      onClick={executeTrade}
                      disabled={!shares || !selected.price || loadingPrice}
                      className="btn btn-primary"
                      style={{ width: "100%", justifyContent: "center", fontSize: 16, padding: "16px 0", opacity: (!shares || !selected.price) ? 0.5 : 1 }}
                    >
                      {side === "buy" ? "Buy" : "Sell"} {selected.symbol}
                    </button>

                    {msg && (
                      <div style={{
                        marginTop: 16, padding: "12px 16px", borderRadius: "var(--radius)",
                        background: msg.ok ? "var(--green-soft)" : "var(--red-soft)",
                        border: `1px solid ${msg.ok ? "var(--green)" : "var(--red)"}`,
                        fontSize: 13, color: msg.ok ? "var(--green)" : "var(--red)",
                      }}>{msg.text}</div>
                    )}

                    <button onClick={() => { setSelected(null); setShares(""); setMsg(null); setTab("browse"); }} style={{
                      marginTop: 16, width: "100%", padding: "10px 0", fontSize: 13,
                      color: "var(--text-3)", cursor: "pointer", fontFamily: "var(--mono)",
                    }}>← Browse other assets</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
