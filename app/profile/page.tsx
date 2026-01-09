"use client";
import { useState, useEffect } from "react";

export default function Profile() {
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    age: "",
    goal: "",
    timeline: "",
    riskScore: 5,
  });

  useEffect(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      setProfile(JSON.parse(saved));
      setSaved(true);
    }
  }, []);

  const saveProfile = (newProfile: typeof profile) => {
    localStorage.setItem("userProfile", JSON.stringify(newProfile));
    setProfile(newProfile);
    setSaved(true);
  };

  const riskLabels: Record<number, { label: string; desc: string; color: string }> = {
    2: { label: "Very Conservative", desc: "You prefer safety over growth", color: "text-blue-400" },
    4: { label: "Conservative", desc: "You want stability with some growth", color: "text-cyan-400" },
    6: { label: "Moderate", desc: "You balance risk and reward", color: "text-emerald-400" },
    8: { label: "Aggressive", desc: "You accept risk for higher returns", color: "text-orange-400" },
    10: { label: "Very Aggressive", desc: "You seek maximum growth", color: "text-red-400" },
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="border-b border-slate-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="font-semibold">Asset Universe</a>
          <div className="flex gap-6 text-sm">
            <a href="/dashboard" className="text-slate-400">Budget</a>
            <a href="/learn" className="text-slate-400">Learn</a>
            <a href="/simulate" className="text-slate-400">Simulate</a>
            <a href="/my-portfolio" className="text-slate-400">My Portfolio</a>
            <a href="/profile" className="text-emerald-400">Profile</a>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {saved && step === 1 ? (
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
            <p className="text-slate-400 mb-8">Your risk preferences help us personalize recommendations.</p>
            
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-slate-400 text-sm">Age Range</div>
                  <div className="font-medium">{profile.age || "Not set"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Goal</div>
                  <div className="font-medium capitalize">{profile.goal || "Not set"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Timeline</div>
                  <div className="font-medium capitalize">{profile.timeline?.replace("-", " ") || "Not set"}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Risk Score</div>
                  <div className={`font-medium ${riskLabels[profile.riskScore]?.color || "text-white"}`}>
                    {profile.riskScore}/10 - {riskLabels[profile.riskScore]?.label || "Moderate"}
                  </div>
                </div>
              </div>
              <button onClick={() => { setStep(1); setSaved(false); }} className="text-emerald-400 text-sm">Retake Quiz →</button>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h2 className="font-semibold mb-3">What This Means</h2>
              <p className="text-slate-400 text-sm mb-4">{riskLabels[profile.riskScore]?.desc}</p>
              <h3 className="font-medium mb-2">Suggested For You:</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                {profile.riskScore <= 4 && <li>• Bonds, Treasury ETFs, High-yield savings</li>}
                {profile.riskScore >= 4 && profile.riskScore <= 6 && <li>• ETFs like SPY, VOO, balanced portfolios</li>}
                {profile.riskScore >= 6 && <li>• Individual stocks, growth ETFs</li>}
                {profile.riskScore >= 8 && <li>• Crypto, high-growth stocks</li>}
              </ul>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <a href="/" className="text-emerald-400 text-sm">← Back to Home</a>
              <div className="flex gap-2 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? "bg-emerald-500" : "bg-slate-700"}`}></div>
                ))}
              </div>
              <p className="text-slate-400 text-sm mt-2">Step {step} of 4</p>
            </div>

            {step === 1 && (
              <div>
                <h1 className="text-3xl font-bold mb-2">What is your age range?</h1>
                <p className="text-slate-400 mb-8">This helps us personalize recommendations.</p>
                <div className="grid gap-3">
                  {["18-24", "25-34", "35-44", "45-54", "55+"].map((age) => (
                    <button key={age} onClick={() => { setProfile({ ...profile, age }); setStep(2); }} className={`p-4 rounded-xl border text-left transition-all ${profile.age === age ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 hover:border-slate-600"}`}>
                      {age} years old
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="text-3xl font-bold mb-2">What is your investing goal?</h1>
                <p className="text-slate-400 mb-8">No wrong answers here.</p>
                <div className="grid gap-3">
                  {[
                    { value: "growth", label: "Long-term growth", desc: "Build wealth over many years" },
                    { value: "income", label: "Generate income", desc: "Regular dividends or interest" },
                    { value: "preserve", label: "Preserve capital", desc: "Protect what I have" },
                  ].map((goal) => (
                    <button key={goal.value} onClick={() => { setProfile({ ...profile, goal: goal.value }); setStep(3); }} className={`p-4 rounded-xl border text-left transition-all ${profile.goal === goal.value ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 hover:border-slate-600"}`}>
                      <div className="font-semibold">{goal.label}</div>
                      <div className="text-slate-400 text-sm">{goal.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="text-3xl font-bold mb-2">What is your time horizon?</h1>
                <p className="text-slate-400 mb-8">When might you need this money?</p>
                <div className="grid gap-3">
                  {[
                    { value: "short", label: "Less than 1 year" },
                    { value: "medium", label: "1 to 3 years" },
                    { value: "long", label: "3 to 10 years" },
                    { value: "very-long", label: "10+ years" },
                  ].map((t) => (
                    <button key={t.value} onClick={() => { setProfile({ ...profile, timeline: t.value }); setStep(4); }} className={`p-4 rounded-xl border text-left transition-all ${profile.timeline === t.value ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 hover:border-slate-600"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h1 className="text-3xl font-bold mb-2">How do you feel about risk?</h1>
                <p className="text-slate-400 mb-8">If your investment dropped 15%, what would you do?</p>
                <div className="grid gap-3">
                  {[
                    { value: 2, label: "Sell everything", desc: "I cannot handle losses" },
                    { value: 4, label: "Sell some", desc: "I would reduce my risk" },
                    { value: 6, label: "Hold steady", desc: "I would wait it out" },
                    { value: 8, label: "Buy more", desc: "Dips are opportunities" },
                    { value: 10, label: "Go all in", desc: "Maximum risk, maximum reward" },
                  ].map((risk) => (
                    <button key={risk.value} onClick={() => { const newProfile = { ...profile, riskScore: risk.value }; saveProfile(newProfile); setStep(1); }} className={`p-4 rounded-xl border text-left transition-all ${profile.riskScore === risk.value ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 hover:border-slate-600"}`}>
                      <div className="font-semibold">{risk.label}</div>
                      <div className="text-slate-400 text-sm">{risk.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="mt-6 text-slate-400 hover:text-white">← Go back</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}