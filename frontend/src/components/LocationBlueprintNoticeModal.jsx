import React from 'react';
import { MapPin, Building2, UploadCloud, ArrowRight, X, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function LocationBlueprintNoticeModal({
  isOpen,
  onClose,
  locationName = 'Selected Location',
  onOpenUploadModal,
  theme = 'dark'
}) {
  if (!isOpen) return null;
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700/80 text-white'
      }`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Ribbon */}
        <div className="p-6 pb-4 border-b border-slate-800/60 bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-transparent flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-lg">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-white">Location Microclimate Calibrated</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/40">
                Site Sync
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono line-clamp-1">{locationName}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs font-sans leading-relaxed text-slate-300">
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>3D Geometry Architecture Notice</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              The <strong>3D digital twin visualization will display the baseline commercial facility structure</strong> until you upload a custom CAD / BIM / PDF blueprint for this site.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Calibrated Microclimate & HVAC Metrics</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              All <strong>outdoor weather, FortyGuard solar radiation, canyon heat flux, utility tariffs, chiller power curves, and HVAC optimization schedules</strong> are 100% updated and tailored to <strong>{locationName.split(',')[0]}</strong>.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 pt-3 border-t border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenUploadModal) onOpenUploadModal();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            <span>Upload Custom Blueprint</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Continue Simulation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
