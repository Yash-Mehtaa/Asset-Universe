"use client";
import { useState, useEffect } from "react";

type Transaction = { id: number; name: string; amount: number; type: "income" | "expense"; category: string; recurring: boolean };

export default function Dashboard() {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [emergency, setEmergency] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({ name: "", amount: "", type: "expense" as "income" | "expense", category: "other", recurring: false });

  useEffect(() => {
    const saved = localStorage.getItem("budget");
    if (saved) {
      const data = JSON.parse(saved);
      setIncome(data.income || "");
      setExpenses(data.expenses || "");
      setEmergency(data.emergency || "");
    }
    const savedTransactions = localStorage.getItem("transactions");
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("budget", JSON.stringify({ income, expenses, emergency }));
  }, [income, expenses, emergency]);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = () => {
    if (!newTransaction.name || !newTransaction.amount) return;
    setTransactions([...transactions, { ...newTransaction, id: Date.now(), amount: parseFloat(newTransaction.amount) }]);
    setNewTransaction({ name: "", amount: "", type: "expense", category: "other", recurring: false });
    setShowAddTransaction(false);
  };

  const deleteTransaction = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0) + (parseFloat(income) || 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0) + (parseFloat(expenses) || 0);
  const emergencyFund = parseFloat(emergency) || 0;
  const investable = Math.max(0, totalIncome - totalExpenses - emergencyFund);

  const categories = ["rent", "food", "transport", "entertainment", "utilities", "shopping", "health", "other"];
  const categoryIcons: Record<string, string> = { rent: "🏠", food: "🍔", transport: "🚗", entertainment: "🎬", utilities: "💡", shopping: "🛒", health: "💊", other: "📦" };

  const expensesByCategory = transactions.filter(t => t.type === "expense").reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="border-b border-slate-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="font-semibold">Asset Universe</a>
          <div className="flex gap-6 text-sm">
            <a href="/dashboard" className="text-emerald-400">Budget</a>
            <a href="/learn" className="text-slate-400">Learn</a>
            <a href="/simulate" className="text-slate-400">Simulate</a>
            <a href="/my-portfolio" className="text-slate-400">My Portfolio</a>
            <a href="/profile" className="text-slate-400">Profile</a>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header with Skip Option */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">💸 Budget Calculator</h1>
            <p className="text-slate-400">Figure out how much you can safely invest each month.</p>
            <p className="text-slate-500 text-sm mt-1">This step is optional, you can skip anytime if you already know your budget.</p>
          </div>
          <a href="/learn" className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-4 py-2 rounded-lg text-sm">Skip to Learn →</a>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-5">
            <div className="text-emerald-400 text-sm font-medium mb-1">💰 Total Income</div>
            <div className="text-2xl font-bold">${totalIncome.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-2xl p-5">
            <div className="text-red-400 text-sm font-medium mb-1">💸 Total Expenses</div>
            <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-5">
            <div className="text-blue-400 text-sm font-medium mb-1">🛡️ Emergency Fund</div>
            <div className="text-2xl font-bold">${emergencyFund.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-2xl p-5">
            <div className="text-cyan-400 text-sm font-medium mb-1">📈 Can Invest</div>
            <div className="text-2xl font-bold">${investable.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Quick Budget Setup */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">⚡ Quick Setup</h2>
            <p className="text-slate-400 text-sm mb-4">Enter your monthly numbers for a quick calculation.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Monthly Income (after tax)</label>
                <input type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="5000" className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Monthly Expenses</label>
                <input type="number" value={expenses} onChange={e => setExpenses(e.target.value)} placeholder="3000" className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Emergency Fund (optional)</label>
                <input type="number" value={emergency} onChange={e => setEmergency(e.target.value)} placeholder="500" className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4" />
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Spending by Category</h2>
            {Object.keys(expensesByCategory).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{categoryIcons[cat]}</span>
                      <span className="capitalize">{cat}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(100, (amount / totalExpenses) * 100)}%` }}></div>
                      </div>
                      <span className="text-sm w-16 text-right">${amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Add transactions to see category breakdown</p>
            )}
          </div>
        </div>

        {/* Transactions Section */}
        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">📝 Transactions</h2>
            <button onClick={() => setShowAddTransaction(!showAddTransaction)} className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg text-sm font-medium">+ Add Transaction</button>
          </div>

          {showAddTransaction && (
            <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <input type="text" placeholder="Name" value={newTransaction.name} onChange={e => setNewTransaction({ ...newTransaction, name: e.target.value })} className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-sm" />
                <input type="number" placeholder="Amount" value={newTransaction.amount} onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })} className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-sm" />
                <select value={newTransaction.type} onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value as "income" | "expense" })} className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-sm">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <select value={newTransaction.category} onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })} className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-sm">
                  {categories.map(cat => <option key={cat} value={cat} className="capitalize">{cat}</option>)}
                </select>
                <button onClick={addTransaction} className="bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium">Add</button>
              </div>
              <label className="flex items-center gap-2 mt-3 text-sm text-slate-400">
                <input type="checkbox" checked={newTransaction.recurring} onChange={e => setNewTransaction({ ...newTransaction, recurring: e.target.checked })} className="rounded" />
                Recurring monthly
              </label>
            </div>
          )}

          {transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span>{categoryIcons[t.category]}</span>
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-slate-400 capitalize">{t.category} {t.recurring && "• Recurring"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold ${t.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                      {t.type === "income" ? "+" : "-"}${t.amount.toLocaleString()}
                    </span>
                    <button onClick={() => deleteTransaction(t.id)} className="text-slate-500 hover:text-red-400 text-sm">×</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-4">No transactions yet. Add some to track your spending!</p>
          )}
        </div>

        {/* Result & CTA */}
        <div className="mt-8 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-2xl p-8 text-center">
          <div className="text-slate-400 mb-2">Your monthly investable amount</div>
          <div className="text-5xl font-bold text-emerald-400 mb-4">${investable.toLocaleString()}</div>
          <p className="text-slate-400 text-sm mb-6">This is what you can safely invest after expenses and emergency savings.</p>
          <div className="flex gap-4 justify-center">
            <a href="/learn" className="bg-emerald-500 hover:bg-emerald-600 font-semibold py-3 px-6 rounded-xl">Learn About Assets →</a>
            <a href="/simulate" className="bg-slate-700 hover:bg-slate-600 font-medium py-3 px-6 rounded-xl">Skip to Simulator →</a>
          </div>
        </div>
      </div>
    </div>
  );
}