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
  AlertTriangle
} from 'lucide-react';
import CustomBuildingUploadModal from './components/CustomBuildingUploadModal';
import ErrorBoundary from './components/ErrorBoundary';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function App() {
  // Theme: 'dark' (Default high-contrast cyberpunk dark mode) | 'light'
  const [theme, setTheme] = useState('dark');

  // Navigation: 'bim' (Autodesk 3D BIM Twin - Default) | 'director' | 'technician' | 'esg'
  const [activeRole, setActiveRole] = useState('bim');
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

      {/* Top Navbar */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        isLight ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-slate-950/80 border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Logo & Product Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-600/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-slate-950 dark:text-white">
                  ThermoShift <span className="text-cyan-600 dark:text-cyan-400">EcoBreeze</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[10px] font-mono font-bold">
                  v2.4
                </span>
              </div>
              <p className={`text-[11px] font-medium hidden sm:block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                FortyGuard Microclimate Predictive HVAC & 3D Autodesk BIM Twin
              </p>
            </div>
          </div>

          {/* Role Navigation Buttons */}
          <div className={`hidden md:flex items-center p-1 rounded-2xl border text-xs font-bold ${
            isLight ? 'bg-slate-100/80 border-slate-300' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <button
              onClick={() => setActiveRole('director')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeRole === 'director'
                  ? isLight
                    ? 'bg-white text-slate-950 shadow-md ring-1 ring-slate-300 font-black'
                    : 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-950'
                    : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> 1. Energy Exec
            </button>
            <button
              onClick={() => setActiveRole('technician')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeRole === 'technician'
                  ? isLight
                    ? 'bg-white text-slate-950 shadow-md ring-1 ring-slate-300 font-black'
                    : 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-950'
                    : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> 2. AHU Tech
            </button>
            <button
              onClick={() => setActiveRole('esg')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeRole === 'esg'
                  ? isLight
                    ? 'bg-white text-slate-950 shadow-md ring-1 ring-slate-300 font-black'
                    : 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-950'
                    : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> 3. Façade/ESG
            </button>
            <button
              onClick={() => setActiveRole('bim')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeRole === 'bim'
                  ? isLight
                    ? 'bg-white text-slate-950 shadow-md ring-1 ring-slate-300 font-black'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md font-black'
                  : isLight
                    ? 'text-amber-800 hover:text-slate-950'
                    : 'text-amber-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" /> 4. 3D Autodesk BIM
            </button>
          </div>

          {/* Action Buttons: Pitch Demo, Heatwave Crisis, Blueprint, Manual, API Suite */}
          <div className="flex items-center gap-2">
            {/* 🏆 Hackathon Pitch Demo Trigger */}
            <button
              onClick={() => setShowPitchModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer hover:scale-105"
              title="Open 60-Second Hackathon Winning Pitch Demo"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">🏆 Pitch Demo</span>
            </button>

            {/* 🔥 Extreme Heatwave Crisis Simulator */}
            <button
              onClick={() => setShowCrisisModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-md shadow-rose-600/25 transition-all cursor-pointer hover:scale-105"
              title="Simulate +48°C Extreme Urban Heatwave Crisis"
            >
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">🔥 Heat Crisis</span>
            </button>

            {/* 📄 Official ESG Certificate */}
            <button
              onClick={() => setShowEsgModal(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-all cursor-pointer"
              title="View Verified ESG Carbon Reduction Certificate"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>ESG Cert</span>
            </button>

            {/* User Manual Button */}
            <button
              onClick={() => setShowUserManualModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Open User Manual & Quick Guide"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="hidden sm:inline">Manual</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-700'
              }`}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {isLight ? (
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>

            {/* Quick Tour Button */}
            <button
              onClick={() => setShowTourModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer shadow-sm"
              title="30-Second Quick Start Tour for Judges & Users"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Tour</span>
            </button>

            {/* Custom Building Blueprint Upload Button */}
            <button
              onClick={() => setShowCustomUploadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/25 transition-all cursor-pointer hover:scale-105"
              title="Upload Custom Building Map / HVAC Blueprint"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload Blueprint</span>
            </button>

            {/* FortyGuard Suite Modal Trigger */}
            <button
              onClick={() => setShowApiSuiteModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-sm cursor-pointer ${
                isLight
                  ? 'bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border-cyan-300'
                  : 'bg-slate-900 hover:border-cyan-500 text-cyan-300 border-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="hidden sm:inline">FortyGuard</span> API (7)
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Role Switcher */}
      <div className={`md:hidden flex items-center justify-around p-2 text-xs font-bold border-b overflow-x-auto ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <button
          onClick={() => setActiveRole('director')}
          className={`px-2.5 py-1.5 rounded-xl whitespace-nowrap ${activeRole === 'director' ? (isLight ? 'bg-slate-950 text-white font-black' : 'bg-cyan-500 text-slate-950 font-black') : 'text-slate-600 dark:text-slate-400'}`}
        >
          Director
        </button>
        <button
          onClick={() => setActiveRole('technician')}
          className={`px-2.5 py-1.5 rounded-xl whitespace-nowrap ${activeRole === 'technician' ? (isLight ? 'bg-slate-950 text-white font-black' : 'bg-cyan-500 text-slate-950 font-black') : 'text-slate-600 dark:text-slate-400'}`}
        >
          AHU Tech
        </button>
        <button
          onClick={() => setActiveRole('esg')}
          className={`px-2.5 py-1.5 rounded-xl whitespace-nowrap ${activeRole === 'esg' ? (isLight ? 'bg-slate-950 text-white font-black' : 'bg-cyan-500 text-slate-950 font-black') : 'text-slate-600 dark:text-slate-400'}`}
        >
          Façade/ESG
        </button>
        <button
          onClick={() => setActiveRole('bim')}
          className={`px-2.5 py-1.5 rounded-xl whitespace-nowrap ${activeRole === 'bim' ? (isLight ? 'bg-slate-950 text-white font-black' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black') : 'text-amber-500 dark:text-amber-400'}`}
        >
          3D BIM Twin
        </button>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Preset Selector & Global Building Status */}
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

        {/* Dynamic Role Views */}
        <ErrorBoundary theme={theme}>
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

          {activeRole === 'bim' && (
            <AutodeskBuildingViewer
              selectedHour={selectedHour}
              hvacData={hvacData}
              activePreset={activePreset}
              customBuildingPlan={customBuildingPlan}
              theme={theme}
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
