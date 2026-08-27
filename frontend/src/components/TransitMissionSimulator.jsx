import React from 'react';
import { Play, Pause, RotateCcw, FastForward, ShieldAlert, CheckCircle2, Truck, Activity, Flame, Clock } from 'lucide-react';

export default function TransitMissionSimulator({
  isPlaying,
  setIsPlaying,
  progress,
  setProgress,
  speed,
  setSpeed,
  totalTransitMins = 25,
  initialBatchTemp = 28.5,
  routeSegments = [],
  currentSlot,
}) {
  // Determine current active route segment based on progress
  const currentSegmentIndex = Math.min(
    Math.floor(progress * (routeSegments.length || 1)),
    Math.max(0, routeSegments.length - 1)
  );
  const currentSegment = routeSegments[currentSegmentIndex] || {};
  const currentAmbientTemp = currentSegment.avg_temp_celsius || currentSlot?.ambient_temp_celsius || 30.0;
  const isCriticalHeat = currentSegment.classification === 'CRITICAL_THERMAL_ZONE' || currentAmbientTemp >= 34.0;

  // Real-time calculated concrete mix telemetry
  const elapsedMins = Math.round(progress * totalTransitMins);
  const remainingMins = Math.max(0, totalTransitMins - elapsedMins);
  const estimatedDistanceKm = (progress * (totalTransitMins * 0.7)).toFixed(1);
  const totalDistanceKm = (totalTransitMins * 0.7).toFixed(1);

  // Concrete thermal hydration physics
  // Mix temp rises faster in hot ambient zones + drum agitation
  const tempRise = (progress * (currentAmbientTemp > 32 ? 3.8 : 1.8)).toFixed(1);
  const currentMixTemp = (Number(initialBatchTemp) + Number(tempRise)).toFixed(1);

  // Slump loss model (starts at 150mm workable slump, drops with heat and time)
  const baseSlumpLoss = progress * (isCriticalHeat ? 48 : 22);
  const currentSlump = Math.max(75, Math.round(150 - baseSlumpLoss));

  // Drum revolution accumulation (14 rpm during transit)
  const drumRevs = Math.min(300, Math.round(elapsedMins * 14));

  return (
    <div className="rounded-2xl border border-zinc-700/80 bg-zinc-950/95 backdrop-blur-xl p-5 shadow-2xl space-y-5">
      {/* Header & Main Control Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isPlaying ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 animate-pulse' : 'bg-zinc-900 text-zinc-400'}`}>
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">Live Transit Mixer Mission</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isPlaying ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-900 text-zinc-400'}`}>
                {isPlaying ? 'Traveling' : progress >= 1 ? 'Arrived at Site' : 'Ready'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">Real-time thermal exposure & slump loss monitoring</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Main Play / Pause Button ("Go on Travel") */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40'
                : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-900/40'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" /> Pause Travel
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> {progress >= 1 ? 'Replay Travel' : 'Go on Travel'}
              </>
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={() => {
              setIsPlaying(false);
              setProgress(0);
            }}
            title="Reset to Origin Plant"
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-slate-700 text-zinc-300 border border-zinc-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-zinc-900/90 border border-zinc-700 rounded-xl p-1 text-xs">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded-lg font-mono font-semibold transition-all ${
                  speed === s ? 'bg-blue-600 text-white shadow' : 'text-zinc-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Mission Progress Scrubber */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <span>🏗️ Batching Plant</span>
            <span className="text-slate-600">({estimatedDistanceKm} km)</span>
          </span>
          <span className="text-sky-400 font-bold text-sm">
            {Math.round(progress * 100)}% Completed
          </span>
          <span className="text-zinc-400 flex items-center gap-1.5">
            <span>📍 Pour Point</span>
            <span className="text-slate-600">({totalDistanceKm} km total)</span>
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.005"
          value={progress}
          onChange={(e) => {
            setProgress(parseFloat(e.target.value));
          }}
          className="w-full h-2.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-sky-500"
        />
      </div>

      {/* Critical Heat Island Alert Banner during travel */}
      {isCriticalHeat && (
        <div className="flex items-center gap-3 bg-red-950/60 border border-red-700/80 rounded-xl p-3.5 text-red-200 animate-pulse text-xs">
          <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-bold uppercase tracking-wider text-red-300">
              Thermal Island Alert ({currentAmbientTemp}°C):
            </span>{' '}
            High solar irradiance accelerating cement hydration. Slump loss rate doubled. Maintain continuous drum agitation.
          </div>
        </div>
      )}

      {/* Live Telemetry Sensor Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Concrete Mix Temp */}
        <div className="bg-zinc-900/60 border border-zinc-700/70 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Concrete Mix Temp (Tc)</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-mono font-bold text-amber-300">
            {currentMixTemp}°C
          </div>
          <div className="text-[10px] text-zinc-500">
            +{tempRise}°C thermal rise
          </div>
        </div>

        {/* Metric 2: Live Slump */}
        <div className="bg-zinc-900/60 border border-zinc-700/70 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Workability Slump</span>
            <Activity className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className={`text-xl font-mono font-bold ${currentSlump < 100 ? 'text-red-400' : 'text-sky-300'}`}>
            {currentSlump} <span className="text-xs font-normal text-zinc-400">mm</span>
          </div>
          <div className="text-[10px] text-zinc-500">
            Initial: 150mm (Target: &gt;100mm)
          </div>
        </div>

        {/* Metric 3: Transit Window */}
        <div className="bg-zinc-900/60 border border-zinc-700/70 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Hydration Clock</span>
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-bold text-emerald-300">
            {elapsedMins} / {totalTransitMins} <span className="text-xs font-normal text-zinc-400">min</span>
          </div>
          <div className="text-[10px] text-zinc-500">
            ASTM C94 Limit: 90 min
          </div>
        </div>

        {/* Metric 4: Drum Revolutions */}
        <div className="bg-zinc-900/60 border border-zinc-700/70 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Drum Revolutions</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-mono font-bold text-blue-300">
            {drumRevs} <span className="text-xs font-normal text-zinc-400">revs</span>
          </div>
          <div className="text-[10px] text-zinc-500">
            Max Tolerance: 300 revs
          </div>
        </div>
      </div>
    </div>
  );
}
