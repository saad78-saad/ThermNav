import React from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle2, Flame, Droplets, Wind, Gauge, Compass } from 'lucide-react';

export default function ACIReadout({
  slot,
  batchTemp,
  transitMins,
  hydrationIndex,
  batchRejected,
  mitigation,
  theme = 'dark',
}) {
  if (!slot) return null;
  const isLight = theme === 'light';

  const isEvapCritical = slot.evaporation_rate >= 0.20;
  const isEvapModerate = slot.evaporation_rate >= 0.15;
  const evapColor = isEvapCritical ? 'text-red-500' : isEvapModerate ? 'text-amber-500' : 'text-emerald-500';

  // Evaporation gauge percentage relative to 0.25 max scale
  const evapPercent = Math.min(100, Math.round((slot.evaporation_rate / 0.25) * 100));

  return (
    <div className={`rounded-3xl border p-6 shadow-2xl space-y-5 transition-all duration-300 ${
      isLight ? 'bg-white border-slate-200 shadow-slate-200/60' : 'bg-[#141618]/95 border-white/10 backdrop-blur-xl'
    }`}>
      {/* Header with Compliance Badge */}
      <div className={`flex items-start justify-between gap-3 border-b pb-4 ${isLight ? 'border-slate-100' : 'border-zinc-800'}`}>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold font-sans-luxury uppercase tracking-wide">
              ACI 305R Civil Engineering Physics Engine
            </h3>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
            }`}>
              ASTM C94 / ACI 301
            </span>
          </div>
          <p className={`text-xs mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Real-time plastic shrinkage cracking gate & Arrhenius hydration assessment
          </p>
        </div>

        {batchRejected ? (
          <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-700 text-red-300 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider animate-pulse">
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span>Batch Rejected</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-700 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ACI Compliant</span>
          </div>
        )}
      </div>

      {/* Primary Gauge Cards: Evaporation, Hydration, Transit Limit */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Metric 1: Evaporation Rate with progress meter */}
        <div className={`border rounded-2xl p-4 space-y-2 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-zinc-700/80'
        }`}>
          <div className="flex justify-between items-center text-xs opacity-70">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Surface Evaporation (E)</span>
            <Droplets className="w-4 h-4 text-sky-500" />
          </div>

          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-mono font-bold ${evapColor}`}>
              {slot.evaporation_rate.toFixed(4)}
            </span>
            <span className="text-xs opacity-60 font-mono">lb/ft²/hr</span>
          </div>

          {/* Meter Bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-700/30 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${isEvapCritical ? 'bg-red-500' : isEvapModerate ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${evapPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono opacity-60">
              <span>0.00 (Safe)</span>
              <span className="text-red-500 font-semibold">0.20 Critical Limit</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Arrhenius Hydration Index */}
        <div className={`border rounded-2xl p-4 space-y-2 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-zinc-700/80'
        }`}>
          <div className="flex justify-between items-center text-xs opacity-70">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Hydration Index (Iₕ)</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>

          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-mono font-bold ${hydrationIndex > 90 ? 'text-red-500' : 'text-emerald-500'}`}>
              {hydrationIndex ? hydrationIndex.toFixed(1) : '15.4'}
            </span>
            <span className="text-xs opacity-60 font-mono">thermal dose</span>
          </div>

          <div className={`text-[10px] leading-tight ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Arrhenius Activation: <span className="font-mono font-semibold">Ea/R = 4000K</span>. Safe limit: &lt; 90.0.
          </div>
        </div>

        {/* Metric 3: Transit Window ASTM C94 */}
        <div className={`border rounded-2xl p-4 space-y-2 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-zinc-700/80'
        }`}>
          <div className="flex justify-between items-center text-xs opacity-70">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Transit Window (Δt)</span>
            <Gauge className="w-4 h-4 text-blue-500" />
          </div>

          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-mono font-bold ${transitMins > 90 ? 'text-red-500' : 'text-blue-500'}`}>
              {transitMins}
            </span>
            <span className="text-xs opacity-60 font-mono">/ 90 mins max</span>
          </div>

          <div className={`text-[10px] leading-tight ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Mandatory discharge window before irreversible slump loss occurs.
          </div>
        </div>
      </div>

      {/* Formula Reference Box */}
      <div className={`rounded-2xl border p-4 space-y-3 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-zinc-800'
      }`}>
        <div className="flex items-center justify-between text-[11px] font-mono opacity-70">
          <span className="font-bold text-amber-500">ACI 305R Evaporation Nomograph Equation</span>
          <span>FortyGuard Telemetry Inputs</span>
        </div>

        <div className={`rounded-xl p-3 font-mono text-xs border text-center tracking-wider ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-zinc-950/90 border-zinc-800 text-slate-200'
        }`}>
          <span className="text-amber-500 font-bold">E</span> = (
          <span className="text-amber-500">Tc</span>
          <sup>2.5</sup> − <span className="text-blue-500">r</span>·
          <span className="text-red-500">Ta</span>
          <sup>2.5</sup>) · (1 + 0.4·<span className="text-emerald-500">V</span>) × 10
          <sup>−6</sup> <span className="opacity-60">[lb/ft²/hr]</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className={`p-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-950/60 border-zinc-800'}`}>
            <div className="text-[10px] opacity-60">Tc (Mix Temp)</div>
            <div className="text-amber-500 font-bold">{batchTemp}°C</div>
          </div>
          <div className={`p-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-950/60 border-zinc-800'}`}>
            <div className="text-[10px] opacity-60">Ta (FortyGuard)</div>
            <div className="text-red-500 font-bold">{slot.ambient_temp_celsius}°C</div>
          </div>
          <div className={`p-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-950/60 border-zinc-800'}`}>
            <div className="text-[10px] opacity-60">r (Rel Humidity)</div>
            <div className="text-blue-500 font-bold">{(slot.relative_humidity * 100).toFixed(0)}%</div>
          </div>
          <div className={`p-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-950/60 border-zinc-800'}`}>
            <div className="text-[10px] opacity-60">V (Wind Speed)</div>
            <div className="text-emerald-500 font-bold">{slot.wind_speed_kmh || 15} km/h</div>
          </div>
        </div>
      </div>

      {/* Mandatory Mitigation Instruction Box */}
      {mitigation && (
        <div className={`flex items-center justify-between p-4 rounded-2xl border text-xs ${
          isLight ? 'bg-orange-50 border-orange-200 text-slate-800' : 'bg-zinc-900/80 border-zinc-700'
        }`}>
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">
              Required Site Curing Protocol
            </div>
            <div className="font-semibold">
              {mitigation.mandated_curing_method}
            </div>
          </div>
          {mitigation.requires_chilled_batch_water && (
            <span className="text-[11px] font-bold text-amber-600 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-xl">
              🧊 Chilled Batch Water Mandatory
            </span>
          )}
        </div>
      )}
    </div>
  );
}

