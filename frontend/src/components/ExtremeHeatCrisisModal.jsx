import React, { useState } from 'react';
import {
  Flame,
  AlertTriangle,
  Zap,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  X,
  Sparkles,
  ThermometerSun,
  Activity,
  Gauge,
  CheckCircle2,
  XCircle,
  Building
} from 'lucide-react';

export default function ExtremeHeatCrisisModal({
  isOpen,
  onClose,
  theme = 'dark'
}) {
  if (!isOpen) return null;

  const [activeScenario, setActiveScenario] = useState('nyc_heat_dome'); // 'nyc_heat_dome' | 'nyc_hudson_glare' | 'nyc_midtown_blackout'
  const [isCrisisActive, setIsCrisisActive] = useState(true);

  const CRISIS_PROFILES = {
    nyc_heat_dome: {
      title: 'Manhattan Financial Canyon Extreme Heat Dome (+42.5°C)',
      location: 'One World Financial Tower, Lower Manhattan, NY',
      ambientTemp: '42.5°C (108.5°F)',
      solarFlux: '1,040 W/m² (Deep Canyon Trapping)',
      asphaltTemp: '58.2°C Urban Canyon Trapping',
      gridRate: '$0.58 / kWh ConEd Emergency Peak Surcharge',
      legacyBms: {
        peakPower: '1,840 kW',
        indoorTemp: '28.4°C (ASHRAE Fail)',
        costSpike: '+$1,450 / Hour',
        blackoutRisk: 'CRITICAL (92% Overload)',
        co2Spike: '+2,400 kg CO2 / Day',
        status: 'Chiller Thermal Trip Imminent'
      },
      thermoShift: {
        peakPower: '420 kW (Coasting)',
        indoorTemp: '22.8°C (Optimal)',
        costSaved: '$980 / Hour Shaved',
        blackoutRisk: 'ZERO (38% Base Load)',
        co2Avoided: '1,850 kg CO2 / Day',
        status: 'Cold Concrete Thermal Battery Discharging'
      }
    },
    nyc_hudson_glare: {
      title: 'Hudson Yards Specular Glare & Chiller Plume Surge (+44.0°C)',
      location: '30 Hudson Yards Supertall, Midtown West, NY',
      ambientTemp: '44.0°C (111.2°F)',
      solarFlux: '1,180 W/m² Specular Double-Glass Glare',
      asphaltTemp: '61.5°C 11th Ave Transit Corridor',
      gridRate: '$0.62 / kWh ConEd Emergency Surcharge',
      legacyBms: {
        peakPower: '2,600 kW',
        indoorTemp: '29.8°C (Tenant Evacuation Warning)',
        costSpike: '+$1,820 / Hour',
        blackoutRisk: 'CATASTROPHIC (96% Grid Cap)',
        co2Spike: '+3,600 kg CO2 / Day',
        status: 'Condenser Ingestion Thermal Lockout'
      },
      thermoShift: {
        peakPower: '680 kW (Modulated)',
        indoorTemp: '23.1°C (Compliant)',
        costSaved: '$1,380 / Hour Shaved',
        blackoutRisk: 'ZERO (Plume Shield Active)',
        co2Avoided: '2,900 kg CO2 / Day',
        status: 'AHU Dynamic Plume Shield & Pre-Cooled Slabs'
      }
    },
    nyc_midtown_blackout: {
      title: 'Grand Central / Lexington Ave High Thermal Mass Heatwave (+41.8°C)',
      location: 'Grand Central Plaza Core, Midtown East, NY',
      ambientTemp: '41.8°C (107.2°F)',
      solarFlux: '990 W/m² (Limestone Heat Retention)',
      asphaltTemp: '56.8°C Subway Grate Thermal Pockets',
      gridRate: '$0.54 / kWh ConEd Demand Surcharge',
      legacyBms: {
        peakPower: '1,920 kW',
        indoorTemp: '27.9°C (Overheating)',
        costSpike: '+$1,280 / Hour',
        blackoutRisk: 'HIGH (88% Overload)',
        co2Spike: '+2,100 kg CO2 / Day',
        status: 'Heavy Chiller Compressor Staging'
      },
      thermoShift: {
        peakPower: '460 kW (Modulated)',
        indoorTemp: '22.9°C (Optimal)',
        costSaved: '$890 / Hour Shaved',
        blackoutRisk: 'ZERO (Core Stored Cooling)',
        co2Avoided: '1,720 kg CO2 / Day',
        status: 'Overnight Pre-Cooled Core Mass Release'
      }
    }
  };

  const profile = CRISIS_PROFILES[activeScenario];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-2xl overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl border border-rose-500/40 bg-slate-900/95 text-slate-100 shadow-2xl shadow-rose-950/60 overflow-hidden flex flex-col">
        {/* Top Emergency Pulse Bar */}
        <div className="w-full bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 h-2 animate-pulse" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-lg shadow-rose-600/30">
              <Flame className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  NYC Extreme Urban Heatwave Crisis & ConEd Grid Stress Simulator
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 font-mono text-[10px] font-bold animate-pulse">
                  CRISIS SIMULATION ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Stress-test building thermodynamics under catastrophic NYC urban canyon heat dome events.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenario Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 py-2 gap-3 overflow-x-auto">
          <button
            onClick={() => setActiveScenario('nyc_heat_dome')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeScenario === 'nyc_heat_dome'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🗽 Scenario 1: Financial Canyon Heat Dome (+42.5°C)
          </button>

          <button
            onClick={() => setActiveScenario('nyc_hudson_glare')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeScenario === 'nyc_hudson_glare'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🔥 Scenario 2: Hudson Yards Specular Glare (+44.0°C)
          </button>

          <button
            onClick={() => setActiveScenario('nyc_midtown_blackout')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeScenario === 'nyc_midtown_blackout'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            ⚡ Scenario 3: Midtown East ConEd Peak (+41.8°C)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Microclimate Telemetry Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">2m Ambient Air</span>
              <strong className="text-rose-400 text-sm font-black">{profile.ambientTemp}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Façade Solar Flux</span>
              <strong className="text-amber-400 text-sm font-black">{profile.solarFlux}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Asphalt Canyon Temp</span>
              <strong className="text-orange-400 text-sm font-black">{profile.asphaltTemp}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Peak Utility Surcharge</span>
              <strong className="text-purple-400 text-sm font-black">{profile.gridRate}</strong>
            </div>
          </div>

          {/* Side-by-Side Comparison: Blind BMS vs ThermoShift */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 🔴 Legacy Blind BMS */}
            <div className="p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-950/30 to-slate-950/80 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-500" />
                  <h4 className="text-xs font-black text-rose-400 uppercase tracking-wider">
                    Blind Traditional BMS (Legacy)
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
                  FAILED STRESS TEST
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Peak Chiller Surge:</span>
                  <strong className="text-rose-400 font-mono text-sm font-black">{profile.legacyBms.peakPower}</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Indoor Zone Temp:</span>
                  <strong className="text-rose-300 font-mono font-bold">{profile.legacyBms.indoorTemp}</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Electricity Cost Surge:</span>
                  <strong className="text-rose-400 font-mono font-bold">{profile.legacyBms.costSpike}</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Grid Blackout Hazard:</span>
                  <strong className="text-rose-500 font-mono font-black">{profile.legacyBms.blackoutRisk}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span><strong>Failure Rationale:</strong> Reactive cooling waited until afternoon heat penetrated glazing $\to$ Chiller thermal overload.</span>
                </div>
              </div>
            </div>

            {/* 🟢 ThermoShift + FortyGuard AI */}
            <div className="p-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/30 to-slate-950/80 space-y-4 shadow-xl ring-1 ring-emerald-500/20">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                    ThermoShift + FortyGuard AI
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                  PASSED (100% RESILIENT)
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Peak Chiller Power:</span>
                  <strong className="text-emerald-400 font-mono text-sm font-black">{profile.thermoShift.peakPower}</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Indoor Zone Temp:</span>
                  <strong className="text-emerald-300 font-mono font-bold">{profile.thermoShift.indoorTemp}</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Electricity Arbitrage:</span>
                  <strong className="text-emerald-400 font-mono font-bold">{profile.thermoShift.costSaved}</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Grid Blackout Hazard:</span>
                  <strong className="text-emerald-400 font-mono font-black">{profile.thermoShift.blackoutRisk}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>AI Strategy:</strong> FortyGuard predicted canyon heatwave $\to$ Pre-cooled concrete slab thermal battery at $0.11/kWh.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-800 bg-slate-950">
          <div className="text-xs text-slate-400">
            Grid Stress Metric: <strong className="text-emerald-400">1,420 kW Demand Shaved During Crisis Event</strong>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-black shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 cursor-pointer"
          >
            Apply Heatwave AI Resilience Profile
          </button>
        </div>
      </div>
    </div>
  );
}
