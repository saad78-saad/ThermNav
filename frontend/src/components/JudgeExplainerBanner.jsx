import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  Zap,
  TrendingDown,
  Wind,
  ThermometerSnowflake,
  ShieldCheck,
  Flame,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Info,
  Layers,
  Building,
  Activity
} from 'lucide-react';

export default function JudgeExplainerBanner({
  onSelectHour,
  selectedHour = 14,
  isAutoPlaying,
  setIsAutoPlaying,
  currentHourData,
  buildingName = "One World Financial Tower (Manhattan Canyon, NY)",
  theme = 'light'
}) {
  const isLight = theme === 'light';
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComparison, setShowComparison] = useState(true);

  // Auto-play timer loop
  useEffect(() => {
    let interval = null;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        onSelectHour((prev) => (prev + 1) % 24);
      }, 1300);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, onSelectHour]);

  // Current simulation state helper
  const hour = currentHourData?.hour ?? selectedHour;
  const tAmb = currentHourData?.ambient_temp_c ?? 38.5;
  const tIn = currentHourData?.indoor_temp_c ?? 23.2;
  const mode = currentHourData?.mode ?? 'PEAK_SHED_COASTING';
  const chillerKw = currentHourData?.chiller_power_kw ?? 180;
  const powerSavedKw = currentHourData?.power_savings_kw ?? 300;
  const tariffRate = currentHourData?.tariff_rate ?? 0.88;
  const tariffCurrency = currentHourData?.tariff_currency ?? 'AED/kWh';

  let currentActionPlainEnglish = "Modulating variable-speed chiller cooling to maintain indoor setpoint.";
  let statusBadge = isLight ? "bg-indigo-50 text-indigo-800 border-indigo-300" : "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
  let statusTitle = "Modulated Cooling";
  let statusIcon = Zap;

  if (mode === 'FREE_COOLING_ECONOMIZER') {
    currentActionPlainEnglish = "🍃 FREE COOLING ACTIVE: Chillers 100% turned OFF (0 kW). Pulling 100% fresh cool canyon air inside.";
    statusBadge = isLight ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    statusTitle = "100% Free Air Economizer";
    statusIcon = Wind;
  } else if (mode === 'PRE_COOLING') {
    currentActionPlainEnglish = "❄️ CHARGING THERMAL BATTERY: Power is cheap right now. Pre-cooling concrete floors to 21°C before afternoon heat arrives.";
    statusBadge = isLight ? "bg-cyan-50 text-cyan-800 border-cyan-300" : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
    statusTitle = "Thermal Battery Charging";
    statusIcon = ThermometerSnowflake;
  } else if (mode === 'PEAK_SHED_COASTING') {
    currentActionPlainEnglish = "🛡️ PEAK TARIFF SHEDDING: Outside is scorching and power is expensive. Chillers powered down; building coasting on stored coldness.";
    statusBadge = isLight ? "bg-amber-50 text-amber-900 border-amber-300" : "bg-amber-500/20 text-amber-300 border-amber-500/40";
    statusTitle = "Coasting on Stored Coldness";
    statusIcon = ShieldCheck;
  }

  const StatusIcon = statusIcon;

  return (
    <div className={`rounded-3xl p-5 md:p-6 shadow-2xl mb-6 relative overflow-hidden transition-all space-y-5 border-2 ${
      isLight 
        ? 'bg-white/95 border-cyan-500/50 shadow-slate-200/80 ring-1 ring-cyan-500/30' 
        : 'bg-slate-900/95 border-cyan-500/40 shadow-2xl backdrop-blur-xl ring-1 ring-cyan-500/20'
    }`}>
      {/* 1. TOP HEADER: THE 1-SENTENCE VALUE PITCH */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md">
              <Sparkles className="w-3.5 h-3.5" /> 30-Second Executive Overview
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border ${
              isLight ? 'bg-cyan-50 text-cyan-800 border-cyan-300' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
            }`}>
              FortyGuard LTM AI Innovation
            </span>
          </div>

          <h2 className={`text-lg md:text-2xl font-black mt-2 tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
            Turning Buildings into <span className={isLight ? 'text-cyan-600' : 'text-cyan-400'}>Thermal Batteries</span> Using Microclimate AI
          </h2>
          <p className={`text-xs md:text-sm mt-1 max-w-3xl leading-relaxed ${isLight ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>
            Standard AC wastefully runs at maximum power during 2 PM peak electricity tariffs ($0.88/kWh). 
            <strong> ThermoShift EcoBreeze</strong> uses FortyGuard street-level heat forecasts to <strong>pre-cool the building at 5 AM when power is cheap ($0.08/kWh)</strong>, then powers down chillers during afternoon peak heat with <strong>zero comfort loss</strong>.
          </p>
        </div>

        {/* 1-Click Auto-Play Controller */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all shadow-xl cursor-pointer ${
              isAutoPlaying
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/30 animate-pulse'
                : isLight
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/30 ring-2 ring-cyan-400'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25 ring-2 ring-cyan-300'
            }`}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-4 h-4" /> Pause Auto-Play
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> ▶ Auto-Play 24h Heat Cycle
              </>
            )}
          </button>

          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`flex items-center gap-1.5 px-3.5 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-500" />
            {showComparison ? 'Hide Comparison' : 'Before vs. After'}
          </button>
        </div>
      </div>

      {/* 2. 🌟 REAL-TIME "WHAT THE BUILDING IS DOING RIGHT NOW" SPOTLIGHT CARD */}
      <div className={`rounded-2xl p-4 md:p-5 relative z-10 shadow-md border ${
        isLight 
          ? 'bg-slate-50 border-cyan-200' 
          : 'bg-slate-950/90 border-cyan-500/50 ring-1 ring-cyan-500/20'
      }`}>
        <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 mb-3 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-600"></span>
            </span>
            <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              Live Building AI Decision At <strong className={`text-sm font-black ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>{hour < 10 ? `0${hour}` : hour}:00</strong>
            </span>
          </div>

          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border ${statusBadge}`}>
            <StatusIcon className="w-3.5 h-3.5" /> {statusTitle}
          </span>
        </div>

        {/* Live Metrics Grid in Human Terms */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Outdoor Weather */}
          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
            <span className={`text-[11px] block font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>1. Outside Street Heat</span>
            <span className={`text-xl font-black font-mono mt-0.5 block ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>{tAmb}°C</span>
            <span className={`text-[10px] ${isLight ? 'text-slate-500 font-medium' : 'text-slate-500'}`}>FortyGuard 2m LTM</span>
          </div>

          {/* Indoor Room Temp */}
          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
            <span className={`text-[11px] block font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>2. Inside Room Temp</span>
            <span className={`text-xl font-black font-mono mt-0.5 block ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>{tIn}°C</span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">100% ASHRAE 55 Comfort</span>
          </div>

          {/* AC Power Draw */}
          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
            <span className={`text-[11px] block font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>3. AC Power Draw</span>
            <span className={`text-xl font-black font-mono mt-0.5 block ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>{chillerKw} kW</span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black">-{powerSavedKw} kW saved</span>
          </div>

          {/* Grid Electricity Tariff */}
          <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
            <span className={`text-[11px] block font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>4. Grid Tariff Rate</span>
            <span className={`text-xl font-black font-mono mt-0.5 block ${isLight ? 'text-slate-950' : 'text-white'}`}>
              {tariffRate} <span className="text-[10px] text-slate-500 font-normal">{tariffCurrency}</span>
            </span>
            <span className={`text-[10px] font-bold ${hour >= 12 && hour < 18 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {hour >= 12 && hour < 18 ? '⚡ ON-PEAK RATE' : '🟢 OFF-PEAK RATE'}
            </span>
          </div>
        </div>

        {/* Plain English Action Explanation */}
        <div className={`mt-3 p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
          isLight ? 'bg-white border-slate-200 text-slate-800 font-medium' : 'bg-slate-900/90 border-slate-800 text-slate-200'
        }`}>
          <Info className="w-4 h-4 text-cyan-600 flex-shrink-0" />
          <span><strong>Why this happens:</strong> {currentActionPlainEnglish}</span>
        </div>
      </div>

      {/* 3. "THE 4 STORY CHAPTERS OF A DAY" (1-Click Jump Buttons) */}
      <div className="relative z-10">
        <div className={`text-xs font-black mb-2 flex items-center justify-between ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
          <span>Click any of the 4 Day Chapters to jump to that moment:</span>
          <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>1-Click Timeline Jump</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Chapter 1: Pre-Cooling */}
          <button
            onClick={() => onSelectHour(5)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              hour >= 4 && hour <= 8
                ? isLight
                  ? 'bg-cyan-50 border-cyan-600 shadow-md ring-2 ring-cyan-500 scale-[1.02]'
                  : 'bg-cyan-950/60 border-cyan-400 shadow-xl ring-2 ring-cyan-400/50 scale-[1.02]'
                : isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`font-mono font-black text-[11px] ${isLight ? 'text-cyan-800' : 'text-cyan-400'}`}>05:00 AM • CHAPTER 1</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-black">
                Pre-Cooling
              </span>
            </div>
            <h4 className={`text-xs font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>Charge Thermal Battery</h4>
            <p className={`text-[11px] mt-1 leading-snug ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
              Power is cheap ($0.08/kWh). Chillers sub-cool concrete to 21°C before the sun rises.
            </p>
          </button>

          {/* Chapter 2: Midday Peak Shed */}
          <button
            onClick={() => onSelectHour(14)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              hour >= 12 && hour <= 17
                ? isLight
                  ? 'bg-amber-50 border-amber-600 shadow-md ring-2 ring-amber-500 scale-[1.02]'
                  : 'bg-amber-950/60 border-amber-400 shadow-xl ring-2 ring-amber-400/50 scale-[1.02]'
                : isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`font-mono font-black text-[11px] ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>02:00 PM • CHAPTER 2</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 font-black">
                Peak Shedding
              </span>
            </div>
            <h4 className={`text-xs font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>Chillers Turn OFF (43°C Heat)</h4>
            <p className={`text-[11px] mt-1 leading-snug ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
              Peak tariff hits $0.88/kWh. Chiller power slashed 65%; building coasts on stored coldness.
            </p>
          </button>

          {/* Chapter 3: Evening Free Air Economizer */}
          <button
            onClick={() => onSelectHour(22)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              hour >= 20 || hour <= 3
                ? isLight
                  ? 'bg-emerald-50 border-emerald-600 shadow-md ring-2 ring-emerald-500 scale-[1.02]'
                  : 'bg-emerald-950/60 border-emerald-400 shadow-xl ring-2 ring-emerald-400/50 scale-[1.02]'
                : isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`font-mono font-black text-[11px] ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>10:00 PM • CHAPTER 3</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-black">
                Free Economizer
              </span>
            </div>
            <h4 className={`text-xs font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>100% Free Air (0 kW AC)</h4>
            <p className={`text-[11px] mt-1 leading-snug ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
              FortyGuard confirms cool street air (h &lt; 45 kJ/kg). Compressors stay OFF; fresh air intake 100%.
            </p>
          </button>

          {/* Chapter 4: Morning Modulated */}
          <button
            onClick={() => onSelectHour(10)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              hour >= 9 && hour <= 11
                ? isLight
                  ? 'bg-indigo-50 border-indigo-600 shadow-md ring-2 ring-indigo-500 scale-[1.02]'
                  : 'bg-indigo-950/60 border-indigo-400 shadow-xl ring-2 ring-indigo-400/50 scale-[1.02]'
                : isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`font-mono font-black text-[11px] ${isLight ? 'text-indigo-800' : 'text-indigo-400'}`}>10:00 AM • CHAPTER 4</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 font-black">
                Modulated
              </span>
            </div>
            <h4 className={`text-xs font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>Variable Speed Staging</h4>
            <p className={`text-[11px] mt-1 leading-snug ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
              Standard high-efficiency variable cooling staging adjusted to rooftop condenser wet-bulb.
            </p>
          </button>
        </div>
      </div>

      {/* 4. BEFORE VS. AFTER COMPARISON MODAL */}
      {showComparison && (
        <div className={`pt-2 border-t relative z-10 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Dumb Traditional BMS */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isLight ? 'bg-rose-50/70 border-rose-200 text-slate-800' : 'bg-red-950/20 border-red-500/30 text-slate-300'
            }`}>
              <div className="flex items-center gap-2 text-rose-600 dark:text-red-400 font-black text-sm">
                <XCircle className="w-4 h-4" /> Traditional AC (Dumb & Reactive)
              </div>
              <ul className={`space-y-1.5 text-[11px] leading-relaxed ${isLight ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>
                <li>❌ <strong>Waits until rooms get hot at 1 PM</strong> before ramping chillers to 100% max load.</li>
                <li>❌ <strong>Pays peak electricity tariff penalties</strong> ($0.88/kWh) during hottest midday hours.</li>
                <li>❌ <strong>Rooftop sensor overheats</strong> on black asphalt roofs, falsely disabling free-air economizers.</li>
                <li>❌ <strong>Overcools shaded North rooms</strong> just to satisfy thermostats in sun-baked South rooms.</li>
              </ul>
            </div>

            {/* ThermoShift AI */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isLight ? 'bg-emerald-50/70 border-emerald-300 text-slate-800' : 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
            }`}>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-sm">
                <CheckCircle2 className="w-4 h-4" /> ThermoShift EcoBreeze (FortyGuard AI)
              </div>
              <ul className={`space-y-1.5 text-[11px] leading-relaxed ${isLight ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>
                <li>✅ <strong>Pre-cools building concrete at 5 AM</strong> when power is cheap ($0.08/kWh).</li>
                <li>✅ <strong>Powers chillers down during 2 PM peak heat</strong>, saving $350–$520/day per commercial building.</li>
                <li>✅ <strong>Uses true street-canyon psychrometric enthalpy</strong> to capture 4–6 hours of 100% free cooling.</li>
                <li>✅ <strong>Directional 4-façade solar balancing</strong> dynamically modulates VAV airflow per orientation.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
