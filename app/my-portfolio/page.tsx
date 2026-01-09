"use client";
import { useState, useEffect } from "react";

type Simulation = { id: number; asset: string; symbol: string; amount: number; startPrice: number; type: string; buyDate?: string };

export default function MyPortfolio() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("simulations");
    if (saved) {
      const raw = JSON.parse(saved);

      const sims: Simulation[] = (raw || []).map((s: Simulation) => {
        const fallback = new Date(typeof s.id === "number" ? s.id : Date.now()).toISOString();
        return { ...s, buyDate: s.buyDate && !isNaN(Date.parse(s.buyDate)) ? s.buyDate : fallback };
      });

      setSimulations(sims);

      const initialPrices: Record<string, number> = {};
      sims.forEach((s: Simulation) => {
        initialPrices[s.symbol] = s.startPrice;
      });
      setPrices(initialPrices);
      setLoading(false);

      fetchPricesParallel(sims, initialPrices);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPricesParallel = async (sims: Simulation[], initialPrices: Record<string, number>) => {
    const symbols = [...new Set(sims.map(s => s.symbol))];

    const promises = symbols.map(async (symbol) => {
      try {
        const res = await fetch(`/api/search?q=${symbol}`);
        const data = await res.json();
        return { symbol, price: data.results?.[0]?.price || null };
      } catch {
        return { symbol, price: null };
      }
    });

    const results = await Promise.all(promises);
    const priceMap: Record<string, number> = { ...initialPrices };

    results.forEach(({ symbol, price }) => {
      if (price) priceMap[symbol] = price;
    });

    setPrices(priceMap);
  };

  const getHoldings = () => {
    const holdings: Record<
      string,
      { asset: string; symbol: string; type: string; totalInvested: number; shares: number; startPrice: number; buyDates: string[] }
    > = {};

    simulations.forEach(sim => {
      const bd = sim.buyDate && !isNaN(Date.parse(sim.buyDate)) ? sim.buyDate : "";

      if (holdings[sim.symbol]) {
        holdings[sim.symbol].totalInvested += sim.amount;
        holdings[sim.symbol].shares += sim.amount / sim.startPrice;
        if (bd) holdings[sim.symbol].buyDates.push(bd);
      } else {
        holdings[sim.symbol] = {
          asset: sim.asset,
          symbol: sim.symbol,
          type: sim.type,
          totalInvested: sim.amount,
          shares: sim.amount / sim.startPrice,
          startPrice: sim.startPrice,
          buyDates: bd ? [bd] : []
        };
      }
    });

    return Object.values(holdings).map(h => {
      const currentPrice = prices[h.symbol] || h.startPrice;
      const currentValue = h.shares * currentPrice;
      const pnl = currentValue - h.totalInvested;
      const pnlPercent = (pnl / h.totalInvested) * 100;

      const times = h.buyDates.map(d => Date.parse(d)).filter(t => !isNaN(t));
      const earliestDate = times.length > 0 ? new Date(Math.min(...times)) : null;

      const buyDatePretty = earliestDate
        ? earliestDate.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })
        : "";

      const buyRateText = `$${h.startPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const currentRateText = `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      return {
        ...h,
        buyDatePretty,
        buyRateText,
        currentRateText,
        currentPrice,
        currentValue,
        pnl,
        pnlPercent
      };
    });
  };

  const holdings = getHoldings();
  const totalInvested = holdings.reduce((sum, h) => sum + h.totalInvested, 0);
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnL = totalValue - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  const winners = holdings.filter(h => h.pnl > 0).sort((a, b) => b.pnlPercent - a.pnlPercent);
  const losers = holdings.filter(h => h.pnl < 0).sort((a, b) => a.pnlPercent - b.pnlPercent);

  const typeAllocation = holdings.reduce((acc, h) => {
    acc[h.type] = (acc[h.type] || 0) + h.currentValue;
    return acc;
  }, {} as Record<string, number>);

  const typeColors: Record<string, string> = {
    stock: "from-blue-500 to-blue-600",
    stocks: "from-blue-500 to-blue-600",
    crypto: "from-orange-500 to-orange-600",
    etf: "from-purple-500 to-purple-600",
    bond: "from-cyan-500 to-cyan-600",
    commodity: "from-yellow-500 to-yellow-600",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <nav className="border-b border-slate-700/50 px-6 py-4 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="font-semibold">Asset Universe</a>
          <div className="flex gap-6 text-sm">
            <a href="/dashboard" className="text-slate-400">Budget</a>
            <a href="/learn" className="text-slate-400">Learn</a>
            <a href="/simulate" className="text-slate-400">Simulate</a>
            <a href="/my-portfolio" className="text-emerald-400">My Portfolio</a>
            <a href="/profile" className="text-slate-400">Profile</a>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">My Portfolio</h1>
          <p className="text-slate-400">Track your simulated investments performance</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : simulations.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold mb-2">No investments yet</h2>
            <p className="text-slate-400 mb-6">Start simulating investments to see your portfolio here</p>
            <a href="/simulate" className="inline-block bg-emerald-500 hover:bg-emerald-600 font-semibold py-3 px-8 rounded-xl">Start Investing</a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-6">
                <div className="text-emerald-400 text-sm font-medium mb-1">Total Value</div>
                <div className="text-3xl font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6">
                <div className="text-blue-400 text-sm font-medium mb-1">Total Invested</div>
                <div className="text-3xl font-bold">${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className={`bg-gradient-to-br ${totalPnL >= 0 ? "from-green-500/20 to-green-600/10 border-green-500/30" : "from-red-500/20 to-red-600/10 border-red-500/30"} border rounded-2xl p-6`}>
                <div className={`text-sm font-medium mb-1 ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>Total P&L</div>
                <div className={`text-3xl font-bold ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className={`bg-gradient-to-br ${totalPnLPercent >= 0 ? "from-green-500/20 to-green-600/10 border-green-500/30" : "from-red-500/20 to-red-600/10 border-red-500/30"} border rounded-2xl p-6`}>
                <div className={`text-sm font-medium mb-1 ${totalPnLPercent >= 0 ? "text-green-400" : "text-red-400"}`}>Return</div>
                <div className={`text-3xl font-bold ${totalPnLPercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {totalPnLPercent >= 0 ? "+" : ""}{totalPnLPercent.toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Allocation by Type</h2>
                <div className="space-y-3">
                  {Object.entries(typeAllocation).map(([type, value]) => (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{type}</span>
                        <span className="text-slate-400">{((value / totalValue) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${typeColors[type] || "from-slate-500 to-slate-600"} rounded-full transition-all duration-500`} style={{ width: `${(value / totalValue) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Performance Leaders</h2>
                <div className="space-y-3">
                  {winners.slice(0, 3).map(h => (
                    <div key={h.symbol} className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">📈</div>
                        <div>
                          <div className="font-medium">{h.asset}</div>
                          <div className="text-sm text-slate-400">
                            {h.symbol}
                            {h.buyDatePretty ? ` · ${h.buyDatePretty} (${h.buyRateText} → ${h.currentRateText})` : ""}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-semibold">+{h.pnlPercent.toFixed(2)}%</div>
                        <div className="text-sm text-slate-400">+${h.pnl.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                  {losers.slice(0, 2).map(h => (
                    <div key={h.symbol} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-400">📉</div>
                        <div>
                          <div className="font-medium">{h.asset}</div>
                          <div className="text-sm text-slate-400">
                            {h.symbol}
                            {h.buyDatePretty ? ` · ${h.buyDatePretty} (${h.buyRateText} → ${h.currentRateText})` : ""}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-400 font-semibold">{h.pnlPercent.toFixed(2)}%</div>
                        <div className="text-sm text-slate-400">${h.pnl.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                  {winners.length === 0 && losers.length === 0 && (
                    <p className="text-slate-400 text-sm">Performance data will appear as prices change</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">All Holdings</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                      <th className="pb-3 font-medium">Asset</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium text-right">Invested</th>
                      <th className="pb-3 font-medium text-right">Current Value</th>
                      <th className="pb-3 font-medium text-right">P&L</th>
                      <th className="pb-3 font-medium text-right">Return</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map(h => (
                      <tr key={h.symbol} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                        <td className="py-4">
                          <div className="font-medium">{h.asset}</div>
                          <div className="text-sm text-slate-400">
                            {h.symbol}
                            {h.buyDatePretty ? ` · ${h.buyDatePretty} (${h.buyRateText} → ${h.currentRateText})` : ""}
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs capitalize bg-gradient-to-r ${typeColors[h.type] || "from-slate-500 to-slate-600"}`}>{h.type}</span>
                        </td>
                        <td className="py-4 text-right">${h.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-4 text-right font-medium">${h.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className={`py-4 text-right ${h.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {h.pnl >= 0 ? "+" : ""}${h.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className={`py-4 text-right font-semibold ${h.pnlPercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {h.pnlPercent >= 0 ? "+" : ""}{h.pnlPercent.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
