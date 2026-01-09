"use client";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-slate-400 hover:text-white transition-colors">← Back to Home</a>

        <h1 className="text-4xl font-bold mt-6 mb-3">Terms of Service</h1>
        <p className="text-slate-400 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">1. Purpose</h2>
            <p>
              Asset Universe is an educational platform. It is designed to help users learn about investing concepts using simulations and market data.
              All simulations use fake money and are for learning only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">2. No financial advice</h2>
            <p>
              Asset Universe does not provide financial, investment, tax, or legal advice. Nothing on this site should be treated as a recommendation
              to buy, sell, or hold any asset.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">3. Market data</h2>
            <p>
              Market prices and other data may be provided by third party APIs and may be delayed, incomplete, or inaccurate.
              You agree that you will not rely on this data for real trading or investment decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">4. Risk and responsibility</h2>
            <p>
              Investing involves risk. You are fully responsible for your decisions and outcomes. Asset Universe is not liable for any loss, damage,
              or decisions made based on the information or simulations on this site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">5. Acceptable use</h2>
            <p>
              You agree not to misuse the platform. This includes attempting to disrupt the site, reverse engineer services, scrape data excessively,
              or use the platform in a way that violates any law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">6. Changes</h2>
            <p>
              We may modify or remove features at any time. We may update these Terms from time to time. Continued use of the site means you accept
              the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">7. Contact</h2>
            <p>
              If you have questions, you can contact the project owner through the profile or project repository where the app is hosted.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
