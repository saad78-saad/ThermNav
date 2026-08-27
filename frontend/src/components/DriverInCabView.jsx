import React, { useState, useEffect } from 'react';
import { Truck, Play, Pause, RotateCcw, Navigation, AlertTriangle, ShieldCheck, CheckCircle2, Clock, Flame, Activity, Compass, MapPin, Radio, Gauge, Droplet } from 'lucide-react';
import InteractiveThermalMap from './InteractiveThermalMap';

export default function DriverInCabView({
  order,
  routeSegments = [],
  plantCoords,
  siteCoords,
  onCompleteOrder,
  theme = 'dark',
}) {
  const isLight = theme === 'light';
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0.15); // 0 to 1
  const [speed, setSpeed] = useState(1);
  const [drumRPM, setDrumRPM] = useState(14); // Standard transit agitation RPM
  const [driverSlumpInput, setDriverSlumpInput] = useState(150);

  // Flatten all route points to compute live driver GPS coordinates
  const allPoints = React.useMemo(() => {
    if (!routeSegments || routeSegments.length === 0) {
      // Fallback New York route points from Queens to Hudson Yards
      return [
        { lat: 40.7447, lng: -73.9485 },
        { lat: 40.7510, lng: -73.9550 },
        { lat: 40.7580, lng: -73.9620 },
        { lat: 40.7540, lng: -73.9780 },
        { lat: 40.7520, lng: -73.9920 },
        { lat: 40.7538, lng: -74.0022 },
      ];
    }
    return routeSegments.flatMap(s => s.path || []);
  }, [routeSegments]);

  // Compute live current driver GPS location based on progress
  const currentDriverGPS = React.useMemo(() => {
    if (allPoints.length === 0) return { lat: 40.7447, lng: -73.9485 };
    if (progress <= 0) return allPoints[0];
    if (progress >= 1) return allPoints[allPoints.length - 1];

    const totalSegments = allPoints.length - 1;
    const exactIndex = progress * totalSegments;
    const index = Math.floor(exactIndex);
    const fraction = exactIndex - index;

    const p1 = allPoints[index];
    const p2 = allPoints[Math.min(index + 1, allPoints.length - 1)];

    return {
      lat: Number((p1.lat + (p2.lat - p1.lat) * fraction).toFixed(6)),
      lng: Number((p1.lng + (p2.lng - p1.lng) * fraction).toFixed(6)),
    };
  }, [allPoints, progress]);

  // Driving Animation Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const step = 0.005 * speed;
        if (prev + step >= 1.0) {
          setIsPlaying(false);
          return 1.0;
        }
        return prev + step;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const totalTransitMins = 24;
  const elapsedMins = Math.round(progress * totalTransitMins);
  const remainingMins = Math.max(0, totalTransitMins - elapsedMins);
  const countdownASTM = Math.max(0, 90 - elapsedMins);
  const currentVehicleSpeed = isPlaying ? Math.round(38 + Math.sin(progress * 10) * 8) : 0;

  // Concrete mix temperature rise
  const initialBatchTemp = order?.batch_temp_celsius || 28.5;
  const tempRise = (progress * 2.8).toFixed(1);
  const currentMixTemp = (Number(initialBatchTemp) + Number(tempRise)).toFixed(1);

  // Slump loss
  const currentSlump = Math.max(80, Math.round(160 - progress * 38));

  // Turn-by-turn navigation steps based on progress
  const navSteps = [
    { threshold: 0.0, street: '21st Street Arterial', instruction: 'Depart Queens Batching Plant via 21st St Northbound', distance: '0.8 mi' },
    { threshold: 0.25, street: 'Queensboro Bridge (Lower Deck)', instruction: 'Merge onto Queensboro Bridge Lower Deck (Caution: Elevated 32°C Deck Heat)', distance: '1.4 mi' },
    { threshold: 0.55, street: '34th Street Manhattan Canyon', instruction: 'Exit onto 2nd Ave ➔ Cross Town via 34th St (Dense High-Rise Radiant Heat)', distance: '2.1 mi' },
    { threshold: 0.85, street: '11th Avenue Corridor', instruction: 'Turn Right onto 11th Ave ➔ Approach Hudson Yards Commercial Gate 4', distance: '0.4 mi' },
    { threshold: 1.0, street: 'Hudson Yards Pour Site', instruction: 'Arrived at Site Pour Point. Position Chute for Discharge.', distance: '0.0 mi' },
  ];

  const currentNavStep = navSteps.slice().reverse().find(s => progress >= s.threshold) || navSteps[0];

  return (
    <div className="space-y-6">
      {/* Top Driver In-Cab Header Bar */}
      <div className={`animate-stagger-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border rounded-3xl p-6 shadow-2xl transition-all duration-300 ${
        isLight
          ? 'bg-white border-slate-200 shadow-slate-200/60'
          : 'bg-gradient-to-r from-slate-900 via-[#101826] to-slate-900 border-white/10'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-600 text-white shadow-xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${
                isLight ? 'bg-sky-100 text-sky-800 border-sky-300' : 'bg-sky-950 text-sky-300 border-sky-700'
              }`}>
                Mixer Fleet #402
              </span>
              <h2 className="text-xl font-bold font-sans-luxury tracking-wide uppercase">
                Driver In-Cab Telemetry & GPS Navigation
              </h2>
            </div>
            <p className={`text-xs mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Mission: <span className="font-semibold text-current">{order?.name || 'Hudson Yards Commercial Tower'}</span> • Driver: J. Miller (ID #84)
            </p>
          </div>
        </div>

        {/* Live Trip Driving Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold font-sans-luxury text-xs tracking-wider transition-all shadow-xl cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/50 animate-pulse'
                : 'bg-gradient-to-r from-emerald-600 via-sky-600 to-emerald-500 hover:brightness-110 text-white shadow-sky-950/50'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" /> Pause Travel
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> {progress >= 1 ? 'Replay Route' : 'Go on Travel / Drive'}
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setProgress(0);
            }}
            title="Reset to Origin Plant"
            className={`p-3.5 rounded-2xl border transition-colors cursor-pointer ${
              isLight ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200' : 'bg-zinc-900 hover:bg-slate-700 text-zinc-300 border-zinc-700'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className={`flex items-center border rounded-2xl p-1 text-xs ${
            isLight ? 'bg-slate-100 border-slate-300' : 'bg-zinc-900 border-zinc-700'
          }`}>
            {[1, 2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1.5 rounded-xl font-mono font-bold transition-all ${
                  speed === s
                    ? 'bg-blue-600 text-white shadow'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-zinc-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live GPS Telemetry Status Strip */}
      <div className={`animate-stagger-2 grid grid-cols-2 sm:grid-cols-5 gap-3 border p-4 rounded-3xl text-xs font-mono transition-all duration-300 ${
        isLight ? 'bg-white border-slate-200 shadow-sm text-slate-700' : 'bg-zinc-950/90 border-white/10 text-zinc-300'
      }`}>
        <div>
          <span className="opacity-60 text-[10px] uppercase block">Current Road</span>
          <span className="text-amber-500 font-bold truncate block">{currentNavStep.street}</span>
        </div>
        <div>
          <span className="opacity-60 text-[10px] uppercase block">Live Latitude</span>
          <span className="text-emerald-500 font-bold">{currentDriverGPS.lat}° N</span>
        </div>
        <div>
          <span className="opacity-60 text-[10px] uppercase block">Live Longitude</span>
          <span className="text-emerald-500 font-bold">{currentDriverGPS.lng}° W</span>
        </div>
        <div>
          <span className="opacity-60 text-[10px] uppercase block">Vehicle Speed</span>
          <span className="text-amber-500 font-bold">{currentVehicleSpeed} km/h</span>
        </div>
        <div>
          <span className="opacity-60 text-[10px] uppercase block">Mission Progress</span>
          <span className="text-blue-500 font-bold">{Math.round(progress * 100)}% Complete</span>
        </div>
      </div>

      {/* Main Grid: Left Navigation & Map (7 cols) + Right In-Cab Sensor HUD (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map & Turn-by-Turn HUD (7 cols) */}
        <div className="lg:col-span-7 space-y-4 animate-stagger-3">
          {/* Turn-by-Turn Instruction Banner */}
          <div className={`flex items-center justify-between p-5 rounded-3xl border shadow-xl transition-all duration-300 ${
            isLight
              ? 'bg-gradient-to-r from-blue-50 via-sky-50 to-white border-blue-200'
              : 'bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border-blue-800/80'
          }`}>
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg">
                <Navigation className="w-6 h-6 transform rotate-45" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold font-sans-luxury text-sky-500 tracking-wider">
                  Next GPS Navigation Maneuver
                </div>
                <div className="text-sm font-bold mt-0.5">
                  {currentNavStep.instruction}
                </div>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>In</div>
              <div className="text-lg font-bold text-sky-500">{currentNavStep.distance}</div>
            </div>
          </div>

          {/* Interactive Travel Scrubber Slider */}
          <div className={`p-4 rounded-3xl border space-y-2 transition-all duration-300 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-zinc-800'
          }`}>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className={`flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                <span>🏗️ {order?.plant_name || 'Queens Batch Plant'}</span>
              </span>
              <span className="text-sky-500 font-bold font-sans-luxury text-[11px]">
                Position: {Math.round(progress * 100)}%
              </span>
              <span className={`flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                <span>📍 {order?.site_name || 'Hudson Yards'}</span>
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.002"
              value={progress}
              onChange={(e) => setProgress(parseFloat(e.target.value))}
              className="w-full h-3 bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {/* Interactive NYC Thermal Map with Live Truck */}
          <InteractiveThermalMap
            routeSegments={routeSegments}
            plantCoords={plantCoords || { lat: 40.7447, lng: -73.9485 }}
            siteCoords={siteCoords || { lat: 40.7538, lng: -74.0022 }}
            truckProgress={progress}
            isPlaying={isPlaying}
            selectedHourLabel="14:00 EDT"
            showHeatmap={true}
            theme={theme}
          />
        </div>

        {/* Right: In-Cab Live Concrete Telemetry Gauges & Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-6 animate-stagger-4">
          {/* ASTM C94 Legal Hydration Countdown Clock */}
          <div className={`rounded-3xl border p-6 shadow-2xl space-y-4 transition-all duration-300 ${
            isLight ? 'bg-white border-slate-200 shadow-slate-200/60' : 'bg-[#141618]/95 border-white/10 backdrop-blur-xl'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-100' : 'border-zinc-800'}`}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold font-sans-luxury uppercase tracking-wider">
                  ASTM C94 Hydration Countdown
                </h3>
              </div>
              <span className={`text-[10px] font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>90 Min Max</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-mono font-extrabold text-emerald-500">
                  {countdownASTM} <span className="text-sm font-normal opacity-70">mins left</span>
                </div>
                <div className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Elapsed Transit: <span className="font-mono font-bold text-current">{elapsedMins} min</span>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>ETA to Pour Point</div>
                <div className="text-xl font-bold text-sky-500">{remainingMins} min</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700/30 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 via-sky-500 to-amber-500 h-full transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          {/* Core Concrete Quality Telemetry HUD */}
          <div className={`rounded-3xl border p-6 shadow-2xl space-y-4 transition-all duration-300 ${
            isLight ? 'bg-white border-slate-200 shadow-slate-200/60' : 'bg-[#141618]/95 border-white/10 backdrop-blur-xl'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-100' : 'border-zinc-800'}`}>
              <h3 className="text-xs font-bold font-sans-luxury uppercase tracking-wider">
                Concrete Quality Telemetry
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                isLight ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-sky-950 text-sky-400 border-sky-800'
              }`}>
                Drum: {drumRPM} RPM
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Mix Temperature */}
              <div className={`p-4 rounded-2xl border space-y-1 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-zinc-700/70'
              }`}>
                <div className="flex justify-between text-[11px] opacity-70">
                  <span>Mix Temp (Tc)</span>
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-2xl font-mono font-bold text-amber-500">
                  {currentMixTemp}°C
                </div>
                <div className="text-[10px] opacity-60">
                  Initial: {initialBatchTemp}°C (+{tempRise}°C)
                </div>
              </div>

              {/* Slump Workability */}
              <div className={`p-4 rounded-2xl border space-y-1 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-zinc-700/70'
              }`}>
                <div className="flex justify-between text-[11px] opacity-70">
                  <span>Live Slump</span>
                  <Activity className="w-3.5 h-3.5 text-sky-500" />
                </div>
                <div className="text-2xl font-mono font-bold text-sky-500">
                  {currentSlump} <span className="text-xs font-normal opacity-70">mm</span>
                </div>
                <div className="text-[10px] opacity-60">
                  Spec: &gt; 100mm
                </div>
              </div>
            </div>

            {/* Direct Driver Inputs: Drum Speed & Slump Log */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/50 border-zinc-700/70'
            }`}>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span>Mixer Drum Speed Setting</span>
                <span className="font-mono text-sky-500 font-bold">{drumRPM} RPM</span>
              </div>
              <input
                type="range"
                min="2"
                max="20"
                step="1"
                value={drumRPM}
                onChange={(e) => setDrumRPM(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-700/40 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-[10px] font-mono opacity-60">
                <span>2 RPM (Slow)</span>
                <span>14 RPM (Standard)</span>
                <span>20 RPM (Fast)</span>
              </div>
            </div>

            {/* Manhattan Heat Island Warning */}
            <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
              isLight ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
            }`}>
              <div className="font-bold flex items-center gap-1.5 text-amber-500 font-sans-luxury">
                <AlertTriangle className="w-4 h-4" />
                <span>FortyGuard LTM Zone: Manhattan Heat Corridor</span>
              </div>
              <p className="text-[11px] opacity-85 leading-relaxed">
                Radiant heat flux 33.2°C detected. Keep drum rotation continuous to prevent localized setting.
              </p>
            </div>

            {/* On-Site Actions */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => onCompleteOrder && onCompleteOrder(order?.id)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-sans-luxury text-xs tracking-wider py-4 rounded-2xl transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Arrived at Site — Mark Pour Completed
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

