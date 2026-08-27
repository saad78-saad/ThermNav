import React, { useState } from 'react';
import PresetSelector, { CONSTRUCTION_PRESETS } from './PresetSelector';
import { SlidersHorizontal, ChevronDown, ChevronUp, Sparkles, Thermometer, Layers, Clock } from 'lucide-react';

export default function DispatchForm({ onSubmit, loading, theme = 'dark' }) {
  const isLight = theme === 'light';
  const [selectedPresetId, setSelectedPresetId] = useState(CONSTRUCTION_PRESETS[0].id);
  const [showAdvancedCoords, setShowAdvancedCoords] = useState(false);

  // Form State initialized to preset 1
  const [plantLat, setPlantLat] = useState(CONSTRUCTION_PRESETS[0].plant_lat);
  const [plantLng, setPlantLng] = useState(CONSTRUCTION_PRESETS[0].plant_lng);
  const [siteLat, setSiteLat] = useState(CONSTRUCTION_PRESETS[0].site_lat);
  const [siteLng, setSiteLng] = useState(CONSTRUCTION_PRESETS[0].site_lng);
  const [batchTemp, setBatchTemp] = useState(CONSTRUCTION_PRESETS[0].batch_temp_celsius);
  const [volume, setVolume] = useState(CONSTRUCTION_PRESETS[0].volume_m3);
  const [deliveryHour, setDeliveryHour] = useState(CONSTRUCTION_PRESETS[0].target_delivery_hour);

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setPlantLat(preset.plant_lat);
    setPlantLng(preset.plant_lng);
    setSiteLat(preset.site_lat);
    setSiteLng(preset.site_lng);
    setBatchTemp(preset.batch_temp_celsius);
    setVolume(preset.volume_m3);
    setDeliveryHour(preset.target_delivery_hour);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      plant_lat: parseFloat(plantLat),
      plant_lng: parseFloat(plantLng),
      site_lat: parseFloat(siteLat),
      site_lng: parseFloat(siteLng),
      batch_temp_celsius: parseFloat(batchTemp),
      volume_m3: parseFloat(volume),
      target_delivery_hour: parseInt(deliveryHour, 10),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1-Click Preset Selector */}
      <PresetSelector
        activePresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        theme={theme}
      />

      {/* Concrete Batch Parameters (Visual Sliders / Inputs) */}
      <div className={`rounded-2xl border p-4 space-y-4 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/40 border-zinc-800'
      }`}>
        <div className="flex items-center justify-between text-xs font-bold uppercase font-sans-luxury tracking-wider opacity-70">
          <span>Batch Mix Specifications</span>
          <span className="text-amber-500 font-mono">ASTM C94 Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Initial Batch Temperature */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                <span>Initial Batch Temp (Tc)</span>
              </span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                isLight ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-amber-400 bg-amber-950/60 border-amber-800/80'
              }`}>
                {batchTemp}°C
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="40"
              step="0.5"
              value={batchTemp}
              onChange={(e) => setBatchTemp(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700/30 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-[10px] opacity-60 font-mono">
              <span>15°C (Chilled)</span>
              <span>28°C (Standard)</span>
              <span>40°C (Hot)</span>
            </div>
          </div>

          {/* Mixer Load Volume */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <Layers className="w-3.5 h-3.5 text-sky-500" />
                <span>Mixer Volume</span>
              </span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                isLight ? 'text-sky-700 bg-sky-50 border-sky-200' : 'text-sky-400 bg-sky-950/60 border-sky-800/80'
              }`}>
                {volume} m³
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700/30 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-[10px] opacity-60 font-mono">
              <span>2 m³ (Partial)</span>
              <span>6 m³ (Standard)</span>
              <span>12 m³ (Full Load)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced GPS Coordinates Toggle */}
      <div className={`border-t pt-3 ${isLight ? 'border-slate-200' : 'border-zinc-800'}`}>
        <button
          type="button"
          onClick={() => setShowAdvancedCoords(!showAdvancedCoords)}
          className={`flex items-center justify-between w-full text-xs py-1 transition-colors cursor-pointer ${
            isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1.5 font-sans-luxury">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Customize Origin & Pour GPS Coordinates</span>
          </span>
          {showAdvancedCoords ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvancedCoords && (
          <div className={`mt-3 p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/70 border-zinc-700/80'
          }`}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] opacity-70 mb-1">Batch Plant Lat</label>
                <input
                  type="number"
                  step="any"
                  value={plantLat}
                  onChange={(e) => setPlantLat(e.target.value)}
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-mono ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-zinc-950 border-zinc-700 text-white'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[11px] opacity-70 mb-1">Batch Plant Lng</label>
                <input
                  type="number"
                  step="any"
                  value={plantLng}
                  onChange={(e) => setPlantLng(e.target.value)}
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-mono ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-zinc-950 border-zinc-700 text-white'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] opacity-70 mb-1">Pour Site Lat</label>
                <input
                  type="number"
                  step="any"
                  value={siteLat}
                  onChange={(e) => setSiteLat(e.target.value)}
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-mono ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-zinc-950 border-zinc-700 text-white'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[11px] opacity-70 mb-1">Pour Site Lng</label>
                <input
                  type="number"
                  step="any"
                  value={siteLng}
                  onChange={(e) => setSiteLng(e.target.value)}
                  className={`w-full border rounded-xl px-2.5 py-1.5 text-xs font-mono ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-zinc-950 border-zinc-700 text-white'
                  }`}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Submit Optimization CTA */}
      <button
        type="submit"
        disabled={loading}
        className="w-full relative overflow-hidden bg-gradient-to-r from-amber-600 via-amber-600 to-amber-500 hover:brightness-110 disabled:opacity-50 text-white font-bold font-sans-luxury text-xs py-4 px-4 rounded-2xl transition-all shadow-xl tracking-wider flex items-center justify-center gap-2 group cursor-pointer"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Querying FortyGuard LTM Microclimate...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            <span>Run FortyGuard Thermal Dispatch Optimization</span>
          </>
        )}
      </button>
    </form>
  );
}

