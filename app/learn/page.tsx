export default function Learn() {
  const assets = [
    { name: "Stocks", icon: "📈", risk: 7, desc: "Own a piece of a company", return: "8-12% avg/year", good: "Long-term growth", bad: "Can drop 30%+ in crashes" },
    { name: "ETFs", icon: "📊", risk: 5, desc: "Basket of stocks or bonds in one purchase", return: "6-10% avg/year", good: "Instant diversification", bad: "Less exciting than picking winners" },
    { name: "Govt Bonds", icon: "🏛️", risk: 2, desc: "Loan money to the government", return: "3-5% avg/year", good: "Very safe, predictable", bad: "Low returns, loses to inflation" },
    { name: "Corporate Bonds", icon: "🏢", risk: 4, desc: "Loan money to companies", return: "4-7% avg/year", good: "Higher returns than govt bonds", bad: "Company could default" },
    { name: "Crypto", icon: "₿", risk: 10, desc: "Digital currencies like Bitcoin", return: "Highly variable", good: "Massive upside potential", bad: "Can lose 80%+ in downturns" },
    { name: "High-Yield Savings", icon: "🏦", risk: 1, desc: "Savings account with better rates", return: "4-5% currently", good: "Zero risk, instant access", bad: "Barely beats inflation" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="border-b border-slate-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="font-semibold">Asset Universe</a>
          <div className="flex gap-6 text-sm">
            <a href="/dashboard" className="text-slate-400">Budget</a>
            <a href="/learn" className="text-emerald-400">Learn</a>
            <a href="/simulate" className="text-slate-400">Simulate</a>
            <a href="/my-portfolio" className="text-slate-400">My Portfolio</a>
            <a href="/profile" className="text-slate-400">Profile</a>
          </div>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Learn About Assets</h1>
        <p className="text-slate-400 mb-8">Understand your options before investing. No jargon, just clarity.</p>
        <div className="grid gap-4">
          {assets.map((asset) => (
            <div key={asset.name} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{asset.icon}</span>
                  <div>
                    <h2 className="text-xl font-semibold">{asset.name}</h2>
                    <p className="text-slate-400">{asset.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">Risk Level</div>
                  <div className="flex gap-1 mt-1">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`w-2 h-4 rounded-sm ${i < asset.risk ? "bg-emerald-500" : "bg-slate-700"}`}></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 mb-1">Typical Return</div>
                  <div className="font-medium">{asset.return}</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 mb-1">Good For</div>
                  <div className="font-medium">{asset.good}</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 mb-1">Watch Out</div>
                  <div className="font-medium">{asset.bad}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a href="/simulate" className="inline-block bg-emerald-500 text-white font-semibold py-3 px-8 rounded-xl">Try the Simulator</a>
        </div>
      </div>
    </div>
  );
}