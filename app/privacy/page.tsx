"use client";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-slate-400 hover:text-white transition-colors">← Back to Home</a>

        <h1 className="text-4xl font-bold mt-6 mb-3">Privacy Policy</h1>
        <p className="text-slate-400 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">1. Overview</h2>
            <p>
              This Privacy Policy explains how Asset Universe handles data. Asset Universe is designed as an educational tool and does not require an account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">2. Data we store on your device</h2>
            <p>
              Asset Universe may store simulator data in your browser using localStorage so your simulated investments persist on your device.
              This data stays in your browser unless you clear your browser storage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">3. Data sent to third parties</h2>
            <p>
              When you request market data, the app may call third party market data providers through API routes.
              These providers may receive standard technical information such as your IP address and browser user agent as part of normal web requests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">4. Cookies and analytics</h2>
            <p>
              Asset Universe does not intentionally set tracking cookies. If you later add analytics or tracking tools, this Privacy Policy should be updated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">5. Your choices</h2>
            <p>
              You can clear your simulator data at any time by clearing your browser storage for this site.
              You can also choose not to use the simulator features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">6. Changes</h2>
            <p>
              We may update this Privacy Policy as features change. Continued use of the site means you accept the updated policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
