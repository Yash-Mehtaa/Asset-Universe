"use client";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-slate-400 hover:text-white transition-colors">← Back to Home</a>

        <h1 className="text-4xl font-bold mt-6 mb-3">Full Disclaimer</h1>
        <p className="text-slate-400 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-6 text-slate-300 leading-relaxed">
          <p className="text-slate-200 font-semibold">
            Asset Universe is for educational purposes only.
          </p>

          <p>
            Asset Universe does not provide financial, investment, tax, or legal advice. Nothing on this site should be interpreted as a recommendation
            or solicitation to buy, sell, or hold any asset.
          </p>

          <p>
            All simulations use fake money and are intended solely for learning. Any portfolio performance, charts, returns, or results shown are simulated
            and may not reflect real world conditions such as fees, taxes, slippage, spreads, liquidity, trading halts, or execution delays.
          </p>

          <p>
            Market data is provided by third party services and may be delayed, incomplete, inaccurate, or unavailable. Asset Universe does not guarantee
            the accuracy of any prices or information displayed.
          </p>

          <p>
            Investing involves risk, including the risk of losing money. You are solely responsible for any real investment decisions you make.
            Always consult a qualified financial professional before making real investment decisions.
          </p>

          <p className="text-slate-500 text-sm">
            By using this site, you acknowledge that you understand and accept this disclaimer.
          </p>
        </div>
      </div>
    </div>
  );
}
