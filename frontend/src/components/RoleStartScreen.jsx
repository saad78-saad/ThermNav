import React, { useState } from 'react';
import {
  Building2, Factory, Truck, ArrowRight, ShieldCheck, Sparkles, Clock,
  Thermometer, Navigation, MapPin, Activity, Gauge, Flame, CheckCircle2,
  AlertTriangle, Layers, Fuel, Users, Droplets, Sun, Check, Zap, Sliders, ChevronRight
} from 'lucide-react';

export default function RoleStartScreen({ onSelectRole, orderCount = 4 }) {
  const [simMixTemp, setSimMixTemp] = useState(28.0);
  const [simAirTemp, setSimAirTemp] = useState(38.0);
  const [simVolume, setSimVolume] = useState(10.0);

  // Quick live evaporation estimate
  const evapRate = Math.max(0.04, Math.round((Math.pow(simMixTemp * 1.8 + 32, 2.5) - 0.45 * Math.pow(simAirTemp * 1.8 + 32, 2.5)) * 1.4 * 1e-6 * 1000) / 1000);
  const isEvapSafe = evapRate < 0.15;

  const fiveFactors = [
    {
      num: '01',
      code: 'FACTOR_TIME',
      title: 'Shortest Travel Time',
      weight: '20%',
      plainExplain: 'Fastest road transit corridor so cement does not lose workability or slump before discharge.',
      stat: '< 25 min transit',
      icon: Clock,
      color: 'border-l-sky-400 text-sky-400',
    },
    {
      num: '02',
      code: 'FACTOR_TRAFFIC',
      title: 'Traffic & Arterial Flow',
      weight: '20%',
      plainExplain: 'Bypasses stop-and-go bottleneck avenues that cause drum overheating and transit delay.',
      stat: '-14 min delay saved',
      icon: Navigation,
      color: 'border-l-amber-400 text-amber-400',
    },
    {
      num: '03',
      code: 'FACTOR_UHI',
      title: 'FortyGuard Microclimate',
      weight: '30%',
      plainExplain: 'Hyperlocal 2-meter temperature modeling avoids 40°C asphalt heat islands.',
      stat: '-3.8°C thermal drop',
      icon: Flame,
      color: 'border-l-orange-400 text-orange-400',
    },
    {
      num: '04',
      code: 'FACTOR_FUEL',
      title: 'Fuel & Emission Savings',
      weight: '10%',
      plainExplain: 'Minimizes heavy diesel idling at intersections, cutting fleet fuel costs and carbon footprint.',
      stat: '-4.2 kg CO₂ / load',
      icon: Fuel,
      color: 'border-l-emerald-400 text-emerald-400',
    },
    {
      num: '05',
      code: 'FACTOR_ACI',
      title: 'Pour Site Readiness',
      weight: '20%',
      plainExplain: 'Ensures the concrete is discharged when evaporation is low, preventing plastic shrinkage cracks.',
      stat: 'E < 0.15 lb/ft²/hr',
      icon: ShieldCheck,
      color: 'border-l-indigo-400 text-indigo-400',
    },
  ];

  return (
    <div className="relative z-10 max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-12">
      {/* 1. TOP INDUSTRIAL TELEMETRY TICKER */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-[#141a24] border border-[#242f42] rounded-2xl px-5 py-3 text-xs font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span>OPERATIONS: LIVE</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="text-slate-300">
            ENGINE: <b className="text-white">FORTYGUARD LTM (2-METER HYPERLOCAL)</b>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="text-slate-300">
            CHILLER: <b className="text-cyan-400">4.0°C DOSING READY</b>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
            ASTM C94 & ACI 305R COMPLIANT
          </span>
          <span className="text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800">
            QUEUE: <b className="text-amber-400">{orderCount} MISSIONS</b>
          </span>
        </div>
      </div>

      {/* 2. SPLIT HERO: INDUSTRIAL CONSOLE & LIVE SIMULATOR */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left (7 cols): Industrial Vision & Role Actions */}
        <div className="lg:col-span-7 bg-[#141a24] border border-[#242f42] rounded-3xl p-8 sm:p-10 flex flex-col justify-between space-y-8 shadow-2xl relative overflow-hidden">
          {/* Subtle industrial stripe accent */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10 industrial-stripe pointer-events-none" />

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-wider uppercase">
              <Activity className="w-3.5 h-3.5" />
              <span>Civil Concrete & Climate Logistics</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight uppercase font-display">
              Thermal-Aware Ready-Mix Concrete Dispatch.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              When ambient temperatures spike over 35°C, cement hydration accelerates rapidly, causing concrete flash-setting, slump loss, and structural shrinkage cracks. ThermNav combines <b>FortyGuard hyperlocal microclimate data</b> with a <b>5-Factor route engine</b> to guarantee defect-free pours and protect ground crews from extreme heat.
            </p>
          </div>

          {/* 3 Main Role Portals Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => onSelectRole('booker')}
              className="p-4 rounded-2xl bg-[#1c2433] hover:bg-[#232d3f] border border-[#334155] hover:border-amber-400 text-left transition-all group cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">
                  Step 1
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-amber-400 uppercase tracking-wide">
                  1. Order Booker
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Input demand & test with 1-click presets
                </div>
              </div>
            </button>

            <button
              onClick={() => onSelectRole('receiver')}
              className="p-4 rounded-2xl bg-[#1c2433] hover:bg-[#232d3f] border border-[#334155] hover:border-cyan-400 text-left transition-all group cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-cyan-500 text-black flex items-center justify-center font-bold">
                  <Factory className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                  Step 2
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-cyan-400 uppercase tracking-wide">
                  2. Site Manager
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  5-Factor ranking & 24h worker schedule
                </div>
              </div>
            </button>

            <button
              onClick={() => onSelectRole('driver')}
              className="p-4 rounded-2xl bg-[#1c2433] hover:bg-[#232d3f] border border-[#334155] hover:border-emerald-400 text-left transition-all group cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                  Step 3
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-400 uppercase tracking-wide">
                  3. Driver HUD
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Turn-by-turn nav & 14 RPM drum tach
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Right (5 cols): Interactive Live Concrete Physics Widget */}
        <div className="lg:col-span-5 bg-[#141a24] border border-[#242f42] rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#242f42] pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Live ACI 305R Physics Gauge
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Interactive</span>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Ambient Air Heat ($T_a$):</span>
                <span className="text-orange-400 font-bold">{simAirTemp}°C</span>
              </div>
              <input
                type="range"
                min="20"
                max="48"
                step="0.5"
                value={simAirTemp}
                onChange={(e) => setSimAirTemp(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Batch Mix Temp ($T_c$):</span>
                <span className="text-cyan-400 font-bold">{simMixTemp}°C</span>
              </div>
              <input
                type="range"
                min="15"
                max="36"
                step="0.5"
                value={simMixTemp}
                onChange={(e) => setSimMixTemp(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Pour Volume:</span>
                <span className="text-white font-bold">{simVolume} m³</span>
              </div>
              <input
                type="range"
                min="4"
                max="15"
                step="1"
                value={simVolume}
                onChange={(e) => setSimVolume(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Live Output Gauge Panel */}
          <div className="p-4 rounded-2xl bg-[#0f141d] border border-[#242f42] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">Surface Evaporation:</span>
              <span className="text-sm font-bold text-white font-mono">{evapRate} lb/ft²/hr</span>
            </div>

            <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between ${
              isEvapSafe ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-red-950/80 text-red-300 border border-red-800'
            }`}>
              <span>{isEvapSafe ? '✅ SAFE: Low Cracking Risk' : '🛑 CRITICAL: High Evaporation Risk'}</span>
              <span className="text-[10px] font-mono">{isEvapSafe ? 'ACI Compliant' : 'Retarder Req'}</span>
            </div>
          </div>

          <button
            onClick={() => onSelectRole('booker')}
            className="w-full industrial-btn-primary py-3 text-xs"
          >
            <span>Launch Order Booker with This Mix</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3. THE 5-FACTOR ROUTE OPTIMIZATION BLUEPRINT */}
      <section className="bg-[#141a24] border border-[#242f42] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#242f42] pb-4">
          <div>
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              The 5 Decision Factors
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
              Multivariate Dispatch & Routing Engine
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
            Weighted Objective Scoring
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {fiveFactors.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.num}
                className={`p-4 rounded-2xl bg-[#0f141d] border border-[#242f42] border-l-4 ${f.color} flex flex-col justify-between space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500">{f.num}</span>
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900">
                    {f.weight}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Icon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{f.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug font-normal">
                    {f.plainExplain}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#242f42] text-[10px] font-mono text-emerald-400 font-bold">
                  {f.stat}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. WORKER HEALTH & 24-HOUR TASK SCHEDULER */}
      <section className="bg-[#141a24] border border-[#242f42] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242f42] pb-4">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              Worker Health & Safety
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              24-Hour Predictive Jobsite Shift Board
            </h2>
            <p className="text-xs text-slate-400">
              Tasks uploaded 24 hours in advance are autonomously shifted to protect workers from heatstroke.
            </p>
          </div>

          <button
            onClick={() => onSelectRole('worker_scheduler')}
            className="industrial-btn-secondary text-xs py-2.5 px-4 flex-shrink-0"
          >
            <span>Open 24h Task Scheduler</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#0f141d] border border-[#242f42] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">🌅 06:00 – 09:00 Cool Slot</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">Optimal</span>
            </div>
            <h4 className="text-xs font-bold text-white">Concrete Pours & Slab Troweling</h4>
            <p className="text-[11px] text-slate-300 leading-snug">
              Temperature-dependent tasks placed in early morning to prevent concrete flash-setting & worker exhaustion.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f141d] border border-[#242f42] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400">🏢 12:00 – 15:00 Midday Slot</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded">Indoor Shield</span>
            </div>
            <h4 className="text-xs font-bold text-white">Electrical Wiring & Drywall</h4>
            <p className="text-[11px] text-slate-300 leading-snug">
              Workers shifted into shaded/air-conditioned building cores during peak ambient heat.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f141d] border border-[#242f42] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">🛡️ OSHA Heat Protocols</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">Active</span>
            </div>
            <h4 className="text-xs font-bold text-white">Mandatory Hydration & Breaks</h4>
            <p className="text-[11px] text-slate-300 leading-snug">
              Enforces 15 min rest/hr and 1.0 L/hr electrolyte fluids whenever Wet-Bulb Globe Temp exceeds 29°C.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
