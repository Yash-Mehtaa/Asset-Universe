"use client";
import { useState } from "react";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    age: "",
    goal: "",
    timeline: "",
    comfort: 5,
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <a href="/" className="text-emerald-400 hover:text-emerald-300 text-sm">← Back to Home</a>
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
            <p className="text-slate-400 mb-8">This helps us personalize explanations for you.</p>
            <div className="grid gap-3">
              {["18-24", "25-34", "35-44", "45-54", "55+"].map((age) => (
                <button key={age} onClick={() => { setProfile({ ...profile, age }); handleNext(); }} className={`p-4 rounded-xl border text-left transition-all ${profile.age === age ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 hover:border-slate-600"}`}>
                  {age} years old
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-3xl font-bold mb-2">What is your investing goal?</h1>
            <p className="text-slate-400 mb-8">There is no wrong answer here.</p>
            <div className="grid gap-3">
              {[
                { value: "growth", label: "Long-term growth", desc: "Build wealth over many years" },
                { value: "income", label: "Generate income", desc: "Regular dividends or interest" },
                { value: "preserve", label: "Preserve capital", desc: "Protect what I have" },
              ].map((goal) => (
                <button key={goal.value} onClick={() => { setProfile({ ...profile, goal: goal.value }); handleNext(); }} className={`p-4 rounded-xl border text-left transition-all ${profile.goal === goal.value ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 hover:border-slate-600"}`}>
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
                { value: "short", label: "Less than 1 year", desc: "Need it soon" },
                { value: "medium", label: "1 to 3 years", desc: "Medium-term plans" },
                { value: "long", label: "3 to 10 years", desc: "Long-term goals" },
                { value: "verylong", label: "10+ years", desc: "Retirement or beyond" },
              ].map((time) => (
                <button key={time.value} onClick={() => { setProfile({ ...profile, timeline: time.value }); handleNext(); }} className={`p-4 rounded-xl border text-left transition-all ${profile.timeline === time.value ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 hover:border-slate-600"}`}>
                  <div className="font-semibold">{time.label}</div>
                  <div className="text-slate-400 text-sm">{time.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-3xl font-bold mb-2">How do you feel about risk?</h1>
            <p className="text-slate-400 mb-8">If your investment dropped 15% in a month, what would you do?</p>
            <div className="grid gap-3">
              {[
                { value: 2, label: "Sell everything", desc: "I cannot handle losses" },
                { value: 4, label: "Sell some", desc: "I would reduce my risk" },
                { value: 6, label: "Hold steady", desc: "I would wait it out" },
                { value: 8, label: "Buy more", desc: "Dips are opportunities" },
              ].map((risk) => (
                <button key={risk.value} onClick={() => setProfile({ ...profile, comfort: risk.value })} className={`p-4 rounded-xl border text-left transition-all ${profile.comfort === risk.value ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 hover:border-slate-600"}`}>
                  <div className="font-semibold">{risk.label}</div>
                  <div className="text-slate-400 text-sm">{risk.desc}</div>
                </button>
              ))}
            </div>
            <a href="/dashboard" className="mt-8 w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 inline-block text-center">
              See My Results
            </a>
          </div>
        )}

        {step > 1 && step < 4 && (
          <button onClick={handleBack} className="mt-6 text-slate-400 hover:text-white transition-colors">
            ← Go back
          </button>
        )}
      </div>
    </div>
  );
}