import React from 'react';
import { Thermometer, ShieldCheck, Cpu, Info, Sparkles, Building2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ThermalSensorDisclaimerModal({ isOpen, onClose, theme = 'dark' }) {
  if (!isOpen) return null;
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700/80 text-white'
      }`}>
        {/* Header Ribbon */}
        <div className="p-6 pb-4 border-b border-slate-800/60 bg-gradient-to-r from-cyan-500/10 via-amber-500/10 to-transparent flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 shadow-lg">
            <Thermometer className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-white">Digital Twin Thermal Telemetry</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/40">
                Notice
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">BMS Internal Sensor & FortyGuard AI Calibration</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs font-sans leading-relaxed text-slate-300">
          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Internal Zone Temperature Telemetry</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              The <strong>inner temperatures</strong> of the building zones in this simulation are based upon simulated <strong>internal BMS thermostat sensors</strong> and <strong>1R1C lumped thermal mass equations</strong> (ASHRAE Standard 55). They represent predicted indoor thermodynamic inertia and pre-cooling retention.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>External Microclimate & Radiative Heat Flux</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              All <strong>outdoor ambient dry-bulb temperatures, relative humidity, solar GHI irradiance, and surrounding building Stefan-Boltzmann heat exchange</strong> are powered live by <strong>FortyGuard LTM AI Microclimate Telemetry</strong>.
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-5 pt-3 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3">
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
            ThermoShift AI • Enterprise HVAC Digital Twin
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Explore Digital Twin</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
