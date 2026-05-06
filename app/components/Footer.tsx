import Link from "next/link";

export function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      padding: "60px 40px 40px",
      marginTop: 80,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: 40,
          marginBottom: 48,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32,
                background: "var(--accent)",
                borderRadius: "var(--radius)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--bg)",
                fontFamily: "var(--serif)", fontWeight: 700, fontSize: 13,
              }}>AU</div>
              <span style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: 18 }}>
                Asset Universe
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 360 }}>
              An educational platform for learning to invest with confidence — using real market data, simulated capital, and complete transparency.
            </p>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Explore</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
              <Link href="/dashboard" style={{ color: "var(--text-2)" }}>Budget</Link>
              <Link href="/learn" style={{ color: "var(--text-2)" }}>Learn</Link>
              <Link href="/simulate" style={{ color: "var(--text-2)" }}>Simulate</Link>
              <Link href="/ai-investors" style={{ color: "var(--text-2)" }}>AI Investors</Link>
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Data</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "var(--text-2)" }}>
              <span>Finnhub</span>
              <span>Alpha Vantage</span>
              <span>CoinGecko</span>
            </div>
          </div>
        </div>

        <div style={{
          padding: "16px 20px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          marginBottom: 32,
        }}>
          <div style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--mono)", letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase" }}>
            Important
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-3)" }}>
            Asset Universe is for educational purposes only. No real money is ever traded. This is not financial, investment, tax, or legal advice. Past performance does not guarantee future results.
          </p>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: 24,
          borderTop: "1px solid var(--border)",
          fontFamily: "var(--mono)",
          fontSize: 11,
          color: "var(--text-3)",
          letterSpacing: "0.05em",
        }}>
          <span>© 2026 Asset Universe</span>
          <span>Educational platform · Not a registered investment advisor</span>
        </div>
      </div>
    </footer>
  );
}
