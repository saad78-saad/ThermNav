import React, { useState, useEffect, useCallback } from 'react';
import ThreeThermalBackground from './components/ThreeThermalBackground';
import HvacPresetSelector from './components/HvacPresetSelector';
import FacilityDirectorView from './components/FacilityDirectorView';
import HvacPlantTechnicianView from './components/HvacPlantTechnicianView';
import ZoneComfortEsgView from './components/ZoneComfortEsgView';
import AutodeskBuildingViewer from './components/AutodeskBuildingViewer';
import FortyGuardApiSuiteModal from './components/FortyGuardApiSuiteModal';
import UserManualModal from './components/UserManualModal';
import HackathonPitchModal from './components/HackathonPitchModal';
import ExtremeHeatCrisisModal from './components/ExtremeHeatCrisisModal';
import EsgCertificateModal from './components/EsgCertificateModal';
import QuickTourModal from './components/QuickTourModal';
import {
  Building2,
  Activity,
  Compass,
  Zap,
  Leaf,
  Wind,
  Layers,
  ThermometerSnowflake,
  ShieldCheck,
  Flame,
  Sparkles,
  Info,
  Clock,
  Play,
  Pause,
  Sun,
  Moon,
  BookOpen,
  Box,
  UploadCloud,
  Trophy,
  Award,
  AlertTriangle,
  Menu,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';
import CustomBuildingUploadModal from './components/CustomBuildingUploadModal';
import LocationBlueprintNoticeModal from './components/LocationBlueprintNoticeModal';
import PageViewInfoModal from './components/PageViewInfoModal';
import ThreeMinutePitchVideoModal from './components/ThreeMinutePitchVideoModal';
import StartupSetupPromptModal from './components/StartupSetupPromptModal';
import ErrorBoundary from './components/ErrorBoundary';
import { VoiceAssistantProvider, VoiceHoverCard, useVoiceAssistant } from './components/VoiceNarrationAssistant';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://thermshiftai-production.up.railway.app');

export default function App() {
  // Theme: 'dark' (Default high-contrast cyberpunk dark mode) | 'light'
  const [theme, setTheme] = useState('dark');

  return (
    <VoiceAssistantProvider theme={theme}>
      <AppInner theme={theme} setTheme={setTheme} />
    </VoiceAssistantProvider>
  );
}

function AppInner({ theme, setTheme }) {
  const { speak, cancelSpeech, isMuted, setIsMuted, isSpeaking } = useVoiceAssistant();

  // Navigation: 'bim' (Autodesk 3D BIM Twin - Default) | 'director' | 'technician' | 'esg'
  const [activeRole, setActiveRole] = useState('bim');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePreset, setActivePreset] = useState('nyc_financial');
  const [showStartupPromptModal, setShowStartupPromptModal] = useState(true); // Prompts on startup
  const [showApiSuiteModal, setShowApiSuiteModal] = useState(false);
  const [showUserManualModal, setShowUserManualModal] = useState(false);
  const [showCustomUploadModal, setShowCustomUploadModal] = useState(false);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [showThreeMinVideoModal, setShowThreeMinVideoModal] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showEsgModal, setShowEsgModal] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showPageInfoModal, setShowPageInfoModal] = useState(false);
  const [customBuildingPlan, setCustomBuildingPlan] = useState(null);

  // Location Blueprint Notice Modal
  const [locationNotice, setLocationNotice] = useState({ isOpen: false, locationName: '' });

  // Backend Live Heartbeat State
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [apiLatencyMs, setApiLatencyMs] = useState(null);

  // Global 24-Hour Horizon Simulation State (Shared across all roles)
  const [selectedHour, setSelectedHour] = useState(14); // 14:00 peak heat default
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // HVAC Optimization Data Store
  const [hvacData, setHvacData] = useState(null);
  const [isLoadingHvac, setIsLoadingHvac] = useState(false);
  const [hvacParams, setHvacParams] = useState({
    pre_cooling_aggression: 1.0,
    economizer_max_temp_c: 22.5
  });

  // Coordinates mapping for FortyGuard API Explorer (All NYC Microclimate Zones)
  const PRESET_COORDS = {
    nyc_financial: { lat: 40.7061, lng: -74.0092 },
    nyc_hudson_yards: { lat: 40.7536, lng: -74.0016 },
    nyc_midtown_east: { lat: 40.7527, lng: -73.9772 },
    nyc_brooklyn_navy: { lat: 40.7018, lng: -73.9723 },
  };

  // Ping Backend Health on Mount & Periodic Check
  useEffect(() => {
    const checkHealth = async () => {
      const startTime = performance.now();
      try {
        const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
        if (res.ok) {
          const latency = Math.round(performance.now() - startTime);
          setIsBackendConnected(true);
          setApiLatencyMs(latency);
        } else {
          setIsBackendConnected(false);
        }
      } catch (err) {
        setIsBackendConnected(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Auto-play 24-hour simulation slider
  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setSelectedHour((prev) => (prev + 1) % 24);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Active Location Coordinates State (Synchronized with FortyGuard & 3D Viewer)
  const [activeLocationCoords, setActiveLocationCoords] = useState({
    lat: 40.7061,
    lng: -74.0092,
    locationName: 'One World Financial Tower (Financial Canyon, Lower Manhattan, NY)'
  });

  // Fetch HVAC Optimization Schedule from backend
  const fetchHvacOptimization = async (presetKey, params, customPlan = customBuildingPlan) => {
    setIsLoadingHvac(true);
    const startTime = performance.now();
    try {
      let res;
      if (customPlan) {
        res = await fetch(`${API_BASE}/api/hvac/simulate-custom`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...customPlan,
            pre_cooling_aggression: params.pre_cooling_aggression
          })
        });
      } else {
        res = await fetch(`${API_BASE}/api/hvac/optimize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preset_key: presetKey,
            pre_cooling_aggression: params.pre_cooling_aggression,
            economizer_max_temp_c: params.economizer_max_temp_c
          })
        });
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHvacData(data);
      setIsBackendConnected(true);
      setApiLatencyMs(Math.round(performance.now() - startTime));
    } catch (err) {
      console.warn('[HVAC API warning] Falling back to client simulator:', err);
      // Fallback robust simulation data generator scaled to custom plan if active
      setHvacData(generateClientHvacFallback(presetKey, params, customPlan));
    } finally {
      setIsLoadingHvac(false);
    }
  };

  useEffect(() => {
    fetchHvacOptimization(activePreset, hvacParams, customBuildingPlan);
  }, [activePreset, hvacParams, customBuildingPlan]);

  const handleApplyCustomSimulation = async (plan) => {
    setCustomBuildingPlan(plan);
    if (plan.lat && plan.lng) {
      setActiveLocationCoords({
        lat: plan.lat,
        lng: plan.lng,
        locationName: plan.name || plan.city || 'Custom Facility'
      });
    }
    fetchHvacOptimization(activePreset, hvacParams, plan);
    setActiveRole('bim'); // Switch directly to 3D Autodesk viewer to see reconstructed building
  };

  const currentHourData = hvacData?.hourly_schedule?.[selectedHour] || {
    ambient_temp_c: 34.2,
    outdoor_enthalpy_kj_kg: 56.4,
    indoor_temp_c: 22.8,
    comfort_lower_c: 21.5,
    comfort_upper_c: 24.0,
    tariff_rate: 0.46,
    tariff_tier: 'ON_PEAK',
    tariff_currency: 'USD/kWh',
    mode: 'PEAK_SHED_COASTING',
    mode_rationale: 'Coasting on stored concrete thermal mass during peak grid surcharge.',
    damper_outdoor_pct: 15,
    damper_recirc_pct: 85,
    chiller_power_kw: 180,
    baseline_power_kw: 480,
    power_savings_kw: 300,
    thermal_storage_charge_pct: 42,
    cost_optimized_usd: 82.8,
    cost_baseline_usd: 220.8
  };

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* 3D City Skyline Background */}
      <ThreeThermalBackground theme={theme} />

      {/* ========================================================================= */}
      {/* 🌟 1. EXECUTIVE METRICS COMMAND NAVBAR (THICKER LUXURY BAR - FULL WIDTH) */}
      {/* ========================================================================= */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-all ${
        isLight ? 'bg-white/95 border-slate-200 shadow-md' : 'bg-slate-950/90 border-slate-800 shadow-2xl'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo & Mobile Drawer Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white transition-all cursor-pointer"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <VoiceHoverCard
              title="ThermoShift EcoBreeze Platform"
              voiceText="ThermoShift EcoBreeze: Hyperlocal microclimate predictive H V A C and three D Autodesk digital twin platform."
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-black text-base tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
                    ThermoShift <span className="text-cyan-400">EcoBreeze</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold">
                    v2.4 PROD
                  </span>
                </div>
              </div>
            </VoiceHoverCard>
          </div>

          {/* ⚡ CENTER LIVE METRICS PILLS IN NAVBAR (WITH VOICE HOVER TOOLTIPS) */}
          <div className="hidden md:flex items-center gap-2.5 text-xs font-mono">
            <VoiceHoverCard title="Peak Demand Reduction" voiceText="Four hundred sixty kilowatts of peak power shaved, avoiding ConEdison peak demand surcharges.">
              <div className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border shadow-sm transition-all hover:scale-105 cursor-pointer ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/50'}`}>
                <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-slate-400 text-[10px] uppercase font-bold">Peak Shaved:</span>
                <strong className="text-cyan-300 font-bold">460 kW (-34%)</strong>
              </div>
            </VoiceHoverCard>

            <VoiceHoverCard title="Daily Cost Savings" voiceText="Four hundred eighteen dollars saved today through automated off-peak thermal mass charging.">
              <div className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border shadow-sm transition-all hover:scale-105 cursor-pointer ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/50'}`}>
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400 text-[10px] uppercase font-bold">Daily ROI:</span>
                <strong className="text-emerald-400 font-bold">$418.50/day</strong>
              </div>
            </VoiceHoverCard>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 shrink-0">
            <VoiceHoverCard title="Voice Audio Guide" voiceText="Toggles automatic voice note narration on hover or replays the current speech note.">
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) {
                    cancelSpeech();
                  } else {
                    speak("Voice Guide Ready", "Hover your mouse over any metric, control, or building component to hear an audio explanation with live transcript tooltips.", { immediate: true, force: true });
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer shadow-sm ${
                  isSpeaking
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse ring-1 ring-amber-400'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-amber-400 animate-bounce' : 'text-cyan-400'}`} />
                <span className="hidden sm:inline">{isSpeaking ? 'Speaking...' : 'Voice Guide'}</span>
              </button>
            </VoiceHoverCard>

            <VoiceHoverCard title="Operational Page Guide" voiceText="Opens operational walkthrough, engineering formulas, and executive guide for the active view.">
              <button
                onClick={() => setShowPageInfoModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all cursor-pointer hover:scale-105 shadow-sm"
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">Page Guide</span>
              </button>
            </VoiceHoverCard>
          </div>
        </div>
      </header>

      {/* Main Responsive Layout */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className={`fixed lg:sticky top-20 z-40 h-[calc(100vh-5rem)] w-64 xl:w-72 shrink-0 border-r flex flex-col justify-between p-4 space-y-5 overflow-y-auto transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isLight ? 'bg-white/95 border-slate-200 shadow-xl' : 'bg-slate-950/95 border-slate-800 backdrop-blur-xl'}`}>
          <div className="space-y-5">
            {/* Primary Views Section */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2 pb-1">Main System Views</div>

              <VoiceHoverCard title="3D Autodesk BIM Twin" voiceText="Interactive three D building digital twin with solar radiation heat flux and floor cutaway slicer.">
                <button
                  onClick={() => { setActiveRole('bim'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    activeRole === 'bim'
                      ? isLight ? 'bg-slate-950 text-white font-black shadow-md' : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400/40'
                      : isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Box className="w-4 h-4" />
                    <span>3D Autodesk Twin</span>
                  </div>
                </button>
              </VoiceHoverCard>

              <VoiceHoverCard title="Facility Executive Dashboard" voiceText="Executive financial arbitrage tracking ConEdison peak demand charges and energy savings.">
                <button
                  onClick={() => { setActiveRole('director'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    activeRole === 'director'
                      ? isLight ? 'bg-slate-950 text-white font-black shadow-md' : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/40'
                      : isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4" />
                    <span>Facility Director</span>
                  </div>
                </button>
              </VoiceHoverCard>

              <VoiceHoverCard title="Central Plant Telemetry" voiceText="Mechanical engineering view with chiller C O P curves, psychrometric enthalpy, and damper modulation.">
                <button
                  onClick={() => { setActiveRole('technician'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    activeRole === 'technician'
                      ? isLight ? 'bg-slate-950 text-white font-black shadow-md' : 'bg-gradient-to-r from-indigo-400 to-purple-500 text-slate-950 font-black shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/40'
                      : isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4" />
                    <span>Plant Technician</span>
                  </div>
                </button>
              </VoiceHoverCard>

              <VoiceHoverCard title="Zone Comfort and ESG" voiceText="A S H R A E Standard fifty-five thermal comfort and Local Law ninety-seven decarbonization compliance tracker.">
                <button
                  onClick={() => { setActiveRole('esg'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    activeRole === 'esg'
                      ? isLight ? 'bg-slate-950 text-white font-black shadow-md' : 'bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 font-black shadow-lg shadow-teal-500/25 ring-2 ring-teal-400/40'
                      : isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4" />
                    <span>Zone Comfort & ESG</span>
                  </div>
                </button>
              </VoiceHoverCard>
            </div>

            {/* Quick Core Actions */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2 pb-1">
                Video Pitch & Setup
              </div>

              <VoiceHoverCard
                title="3-Minute Executive Product Pitch Video"
                voiceText="Watch the complete three-minute product pitch video with synchronized voice narration, architectural animations, and financial ROI breakdown."
              >
                <button
                  onClick={() => setShowThreeMinVideoModal(true)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 hover:scale-[1.02] transition-all cursor-pointer ring-1 ring-cyan-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-white/20">🎬</span>
                    <span>3-Min Product Video</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[9px] font-mono font-bold">▶ Play</span>
                </button>
              </VoiceHoverCard>

              <VoiceHoverCard
                title="Custom Location & 3D Blueprint Setup"
                voiceText="Enter your custom facility address or upload a 3D CAD/BIM blueprint to run live calculations."
              >
                <button
                  onClick={() => setShowStartupPromptModal(true)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md shadow-emerald-500/20 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>🌍</span>
                    <span>Custom Site & 3D Setup</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-slate-950/20 text-[9px] font-mono font-bold">Setup</span>
                </button>
              </VoiceHoverCard>
            </div>
          </div>

          {/* Bottom BMS Connection Indicator */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-300">FortyGuard BMS</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">ONLINE</span>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay Backdrop */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity cursor-pointer"
          />
        )}

        {/* ========================================================================= */}
        {/* 💻 MAIN CONTENT WORKSPACE (EXPANDED TO FULL RIGHT WIDTH) */}
        {/* ========================================================================= */}
        <div className="flex-1 min-w-0 flex flex-col">
          <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5 flex-1">
            {/* Dynamic Role Views */}
            <ErrorBoundary theme={theme}>
              {/* Primary Main View: 3D Autodesk Digital Twin & Microclimate Simulation Hero */}
              {activeRole === 'bim' && (
                <AutodeskBuildingViewer
                  selectedHour={selectedHour}
                  onSelectHour={setSelectedHour}
                  isAutoPlaying={isAutoPlaying}
                  onToggleAutoPlay={() => setIsAutoPlaying(!isAutoPlaying)}
                  hvacData={hvacData}
                  activePreset={activePreset}
                  onSelectPreset={(key) => {
                    setActivePreset(key);
                    setCustomBuildingPlan(null);
                    const presetLabels = {
                      nyc_financial: 'One World Financial Tower (Financial Canyon, NY)',
                      nyc_hudson_yards: '30 Hudson Yards Supertall (Midtown West, NY)',
                      nyc_midtown_east: 'Grand Central Plaza Core (Midtown East, NY)',
                      nyc_brooklyn_navy: 'Brooklyn Navy Yard Tech Hub (East River Waterfront, NY)'
                    };
                    setLocationNotice({ isOpen: true, locationName: presetLabels[key] || key });
                  }}
                  customBuildingPlan={customBuildingPlan}
                  theme={theme}
                  onLocationNotice={(locName) => setLocationNotice({ isOpen: true, locationName: locName })}
                  onOpenUploadModal={() => setShowCustomUploadModal(true)}
                  onOpenApiModal={() => setShowApiSuiteModal(true)}
                  onLocationChange={(coords) => {
                    if (coords && coords.lat && coords.lng) {
                      setActiveLocationCoords({
                        lat: coords.lat,
                        lng: coords.lng,
                        locationName: coords.locationName || coords.name || 'Selected Location'
                      });
                    }
                  }}
                />
              )}

          {activeRole === 'director' && (
            <FacilityDirectorView
              hvacData={hvacData}
              selectedHour={selectedHour}
              currentHourData={currentHourData}
              activePreset={activePreset}
              customBuildingPlan={customBuildingPlan}
              theme={theme}
              onOpenCrisisModal={() => setShowCrisisModal(true)}
            />
          )}

          {activeRole === 'technician' && (
            <HvacPlantTechnicianView
              hvacData={hvacData}
              selectedHour={selectedHour}
              currentHourData={currentHourData}
              hvacParams={hvacParams}
              onUpdateParams={setHvacParams}
              activePreset={activePreset}
              customBuildingPlan={customBuildingPlan}
              theme={theme}
            />
          )}

          {activeRole === 'esg' && (
            <ZoneComfortEsgView
              hvacData={hvacData}
              selectedHour={selectedHour}
              currentHourData={currentHourData}
              activePreset={activePreset}
              customBuildingPlan={customBuildingPlan}
              theme={theme}
              onOpenEsgModal={() => setShowEsgModal(true)}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className={`border-t py-8 mt-12 transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-900 text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">ThermoShift EcoBreeze</span>
            <span>• Powered by FortyGuard Hyperlocal Microclimate LTM Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowApiSuiteModal(true)} className="hover:text-cyan-400">
              FortyGuard API
            </button>
            <button onClick={() => setShowUserManualModal(true)} className="hover:text-cyan-400">
              User Manual
            </button>
          </div>
        </div>
      </footer>
        </div>
      </div>

      {/* MODALS */}
      {/* 0. 🌍 STARTUP CUSTOM LOCATION & 3D BLUEPRINT SETUP PROMPT MODAL */}
      <StartupSetupPromptModal
        isOpen={showStartupPromptModal}
        onClose={() => setShowStartupPromptModal(false)}
        onApplyLocationAndBlueprint={({ location, coords, customPlan }) => {
          if (coords) {
            setActiveLocationCoords(coords);
          }
          if (customPlan) {
            handleApplyCustomSimulation(customPlan);
          } else if (coords) {
            fetchHvacOptimization(activePreset, hvacParams, null);
          }
          setActiveRole('bim');
        }}
        onOpenUploadModal={() => setShowCustomUploadModal(true)}
        theme={theme}
      />

      {/* 1. FORTYGUARD API SUITE MODAL */}
      <FortyGuardApiSuiteModal
        isOpen={showApiSuiteModal}
        onClose={() => setShowApiSuiteModal(false)}
        lat={activeLocationCoords.lat}
        lng={activeLocationCoords.lng}
        locationName={activeLocationCoords.locationName}
        theme={theme}
      />

      {/* 2. USER MANUAL MODAL */}
      <UserManualModal
        isOpen={showUserManualModal}
        onClose={() => setShowUserManualModal(false)}
        theme={theme}
      />

      {/* 3. CUSTOM BUILDING & HVAC BLUEPRINT UPLOAD MODAL */}
      <CustomBuildingUploadModal
        isOpen={showCustomUploadModal}
        onClose={() => setShowCustomUploadModal(false)}
        onApplyCustomSimulation={handleApplyCustomSimulation}
        theme={theme}
      />

      {/* 4. 🏆 HACKATHON PITCH MODAL */}
      <HackathonPitchModal
        isOpen={showPitchModal}
        onClose={() => setShowPitchModal(false)}
        theme={theme}
      />

      {/* 5. 🔥 EXTREME HEATWAVE CRISIS SIMULATOR */}
      <ExtremeHeatCrisisModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
        theme={theme}
      />

      {/* 🎬 3-MINUTE EXECUTIVE PRODUCT PITCH VIDEO MODAL */}
      <ThreeMinutePitchVideoModal
        isOpen={showThreeMinVideoModal}
        onClose={() => setShowThreeMinVideoModal(false)}
        theme={theme}
      />

      {/* 6. 📄 VERIFIED ESG CERTIFICATE MODAL */}
      <EsgCertificateModal
        isOpen={showEsgModal}
        onClose={() => setShowEsgModal(false)}
        buildingName={customBuildingPlan?.name || hvacData?.building?.name || 'One World Financial Tower'}
        city={customBuildingPlan?.city || hvacData?.building?.city || 'New York, NY'}
        annualKwhSaved={hvacData ? `${(hvacData.summary.energy_saved_kwh * 365).toLocaleString()} kWh` : '748,900 kWh'}
        annualCostSaved={hvacData ? `$${Math.round(hvacData.summary.cost_saved_usd * 365).toLocaleString()} USD` : '$348,000 USD'}
        annualCarbonAvoided={hvacData ? `${Math.round((hvacData.summary.carbon_avoided_kg_co2 * 365) / 1000).toLocaleString()} tCO2e` : '360.5 tCO2e'}
        theme={theme}
      />

      {/* 7. 💡 QUICK TOUR GUIDED WALKTHROUGH */}
      <QuickTourModal
        isOpen={showTourModal}
        onClose={() => setShowTourModal(false)}
        theme={theme}
        onNavigateToBim={() => setActiveRole('bim')}
      />

      {/* 8. 🏢 LOCATION BLUEPRINT ARCHITECTURAL NOTICE MODAL */}
      <LocationBlueprintNoticeModal
        isOpen={locationNotice.isOpen}
        locationName={locationNotice.locationName}
        onClose={() => setLocationNotice({ isOpen: false, locationName: '' })}
        onOpenUploadModal={() => setShowCustomUploadModal(true)}
        theme={theme}
      />

      {/* 10. ℹ️ DYNAMIC VIEW GUIDE & EXPLANATION MODAL */}
      <PageViewInfoModal
        isOpen={showPageInfoModal}
        onClose={() => setShowPageInfoModal(false)}
        roleKey={activeRole}
        theme={theme}
      />
    </div>
  );
}

// Client-side fallback generator in case backend is loading or disconnected
function generateClientHvacFallback(presetKey, params, customPlan = null) {
  const isCustom = Boolean(customPlan);
  const isHudsonYards = !isCustom && presetKey === 'nyc_hudson_yards';
  const isMidtownEast = !isCustom && presetKey === 'nyc_midtown_east';
  const isBrooklynNavy = !isCustom && presetKey === 'nyc_brooklyn_navy';

  const buildingName = isCustom
    ? (customPlan.name || 'Custom High-Performance Digital Twin')
    : isHudsonYards
    ? '30 Hudson Yards Supertall (Midtown West, NY)'
    : isMidtownEast
    ? 'Grand Central Plaza Core (Midtown East, NY)'
    : isBrooklynNavy
    ? 'Brooklyn Navy Yard Tech Hub (East River Waterfront, NY)'
    : 'One World Financial Tower (Financial Canyon, Lower Manhattan, NY)';

  const floorArea = isCustom
    ? (customPlan.floor_area_m2 || customPlan.area || 28000)
    : (isHudsonYards ? 45000 : isMidtownEast ? 38000 : isBrooklynNavy ? 22000 : 32000);

  const chillerCap = isCustom
    ? (customPlan.chiller_capacity_kw || customPlan.chiller || 2600)
    : (isHudsonYards ? 3800 : isMidtownEast ? 3100 : isBrooklynNavy ? 1800 : 2600);

  const numFloors = isCustom
    ? (customPlan.num_floors || customPlan.floors || 10)
    : (isHudsonYards ? 73 : isMidtownEast ? 52 : isBrooklynNavy ? 12 : 45);

  const areaScale = Math.max(0.2, floorArea / 32000);
  const base_kw = Math.round((isHudsonYards ? 680 : 480) * areaScale);

  const hourly = [];
  let totalBaseKwh = 0;
  let totalOptKwh = 0;
  let totalBaseCost = 0;
  let totalOptCost = 0;
  let peakShaved = 0;

  for (let h = 0; h < 24; h++) {
    const t_amb = isHudsonYards
      ? 23 + 13.8 * Math.sin((h - 8) * 0.25)
      : isMidtownEast
      ? 22 + 13.2 * Math.sin((h - 8) * 0.25)
      : isBrooklynNavy
      ? 20 + 11.8 * Math.sin((h - 8) * 0.25)
      : 22.5 + 13.3 * Math.sin((h - 8) * 0.25);

    const rh = isBrooklynNavy ? 58 - 12 * Math.sin((h - 8) * 0.25) : 50 - 15 * Math.sin((h - 8) * 0.25);
    const h_out = 1.006 * t_amb + 0.012 * (2501 + 1.86 * t_amb);
    const isEcon = h_out <= 46.0 && t_amb <= (params?.economizer_max_temp_c || 22.5);
    const isPrecool = h >= 4 && h <= 8;
    const isPeakShed = h >= 12 && h <= 17;

    let mode = 'MODULATED_MECHANICAL';
    let chiller_kw = Math.round((isHudsonYards ? 520 : 380) * areaScale);
    if (isEcon) {
      mode = 'FREE_COOLING_ECONOMIZER';
      chiller_kw = Math.round(25 * areaScale);
    } else if (isPrecool) {
      mode = 'PRE_COOLING';
      chiller_kw = Math.round(620 * areaScale * (params?.pre_cooling_aggression || 1.0));
    } else if (isPeakShed) {
      mode = 'PEAK_SHED_COASTING';
      chiller_kw = Math.round(180 * areaScale);
    }

    const tariff = isPrecool ? 0.11 : isPeakShed ? (isHudsonYards ? 0.48 : 0.46) : 0.22;
    const tier = isPrecool ? 'OFF_PEAK' : isPeakShed ? 'ON_PEAK' : 'MID_PEAK';
    const optCost = Math.round(chiller_kw * tariff * 100) / 100;
    const baseCost = Math.round(base_kw * tariff * 100) / 100;

    totalBaseKwh += base_kw;
    totalOptKwh += chiller_kw;
    totalBaseCost += baseCost;
    totalOptCost += optCost;
    if (isPeakShed) {
      peakShaved = Math.max(peakShaved, base_kw - chiller_kw);
    }

    hourly.push({
      hour: h,
      time_label: `${h < 10 ? '0' : ''}${h}:00`,
      ambient_temp_c: Math.round(t_amb * 10) / 10,
      wet_bulb_temp_c: Math.round((t_amb - 4) * 10) / 10,
      relative_humidity_pct: Math.round(rh),
      outdoor_enthalpy_kj_kg: Math.round(h_out * 10) / 10,
      indoor_enthalpy_kj_kg: 45.5,
      indoor_temp_c: isPrecool ? 21.5 : isPeakShed ? 23.6 : 22.8,
      comfort_lower_c: 21.5,
      comfort_upper_c: 24.0,
      tariff_rate: tariff,
      tariff_tier: tier,
      tariff_currency: 'USD/kWh',
      mode: mode,
      mode_rationale: isEcon
        ? 'FortyGuard local microclimate enthalpy is low. 100% Free Fresh Air active.'
        : isPrecool
        ? 'Sub-cooling concrete core during off-peak tariff window.'
        : isPeakShed
        ? 'Coasting on stored concrete thermal mass during peak demand surcharge.'
        : 'Modulated variable-speed mechanical cooling.',
      damper_outdoor_pct: isEcon ? 100 : isPrecool ? 20 : isPeakShed ? 15 : 25,
      damper_recirc_pct: isEcon ? 0 : isPrecool ? 80 : isPeakShed ? 85 : 75,
      chiller_power_kw: chiller_kw,
      baseline_power_kw: base_kw,
      power_savings_kw: Math.max(0, base_kw - chiller_kw),
      thermal_storage_charge_pct: isPrecool ? 94 : isPeakShed ? 42 : 60,
      cost_optimized_usd: optCost,
      cost_baseline_usd: baseCost
    });
  }

  const energySaved = Math.max(0, totalBaseKwh - totalOptKwh);
  const costSaved = Math.max(0, totalBaseCost - totalOptCost);

  return {
    status: 'success',
    building: {
      name: buildingName,
      city: customPlan?.city || 'New York, NY',
      floor_area_m2: floorArea,
      num_floors: numFloors,
      chiller_capacity_kw: chillerCap
    },
    summary: {
      total_baseline_kwh: Math.round(totalBaseKwh),
      total_optimized_kwh: Math.round(totalOptKwh),
      energy_saved_kwh: Math.round(energySaved),
      energy_saved_pct: Math.round((energySaved / Math.max(1, totalBaseKwh)) * 1000) / 10,
      total_baseline_cost_usd: Math.round(totalBaseCost * 10) / 10,
      total_optimized_cost_usd: Math.round(totalOptCost * 10) / 10,
      cost_saved_usd: Math.round(costSaved * 10) / 10,
      cost_saved_pct: Math.round((costSaved / Math.max(1, totalBaseCost)) * 1000) / 10,
      carbon_avoided_kg_co2: Math.round(energySaved * 0.385 * 10) / 10,
      free_cooling_economizer_hours: 6,
      pre_cooling_hours: 4,
      peak_shed_hours: 6,
      peak_demand_shaved_kw: peakShaved || Math.round(320 * areaScale)
    },
    hourly_schedule: hourly,
    facade_balance: {
      facades: [
        { orientation: 'West Façade', heat_flux_wm2: 860, exposure_level: 'CRITICAL_HIGH', vav_damper_target_pct: 94, solar_gain_kw: Math.round(980 * areaScale), recommendation: 'Boost VAV cooling airflow; activate smart dynamic glazing.' },
        { orientation: 'South Façade', heat_flux_wm2: 720, exposure_level: 'HIGH', vav_damper_target_pct: 78, solar_gain_kw: Math.round(790 * areaScale), recommendation: 'Maintain moderate cooling stage to prevent perimeter heat soak.' },
        { orientation: 'East Façade', heat_flux_wm2: 280, exposure_level: 'LOW_SHADED', vav_damper_target_pct: 35, solar_gain_kw: Math.round(230 * areaScale), recommendation: 'Throttle VAV damper to 35% to prevent overcooling.' },
        { orientation: 'North Façade', heat_flux_wm2: 170, exposure_level: 'MINIMAL', vav_damper_target_pct: 25, solar_gain_kw: Math.round(110 * areaScale), recommendation: 'Minimum ventilation flow. Heat load negligible.' }
      ]
    }
  };
}
