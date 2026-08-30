import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Zap,
  Building2,
  Activity,
  Flame,
  Leaf,
  Layers,
  Sparkles,
  Award,
  CheckCircle2,
  TrendingUp,
  Clock,
  Compass
} from 'lucide-react';
import { useVoiceAssistant } from './VoiceNarrationAssistant';

const SCENES = [
  {
    id: 1,
    timeRange: '0:00 - 0:30',
    durationSec: 30,
    title: 'The $50 Billion Urban Heat Island Blindspot',
    subtitle: 'Why Conventional Building Management Systems Fail',
    narration: 'Commercial buildings consume over 40% of global electricity, with HVAC systems driving massive peak demand charges. Today, standard building management systems rely on remote airport weather forecasts that fail to capture the localized reality: urban canyons and asphalt surfaces generate severe microclimates, raising perimeter temperatures by up to 5 degrees Celsius and triggering massive chiller spikes during expensive peak tariff hours.',
    metrics: [
      { label: 'UHI Heat Trap Flux', val: '+4.8°C Delta', color: 'text-rose-400', icon: Flame },
      { label: 'ConEd Demand Surcharge', val: '$38.50 / kW', color: 'text-amber-400', icon: Zap },
      { label: 'HVAC Energy Waste', val: '35% Overcooling', color: 'text-rose-300', icon: Activity }
    ],
    badge: '🚨 The Problem',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    keyPoints: [
      'Airport weather stations are 15 miles away and miss street canyon thermal traps.',
      'Adjacent glass towers radiate specular heat glare directly into perimeter facades.',
      'Peak cooling surcharges account for over 50% of monthly commercial utility bills.'
    ]
  },
  {
    id: 2,
    timeRange: '0:30 - 1:00',
    durationSec: 30,
    title: 'ThermoShift AI: Hyperlocal 3D Digital Twin',
    subtitle: 'Physics-Informed BIM Modeling & Solar Boundary Equations',
    narration: 'Enter ThermoShift AI: the first physics-informed microclimate digital twin for commercial real estate. By ingesting Autodesk BIM blueprints and computing Stefan-Boltzmann longwave radiation flux and Sol-Air temperatures across every facade quadrant, our engine predicts exact solar heat gain hours in advance, transforming static concrete into a proactive thermal battery.',
    metrics: [
      { label: 'Stefan-Boltzmann', val: 'q_rad = ε·σ·F12·ΔT⁴', color: 'text-cyan-400', icon: Sparkles },
      { label: 'BIM Integration', val: 'Revit / IFC 3D', color: 'text-blue-400', icon: Building2 },
      { label: 'Sol-Air Dynamic Accuracy', val: '±0.2°C Precision', color: 'text-emerald-400', icon: CheckCircle2 }
    ],
    badge: '⚡ The Solution',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    keyPoints: [
      'Real-time Autodesk BIM geometry with floor-by-floor cutaways and occupant heat tracking.',
      'Calculates dynamic Sol-Air temperatures accounting for direct irradiance and reflected glare.',
      'Models building concrete thermal mass capacitance using 1R1C differential physics.'
    ]
  },
  {
    id: 3,
    timeRange: '1:00 - 1:30',
    durationSec: 30,
    title: 'FortyGuard Microclimate Sensor Ingestion',
    subtitle: '150-Meter GIS Radius Telemetry & Radiation Modeling',
    narration: 'ThermoShift AI connects directly to FortyGuard live urban sensor streams within a 150-meter radius of the target facility. We track surrounding skyscraper surface temperatures, canyon wind shear, and thermal exhaust plumes, ensuring the central air handling units throttle intake louvers right before hot street plumes can trigger chiller surge.',
    metrics: [
      { label: 'FortyGuard Sensors', val: '150m Urban Radar', color: 'text-emerald-400', icon: Compass },
      { label: 'Plume Ingestion Guard', val: 'Louvers to 15%', color: 'text-purple-400', icon: Layers },
      { label: 'Avoided Chiller Spikes', val: '240 kW per Event', color: 'text-cyan-300', icon: Zap }
    ],
    badge: '🛰️ Data Fusion',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    keyPoints: [
      'Live OpenStreetMap GIS radius tracking 4 surrounding neighbor building surface heat loads.',
      'Identifies stagnant urban canyon heat pockets and secondary specular glare hotspots.',
      'Proactively isolates AHU outdoor dampers to avoid ingesting neighbor rooftop exhaust plumes.'
    ]
  },
  {
    id: 4,
    timeRange: '1:30 - 2:00',
    durationSec: 30,
    title: 'Autonomous 4-Stage HVAC Optimization Engine',
    subtitle: 'Free Cooling Economizer, Thermal Mass Pre-Cooling & Peak Coasting',
    narration: 'Our optimization dispatch operates continuously across 4 predictive modes. At dawn, we take advantage of low night tariffs to pre-cool the structural concrete core. During peak afternoon heatwaves, chillers throttle down by 34%, coasting on stored thermal inertia. When outdoor enthalpy drops below 46 kilojoules per kilogram, 100% free fresh air cooling engages automatically.',
    metrics: [
      { label: 'Free Air Cooling', val: '6.5 Hrs / Day', color: 'text-amber-400', icon: Leaf },
      { label: 'Pre-Cooling Charge', val: '04:00 - 08:00 AM', color: 'text-cyan-400', icon: Clock },
      { label: 'Peak Shed Coasting', val: '12:00 - 05:00 PM', color: 'text-teal-300', icon: Activity }
    ],
    badge: '⚙️ Automation',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    keyPoints: [
      'Sub-cools concrete core at $0.11/kWh off-peak rate to coast through $0.46/kWh peak surcharges.',
      'Dynamically balances 4-facade VAV damper CFM airflow to eliminate perimeter hot-spots.',
      'Maintains strict ASHRAE Standard 55 thermal comfort (-0.2 < PMV < +0.2) with zero occupant complaints.'
    ]
  },
  {
    id: 5,
    timeRange: '2:00 - 2:30',
    durationSec: 30,
    title: 'Enterprise Financial Arbitrage & Grid ROI',
    subtitle: 'ConEdison SC-9 Rate Multipliers & Payback Horizon',
    narration: 'The financial impact is immediate. For a typical 45,000 square-meter Manhattan commercial tower, ThermoShift AI shaves 460 kilowatts of peak electrical demand, saving over $348,000 annually. With zero upfront mechanical capital expenditure required, enterprise building operators achieve a complete payback in under 5 months.',
    metrics: [
      { label: 'Annual Net Savings', val: '$348,500 / yr', color: 'text-emerald-400', icon: TrendingUp },
      { label: 'Peak Demand Shaved', val: '460 kW (-34%)', color: 'text-cyan-400', icon: Zap },
      { label: 'Capital Payback Horizon', val: '< 5 Months', color: 'text-amber-300', icon: Award }
    ],
    badge: '💰 Financial ROI',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    keyPoints: [
      '37.3% utility bill reduction through automated tariff tier shifting.',
      'Unlocks NYISO Emergency Demand Response and ConEd automated capacity incentives.',
      'Non-invasive cloud software layer connecting via standard BACnet IP and Modbus TCP.'
    ]
  },
  {
    id: 6,
    timeRange: '2:30 - 3:00',
    durationSec: 30,
    title: 'Decarbonization, NYC Local Law 97 & Scalability',
    subtitle: 'Scope 2 Emission Reductions & Global Deployment Vision',
    narration: 'Finally, ThermoShift AI guarantees regulatory compliance. In New York City, our platform eliminates over 1,840 kilograms of carbon emissions daily, avoiding costly Local Law 97 penalties at $268 per ton while securing top-tier LEED and WELL building credits. ThermoShift AI: cooling our cities, protecting our power grid, and driving the future of intelligent architecture.',
    metrics: [
      { label: 'Daily CO₂ Abated', val: '1,840 kg / day', color: 'text-teal-400', icon: Leaf },
      { label: 'NYC LL97 Compliance', val: '$0 Penalties', color: 'text-emerald-400', icon: CheckCircle2 },
      { label: 'LEED & WELL Credits', val: '18 Energy Points', color: 'text-amber-400', icon: Award }
    ],
    badge: '🌱 Decarbonization',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    keyPoints: [
      'Automated Scope 2 carbon emissions audit reporting for SEC and ESG disclosures.',
      'Seamless multi-building portfolio deployment across NYC, Chicago, Dubai, and Singapore.',
      'Future-ready API connecting architects, facility directors, and HVAC plant engineers.'
    ]
  }
];

export default function ThreeMinutePitchVideoModal({ isOpen, onClose, theme = 'dark' }) {
  const isLight = theme === 'light';
  const { speak, cancelSpeech } = useVoiceAssistant();

  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sceneProgressSec, setSceneProgressSec] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const activeScene = SCENES[currentSceneIdx];
  const timerRef = useRef(null);

  // Play voice narration for current scene
  useEffect(() => {
    if (isOpen && isPlaying) {
      if (!isMuted) {
        speak(activeScene.title, activeScene.narration, { immediate: true, force: true });
      }
    } else if (!isPlaying) {
      cancelSpeech();
    }
  }, [currentSceneIdx, isPlaying, isOpen, isMuted, speak, cancelSpeech, activeScene]);

  // Handle Playback Interval Timer (0 to 30s per scene -> 3:00 total)
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSceneProgressSec((prev) => {
          if (prev >= activeScene.durationSec) {
            // Move to next scene or loop/finish
            if (currentSceneIdx < SCENES.length - 1) {
              setCurrentSceneIdx((idx) => idx + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 0;
            }
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSceneIdx, activeScene.durationSec]);

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      setCurrentSceneIdx(0);
      setSceneProgressSec(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      cancelSpeech();
    }
  }, [isOpen, cancelSpeech]);

  if (!isOpen) return null;

  // Calculate global elapsed time in seconds (0 to 180)
  const globalElapsedSec = currentSceneIdx * 30 + sceneProgressSec;
  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-5xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-cyan-500/50 text-white shadow-cyan-500/20'
      }`}>
        {/* Top Header Bar */}
        <div className="p-4 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-md shadow-cyan-500/30">
              🎬
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                ThermoShift AI • 3-Minute Executive Product Pitch Video
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold">
                  Scene {activeScene.id}/6
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Official Hackathon Product Walkthrough with Voice Narration & Live Telemetry
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Stage / Slide Canvas */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          {/* Scene Title Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border inline-block mb-1.5 ${activeScene.badgeColor}`}>
                {activeScene.badge} • {activeScene.timeRange}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {activeScene.title}
              </h2>
              <p className="text-xs text-cyan-400 font-mono mt-0.5">
                {activeScene.subtitle}
              </p>
            </div>

            <div className="text-right font-mono text-xs text-slate-400">
              <span className="text-slate-200 font-bold text-sm">{formatTime(globalElapsedSec)}</span> / 3:00
            </div>
          </div>

          {/* Key Metrics Cards for Scene */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeScene.metrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 shadow-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                    <span>{m.label}</span>
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className={`text-lg sm:text-xl font-mono font-black ${m.color}`}>
                    {m.val}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Spoken Voice Script Transcript HUD */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold">
              <div className="flex items-center gap-2">
                <Volume2 className={`w-4 h-4 ${isPlaying && !isMuted ? 'animate-bounce text-cyan-300' : 'text-slate-500'}`} />
                <span>Synchronized Voice Narration Transcript:</span>
              </div>
              {isPlaying && (
                <span className="text-[10px] text-amber-400 font-normal animate-pulse">
                  🎙️ Voice Audio Playing...
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              "{activeScene.narration}"
            </p>
          </div>

          {/* Bulleted Core Engineering Insights */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-400 font-mono tracking-wider">
              Key Engineering & Financial Highlights
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              {activeScene.keyPoints.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Video Player Control Deck */}
        <div className="p-4 px-6 bg-slate-950 border-t border-slate-800 space-y-3 select-none">
          {/* 180-Second Timeline Scrubber Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span className="text-cyan-400 font-bold">{formatTime(globalElapsedSec)}</span>
              <span>Total Video Runtime: 3:00 (180s)</span>
            </div>
            <div className="relative w-full h-2 rounded-full bg-slate-800 overflow-hidden cursor-pointer">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${(globalElapsedSec / 180) * 100}%` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Play/Pause/Prev/Next */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (currentSceneIdx > 0) {
                    setCurrentSceneIdx((idx) => idx - 1);
                    setSceneProgressSec(0);
                  }
                }}
                disabled={currentSceneIdx === 0}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 disabled:opacity-40 cursor-pointer text-xs"
                title="Previous Scene"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/25 flex items-center gap-2 cursor-pointer transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause Video' : 'Play Video'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentSceneIdx < SCENES.length - 1) {
                    setCurrentSceneIdx((idx) => idx + 1);
                    setSceneProgressSec(0);
                  }
                }}
                disabled={currentSceneIdx === SCENES.length - 1}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 disabled:opacity-40 cursor-pointer text-xs"
                title="Next Scene"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentSceneIdx(0);
                  setSceneProgressSec(0);
                  setIsPlaying(true);
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 cursor-pointer text-xs"
                title="Restart Video from 0:00"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Scene Select Jump Pills */}
            <div className="hidden lg:flex items-center gap-1">
              {SCENES.map((sc, idx) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    setCurrentSceneIdx(idx);
                    setSceneProgressSec(0);
                    setIsPlaying(true);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    currentSceneIdx === idx
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  S{sc.id} ({sc.timeRange.split(' - ')[0]})
                </button>
              ))}
            </div>

            {/* Mute Audio Toggle */}
            <button
              type="button"
              onClick={() => {
                if (!isMuted) {
                  cancelSpeech();
                  setIsMuted(true);
                } else {
                  setIsMuted(false);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                isMuted ? 'bg-rose-950/60 text-rose-300 border-rose-500/40' : 'bg-slate-900 text-cyan-300 border-slate-800 hover:text-white'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isMuted ? 'Audio Muted' : 'Narration ON'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
