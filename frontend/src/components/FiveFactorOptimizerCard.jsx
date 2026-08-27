import React from 'react';
import { Clock, Navigation, Flame, Fuel, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

export default function FiveFactorOptimizerCard({ optimizerData }) {
  const data = optimizerData || {
    composite_score: 94.2,
    factors: [
      { id: "travel_time", name: "1. Shortest Travel Time", score: 92.5, weight: "20%", metric: "24 mins (Fastest Corridor)", plainSummary: "Arrives before concrete loses plasticity", icon: Clock },
      { id: "route_condition", name: "2. Traffic & Road Condition", score: 88.0, weight: "15%", metric: "+3m minor traffic", plainSummary: "Bypasses heavy arterial gridlock", icon: Navigation },
      { id: "microclimate", name: "3. FortyGuard Microclimate", score: 96.0, weight: "30%", metric: "Avoids 38°C peak canyon", plainSummary: "Prevents heat-induced flash setting", icon: Flame },
      { id: "fuel_efficiency", name: "4. Fuel & Emission Savings", score: 91.5, weight: "15%", metric: "-3.8 kg CO₂ / transit", plainSummary: "Saves diesel by eliminating idling", icon: Fuel },
      { id: "execution_demand", name: "5. Pour Site Readiness", score: 98.0, weight: "20%", metric: "E = 0.08 lb/ft²/hr (Safe)", plainSummary: "Zero plastic shrinkage cracking risk", icon: ShieldCheck },
    ]
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 75) return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  const getBarColor = (score) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 75) return 'bg-sky-500';
    return 'bg-amber-500';
  };

  return (
    <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 backdrop-blur-md p-6 shadow-xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
              Multivariate Decision Engine
            </span>
            <span className="text-[10px] font-mono bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">
              FortyGuard LTM
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight mt-1">
            The 5-Factor Route & Dispatch Optimizer
          </h3>
          <p className="text-xs text-slate-400">
            How ThermNav scores and selects the winning delivery corridor
          </p>
        </div>

        {/* Big High-Impact ThermNav Index Score */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 flex-shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">ThermNav Score</span>
            <span className="text-xs text-emerald-400 font-semibold">Optimal Corridor</span>
          </div>
          <div className="text-2xl font-black text-orange-400 font-mono">
            {data.composite_score || 94.2}<span className="text-xs text-slate-500">/100</span>
          </div>
        </div>
      </div>

      {/* 5 Factors Horizontal Progress Meters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {data.factors.map((f, idx) => {
          return (
            <div
              key={f.id || idx}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/70 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">Weight: {f.weight}</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getScoreColor(f.score)}`}>
                  {f.score} / 100
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white leading-snug">
                  {f.name}
                </h4>
                <p className="text-[11px] text-orange-400 font-mono mt-1">
                  {f.metric}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                  {f.plainSummary || f.status}
                </p>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${getBarColor(f.score)} transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(10, f.score))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
