"use client";
import { useState } from "react";
import Link from "next/link";

type Transaction = { id: number; desc: string; amount: number; category: string; type: "income" | "expense" };

const CATEGORIES = ["Housing", "Food", "Transport", "Entertainment", "Healthcare", "Other"];
const CAT_COLORS: Record<string, string> = {
  Housing: "#a78bfa", Food: "#38bdf8", Transport: "#34d399",
  Entertainment: "#fbbf24", Healthcare: "#f87171", Other: "#94a3b8",
};

export default function DashboardPage() {
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [emergency, setEmergency] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCat, setNewCat] = useState("Other");
  const [newType, setNewType] = useState<"income" | "expense">("expense");

  const investable = Math.max(0, income - expenses - emergency);
  const investPct = income > 0 ? (investable / income) * 100 : 0;

  const addTransaction = () => {
    if (!newDesc || !newAmount) return;
    const amt = parseFloat(newAmount);
    if (isNaN(amt)) return;
    setTransactions(t => [...t, { id: Date.now(), desc: newDesc, amount: amt, category: newCat, type: newType }]);
    if (newType === "income") setIncome(i => i + amt);
    else setExpenses(e => e + amt);
    setNewDesc(""); setNewAmount("");
  };

  const byCategory = CATEGORIES.map(c => ({
    cat: c,
    total: transactions.filter(t => t.category === c && t.type === "expense").reduce((s, t) => s + t.amount, 0),
  })).filter(c => c.total > 0);

  const maxCat = Math.max(...byCategory.map(c => c.total), 1);

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <div className="section animate-fadeup">

        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <span className="badge tag-neutral">STEP 1 OF 4</span>
        </div>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", marginBottom: 12 }}>
          <span className="gradient-text">Budget Calculator</span>
        </h1>
        <p style={{ color: "var(--text2)", marginBottom: 48, maxWidth: 480 }}>
          Figure out how much you can safely invest each month. Optional — skip if you already know your budget.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>

          {/* Left: inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Quick setup */}
            <div className="card">
              <h2 style={{ fontSize: 16, marginBottom: 20, fontFamily: "Syne, sans-serif" }}>⚡ Quick Setup</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Monthly Income (after tax)", val: income, set: setIncome },
                  { label: "Monthly Expenses", val: expenses, set: setExpenses },
                  { label: "Emergency Fund (optional)", val: emergency, set: setEmergency },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: 12, color: "var(--text3)", display: "block", marginBottom: 6, fontFamily: "DM Mono, monospace" }}>
                      {f.label}
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)", fontSize: 14 }}>$</span>
                      <input
                        type="number" min="0"
                        value={f.val || ""}
                        onChange={e => f.set(parseFloat(e.target.value) || 0)}
                        style={{ paddingLeft: 28 }}
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add transaction */}
            <div className="card">
              <h2 style={{ fontSize: 16, marginBottom: 20, fontFamily: "Syne, sans-serif" }}>+ Add Transaction</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description"/>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }}>$</span>
                    <input type="number" min="0" value={newAmount} onChange={e => setNewAmount(e.target.value)} style={{ paddingLeft: 28 }} placeholder="0"/>
                  </div>
                  <select value={newCat} onChange={e => setNewCat(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["income", "expense"] as const).map(t => (
                    <button key={t} onClick={() => setNewType(t)} style={{
                      flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 700,
                      background: newType === t ? (t === "income" ? "var(--green-dim)" : "var(--red-dim)") : "var(--surface)",
                      border: `1px solid ${newType === t ? (t === "income" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)") : "var(--border)"}`,
                      color: newType === t ? (t === "income" ? "var(--green)" : "var(--red)") : "var(--text2)",
                      textTransform: "capitalize", transition: "all 0.2s",
                    }}>{t}</button>
                  ))}
                </div>
                <button className="btn-primary" onClick={addTransaction} style={{ justifyContent: "center" }}>Add</button>
              </div>
            </div>
          </div>

          {/* Right: results */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Total Income", value: income, icon: "💰", color: "var(--green)" },
                { label: "Total Expenses", value: expenses, icon: "💸", color: "var(--red)" },
                { label: "Emergency Fund", value: emergency, icon: "🛡️", color: "var(--blue)" },
                { label: "Can Invest", value: investable, icon: "📈", color: "var(--purple)" },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="label">{s.icon} {s.label}</div>
                  <div className="value" style={{ color: s.color, fontSize: 18 }}>
                    ${s.value.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Investable highlight */}
            <div className="card" style={{ borderColor: investable > 0 ? "var(--purple-border)" : "var(--border)", background: investable > 0 ? "var(--purple-dim)" : "var(--surface)", textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 8, fontFamily: "DM Mono, monospace" }}>MONTHLY INVESTABLE AMOUNT</div>
              <div style={{ fontSize: 48, fontWeight: 900, fontFamily: "Syne, sans-serif", color: investable > 0 ? "var(--purple)" : "var(--text3)", letterSpacing: "-2px" }}>
                ${investable.toLocaleString()}
              </div>
              {income > 0 && (
                <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 8 }}>
                  {investPct.toFixed(1)}% of income
                </div>
              )}
              {/* Bar */}
              <div style={{ marginTop: 16, height: 6, borderRadius: 3, background: "var(--surface2)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg, var(--purple), var(--blue))", width: `${Math.min(investPct, 100)}%`, transition: "width 0.5s ease" }}/>
              </div>
            </div>

            {/* Category breakdown */}
            {byCategory.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: 14, marginBottom: 16, fontFamily: "Syne, sans-serif" }}>📊 Spending by Category</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {byCategory.map(c => (
                    <div key={c.cat}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: "var(--text2)" }}>{c.cat}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: CAT_COLORS[c.cat] }}>${c.total.toLocaleString()}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: "var(--surface2)", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 2, background: CAT_COLORS[c.cat], width: `${(c.total / maxCat) * 100}%`, transition: "width 0.4s ease" }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transactions */}
            {transactions.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: 14, marginBottom: 16, fontFamily: "Syne, sans-serif" }}>📝 Transactions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
                  {transactions.map(t => (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--surface)", borderRadius: 8, border: "1px solid var(--border)" }}>
                      <div>
                        <span style={{ fontSize: 13, color: "var(--text)" }}>{t.desc}</span>
                        <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 8 }}>{t.category}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.type === "income" ? "var(--green)" : "var(--red)" }}>
                        {t.type === "income" ? "+" : "-"}${t.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
          <Link href="/learn" className="btn-primary">Learn About Assets →</Link>
          <Link href="/simulate" className="btn-ghost">Skip to Simulator</Link>
        </div>
      </div>
    </div>
  );
}
