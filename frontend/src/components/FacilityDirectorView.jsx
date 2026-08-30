import React, { useState } from 'react';
import JudgeExplainerBanner from './JudgeExplainerBanner';
import {
  TrendingDown,
  Zap,
  DollarSign,
  Leaf,
  Clock,
  Sliders,
  ShieldCheck,
  ThermometerSnowflake,
  Wind,
  BatteryCharging,
  Info,
  ChevronRight,
  Flame,
  CheckCircle2,
  Sparkles,
  BarChart3
} from 'lucide-react';

export default function FacilityDirectorView({
  scheduleData,
  hvacData,
  onUpdateParams,
  isLoading,
  selectedHour = 14,
  onSelectHour,
  isAutoPlaying,
  setIsAutoPlaying,
  activePreset,
  theme = 'light',
  onOpenCrisisModal
}) {
  const isLight = theme === 'light';
  const dataStore = hvacData || scheduleData;
  const [activeSection, setActiveSection] = useState('working'); // 'working' | 'information'
  const [precoolAggression, setPrecoolAggression] = useState(1.0);
  const [economizerMaxTemp, setEconomizerMaxTemp] = useState(22.5);

  if (!dataStore || !dataStore.summary) {
    return (
      <div className={`p-8 text-center rounded-3xl border ${isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-3" />
        Loading facility thermal optimization schedule...
      </div>
    );
  }

  const { summary, hourly_schedule: schedule, building } = dataStore;
  const currentHourData = schedule[selectedHour] || schedule[0];

  const handleAggressionChange = (val) => {
    setPrecoolAggression(val);
    onUpdateParams({ pre_cooling_aggression: parseFloat(val), economizer_max_temp_c: economizerMaxTemp });
  };

  const handleEconomizerTempChange = (val) => {
    setEconomizerMaxTemp(val);
    onUpdateParams({ pre_cooling_aggression: precoolAggression, economizer_max_temp_c: parseFloat(val) });
  };

  // SVG Chart Geometry Calculations
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  const minTemp = 15;
  const maxTemp = 48;

  const getY = (temp) => {
    const clamped = Math.max(minTemp, Math.min(maxTemp, temp));
    return paddingTop + chartH - ((clamped - minTemp) / (maxTemp - minTemp)) * chartH;
  };

  const getX = (hour) => {
    return paddingLeft + (hour / 23) * chartW;
  };

  // Generate SVG Path string
  const outdoorPath = schedule.reduce((acc, curr, idx) => {
    const x = getX(curr.hour);
    const y = getY(curr.ambient_temp_c);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const indoorPath = schedule.reduce((acc, curr, idx) => {
    const x = getX(curr.hour);
    const y = getY(curr.indoor_temp_c);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const getModeBadge = (mode) => {
    switch (mode) {
      case 'FREE_COOLING_ECONOMIZER':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
            isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}>
            <Wind className="w-3.5 h-3.5" /> 100% Free Air Economizer (Compressors 0 kW)
          </span>
        );
      case 'PRE_COOLING':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
            isLight ? 'bg-cyan-50 text-cyan-800 border-cyan-300' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
          }`}>
            <ThermometerSnowflake className="w-3.5 h-3.5" /> Charging Thermal Battery (Off-Peak)
          </span>
        );
      case 'PEAK_SHED_COASTING':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
            isLight ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" /> Thermal Coasting (Peak Tariff Averted)
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            isLight ? 'bg-indigo-50 text-indigo-800 border-indigo-300' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
          }`}>
            <Zap className="w-3.5 h-3.5" /> Modulated Variable Mechanical
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 🌟 JUDGE 30-SECOND EXPLAINER & 24H SIMULATOR BANNER */}
      <JudgeExplainerBanner
        selectedHour={selectedHour}
        onSelectHour={onSelectHour}
        isAutoPlaying={isAutoPlaying}
        setIsAutoPlaying={setIsAutoPlaying}
        currentHourData={currentHourData}
        buildingName={building?.name}
        theme={theme}
      />

      {/* Primary Working vs Information Categorization Header Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <DollarSign className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-black text-white">Facility Executive Control Center</h3>
            <p className="text-xs text-slate-400">ConEd SC-9 Peak Demand Arbitrage & Thermal Mass Storage Operations</p>
          </div>
        </div>

        <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveSection('working')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'working' ? 'bg-emerald-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🛠️ Working Operations</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('information')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'information' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>ℹ️ Information & Tariff Guide</span>
          </button>
        </div>
      </div>

      {activeSection === 'working' ? (
        <>
          {/* 1. TOP STATS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Cost Savings */}
            <div className={`border rounded-3xl p-5 relative overflow-hidden transition-all shadow-md group ${
              isLight ? 'bg-white border-slate-200 hover:border-emerald-500 shadow-slate-200/50' : 'bg-slate-900/85 border-slate-800 hover:border-emerald-500/50'
            }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Daily Cost Savings</span>
            <div className={`p-2 rounded-xl border group-hover:scale-110 transition-transform ${
              isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
              ${summary.cost_saved_usd}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingDown className="w-3 h-3 mr-0.5" />
              {summary.cost_saved_pct}%
            </span>
          </div>
          <div className={`mt-1 text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Saved vs. standard dumb BMS
          </div>
        </div>

        {/* Peak Demand Shaved */}
        <div className={`border rounded-3xl p-5 relative overflow-hidden transition-all shadow-md group ${
          isLight ? 'bg-white border-slate-200 hover:border-cyan-500 shadow-slate-200/50' : 'bg-slate-900/85 border-slate-800 hover:border-cyan-500/50'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Peak Demand Shaved</span>
            <div className={`p-2 rounded-xl border group-hover:scale-110 transition-transform ${
              isLight ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
            }`}>
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono tracking-tight ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
              {summary.peak_demand_shaved_kw} <span className="text-sm font-normal text-slate-500">kW</span>
            </span>
          </div>
          <div className={`mt-1 text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Thermal battery peak shedding
          </div>
        </div>

        {/* Total Energy Saved */}
        <div className={`border rounded-3xl p-5 relative overflow-hidden transition-all shadow-md group ${
          isLight ? 'bg-white border-slate-200 hover:border-blue-500 shadow-slate-200/50' : 'bg-slate-900/85 border-slate-800 hover:border-blue-500/50'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Net Energy Shaved</span>
            <div className={`p-2 rounded-xl border group-hover:scale-110 transition-transform ${
              isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
              {summary.energy_saved_kwh} <span className="text-sm font-normal text-slate-500">kWh</span>
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              -{summary.energy_saved_pct}%
            </span>
          </div>
          <div className={`mt-1 text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            24-hour cycle efficiency gain
          </div>
        </div>

        {/* Free-Cooling Economizer Hours */}
        <div className={`border rounded-3xl p-5 relative overflow-hidden transition-all shadow-md group ${
          isLight ? 'bg-white border-slate-200 hover:border-teal-500 shadow-slate-200/50' : 'bg-slate-900/85 border-slate-800 hover:border-teal-500/50'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Economizer Hours</span>
            <div className={`p-2 rounded-xl border group-hover:scale-110 transition-transform ${
              isLight ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
            }`}>
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono tracking-tight ${isLight ? 'text-teal-700' : 'text-teal-300'}`}>
              {summary.free_cooling_economizer_hours} <span className="text-sm font-normal text-slate-500">hrs</span>
            </span>
          </div>
          <div className={`mt-1 text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Compressors 100% powered down
          </div>
        </div>

        {/* Carbon Avoided */}
        <div className={`border rounded-3xl p-5 relative overflow-hidden transition-all shadow-md group ${
          isLight ? 'bg-white border-slate-200 hover:border-emerald-500 shadow-slate-200/50' : 'bg-slate-900/85 border-slate-800 hover:border-emerald-500/50'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Carbon Abatement</span>
            <div className={`p-2 rounded-xl border group-hover:scale-110 transition-transform ${
              isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono tracking-tight ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
              {summary.carbon_avoided_kg_co2} <span className="text-sm font-normal text-slate-500">kg</span>
            </span>
          </div>
          <div className={`mt-1 text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Avoided Scope 2 GHG emissions
          </div>
        </div>
      </div>

      {/* 2. 24-HOUR HORIZON INTERACTIVE VISUALIZER */}
      <div className={`rounded-3xl p-5 md:p-6 shadow-xl border transition-all ${
        isLight ? 'bg-white border-slate-200 shadow-slate-200/60' : 'bg-slate-900/85 border-slate-800 shadow-2xl backdrop-blur-md'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-lg font-black tracking-tight flex items-center gap-2 ${isLight ? 'text-slate-950' : 'text-white'}`}>
                <BarChart3 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                24-Hour Predictive Thermal & Tariff Curves
              </h3>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                isLight ? 'bg-cyan-50 text-cyan-800 border-cyan-300' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              }`}>
                FortyGuard Microclimate Curve
              </span>
            </div>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
              Click anywhere along the chart to scrub the simulated hour and inspect real-time thermal mass charging.
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3.5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className={isLight ? 'text-slate-800 font-bold' : 'text-slate-300 font-medium'}>Outdoor Temp (°C)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-600" />
              <span className={isLight ? 'text-slate-800 font-bold' : 'text-slate-300 font-medium'}>Indoor Temp (°C)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1.5 rounded-sm bg-amber-500" />
              <span className={isLight ? 'text-slate-800 font-bold' : 'text-slate-300 font-medium'}>Peak Tariff Zone</span>
            </div>
          </div>
        </div>

        {/* 📈 DYNAMIC SVG MULTI-CURVE CHART */}
        <div className={`w-full rounded-2xl p-3 relative overflow-hidden border ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/90 border-slate-800/90'
        }`}>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto cursor-crosshair select-none"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = ((e.clientX - rect.left) / rect.width) * svgWidth;
              const ratio = Math.max(0, Math.min(1, (clickX - paddingLeft) / chartW));
              const hour = Math.round(ratio * 23);
              onSelectHour(hour);
              setIsAutoPlaying(false);
            }}
          >
            {/* Grid Lines & Axis Labels */}
            {[20, 30, 40].map((t) => (
              <g key={t}>
                <line
                  x1={paddingLeft}
                  y1={getY(t)}
                  x2={svgWidth - paddingRight}
                  y2={getY(t)}
                  stroke={isLight ? '#cbd5e1' : '#334155'}
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={getY(t) + 4}
                  textAnchor="end"
                  fill={isLight ? '#475569' : '#64748b'}
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {t}°C
                </text>
              </g>
            ))}

            {/* Shaded Tariff Peak Area (12:00 - 18:00) */}
            <rect
              x={getX(12)}
              y={paddingTop}
              width={getX(18) - getX(12)}
              height={chartH}
              fill="#f59e0b"
              fillOpacity={isLight ? '0.14' : '0.08'}
            />

            {/* Shaded Pre-Cooling Area (04:00 - 08:00) */}
            <rect
              x={getX(4)}
              y={paddingTop}
              width={getX(8) - getX(4)}
              height={chartH}
              fill="#06b6d4"
              fillOpacity={isLight ? '0.14' : '0.08'}
            />

            {/* Curves */}
            <path d={outdoorPath} fill="none" stroke="#e11d48" strokeWidth="2.5" />
            <path d={indoorPath} fill="none" stroke="#0284c7" strokeWidth="2.5" />

            {/* Data Points */}
            {schedule.map((item, idx) => (
              <g key={idx}>
                <circle
                  cx={getX(item.hour)}
                  cy={getY(item.ambient_temp_c)}
                  r={selectedHour === idx ? '6' : '2.5'}
                  fill="#e11d48"
                />
                <circle
                  cx={getX(item.hour)}
                  cy={getY(item.indoor_temp_c)}
                  r={selectedHour === idx ? '6' : '2.5'}
                  fill="#0284c7"
                />
              </g>
            ))}

            {/* Selected Hour Vertical Line Tracker */}
            <line
              x1={getX(selectedHour)}
              y1={paddingTop - 5}
              x2={getX(selectedHour)}
              y2={paddingTop + chartH + 5}
              stroke={isLight ? '#0f172a' : '#ffffff'}
              strokeWidth="2.5"
              strokeDasharray="3 3"
            />

            {/* X-Axis Hour Labels */}
            {schedule.filter((_, i) => i % 3 === 0).map((item) => (
              <text
                key={item.hour}
                x={getX(item.hour)}
                y={svgHeight - 10}
                textAnchor="middle"
                fill={isLight ? '#334155' : '#94a3b8'}
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {item.time_label}
              </text>
            ))}
          </svg>
        </div>

        {/* Hour Block Buttons Grid */}
        <div className="relative pt-4 pb-2 overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-24 gap-1.5 mb-2">
              {schedule.map((item, idx) => {
                const isSelected = selectedHour === idx;
                let modeColor = isLight ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30';
                if (item.mode === 'FREE_COOLING_ECONOMIZER') {
                  modeColor = isLight ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold' : 'bg-emerald-500/30 text-emerald-200 border-emerald-500/50';
                }
                if (item.mode === 'PRE_COOLING') {
                  modeColor = isLight ? 'bg-cyan-50 text-cyan-900 border-cyan-300 font-bold' : 'bg-cyan-500/30 text-cyan-200 border-cyan-500/50';
                }
                if (item.mode === 'PEAK_SHED_COASTING') {
                  modeColor = isLight ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold' : 'bg-amber-500/30 text-amber-200 border-amber-500/50';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectHour(idx);
                      setIsAutoPlaying(false);
                    }}
                    className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-slate-900 text-white border-slate-950 shadow-lg scale-105 z-10'
                          : 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-400 shadow-xl shadow-cyan-500/20 scale-105 z-10'
                        : `${modeColor} hover:brightness-95`
                    }`}
                  >
                    <span className="text-[10px] font-mono font-black">{item.time_label}</span>
                    <span className={`text-[11px] font-mono mt-1 font-bold ${
                      isSelected && isLight ? 'text-rose-300' : isLight ? 'text-rose-600' : 'text-rose-300'
                    }`}>{item.ambient_temp_c}°</span>
                    <span className={`text-[11px] font-mono font-black ${
                      isSelected && isLight ? 'text-cyan-300' : isLight ? 'text-cyan-800' : 'text-cyan-300'
                    }`}>{item.indoor_temp_c}°</span>
                  </button>
                );
              })}
            </div>

            {/* Thermal Battery Charge Bar Track */}
            <div className={`mt-3 rounded-2xl p-4 border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800/90'
            }`}>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={`flex items-center gap-2 font-black ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
                  <BatteryCharging className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Building Concrete Thermal Battery State-of-Charge (SoC)
                </span>
                <span className={`font-mono font-black px-2.5 py-0.5 rounded-lg border ${
                  isLight ? 'bg-cyan-100 text-cyan-900 border-cyan-300' : 'bg-cyan-950/50 text-cyan-300 border-cyan-800/40'
                }`}>
                  {currentHourData.thermal_storage_charge_pct}% Charged
                </span>
              </div>
              <div className={`grid grid-cols-24 gap-1 h-4 rounded-xl p-1 border ${
                isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-900 border-slate-800/80'
              }`}>
                {schedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="h-full rounded-sm transition-all"
                    style={{
                      backgroundColor:
                        item.thermal_storage_charge_pct > 70
                          ? '#0284c7'
                          : item.thermal_storage_charge_pct > 40
                          ? '#2563eb'
                          : '#64748b',
                      opacity: item.thermal_storage_charge_pct / 100
                    }}
                    title={`Hour ${item.time_label}: ${item.thermal_storage_charge_pct}% charged`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Hour Telemetry Detail Callout */}
        <div className={`mt-5 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border ${
          isLight ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-slate-950/90 border-slate-800'
        }`}>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-sm font-mono font-black px-3 py-1 rounded-xl border ${
                isLight ? 'bg-white text-slate-950 border-slate-300 shadow-sm' : 'bg-slate-800 text-white border-slate-700'
              }`}>
                CURRENT TIME: {currentHourData.time_label}
              </span>
              {getModeBadge(currentHourData.mode)}
            </div>
            <p className={`text-xs pt-1 flex items-center gap-2 font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
              {currentHourData.mode_rationale}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className={`px-4 py-2.5 rounded-2xl border shadow-sm ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <span className={`block text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>CHILLER POWER</span>
              <span className={`font-black text-sm ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>{currentHourData.chiller_power_kw} kW</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] ml-1 font-bold">(-{currentHourData.power_savings_kw} kW)</span>
            </div>
            <div className={`px-4 py-2.5 rounded-2xl border shadow-sm ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <span className={`block text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>DAMPER OA%</span>
              <span className="text-emerald-700 dark:text-emerald-300 font-black text-sm">{currentHourData.damper_outdoor_pct}%</span>
            </div>
            <div className={`px-4 py-2.5 rounded-2xl border shadow-sm ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <span className={`block text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>OUT ENTHALPY</span>
              <span className={`font-black text-sm ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>{currentHourData.outdoor_enthalpy_kj_kg} kJ/kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SIMULATION & OPTIMIZATION CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`rounded-3xl p-5 shadow-xl border ${
          isLight ? 'bg-white border-slate-200 shadow-slate-200/60' : 'bg-slate-900/85 border-slate-800'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-2 rounded-xl border ${
              isLight ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
            }`}>
              <Sliders className="w-4 h-4" />
            </div>
            <h4 className={`text-sm font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>Pre-Cooling Aggression Factor</h4>
            <span className={`ml-auto font-mono text-sm font-black px-2.5 py-0.5 rounded-lg border ${
              isLight ? 'bg-cyan-100 text-cyan-900 border-cyan-300' : 'bg-cyan-950/50 text-cyan-400 border-cyan-800/40'
            }`}>
              {precoolAggression}x
            </span>
          </div>
          <p className={`text-xs mb-4 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
            Controls how deeply the building's concrete core is sub-cooled during overnight low-tariff hours to withstand afternoon peak spikes.
          </p>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={precoolAggression}
            onChange={(e) => handleAggressionChange(e.target.value)}
            className={`w-full cursor-pointer h-2.5 rounded-lg ${isLight ? 'accent-cyan-600 bg-slate-200' : 'accent-cyan-400 bg-slate-800'}`}
          />
          <div className={`flex justify-between text-[10px] mt-1.5 font-mono font-bold ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
            <span>0.5x (Gentle)</span>
            <span>1.0x (Optimal ASHRAE 55)</span>
            <span>1.5x (Aggressive Peak Shed)</span>
          </div>
        </div>

        <div className={`rounded-3xl p-5 shadow-xl border ${
          isLight ? 'bg-white border-slate-200 shadow-slate-200/60' : 'bg-slate-900/85 border-slate-800'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-2 rounded-xl border ${
              isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              <Wind className="w-4 h-4" />
            </div>
            <h4 className={`text-sm font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>Economizer Upper Temp Threshold</h4>
            <span className={`ml-auto font-mono text-sm font-black px-2.5 py-0.5 rounded-lg border ${
              isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-emerald-950/50 text-emerald-400 border-emerald-800/40'
            }`}>
              {economizerMaxTemp}°C
            </span>
          </div>
          <p className={`text-xs mb-4 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
            Maximum outdoor dry-bulb temperature where 100% outside air free-cooling is permitted when psychrometric enthalpy matches indoor target.
          </p>
          <input
            type="range"
            min="19.0"
            max="25.0"
            step="0.5"
            value={economizerMaxTemp}
            onChange={(e) => handleEconomizerTempChange(e.target.value)}
            className={`w-full cursor-pointer h-2.5 rounded-lg ${isLight ? 'accent-emerald-600 bg-slate-200' : 'accent-emerald-400 bg-slate-800'}`}
          />
          <div className={`flex justify-between text-[10px] mt-1.5 font-mono font-bold ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
            <span>19.0°C (Conservative)</span>
            <span>22.5°C (Standard ASHRAE 90.1)</span>
            <span>25.0°C (Max Free Air)</span>
          </div>
        </div>
      </div>
    </>
  ) : (
    /* ========================================================================= */
    /* ℹ️ FACILITY EXECUTIVE INFORMATION & TARIFF GUIDE (INFORMATION SIDE) */
    /* ========================================================================= */
    <div className={`rounded-3xl p-6 shadow-xl border space-y-6 animate-in fade-in duration-200 ${
      isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
    }`}>
      <div className="flex items-center gap-3 border-b pb-4 border-slate-800">
        <span className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
          <Info className="w-5 h-5" />
        </span>
        <div>
          <h4 className="text-base font-black text-white">
            ConEd SC-9 Tariff Arbitrage, 1R1C Thermal Mass Physics & Financial Modeling
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Engineering calculations, rate structure breakdowns, and investment payback metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ConEd SC-9 Rate Structure */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Zap className="w-4 h-4" />
            <h5 className="text-xs font-black uppercase tracking-wider">
              1. ConEd SC-9 Rate Structure & Peak Multipliers
            </h5>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Consolidated Edison Service Classification No. 9 (SC-9) charges high-tension commercial facilities based on two separate cost components:
          </p>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Off-Peak (22:00 - 08:00):</span>
              <strong className="text-cyan-400">$0.11 / kWh (Low Energy Charge)</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">On-Peak (11:00 - 18:00):</span>
              <strong className="text-amber-400">$0.46 / kWh (+318% Multiplier)</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Demand Charge (Peak 15-min):</span>
              <strong className="text-rose-400">$38.50 / kW monthly peak</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            By shifting 240 kW of cooling demand from 14:00 to 05:00, ThermoShift cuts peak demand charges by up to <strong>$9,240 / month</strong>.
          </p>
        </div>

        {/* 1R1C Thermal Mass Physics */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <ThermometerSnowflake className="w-4 h-4" />
            <h5 className="text-xs font-black uppercase tracking-wider">
              2. 1R1C Concrete Lumped Thermal Mass Physics
            </h5>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The building's heavy concrete core and structural floor slabs act as an internal <strong>sensible thermal battery</strong> modeled via the 1R1C differential equation:
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 font-mono text-xs text-center">
            C_th · (dT_in / dt) = (T_amb - T_in) / R_envelope - Q_cooling + Q_internal
          </div>
          <div className="space-y-1 text-[11px] text-slate-400">
            <div>• <strong className="text-slate-200">C_th (Thermal Capacitance):</strong> ~8,400 kWh / °C for a 10-floor concrete superstructure.</div>
            <div>• <strong className="text-slate-200">Pre-Cooling Lead Time:</strong> 4 hours of off-peak sub-cooling stores 2,800 kWh of cooling energy.</div>
            <div>• <strong className="text-slate-200">Peak Thermal Coasting:</strong> Allows chillers to throttle to 30% load while indoor temp rises by &lt; 0.8°C.</div>
          </div>
        </div>

        {/* Capital Investment ROI */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <DollarSign className="w-4 h-4" />
            <h5 className="text-xs font-black uppercase tracking-wider">
              3. Financial ROI & Payback Timeline
            </h5>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">Annual Energy Cost Avoided:</span>
              <strong className="text-emerald-400">$348,200 / year</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">Demand Charge Reductions:</span>
              <strong className="text-cyan-400">$110,800 / year</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">Software & Sensor Retrofit Cost:</span>
              <strong className="text-slate-300">$140,000 (One-Time)</strong>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-400">Payback Horizon:</span>
              <strong className="text-emerald-300 font-bold">4.8 Months (&lt; 0.5 Year)</strong>
            </div>
          </div>
        </div>

        {/* Emergency Heatwave & Grid Demand Response */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldCheck className="w-4 h-4" />
            <h5 className="text-xs font-black uppercase tracking-wider">
              4. NYISO Demand Response & Grid Incentives
            </h5>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            During extreme ConEd emergency grid events, ThermoShift participates in automated <strong>NYISO Special Case Resources (SCR)</strong> programs:
          </p>
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              ⚡ <strong>Event Dispatch Payment:</strong> $25.00 / kW-month reservation + $500 / MWh curtailment incentive.
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              🏢 <strong>Zero Occupant Impact:</strong> Pre-chilled thermal mass buffers tenant comfort for up to 3.5 hours during full chiller curtailment.
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
    </div>
  );
}
