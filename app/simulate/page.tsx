"use client";
import { useState, useEffect } from "react";

type Asset = { id: string; symbol: string; name: string; price: number; change: number; type: string };
type Simulation = { id: number; asset: string; symbol: string; amount: number; startPrice: number; type: string; buyDate: string };

const categories = [
  { id: "stocks", name: "Stocks", icon: "📈", desc: "Apple, Google, Tesla, etc." },
  { id: "etfs", name: "ETFs", icon: "📊", desc: "S&P 500, Nasdaq, Bonds, etc." },
  { id: "crypto", name: "Crypto", icon: "₿", desc: "Bitcoin, Ethereum, Solana, etc." },
  { id: "bonds", name: "Bonds", icon: "🏛️", desc: "Treasury, Corporate, Municipal" },
  { id: "commodities", name: "Commodities", icon: "🥇", desc: "Gold, Silver, Oil, etc." },
  { id: "custom", name: "Custom Search", icon: "🔍", desc: "Search anything investable" },
];

export default function Simulate() {
  const [category, setCategory] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("simulations");
    if (saved) setSimulations(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("simulations", JSON.stringify(simulations));
  }, [simulations]);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    setSearchResults([]);
    setSelectedAsset(null);
    fetch(`/api/prices?category=${category}`)
      .then(res => res.json())
      .then(data => { setAssets(data.assets || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(`/api/search?q=${searchQuery.toUpperCase()}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      setSearchResults([]);
    }
    setSearching(false);
  };

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleSimulate = () => {
    if (!amount || !selectedAsset) return;

    const buyDate = new Date().toISOString();

    setSimulations([
      ...simulations,
      {
        id: Date.now(),
        asset: selectedAsset.name,
        symbol: selectedAsset.symbol,
        amount: parseFloat(amount),
        startPrice: selectedAsset.price,
        type: selectedAsset.type,
        buyDate: buyDate
      }
    ]);

    setAmount("");
    setSelectedAsset(null);
  };

  const handleDelete = (id: number) => {
    setSimulations(simulations.filter(s => s.id !== id));
  };

  const totalInvested = simulations.reduce((sum, s) => sum + s.amount, 0);
  const totalValue = simulations.reduce((sum, s) => {
    const current = assets.find(a => a.symbol === s.symbol)?.price || s.startPrice;
    return sum + (s.amount / s.startPrice) * current;
  }, 0);
  const totalGain = totalValue - totalInvested;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="border-b border-slate-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="font-semibold">Asset Universe</a>
          <div className="flex gap-6 text-sm">
            <a href="/dashboard" className="text-slate-400">Budget</a>
            <a href="/learn" className="text-slate-400">Learn</a>
            <a href="/simulate" className="text-emerald-400">Simulate</a>
            <a href="/my-portfolio" className="text-slate-400 hover:text-white">My Portfolio</a>
            <a href="/profile" className="text-slate-400">Profile</a>
          </div>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Investment Simulator</h1>
        <p className="text-slate-400 mb-8">Practice with fake money, real market prices.</p>

        {!category ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Choose investment type</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)} className="bg-slate-800 border border-slate-700 hover:border-emerald-500 rounded-xl p-6 text-left transition-all">
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className="font-semibold">{cat.name}</div>
                  <div className="text-sm text-slate-400">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <button onClick={() => { setCategory(""); setAssets([]); setSearchQuery(""); setSearchResults([]); setSelectedAsset(null); }} className="text-emerald-400 mb-6">← Change category</button>

            {loading ? (
              <p>Loading {category} prices...</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h2 className="font-semibold mb-4">New Simulation</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">Search any {category}</label>
                      <div className="flex gap-2">
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} placeholder={`Search ${category}...`} className="flex-1 bg-slate-700 border border-slate-600 rounded-lg py-2 px-4" />
                        <button onClick={handleSearch} disabled={searching} className="bg-emerald-500 hover:bg-emerald-600 px-4 rounded-lg">{searching ? "..." : "🔍"}</button>
                      </div>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="space-y-2">
                        <label className="block text-sm text-slate-400">Search Results</label>
                        {searchResults.map(a => (
                          <button key={a.id} onClick={() => handleSelectAsset(a)} className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg p-3 text-left flex justify-between items-center">
                            <div>
                              <div className="font-medium">{a.name}</div>
                              <div className="text-sm text-slate-400">{a.symbol}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-emerald-400 font-semibold">${a.price.toLocaleString()}</div>
                              <div className={`text-sm ${a.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>{a.change >= 0 ? "+" : ""}{a.change.toFixed(2)}%</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.length === 0 && !selectedAsset && (
                      <div className="space-y-2">
                        <label className="block text-sm text-slate-400">Popular {category}</label>
                        {assets.slice(0, 5).map(a => (
                          <button key={a.id} onClick={() => handleSelectAsset(a)} className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg p-3 text-left flex justify-between items-center">
                            <div>
                              <div className="font-medium">{a.name}</div>
                              <div className="text-sm text-slate-400">{a.symbol}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-emerald-400 font-semibold">${a.price.toLocaleString()}</div>
                              <div className={`text-sm ${a.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>{a.change >= 0 ? "+" : ""}{a.change.toFixed(2)}%</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedAsset && (
                      <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <div className="font-semibold">{selectedAsset.name}</div>
                            <div className="text-sm text-slate-400">{selectedAsset.symbol}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-emerald-400 font-bold text-xl">${selectedAsset.price.toLocaleString()}</div>
                            <button onClick={() => setSelectedAsset(null)} className="text-sm text-slate-400 hover:text-white">Change</button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm mb-2">Amount ($)</label>
                          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="500" className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4" />
                        </div>
                        {amount && parseFloat(amount) > 0 && (
                          <div className="mt-2 text-sm text-slate-400">
                            You will get {(parseFloat(amount) / selectedAsset.price).toFixed(4)} shares
                          </div>
                        )}
                        <button onClick={handleSimulate} className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 font-semibold py-2 rounded-lg">Invest ${amount || "0"}</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h2 className="font-semibold mb-4">Portfolio</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-slate-400">Invested</span><span>${totalInvested.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Value</span><span>${totalValue.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Gain/Loss</span><span className={totalGain >= 0 ? "text-emerald-400" : "text-red-400"}>{totalGain >= 0 ? "+" : ""}${totalGain.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            )}

            {simulations.length > 0 && (
              <div className="mt-8">
                <h2 className="font-semibold mb-4">Your Simulations</h2>
                <div className="space-y-3">
                  {simulations.map(sim => (
                    <div key={sim.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{sim.asset}</div>
                        <div className="text-sm text-slate-400">${sim.amount} at ${sim.startPrice.toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-slate-400">{sim.symbol}</div>
                        <button onClick={() => handleDelete(sim.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
