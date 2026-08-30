import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import CustomBuildingUploadModal from './components/CustomBuildingUploadModal';
import ErrorBoundary from './components/ErrorBoundary';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function App() {
  // Theme: 'dark' (Default high-contrast cyberpunk dark mode) | 'light'
  const [theme, setTheme] = useState('dark');

  // Navigation: 'bim' (Autodesk 3D BIM Twin - Default) | 'director' | 'technician' | 'esg'
  const [activeRole, setActiveRole] = useState('bim');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePreset, setActivePreset] = useState('nyc_financial');
  const [showApiSuiteModal, setShowApiSuiteModal] = useState(false);
  const [showUserManualModal, setShowUserManualModal] = useState(false);
  const [showCustomUploadModal, setShowCustomUploadModal] = useState(false);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showEsgModal, setShowEsgModal] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [customBuildingPlan, setCustomBuildingPlan] = useState(null);

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

  // Fetch HVAC Optimization Schedule from backend
  const fetchHvacOptimization = async (presetKey, params) => {
    setIsLoadingHvac(true);
    try {
      const res = await fetch(`${API_BASE}/api/hvac/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset_key: presetKey,
          pre_cooling_aggression: params.pre_cooling_aggression,
          economizer_max_temp_c: params.economizer_max_temp_c
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHvacData(data);
    } catch (err) {
      console.warn('[HVAC API warning] Falling back to client simulator:', err);
      // Fallback robust simulation data generator
      setHvacData(generateClientHvacFallback(presetKey, params));
    } finally {
      setIsLoadingHvac(false);
    }
  };

  useEffect(() => {
    fetchHvacOptimization(activePreset, hvacParams);
  }, [activePreset, hvacParams]);

  const handleApplyCustomSimulation = async (plan) => {
    setCustomBuildingPlan(plan);
    setIsLoadingHvac(true);
    try {
      const res = await fetch(`${API_BASE}/api/hvac/simulate-custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      });
      if (res.ok) {
        const data = await res.json();
        setHvacData(data);
        setActiveRole('bim'); // Switch directly to 3D Autodesk viewer to see reconstructed building
      }
    } catch (err) {
      console.warn('Failed custom backend simulation, using client fallback:', err);
    } finally {
      setIsLoadingHvac(false);
    }
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

      {/* Main Responsive Layout: Sidebar + Wide Content Canvas */}
      <div className="flex min-h-screen">

        {/* 📱 Mobile Backdrop Overlay */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)} 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}

        {/* ========================================================================= */}
        {/* 🧭 EXECUTIVE COMMAND SIDEBAR (LEFT FIXED / COLLAPSIBLE DRAWER) */}
        {/* ========================================================================= */}
        <aside className={`fixed lg:sticky top-0 z-50 h-screen w-72 shrink-0 border-r flex flex-col justify-between p-5 space-y-6 overflow-y-auto transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isLight ? 'bg-white/95 border-slate-200 shadow-xl' : 'bg-slate-950/95 border-slate-800 backdrop-blur-xl'
        }`}>
          
          <div className="space-y-6">
            {/* Brand Logo & Version */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/25">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-black text-sm tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
                      ThermoShift <span className="text-cyan-400">EcoBreeze</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/30">
                    FortyGuard LTM v2.4
                  </span>
                </div>
              </div>

              {/* Close Button on Mobile */}
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-xl hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Primary Views Section */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-3 pb-1">
                Main System Views
              </div>

              <button
                onClick={() => { setActiveRole('bim'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeRole === 'bim'
                    ? isLight
                      ? 'bg-slate-950 text-white font-black shadow-md'
                      : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400/40'
                    : isLight
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Box className="w-4 h-4 text-cyan-400" />
                  <span>1. 3D Autodesk BIM Twin</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-[9px] font-mono text-cyan-300 font-bold">Hero</span>
              </button>

              <button
                onClick={() => { setActiveRole('director'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeRole === 'director'
                    ? isLight
                      ? 'bg-slate-950 text-white font-black shadow-md'
                      : 'bg-cyan-500 text-slate-950 font-black shadow-md'
                    : isLight
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>2. Energy Director</span>
                </div>
              </button>

              <button
                onClick={() => { setActiveRole('technician'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeRole === 'technician'
                    ? isLight
                      ? 'bg-slate-950 text-white font-black shadow-md'
                      : 'bg-cyan-500 text-slate-950 font-black shadow-md'
                    : isLight
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>3. AHU Plant Tech</span>
                </div>
              </button>

              <button
                onClick={() => { setActiveRole('esg'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeRole === 'esg'
                    ? isLight
                      ? 'bg-slate-950 text-white font-black shadow-md'
                      : 'bg-cyan-500 text-slate-950 font-black shadow-md'
                    : isLight
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>4. Façade Solar & ESG</span>
                </div>
              </button>
            </div>

            {/* Quick Interactive Tools & Diagnostics Section */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-3 pb-1">
                Executive Tools & Suites
              </div>

              <button
                onClick={() => setShowPitchModal(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                <span>🏆 60-Sec Pitch Demo</span>
              </button>

              <button
                onClick={() => setShowCrisisModal(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-600/25 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Flame className="w-4 h-4 animate-pulse" />
                <span>🔥 Heatwave Crisis Stress</span>
              </button>

              <button
                onClick={() => setShowCustomUploadModal(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                <span>📁 Upload Custom BIM</span>
              </button>

              <button
                onClick={() => setShowEsgModal(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>📜 Official ESG Certificate</span>
              </button>

              <button
                onClick={() => setShowApiSuiteModal(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-500 hover:text-cyan-300 transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>🔬 FortyGuard API Suite (7)</span>
              </button>

              <button
                onClick={() => setShowUserManualModal(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>📖 User Manual & Specs</span>
              </button>

              <button
                onClick={() => setShowTourModal(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>💡 30-Sec Quick Tour</span>
              </button>
            </div>
          </div>

          {/* Bottom Utility & Theme Controls */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-300">FortyGuard BMS</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">ONLINE</span>
            </div>

            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-800 text-amber-300'
              }`}
            >
              {isLight ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span>{isLight ? 'Dark Cyber Mode' : 'Light Mode'}</span>
            </button>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* 💻 MAIN CONTENT WORKSPACE (EXPANDED TO FULL RIGHT WIDTH) */}
        {/* ========================================================================= */}
        <div className="flex-1 min-w-0 flex flex-col">
          
          {/* Top Mobile Bar */}
          <header className={`lg:hidden sticky top-0 z-30 flex items-center justify-between p-4 border-b backdrop-blur-md ${
            isLight ? 'bg-white/90 border-slate-200' : 'bg-slate-950/80 border-slate-800'
          }`}>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 font-bold text-xs"
            >
              <Menu className="w-5 h-5" />
              <span>Menu / Tools</span>
            </button>

            <span className={`font-black text-xs ${isLight ? 'text-slate-950' : 'text-white'}`}>
              ThermoShift <strong className="text-cyan-400">EcoBreeze</strong>
            </span>

            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400"
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </header>

          <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
            {/* Dynamic Role Views */}
            <ErrorBoundary theme={theme}>
          {/* ========================================================================= */}
          {/* 🌟 1. EXECUTIVE IMPACT COMMAND BAR (ALL CRITICAL HIGHLIGHTS ON FRONT PAGE) */}
          {/* ========================================================================= */}
          {activeRole === 'bim' && (
            <div className={`rounded-3xl p-5 sm:p-6 border shadow-2xl space-y-4 transition-all relative overflow-hidden ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900/95 border-slate-800 backdrop-blur-md'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 shrink-0">
                    <Zap className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className={`text-lg sm:text-xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
                        ThermoShift EcoBreeze Command Center
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        FORTYGUARD LTM AI RUNTIME
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        LIVE BMS CONNECTED
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Hyperlocal Microclimate Predictive Pre-Cooling, Free-Air Economizer & 3D Autodesk Digital Twin
                    </p>
                  </div>
                </div>

                {/* Quick High-Impact Triggers */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  <button
                    onClick={() => setShowPitchModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer hover:scale-105"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>🏆 Pitch Demo</span>
                  </button>
                  <button
                    onClick={() => setShowCrisisModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black shadow-md shadow-rose-600/25 transition-all cursor-pointer hover:scale-105"
                  >
                    <Flame className="w-4 h-4 animate-pulse" />
                    <span>🔥 Heat Crisis</span>
                  </button>
                  <button
                    onClick={() => setShowEsgModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 transition-all cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>ESG Cert</span>
                  </button>
                  <button
                    onClick={() => setShowCustomUploadModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-black shadow-md transition-all cursor-pointer hover:scale-105"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload BIM</span>
                  </button>
                </div>
              </div>

              {/* 5 Real-Time Key Impact Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs font-mono">
                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} space-y-1`}>
                  <div className="flex items-center justify-between text-[11px] text-cyan-400 font-bold">
                    <span>PEAK SHAVED</span>
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-lg font-black text-cyan-300">460 kW</div>
                  <div className="text-[10px] text-slate-400 font-medium">-34.2% Grid Surcharge</div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} space-y-1`}>
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                    <span>DAILY SAVINGS</span>
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-lg font-black text-emerald-400 font-mono">$418.50</div>
                  <div className="text-[10px] text-slate-400 font-medium">Off-Peak Pre-Cooling ROI</div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} space-y-1`}>
                  <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold">
                    <span>FREE AIR HOURS</span>
                    <Wind className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-lg font-black text-amber-300">6.5 Hrs/Day</div>
                  <div className="text-[10px] text-slate-400 font-medium">Compressors 0 kW (Free)</div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} space-y-1`}>
                  <div className="flex items-center justify-between text-[11px] text-teal-400 font-bold">
                    <span>CO₂ ABATED</span>
                    <Leaf className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <div className="text-lg font-black text-teal-300">1,840 kg</div>
                  <div className="text-[10px] text-slate-400 font-medium">+14 LEED Credit Pts</div>
                </div>

                <div className={`col-span-2 sm:col-span-1 p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} space-y-1`}>
                  <div className="flex items-center justify-between text-[11px] text-rose-400 font-bold">
                    <span>FORTYGUARD UHI</span>
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div className="text-lg font-black text-rose-300">+4.8°C Flux</div>
                  <div className="text-[10px] text-slate-400 font-medium">2m LTM Queued & Active</div>
                </div>
              </div>
            </div>
          )}

          {/* Primary Main View: 3D Autodesk Digital Twin & Microclimate Simulation Hero */}
          {activeRole === 'bim' && (
            <AutodeskBuildingViewer
              selectedHour={selectedHour}
              hvacData={hvacData}
              activePreset={activePreset}
              customBuildingPlan={customBuildingPlan}
              theme={theme}
            />
          )}

          {/* Preset Selector & Global 24-Hour Horizon Controller */}
          <HvacPresetSelector
            activePreset={activePreset}
            onSelectPreset={(key) => {
              setActivePreset(key);
              setCustomBuildingPlan(null); // Reset custom plan if preset selected
            }}
            selectedHour={selectedHour}
            onSelectHour={setSelectedHour}
            isAutoPlaying={isAutoPlaying}
            onToggleAutoPlay={() => setIsAutoPlaying(!isAutoPlaying)}
            hvacData={hvacData}
            customBuildingPlan={customBuildingPlan}
            onOpenCustomModal={() => setShowCustomUploadModal(true)}
            theme={theme}
          />

          {activeRole === 'director' && (
            <FacilityDirectorView
              hvacData={hvacData}
              selectedHour={selectedHour}
              currentHourData={currentHourData}
              activePreset={activePreset}
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
              theme={theme}
            />
          )}

          {activeRole === 'esg' && (
            <ZoneComfortEsgView
              hvacData={hvacData}
              selectedHour={selectedHour}
              currentHourData={currentHourData}
              activePreset={activePreset}
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
            <button
              onClick={() => setShowPitchModal(true)}
              className="hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Pitch Presentation</span>
            </button>
            <button
              onClick={() => setShowCrisisModal(true)}
              className="hover:text-rose-400 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Crisis Stress Test</span>
            </button>
            <button
              onClick={() => setShowUserManualModal(true)}
              className="hover:text-cyan-500 font-bold cursor-pointer"
            >
              User Manual
            </button>
          </div>
        </div>
      </footer>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. FORTYGUARD API SUITE MODAL */}
      <FortyGuardApiSuiteModal
        isOpen={showApiSuiteModal}
        onClose={() => setShowApiSuiteModal(false)}
        lat={customBuildingPlan?.lat || PRESET_COORDS[activePreset]?.lat || 40.7061}
        lng={customBuildingPlan?.lng || PRESET_COORDS[activePreset]?.lng || -74.0092}
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
    </div>
  );
}

// Client-side fallback generator in case backend is loading or disconnected
function generateClientHvacFallback(presetKey, params) {
  const isHudsonYards = presetKey === 'nyc_hudson_yards';
  const isMidtownEast = presetKey === 'nyc_midtown_east';
  const isBrooklynNavy = presetKey === 'nyc_brooklyn_navy';
  const isFinancial = presetKey === 'nyc_financial' || (!isHudsonYards && !isMidtownEast && !isBrooklynNavy);

  const buildingName = isHudsonYards
    ? '30 Hudson Yards Supertall (Midtown West, NY)'
    : isMidtownEast
    ? 'Grand Central Plaza Core (Midtown East, NY)'
    : isBrooklynNavy
    ? 'Brooklyn Navy Yard Tech Hub (East River Waterfront, NY)'
    : 'One World Financial Tower (Financial Canyon, Lower Manhattan, NY)';

  const hourly = [];
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
    let chiller_kw = isHudsonYards ? 520 : 380;
    if (isEcon) {
      mode = 'FREE_COOLING_ECONOMIZER';
      chiller_kw = isHudsonYards ? 35 : 25;
    } else if (isPrecool) {
      mode = 'PRE_COOLING';
      chiller_kw = isHudsonYards ? 850 : 620;
    } else if (isPeakShed) {
      mode = 'PEAK_SHED_COASTING';
      chiller_kw = isHudsonYards ? 240 : 180;
    }

    const tariff = isPrecool ? 0.11 : isPeakShed ? (isHudsonYards ? 0.48 : 0.46) : 0.22;
    const tier = isPrecool ? 'OFF_PEAK' : isPeakShed ? 'ON_PEAK' : 'MID_PEAK';
    const base_kw = isHudsonYards ? 680 : 480;

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
        ? 'FortyGuard NYC local microclimate enthalpy is low. 100% Free Fresh Air active.'
        : isPrecool
        ? 'Sub-cooling concrete core during ConEdison off-peak tariff window.'
        : isPeakShed
        ? 'Coasting on stored concrete thermal mass during ConEdison peak demand surcharge.'
        : 'Modulated variable-speed mechanical cooling.',
      damper_outdoor_pct: isEcon ? 100 : isPrecool ? 20 : isPeakShed ? 15 : 25,
      damper_recirc_pct: isEcon ? 0 : isPrecool ? 80 : isPeakShed ? 85 : 75,
      chiller_power_kw: chiller_kw,
      baseline_power_kw: base_kw,
      power_savings_kw: Math.max(0, base_kw - chiller_kw),
      thermal_storage_charge_pct: isPrecool ? 94 : isPeakShed ? 42 : 60,
      cost_optimized_usd: Math.round(chiller_kw * tariff * 100) / 100,
      cost_baseline_usd: Math.round(base_kw * tariff * 100) / 100
    });
  }

  return {
    status: 'success',
    building: { name: buildingName, city: 'New York, NY', floor_area_m2: isHudsonYards ? 45000 : 32000 },
    summary: {
      total_baseline_kwh: isHudsonYards ? 16320 : 11520,
      total_optimized_kwh: isHudsonYards ? 10880 : 7680,
      energy_saved_kwh: isHudsonYards ? 5440 : 3840,
      energy_saved_pct: 33.3,
      total_baseline_cost_usd: isHudsonYards ? 1795.2 : 1264.8,
      total_optimized_cost_usd: 792.4,
      cost_saved_usd: 472.4,
      cost_saved_pct: 37.3,
      carbon_avoided_kg_co2: 265.2,
      free_cooling_economizer_hours: 6,
      pre_cooling_hours: 4,
      peak_shed_hours: 6,
      peak_demand_shaved_kw: 320
    },
    hourly_schedule: hourly,
    facade_balance: {
      facades: [
        { orientation: 'West Façade', heat_flux_wm2: 860, exposure_level: 'CRITICAL_HIGH', vav_damper_target_pct: 94, solar_gain_kw: 980, recommendation: 'Boost VAV cooling airflow; activate smart dynamic glazing.' },
        { orientation: 'South Façade', heat_flux_wm2: 720, exposure_level: 'HIGH', vav_damper_target_pct: 78, solar_gain_kw: 790, recommendation: 'Maintain moderate cooling stage to prevent perimeter heat soak.' },
        { orientation: 'East Façade', heat_flux_wm2: 280, exposure_level: 'LOW_SHADED', vav_damper_target_pct: 35, solar_gain_kw: 230, recommendation: 'Throttle VAV damper to 35% to prevent overcooling.' },
        { orientation: 'North Façade', heat_flux_wm2: 170, exposure_level: 'MINIMAL', vav_damper_target_pct: 25, solar_gain_kw: 110, recommendation: 'Minimum ventilation flow. Heat load negligible.' }
      ]
    }
  };
}
