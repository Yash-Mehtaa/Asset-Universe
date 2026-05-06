"use client";
import { useState } from "react";
import Link from "next/link";
import { Footer } from "../components/Footer";

const CATEGORIES = ["Housing", "Food", "Transport", "Entertainment", "Healthcare", "Other"];
const COLORS: Record<string, string> = {
  Housing: "#c9a875", Food: "#7fa886", Transport: "#88a2c4",
  Entertainment: "#c98570", Healthcare: "#a89070", Other: "#7a7468",
};

type Tx = { id: number; desc: string; amount: number; category: string; type: "income" | "expense" };

export default function DashboardPage() {
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [emergency, setEmergency] = useState(0);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [d, setD] = useState(""); const [a, setA] = useState("");
  const [c, setC] = useState("Other"); const [t, setT] = useState<"income" | "expense">("expense");

  const investable = Math.max(0, income - expenses - emergency);
  const investPct = income > 0 ? (investable / income) * 100 : 0;

  const add = () => {
    if (!d || !a) return;
    const amt = parseFloat(a); if (isNaN(amt)) return;
    setTransactions(arr => [...arr, { id: Date.now(), desc: d, amount: amt, category: c, type: t }]);
    if (t === "income") setIncome(i => i + amt); else setExpenses(e => e + amt);
    setD(""); setA("");
  };

  const byCat = CATEGORIES.map(cat => ({
    cat,
    total: transactions.filter(tx => tx.category === cat && tx.type === "expense").reduce((s, tx) => s + tx.amount, 0),
  })).filter(c => c.total > 0);
  const maxCat = Math.max(...byCat.map(c => c.total), 1);

  return (
    <>
      <section style={{ padding: "60px 40px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="fadeup" style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
            <span className="mono" style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: "0.1em" }}>02 / 06</span>
            <div style={{ width: 40, height: 1, background: "var(--border)" }} />
            <span className="eyebrow">Step 02 — Plan</span>
          </div>
          <h1 className="fadeup-delay-1" style={{ fontSize: "clamp(40px, 6vw, 72px)", marginBottom: 20, maxWidth: 900 }}>
            How much can you <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>safely</em> invest?
          </h1>
          <p className="fadeup-delay-2" style={{ fontSize: 18, maxWidth: 580, marginBottom: 0 }}>
            Enter your income and expenses below. We'll calculate exactly what's left over for investing each month — after the things that matter.
          </p>
        </div>
      </section>

      <section className="section">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="card">
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 24 }}>
                <span className="mono" style={{ fontSize: 12, color: "var(--accent)" }}>I.</span>
                <h3 style={{ fontSize: 22 }}>Quick setup</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[
                  { label: "Monthly income (after tax)", val: income, set: setIncome },
                  { label: "Monthly expenses", val: expenses, set: setExpenses },
                  { label: "Emergency fund (optional)", val: emergency, set: setEmergency },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display: "block", fontSize: 13, color: "var(--text-2)", marginBottom: 8 }}>{f.label}</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 14 }}>$</span>
                      <input type="number" min="0" value={f.val || ""} onChange={e => f.set(parseFloat(e.target.value) || 0)} style={{ paddingLeft: 32 }} placeholder="0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 24 }}>
                <span className="mono" style={{ fontSize: 12, color: "var(--accent)" }}>II.</span>
                <h3 style={{ fontSize: 22 }}>Add transaction</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input value={d} onChange={e => setD(e.target.value)} placeholder="Description (e.g. Rent, Groceries)" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}>$</span>
                    <input type="number" min="0" value={a} onChange={e => setA(e.target.value)} placeholder="0" style={{ paddingLeft: 28 }} />
                  </div>
                  <select value={c} onChange={e => setC(e.target.value)}>
                    {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["income", "expense"] as const).map(typ => (
                    <button key={typ} onClick={() => setT(typ)} style={{
                      flex: 1, padding: "10px 0",
                      borderRadius: "var(--radius)",
                      fontSize: 13, fontWeight: 500,
                      background: t === typ ? (typ === "income" ? "var(--green-soft)" : "var(--red-soft)") : "var(--surface-2)",
                      border: `1px solid ${t === typ ? (typ === "income" ? "var(--green)" : "var(--red)") : "var(--border)"}`,
                      color: t === typ ? (typ === "income" ? "var(--green)" : "var(--red)") : "var(--text-2)",
                      textTransform: "capitalize", transition: "all 0.2s",
                    }}>{typ}</button>
                  ))}
                </div>
                <button className="btn btn-primary" onClick={add} style={{ justifyContent: "center" }}>Add transaction</button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Income", value: income, color: "var(--green)" },
                { label: "Expenses", value: expenses, color: "var(--red)" },
                { label: "Emergency", value: emergency, color: "var(--blue)" },
                { label: "Investable", value: investable, color: "var(--accent)" },
              ].map(s => (
                <div key={s.label} style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius)", padding: "20px 22px",
                }}>
                  <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 500, color: s.color }}>
                    ${s.value.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{
              background: investable > 0 ? "var(--accent-soft)" : "var(--surface)",
              borderColor: investable > 0 ? "var(--accent-strong)" : "var(--border)",
              textAlign: "center", padding: "44px 32px",
            }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>Monthly investable amount</div>
              <div style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(48px, 7vw, 80px)",
                fontWeight: 500,
                color: investable > 0 ? "var(--accent)" : "var(--text-3)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}>
                ${investable.toLocaleString()}
              </div>
              {income > 0 && (
                <div style={{ marginTop: 16, fontSize: 14, color: "var(--text-2)" }}>
                  <em style={{ fontStyle: "italic", color: "var(--accent)" }}>{investPct.toFixed(1)}%</em> of your income
                </div>
              )}
              <div style={{ marginTop: 24, height: 4, borderRadius: 2, background: "var(--surface-2)", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "var(--accent)", width: `${Math.min(investPct, 100)}%`, transition: "width 0.6s ease" }} />
              </div>
            </div>

            {byCat.length > 0 && (
              <div className="card">
                <div className="eyebrow" style={{ marginBottom: 18 }}>Spending by category</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {byCat.map(c => (
                    <div key={c.cat}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 14 }}>{c.cat}</span>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: COLORS[c.cat] }}>${c.total.toLocaleString()}</span>
                      </div>
                      <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: COLORS[c.cat], width: `${(c.total / maxCat) * 100}%`, transition: "width 0.4s" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {transactions.length > 0 && (
              <div className="card">
                <div className="eyebrow" style={{ marginBottom: 18 }}>Transactions ({transactions.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                  {transactions.slice().reverse().map(tx => (
                    <div key={tx.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 14px",
                      background: "var(--surface-2)",
                      borderRadius: "var(--radius)",
                    }}>
                      <div>
                        <div style={{ fontSize: 14 }}>{tx.desc}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{tx.category}</div>
                      </div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: tx.type === "income" ? "var(--green)" : "var(--red)" }}>
                        {tx.type === "income" ? "+" : "−"}${tx.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 60 }}>
          <Link href="/learn" className="btn btn-primary">Continue to Learn →</Link>
          <Link href="/simulate" className="btn btn-ghost">Skip to simulator</Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
