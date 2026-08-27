import React from 'react';
import {
  Award,
  ShieldCheck,
  Leaf,
  CheckCircle2,
  Download,
  Printer,
  X,
  Sparkles,
  Building,
  QrCode,
  Globe,
  FileCheck
} from 'lucide-react';

export default function EsgCertificateModal({
  isOpen,
  onClose,
  buildingName = 'One World Financial Tower',
  city = 'New York, NY',
  annualKwhSaved = '748,900 kWh',
  annualCostSaved = '$348,000 USD',
  annualCarbonAvoided = '360.5 tCO2e',
  theme = 'dark'
}) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-2xl overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl border border-emerald-500/40 bg-slate-900/95 text-slate-100 shadow-2xl shadow-emerald-950/50 overflow-hidden flex flex-col">
        {/* Certificate Golden Top Trim */}
        <div className="w-full bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 h-2.5" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white">
                Official ESG Carbon Reduction & Energy Arbitrage Certificate
              </h3>
              <p className="text-xs text-slate-400">
                Verified under ASHRAE 90.1-2022 & NYC Local Law 97 Municipal Carbon Guidelines.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Certificate Canvas */}
        <div className="p-8 space-y-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border m-6 rounded-2xl border-emerald-500/30 shadow-inner">
          <div className="text-center space-y-2 border-b border-emerald-500/20 pb-6">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold uppercase tracking-wider">
              ✦ CERTIFICATE OF THERMODYNAMIC EFFICIENCY & DECARBONIZATION ✦
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white pt-2">
              {buildingName}
            </h2>
            <p className="text-xs text-slate-400">
              Facility Location: <strong className="text-slate-200">{city}</strong> • Verified Microclimate: <strong className="text-cyan-400">FortyGuard LTM</strong>
            </p>
          </div>

          {/* Key Verified Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Annual Electricity Saved</span>
              <div className="text-xl font-black text-cyan-400 font-mono">{annualKwhSaved}</div>
              <span className="text-[10px] text-emerald-400">35.5% Grid Reduction</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Net Energy Arbitrage</span>
              <div className="text-xl font-black text-amber-400 font-mono">{annualCostSaved}</div>
              <span className="text-[10px] text-amber-300">ConEdison TOU Shaved</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Scope 2 Carbon Avoided</span>
              <div className="text-xl font-black text-emerald-400 font-mono">{annualCarbonAvoided}</div>
              <span className="text-[10px] text-emerald-300">NYC LL97 Compliant</span>
            </div>
          </div>

          {/* Verification Stamps */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-slate-200 font-bold">Verification Hash:</div>
                <div className="text-[10px] text-slate-500">0x8F9C...4B1A-FORTYGUARD-BIM</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-5 h-5" />
              <span>Certified Autonomous AI BMS Operation</span>
            </div>
          </div>
        </div>

        {/* Modal Footer / Action Buttons */}
        <div className="flex items-center justify-between p-6 border-t border-slate-800 bg-slate-950">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/20 cursor-pointer transition-all hover:scale-105"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
