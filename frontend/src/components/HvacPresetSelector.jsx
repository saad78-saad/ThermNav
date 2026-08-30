import React, { useState } from 'react';
import {
  Building2,
  Sun,
  Flame,
  Wind,
  Droplets,
  MapPin,
  Zap,
  UploadCloud,
  Sparkles,
  Clock,
  Play,
  Pause,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ThermometerSnowflake,
  BatteryCharging,
  Info
} from 'lucide-react';

const PRESETS = [
  {
    id: "nyc_financial",
    name: "One World Financial Tower",
    city: "Financial Canyon, Lower Manhattan, NY",
    climate: "Deep Urban Canyon Heat Trapping",
    icon: Building2,
    color: "from-blue-600 to-indigo-600",
    badgeColor: "bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30",
    stats: { temp: "34.5°C", peakTariff: "$0.46/kWh", solarGHI: "880 W/m²" },
    tag: "FortyGuard Canyon Thermal Trapping • ConEd Shaving"
  },
  {
    id: "nyc_hudson_yards",
    name: "30 Hudson Yards Supertall",
    city: "Hudson Yards, Midtown West, NY",
    climate: "Supertall Glass Specular Glare & Wind",
    icon: Flame,
    color: "from-amber-500 to-red-600",
    badgeColor: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
    stats: { temp: "36.8°C", peakTariff: "$0.48/kWh", solarGHI: "960 W/m²" },
    tag: "Glass Curtain Reflections & Plume Shield"
  },
  {
    id: "nyc_midtown_east",
    name: "Grand Central Plaza Core",
    city: "Midtown East / Lexington Ave, NY",
    climate: "High Thermal Mass Masonry & Asphalt",
    icon: Sun,
    color: "from-orange-500 to-amber-600",
    badgeColor: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
    stats: { temp: "35.2°C", peakTariff: "$0.44/kWh", solarGHI: "910 W/m²" },
    tag: "Limestone Heat Soak & Delayed Thermal Release"
  },
  {
    id: "nyc_brooklyn_navy",
    name: "Brooklyn Navy Yard Tech Hub",
    city: "East River Waterfront, Brooklyn, NY",
    climate: "Maritime Coastal Breeze & High Rooftop Solar",
    icon: Droplets,
    color: "from-emerald-500 to-teal-600",
    badgeColor: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
    stats: { temp: "31.8°C", peakTariff: "$0.42/kWh", solarGHI: "890 W/m²" },
    tag: "Coastal Maritime Economizer & Waterfront Cooling"
  }
];

export default function HvacPresetSelector({
  activePreset,
  onSelectPreset,
  selectedHour = 14,
  onSelectHour,
  isAutoPlaying = false,
  onToggleAutoPlay,
  hvacData,
  customBuildingPlan,
  onOpenCustomModal,
  theme = 'dark'
}) {
  const isLight = theme === 'light';
  const [showQuickGuide, setShowQuickGuide] = useState(false);

  const currentHourData = hvacData?.hourly_schedule?.[selectedHour] || {};
  const ambientTemp = currentHourData.ambient_temp_c ?? 34.2;
  const currentMode = currentHourData.mode ?? 'PEAK_SHED_COASTING';
  const currentTariff = currentHourData.tariff_rate ?? 0.46;
  const timeLabel = currentHourData.time_label ?? `${selectedHour < 10 ? '0' : ''}${selectedHour}:00`;

  return (
    <div className="space-y-4">
      {/* 💡 User-Friendly Quick-Start Guide Bar (Collapsible) */}
      <div className={`rounded-2xl border transition-all ${
        isLight ? 'bg-cyan-50/80 border-cyan-200 text-slate-800' : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200'
      }`}>
        <button
          onClick={() => setShowQuickGuide(!showQuickGuide)}
          className="w-full p-3.5 flex items-center justify-between font-bold text-xs cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>💡 New to ThermoShift? Click here for the 3-step Quick Start Guide</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-cyan-400">
            <span>{showQuickGuide ? 'Hide Guide' : 'Show Guide'}</span>
            {showQuickGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showQuickGuide && (
          <div className="p-4 pt-0 border-t border-cyan-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <strong className="text-cyan-400 block font-bold">1. Select or Upload Facility</strong>
              <p className="text-slate-400 text-[11px]">
                Choose a world city preset below or click <strong>Upload Blueprint</strong> to drop your own CAD/BIM floor plan.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <strong className="text-amber-400 block font-bold">2. Scrub the 24-Hour Horizon</strong>
              <p className="text-slate-400 text-[11px]">
                Drag the time slider below or press <strong>▶ Auto-Play</strong> to watch FortyGuard pre-cool slabs and shed peak power.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <strong className="text-emerald-400 block font-bold">3. Inspect 3D BIM & Stress Tests</strong>
              <p className="text-slate-400 text-[11px]">
                Switch to <strong>3D Autodesk BIM</strong> to slice open ducts, toggle meetings, or run the <strong>Heat Crisis</strong> test.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 🎛️ 24-HOUR HORIZON TIMELINE & SIMULATION CONTROLLER */}
      <div className={`rounded-3xl p-5 md:p-6 shadow-xl border transition-all ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800 backdrop-blur-md'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  24-Hour Microclimate Simulation Horizon
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold">
                  {timeLabel}
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Outdoor Temp: <strong className="text-rose-400 font-mono">{ambientTemp}°C</strong> • Mode: <strong className="text-cyan-400 font-bold">{currentMode}</strong> • Tariff: <strong className="text-amber-400 font-mono">${currentTariff}/kWh</strong>
              </p>
            </div>
          </div>

          {/* Quick Jump Buttons & Auto Play */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => onSelectHour && onSelectHour(5)}
              className={`px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
                selectedHour === 5
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              ❄️ 05:00 Pre-Cool
            </button>

            <button
              onClick={() => onSelectHour && onSelectHour(14)}
              className={`px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
                selectedHour === 14
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              ☀️ 14:00 Peak Heat
            </button>

            <button
              onClick={() => onSelectHour && onSelectHour(21)}
              className={`px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
                selectedHour === 21
                  ? 'bg-purple-500 text-white border-purple-400 font-black shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              🌆 21:00 Evening
            </button>

            {onToggleAutoPlay && (
              <button
                onClick={onToggleAutoPlay}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  isAutoPlaying
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white shadow-md'
                }`}
              >
                {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isAutoPlaying ? 'Pause' : 'Auto Play'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Scrubbing Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="23"
            step="1"
            value={selectedHour}
            onChange={(e) => onSelectHour && onSelectHour(parseInt(e.target.value))}
            className="w-full h-3 rounded-lg accent-cyan-400 bg-slate-800 cursor-pointer"
          />

          {/* Time Marker Labels */}
          <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
            <span>00:00 (Night Off-Peak)</span>
            <span className="text-cyan-400 font-bold">06:00 (Pre-Cool)</span>
            <span className="text-amber-400 font-bold">12:00 (On-Peak Shaving)</span>
            <span className="text-orange-400 font-bold">18:00 (Peak End)</span>
            <span>23:00 (Night)</span>
          </div>
        </div>
      </div>

      {/* 🏢 FACILITY PRESETS & CUSTOM BLUEPRINT INDICATOR */}
      <div className={`rounded-3xl p-5 md:p-6 shadow-xl border transition-all ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Select Facility Location / Microclimate Profile</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any building to simulate real utility rates and FortyGuard microclimate conditions.
            </p>
          </div>

          {onOpenCustomModal && (
            <button
              onClick={onOpenCustomModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer hover:scale-105"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Custom Blueprint</span>
            </button>
          )}
        </div>

        {/* Active Custom Building Indicator Banner if Loaded */}
        {customBuildingPlan && (
          <div className="mb-4 p-4 rounded-2xl border border-cyan-500/40 bg-cyan-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-600 text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-white">
                    CUSTOM ACTIVE PLAN: {customBuildingPlan.name}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-500 text-slate-950">
                    {customBuildingPlan.num_floors} Storeys • {customBuildingPlan.floor_area_m2?.toLocaleString()} m²
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Simulating custom ductwork ({customBuildingPlan.hvac_duct_structure?.system_type || 'VAV Network'}) & {customBuildingPlan.occupancy_peak} peak occupants.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenCustomModal}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-cyan-500/40 bg-slate-900 text-cyan-300 hover:bg-slate-800 transition-all cursor-pointer"
            >
              Edit Blueprint Specs
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = activePreset === preset.id && !customBuildingPlan;

            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
                className={`text-left relative p-4 rounded-2xl border transition-all duration-200 group overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${preset.color} opacity-${
                    isSelected ? '100' : '50'
                  } group-hover:opacity-100 transition-opacity`}
                />

                <div className="flex items-start justify-between gap-2 mb-2 pt-1">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${preset.color} text-white shadow-sm`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold leading-tight text-white">
                        {preset.name}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{preset.city}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 mb-3 font-medium line-clamp-1">
                  {preset.climate}
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800 text-[10px] font-mono">
                  <div className="text-slate-400">
                    Peak: <span className="font-semibold text-rose-400">{preset.stats.temp}</span>
                  </div>
                  <div className="text-slate-400">
                    Tariff: <span className="font-semibold text-amber-400">{preset.stats.peakTariff}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
