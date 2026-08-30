import React, { useState } from 'react';
import {
  Activity,
  Wind,
  Gauge,
  Power,
  Flame,
  Thermometer,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sliders,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function HvacPlantTechnicianView({
  scheduleData,
  hvacData,
  selectedHour = 14,
  onSelectHour,
  hvacParams,
  onUpdateParams,
  activePreset,
  theme = 'light'
}) {
  const isLight = theme === 'light';
  const dataStore = hvacData || scheduleData;
  const [activeSection, setActiveSection] = useState('working'); // 'working' | 'information'
  const [overrideMode, setOverrideMode] = useState('AUTO'); // 'AUTO' | 'FORCE_ECONOMIZER' | 'FORCE_PEAK_SHED'

  const schedule = dataStore?.hourly_schedule || [];
  const current = schedule[selectedHour] || schedule[0] || {
    time_label: '14:00',
    ambient_temp_c: 38.5,
    wet_bulb_temp_c: 24.2,
    relative_humidity_pct: 42.0,
    outdoor_enthalpy_kj_kg: 56.4,
    indoor_enthalpy_kj_kg: 45.5,
    damper_outdoor_pct: 20,
    damper_recirc_pct: 80,
    chiller_power_kw: 340.0,
    mode: 'PEAK_SHED_COASTING'
  };

  // Determine active values based on override
  let outdoorDamper = current.damper_outdoor_pct;
  let recircDamper = current.damper_recirc_pct;
  let compressorStatus = current.mode === 'FREE_COOLING_ECONOMIZER' ? 'OFF (0 kW)' : 'VARIABLE SPEED RUNNING';
  let compressorLoad = current.mode === 'FREE_COOLING_ECONOMIZER' ? 0 : current.mode === 'PEAK_SHED_COASTING' ? 35 : 75;

  if (overrideMode === 'FORCE_ECONOMIZER') {
    outdoorDamper = 100;
    recircDamper = 0;
    compressorStatus = 'FORCED OFF (0 kW)';
    compressorLoad = 0;
  } else if (overrideMode === 'FORCE_PEAK_SHED') {
    outdoorDamper = 15;
    recircDamper = 85;
    compressorStatus = 'THROTTLED (30% POWER)';
    compressorLoad = 30;
  }

  const enthalpyDifference = (current.outdoor_enthalpy_kj_kg - current.indoor_enthalpy_kj_kg).toFixed(1);
  const isEnthalpyFavorable = current.outdoor_enthalpy_kj_kg <= current.indoor_enthalpy_kj_kg;

  return (
    <div className="space-y-6">
      {/* Primary Working vs Information Categorization Header Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Activity className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-black text-white">Central Plant & Mechanical Engineering Suite</h3>
            <p className="text-xs text-slate-400">Modbus/BACnet Telemetry, Chiller VSD Staging & Psychrometric Enthalpy</p>
          </div>
        </div>

        <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveSection('working')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'working' ? 'bg-cyan-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🛠️ Working Side</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('information')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'information' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📖 Reading & Reference Materials</span>
          </button>
        </div>
      </div>

      {activeSection === 'working' ? (
        <>
          {/* 1. PLANT CONTROLS & OVERRIDE HEADER */}
          <div className={`rounded-3xl p-5 md:p-6 shadow-xl border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-slate-200/60' : 'bg-slate-900/85 border-slate-800 shadow-2xl backdrop-blur-md'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <span className={`p-2 rounded-xl border ${
                  isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                }`}>
                  <Activity className="w-4 h-4" />
                </span>
                <h3 className={`text-lg font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  AHU-01 Automation & Plant Telemetry
                </h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                  isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  Live Modbus/BACnet Stream
                </span>
              </div>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                Real-time damper actuation, psychrometric enthalpy differential, and chiller stage telemetry for <strong>Hour {current.time_label}</strong>.
              </p>
            </div>

            {/* Override Control Buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <button
                onClick={() => setOverrideMode('AUTO')}
                className={`px-4 py-2.5 rounded-2xl border transition-all cursor-pointer ${
                  overrideMode === 'AUTO'
                    ? isLight
                      ? 'bg-cyan-600 text-white border-cyan-700 shadow-md ring-2 ring-cyan-400'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md ring-1 ring-cyan-400'
                    : isLight
                      ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                🤖 Autonomous FortyGuard LTM
              </button>
          <button
            onClick={() => setOverrideMode('FORCE_ECONOMIZER')}
            className={`px-4 py-2.5 rounded-2xl border transition-all cursor-pointer ${
              overrideMode === 'FORCE_ECONOMIZER'
                ? isLight
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md ring-1 ring-emerald-400'
                : isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            🍃 Force 100% Free Air
          </button>
          <button
            onClick={() => setOverrideMode('FORCE_PEAK_SHED')}
            className={`px-4 py-2.5 rounded-2xl border transition-all cursor-pointer ${
              overrideMode === 'FORCE_PEAK_SHED'
                ? isLight
                  ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-400'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md ring-1 ring-amber-400'
                : isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            🛡️ Force Peak Shed
          </button>
        </div>
      </div>

      {/* 2. INTERACTIVE AIR HANDLING UNIT (AHU) SCHEMATIC */}
      <div className={`rounded-3xl p-6 shadow-xl border transition-all ${
        isLight ? 'bg-white border-slate-200 shadow-slate-200/60' : 'bg-slate-900/85 border-slate-800 shadow-2xl backdrop-blur-md'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h4 className={`text-sm font-black flex items-center gap-2 ${isLight ? 'text-slate-950' : 'text-white'}`}>
            <Wind className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Air Handling Unit (AHU) Mechanical Flow Schematic
          </h4>
          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border ${
            isLight ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-slate-800/80 text-slate-300 border-slate-700'
          }`}>
            Selected Time: <strong className={isLight ? 'text-cyan-800 font-black' : 'text-cyan-300 font-black'}>{current.time_label}</strong>
          </span>
        </div>

        {/* Visual AHU Diagram Container */}
        <div className={`rounded-2xl p-5 overflow-x-auto border ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/90 border-slate-800'
        }`}>
          <div className="min-w-[720px] flex items-center justify-between gap-3 text-xs font-mono">
            {/* 1. Outdoor Air Intake */}
            <div className={`flex-1 rounded-2xl p-4 relative text-center border transition-all ${
              isLight ? 'bg-white border-slate-200 shadow-sm hover:border-cyan-400' : 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/40'
            }`}>
              <div className={`text-[10px] font-bold mb-1 tracking-wider ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>OUTDOOR AIR (OA)</div>
              <div className={`text-xl font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>{current.ambient_temp_c}°C</div>
              <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{current.relative_humidity_pct}% RH</div>
              <div className={`mt-2 text-[10px] px-2 py-0.5 rounded border font-bold ${
                isLight ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-amber-950/30 text-amber-400 border-amber-800/40'
              }`}>
                h: {current.outdoor_enthalpy_kj_kg} kJ/kg
              </div>
              <div className={`mt-3 pt-2 border-t flex justify-between items-center text-[10px] ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Damper OA:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{outdoorDamper}% Open</span>
              </div>
            </div>

            {/* Animated Air Flow Indicator */}
            <div className="flex flex-col items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold px-1">
              <div className="animate-pulse flex items-center gap-1">
                <ArrowRight className="w-4 h-4" />
              </div>
              <span className={`text-[9px] mt-0.5 ${isLight ? 'text-slate-500 font-bold' : 'text-slate-500'}`}>Airflow</span>
            </div>

            {/* 2. Mixing Chamber & Return Air */}
            <div className={`flex-1 rounded-2xl p-4 relative text-center border transition-all ${
              isLight ? 'bg-white border-slate-200 shadow-sm hover:border-indigo-400' : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40'
            }`}>
              <div className={`text-[10px] font-bold mb-1 tracking-wider ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>MIXING CHAMBER</div>
              <div className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Mixed Enthalpy</div>
              <div className={`text-lg font-black mt-0.5 ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>
                {((current.outdoor_enthalpy_kj_kg * outdoorDamper + current.indoor_enthalpy_kj_kg * recircDamper) / 100).toFixed(1)} kJ/kg
              </div>
              <div className={`mt-3 pt-2 border-t flex justify-between items-center text-[10px] ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Damper RA:</span>
                <span className={`font-bold ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>{recircDamper}%</span>
              </div>
            </div>

            {/* Animated Air Flow Indicator */}
            <div className="flex flex-col items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold px-1">
              <div className="animate-pulse flex items-center gap-1">
                <ArrowRight className="w-4 h-4" />
              </div>
              <span className={`text-[9px] mt-0.5 ${isLight ? 'text-slate-500 font-bold' : 'text-slate-500'}`}>Filtration</span>
            </div>

            {/* 3. Cooling & Dehumidification Coil */}
            <div className={`flex-1 rounded-2xl p-4 relative text-center border transition-all ${
              isLight ? 'bg-white border-slate-200 shadow-sm hover:border-blue-400' : 'bg-slate-900/90 border-slate-800 hover:border-blue-500/40'
            }`}>
              <div className={`text-[10px] font-bold mb-1 tracking-wider ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>COOLING COIL</div>
              <div className={`text-sm font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>
                {compressorLoad === 0 ? 'BYPASS (0 kW)' : `${current.chiller_power_kw} kW`}
              </div>
              <div className="mt-1">
                <span
                  className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    compressorLoad === 0
                      ? isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : isLight ? 'bg-blue-50 text-blue-800 border-blue-300' : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}
                >
                  {compressorLoad === 0 ? '100% FREE AIR' : `Stage ${compressorLoad > 60 ? '2 (High)' : '1 (Econ)'}`}
                </span>
              </div>
              <div className={`mt-3 pt-2 border-t flex justify-between items-center text-[10px] ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Coil Status:</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-300">{compressorLoad === 0 ? 'OFF' : 'ACTIVE'}</span>
              </div>
            </div>

            {/* Animated Air Flow Indicator */}
            <div className="flex flex-col items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold px-1">
              <div className="animate-pulse flex items-center gap-1">
                <ArrowRight className="w-4 h-4" />
              </div>
              <span className={`text-[9px] mt-0.5 ${isLight ? 'text-slate-500 font-bold' : 'text-slate-500'}`}>Supply</span>
            </div>

            {/* 4. Supply Air to Building Zones */}
            <div className={`flex-1 rounded-2xl p-4 relative text-center border transition-all ${
              isLight ? 'bg-white border-slate-200 shadow-sm hover:border-emerald-400' : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
            }`}>
              <div className={`text-[10px] font-bold mb-1 tracking-wider ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>SUPPLY AIR (SA)</div>
              <div className={`text-xl font-black ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>14.8°C</div>
              <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>12,500 CFM Airflow</div>
              <div className={`mt-3 pt-2 border-t flex justify-between items-center text-[10px] ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>VAV Zone:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">OPTIMAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PSYCHROMETRIC ENTHALPY & CHILLER METERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Psychrometric Enthalpy Analyzer */}
        <div className={`rounded-3xl p-5 md:p-6 shadow-xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-slate-200/60' : 'bg-slate-900/85 border-slate-800'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-2 rounded-xl border ${
              isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              <Gauge className="w-4 h-4" />
            </div>
            <h4 className={`text-sm font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>
              Psychrometric Enthalpy Comparator (h_out vs h_in)
            </h4>
          </div>
          <p className={`text-xs mb-4 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
            FortyGuard microclimate enthalpy math determines whether outside air heat content is low enough to replace mechanical cooling.
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className={`flex justify-between items-center p-3.5 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className={isLight ? 'text-slate-600 font-bold' : 'text-slate-400'}>Outdoor Air Enthalpy (h_out):</span>
              <span className={`font-black text-sm ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>{current.outdoor_enthalpy_kj_kg} kJ/kg</span>
            </div>
            <div className={`flex justify-between items-center p-3.5 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className={isLight ? 'text-slate-600 font-bold' : 'text-slate-400'}>Indoor Return Air Enthalpy (h_in):</span>
              <span className={`font-black text-sm ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>{current.indoor_enthalpy_kj_kg} kJ/kg</span>
            </div>
            <div className={`flex justify-between items-center p-3.5 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className={isLight ? 'text-slate-600 font-bold' : 'text-slate-400'}>Enthalpy Differential (Δh):</span>
              <span className={`font-black text-sm ${isEnthalpyFavorable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {enthalpyDifference > 0 ? `+${enthalpyDifference}` : enthalpyDifference} kJ/kg
              </span>
            </div>
          </div>

          <div className={`mt-4 p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/80 border-slate-800/80'
          }`}>
            {isEnthalpyFavorable ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                  Economizer gate verified: Outdoor air is energetically cooler. 100% Free Air active.
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span className={isLight ? 'text-slate-700 font-medium' : 'text-slate-300'}>
                  Outdoor enthalpy is higher. Mechanical cooling active to prevent latent moisture loading.
                </span>
              </>
            )}
          </div>
        </div>

        {/* Chiller Staging & Rooftop Condenser Microclimate */}
        <div className={`rounded-3xl p-5 md:p-6 shadow-xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-slate-200/60' : 'bg-slate-900/85 border-slate-800'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-2 rounded-xl border ${
              isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              <Zap className="w-4 h-4" />
            </div>
            <h4 className={`text-sm font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>
              Chiller Plant & Rooftop Microclimate COP
            </h4>
          </div>
          <p className={`text-xs mb-4 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
            FortyGuard 2-meter heatmap accounts for rooftop asphalt heat plume when calculating condenser heat rejection efficiency.
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className={`flex justify-between items-center p-3.5 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className={isLight ? 'text-slate-600 font-bold' : 'text-slate-400'}>Compressor Array Status:</span>
              <span className={`font-black ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>{compressorStatus}</span>
            </div>
            <div className={`flex justify-between items-center p-3.5 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className={isLight ? 'text-slate-600 font-bold' : 'text-slate-400'}>Rooftop Wet-Bulb (T_wb):</span>
              <span className={`font-black text-sm ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>{current.wet_bulb_temp_c}°C</span>
            </div>
            <div className={`flex justify-between items-center p-3.5 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className={isLight ? 'text-slate-600 font-bold' : 'text-slate-400'}>Dynamic Chiller COP:</span>
              <span className={`font-black text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                {(3.3 * (1.0 - (current.wet_bulb_temp_c - 20.0) * 0.015)).toFixed(2)} (High Efficiency)
              </span>
            </div>
          </div>

          <div className={`mt-4 p-3.5 rounded-2xl border text-xs flex justify-between items-center ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}>
            <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Compressor Electrical Load:</span>
            <div className="flex items-center gap-2">
              <div className={`w-32 h-2.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                  style={{ width: `${compressorLoad}%` }}
                />
              </div>
              <span className={`font-mono font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>{compressorLoad}%</span>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    /* ========================================================================= */
    /* ℹ️ MECHANICAL ENGINEERING & PLANT MAINTENANCE GUIDE (INFORMATION SIDE) */
    /* ========================================================================= */
    <div className={`rounded-3xl p-6 shadow-xl border space-y-6 animate-in fade-in duration-200 ${
      isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
    }`}>
      <div className="flex items-center gap-3 border-b pb-4 border-slate-800">
        <span className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
          <Activity className="w-5 h-5" />
        </span>
        <div>
          <h4 className="text-base font-black text-white">
            Mechanical Engineering Standards, Psychrometrics & Chiller Lift Optimization
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            ASHRAE Guideline 36, Psychrometric enthalpy formulas, and centrifugal VSD compressor diagnostics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Psychrometric Enthalpy Equation */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Wind className="w-4 h-4" />
            <h5 className="text-xs font-black uppercase tracking-wider">
              1. Psychrometric Enthalpy Matrix (ASHRAE Fundamentals)
            </h5>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Free-cooling economizer gating is governed strictly by moist air specific enthalpy rather than dry-bulb temperature alone:
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 font-mono text-xs text-center">
            h = c_p · T_db + W · (h_fg + c_pw · T_db) = 1.006 · T + W · (2501 + 1.86 · T) [kJ/kg]
          </div>
          <div className="space-y-1.5 text-xs text-slate-400">
            <div>• <strong className="text-slate-200">Enthalpy Threshold:</strong> Outside air is permitted when h_outdoor &le; 45.5 kJ/kg.</div>
            <div>• <strong className="text-slate-200">Latent Heat Penalty Avoidance:</strong> Prevents humid air ingestion during morning high-dewpoint hours.</div>
          </div>
        </div>

        {/* Chiller VSD Surge & Lift */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <Zap className="w-4 h-4" />
            <h5 className="text-xs font-black uppercase tracking-wider">
              2. Centrifugal Chiller Lift & VSD Speed Modulation
            </h5>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Compressor Coefficient of Performance (COP) varies dynamically with condenser entering water temperature (EWT):
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-indigo-300 font-mono text-xs text-center">
            COP_chiller = Q_evap / P_electrical = 3.3 · [ 1.0 - (T_wetbulb - 20.0) · 0.015 ]
          </div>
          <div className="space-y-1 text-xs text-slate-400">
            <div>• Every 1°C reduction in cooling tower wet-bulb approach increases chiller COP by <strong>+1.5%</strong>.</div>
            <div>• Variable speed drive (VSD) eliminates aerodynamic surge while operating at 30% partial loads.</div>
          </div>
        </div>

        {/* ASHRAE Guideline 36 Static Pressure Reset */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <h5 className="text-xs font-black uppercase tracking-wider">
              3. ASHRAE Guideline 36: Trim & Respond VAV Reset
            </h5>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Duct static pressure is continuously reset based on the most demanding terminal VAV damper position:
          </p>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              • <strong>Trim Mode:</strong> If max damper &lt; 85%, trim supply fan static pressure by -0.04 in. w.g. every 2 minutes.
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              • <strong>Respond Mode:</strong> If 2+ zone dampers reach 100%, boost fan static pressure by +0.06 in. w.g.
            </div>
          </div>
        </div>

        {/* Preventive Maintenance & Bearing Diagnostics */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Sliders className="w-4 h-4" />
            <h5 className="text-xs font-black uppercase tracking-wider">
              4. Predictive Vibration & Actuator Health Monitoring
            </h5>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">AHU-01 Supply Fan Vibration:</span>
              <strong className="text-emerald-400">0.08 in/s (ISO 10816 Class I Normal)</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">Damper Actuator Hunting Score:</span>
              <strong className="text-cyan-400">&lt; 2 oscillations / hr (Optimal)</strong>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-400">Next Scheduled Filter Replacement:</span>
              <strong className="text-slate-300 font-bold">42 Operating Days Remaining</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
    </div>
  );
}
