"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-slate-800/50 px-6 py-4 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-slate-900">AU</span>
            </div>
            <span className="font-semibold">Asset Universe</span>
          </a>
          <div className="flex gap-6 text-sm">
            <a href="/dashboard" className="text-slate-400 hover:text-white transition-colors">Budget</a>
            <a href="/learn" className="text-slate-400 hover:text-white transition-colors">Learn</a>
            <a href="/simulate" className="text-slate-400 hover:text-white transition-colors">Simulate</a>
            <a href="/my-portfolio" className="text-slate-400 hover:text-white transition-colors">My Portfolio</a>
            <a href="/profile" className="text-slate-400 hover:text-white transition-colors">Profile</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-6 text-center">
        {/* Badge */}
        <div className="mb-6 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium backdrop-blur-sm">
          ✨ 100% Free • No Account Required • Real Market Data
        </div>

        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 via-cyan-400 to-emerald-500 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-emerald-500/25 animate-bounce">
            <span className="text-4xl font-bold text-slate-900">AU</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Asset Universe</span>
          </h1>
          <p className="text-xl text-slate-400 font-light">Master investing before risking real money</p>
        </div>

        {/* Value Proposition */}
        <div className="max-w-3xl mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-slate-200 leading-tight">
            The smartest way to learn investing — <span className="text-emerald-400">risk-free</span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Calculate your budget, understand different assets, and practice with our simulator using live market prices. Build confidence before you invest a single dollar.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mb-12 w-full">
          <div className="group bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 text-left hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all duration-300 backdrop-blur-sm">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Smart Budget</h3>
            <p className="text-slate-400 text-sm">Know exactly what you can afford to invest each month</p>
          </div>
          <div className="group bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 text-left hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all duration-300 backdrop-blur-sm">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Learn Simply</h3>
            <p className="text-slate-400 text-sm">Stocks, ETFs, crypto explained without confusing jargon</p>
          </div>
          <div className="group bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 text-left hover:border-purple-500/50 hover:bg-slate-800/50 transition-all duration-300 backdrop-blur-sm">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Live Simulator</h3>
            <p className="text-slate-400 text-sm">Practice with fake money using real-time market prices</p>
          </div>
          <div className="group bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 text-left hover:border-orange-500/50 hover:bg-slate-800/50 transition-all duration-300 backdrop-blur-sm">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Track Progress</h3>
            <p className="text-slate-400 text-sm">Monitor your portfolio performance and learn from results</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <a href="/dashboard" className="group relative bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105">
            Start Learning — It's Free
            <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
          </a>
          <a href="/simulate" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-medium px-8 py-4 rounded-xl text-lg transition-all duration-300 hover:scale-105">
            Try Simulator
          </a>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">✓</span>
            No credit card
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">✓</span>
            No account needed
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">✓</span>
            Real market data
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">✓</span>
            100% free forever
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-emerald-400">10K+</div>
            <div className="text-slate-500 text-sm">Assets Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-400">Live</div>
            <div className="text-slate-500 text-sm">Market Prices</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-400">$0</div>
            <div className="text-slate-500 text-sm">Risk Required</div>
          </div>
        </div>
      </div>

      {/* Footer with Disclaimer */}
      <footer className="relative z-10 border-t border-slate-800/50 px-6 py-8 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Disclaimer Box */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-yellow-500">⚠️</span>
              <h3 className="font-semibold text-yellow-500">Important Disclaimer</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              <strong>Asset Universe is for educational purposes only.</strong> This platform does not provide financial, investment, tax, or legal advice. All simulations use fake money and are meant solely for learning. Past performance does not guarantee future results. Market data is provided by third-party APIs and may be delayed or inaccurate. Always consult a qualified financial advisor before making real investment decisions. By using this site, you acknowledge that you understand these terms.
            </p>
          </div>

          {/* Links */}
          <div className="flex justify-center gap-6 text-sm text-slate-500 mb-4">
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/disclaimer" className="hover:text-white transition-colors">Full Disclaimer</a>
          </div>

          {/* Copyright & API Credits */}
          <p className="text-slate-600 text-sm mb-2">
            © {new Date().getFullYear()} Asset Universe. Educational platform only. Not a registered investment advisor.
          </p>
          <p className="text-slate-700 text-xs">
            Market data provided by <a href="https://finnhub.io" target="_blank" className="underline hover:text-slate-500">Finnhub</a>, <a href="https://www.coingecko.com" target="_blank" className="underline hover:text-slate-500">CoinGecko</a>, and <a href="https://www.alphavantage.co" target="_blank" className="underline hover:text-slate-500">Alpha Vantage</a>
          </p>
        </div>
      </footer>
    </div>
  );
}