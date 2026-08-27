import React, { useState } from 'react';
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  Building,
  Thermometer,
  Zap,
  Globe,
  Users,
  ShieldCheck,
  CheckCircle2,
  Atom,
  Clock,
  Layers,
  Box,
  Compass
} from 'lucide-react';

export default function QuickTourModal({ isOpen, onClose, theme = 'dark', onNavigateToBim }) {
  const [currentStep, setCurrentStep] = useState(0);
  const isLight = theme === 'light';

  if (!isOpen) return null;

  const tourSteps = [
    {
      id: 'step_welcome',
      title: 'Welcome to ThermoShift EcoBreeze',
      badge: 'FORTYGUARD MICROCLIMATE LTM',
      icon: Atom,
      iconColor: 'from-cyan-500 to-blue-600',
      description:
        'ThermoShift EcoBreeze connects FortyGuard’s hyperlocal urban temperature heatmaps to Autodesk CFD/Revit physics and HVAC plant control systems.',
      keyTakeaway:
        '💡 Saves commercial high-rises $350k+/year by pre-cooling building thermal mass before peak tariff hours ($0.46/kWh) and avoiding heat-island spikes.',
      details: [
        '⚡ 24/7 AI-driven thermodynamic horizon optimization',
        '🌡️ Integrates surrounding building surface heatmaps (150m radius)',
        '🏢 100% ASHRAE 55 thermal comfort compliance for occupants'
      ]
    },
    {
      id: 'step_bim_twin',
      title: '3D Autodesk BIM Twin & Active Occupants',
      badge: '3D CFD SIMULATION',
      icon: Box,
      iconColor: 'from-blue-600 to-indigo-600',
      description:
        'Inspect structural columns, concrete thermal slabs, corporate tenant mechanical systems, and active office workers inside the building.',
      keyTakeaway:
        '👥 Every floor plate renders 3D occupants with glowing amber metabolic heat halos (+120W sensible heat) and workstation dual screens.',
      details: [
        '🔪 Toggle "Cutaway ON/OFF" to slice through interior office suites',
        '🔍 Click "Zoom to People" to fly right into 3rd-floor workstations',
        '💨 Watch live cyan airflow particle streams flowing through ducts'
      ]
    },
    {
      id: 'step_gis_heatmaps',
      title: 'Google Maps 3D Thermal Area & Radiant Waves',
      badge: 'GIS URBAN MICROCLIMATE',
      icon: Globe,
      iconColor: 'from-amber-500 to-rose-600',
      description:
        'Switch between 3D BIM Twin and Google Maps Satellite GIS Area View to see surrounding skyscrapers radiating heat onto the center building.',
      keyTakeaway:
        '🌊 Visible Stefan-Boltzmann radiant heat waves and specular solar glare bounce from neighbor glass curtain walls onto your building facade.',
      details: [
        '🏢 Toggle "Side Building Temps: ON/OFF" for floating HUD badges',
        '💨 Automatic AHU Plume Shield blocks 54°C neighbor rooftop exhaust',
        '📍 Live GPS positioning, asphalt canyons & cool tree oases'
      ]
    },
    {
      id: 'step_corporate_blueprints',
      title: 'Corporate Tenants & Custom Blueprints',
      badge: 'HVAC CATALOG & UPLOAD',
      icon: Building,
      iconColor: 'from-purple-600 to-pink-600',
      description:
        'Customize HVAC systems for every tenant floor (Google UFAD, Goldman Sachs Dual VAV, Pfizer DOAS + HEPA, WeWork VRF, Autodesk Displacement).',
      keyTakeaway:
        '🚀 Upload your own building blueprints (JSON, DWG, IFC, DXF) or load 1-click sample hospitals, tech campuses, and high-rise towers!',
      details: [
        '📊 Switch views: Energy Exec (Overview), AHU Tech, Façade/ESG, 3D BIM Twin',
        '🏆 Pitch Presentation, Extreme Heat Crisis Stress Test, ESG Certificate',
        '⏱️ Scrub the 24-hour timeline or click "▶ Auto Play" to watch the whole day'
      ]
    }
  ];

  const current = tourSteps[currentStep];
  const IconComponent = current.icon;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      if (onNavigateToBim) onNavigateToBim();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border relative overflow-hidden transition-all ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-2xl bg-gradient-to-tr ${current.iconColor} text-white shadow-md`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                {current.badge}
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {current.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="space-y-4 text-xs sm:text-sm">
          <p className={isLight ? 'text-slate-700' : 'text-slate-300'}>
            {current.description}
          </p>

          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 font-medium">
            {current.keyTakeaway}
          </div>

          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
              Key Capabilities in This View:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {current.details.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Indicator & Navigation Footer */}
        <div className="flex items-center justify-between gap-4 pt-6 mt-6 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            {tourSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === idx ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Go to Step ${idx + 1}`}
              />
            ))}
            <span className="text-[10px] font-mono text-slate-400 ml-2">
              Step {currentStep + 1} of {tourSteps.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all cursor-pointer"
            >
              <span>{currentStep === tourSteps.length - 1 ? '🚀 Start Exploring' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
