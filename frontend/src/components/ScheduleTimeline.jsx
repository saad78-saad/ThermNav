import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, Clock, SunMedium, Wind } from 'lucide-react';

export default function ScheduleTimeline({
  slots = [],
  recommendedTime,
  selectedSlotOffset = 0,
  onSelectSlot,
  theme = 'dark',
}) {
  if (!slots || slots.length === 0) return null;
  const isLight = theme === 'light';

  const STATUS_CONFIG = {
    OPTIMAL: {
      bg: isLight ? 'bg-emerald-50/80 hover:bg-emerald-100/80' : 'bg-emerald-950/40 hover:bg-emerald-950/60',
      border: isLight ? 'border-emerald-300' : 'border-emerald-700/80',
      activeBorder: isLight ? 'border-emerald-500 ring-2 ring-emerald-400/50 bg-white' : 'border-emerald-400 ring-2 ring-emerald-500/40 bg-zinc-950',
      badge: isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: CheckCircle2,
      label: 'Optimal Window',
    },
    ACCEPTABLE_WITH_RETARDER: {
      bg: isLight ? 'bg-amber-50/80 hover:bg-amber-100/80' : 'bg-amber-950/40 hover:bg-amber-950/60',
      border: isLight ? 'border-amber-300' : 'border-amber-700/80',
      activeBorder: isLight ? 'border-amber-500 ring-2 ring-amber-400/50 bg-white' : 'border-amber-400 ring-2 ring-amber-500/40 bg-zinc-950',
      badge: isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: AlertTriangle,
      label: 'Retarder Req.',
    },
    REJECTED_HEAT_ATTACK: {
      bg: isLight ? 'bg-red-50/80 hover:bg-red-100/80' : 'bg-red-950/40 hover:bg-red-950/60',
      border: isLight ? 'border-red-300' : 'border-red-800/80',
      activeBorder: isLight ? 'border-red-500 ring-2 ring-red-400/50 bg-white' : 'border-red-400 ring-2 ring-red-500/40 bg-zinc-950',
      badge: isLight ? 'bg-red-100 text-red-800 border-red-300' : 'bg-red-500/20 text-red-300 border-red-500/30',
      icon: XCircle,
      label: 'Heat Attack',
    },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold font-sans-luxury uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>12-Hour Microclimate Schedule Explorer</span>
          </h3>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Click any hour to preview microclimate thermal shading on the map
          </p>
        </div>
        <span className={`text-[10px] font-mono px-2 py-1 rounded border ${
          isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-zinc-900 text-zinc-300 border-zinc-700'
        }`}>
          FortyGuard LTM
        </span>
      </div>

      {/* Grid of Hourly Dispatch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
        {slots.map((slot) => {
          const cfg = STATUS_CONFIG[slot.status] || STATUS_CONFIG.OPTIMAL;
          const isRecommended = slot.clock_time === recommendedTime;
          const isSelected = slot.dispatch_hour_offset === selectedSlotOffset;
          const StatusIcon = cfg.icon;

          return (
            <button
              key={slot.dispatch_hour_offset}
              type="button"
              onClick={() => onSelectSlot && onSelectSlot(slot)}
              className={`
                relative text-left rounded-2xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between
                ${cfg.bg}
                ${isSelected ? `${cfg.activeBorder} shadow-lg scale-[1.02]` : cfg.border}
              `}
            >
              {/* Recommended Badge on Top */}
              {isRecommended && (
                <div className="absolute -top-2 right-2">
                  <span className="flex items-center gap-1 text-[9px] font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                    <Sparkles className="w-2.5 h-2.5" /> Optimal
                  </span>
                </div>
              )}

              {/* Time & Status Row */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-mono font-bold">
                    {slot.clock_time}
                  </span>
                  {isSelected && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                      isLight ? 'bg-orange-100 text-orange-800 border-orange-300' : 'bg-amber-950/80 text-amber-400 border-amber-800'
                    }`}>
                      Active
                    </span>
                  )}
                </div>

                <span className={`text-[9px] font-bold font-sans-luxury px-2 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1 ${cfg.badge}`}>
                  <StatusIcon className="w-2.5 h-2.5" />
                  {cfg.label}
                </span>
              </div>

              {/* FortyGuard Sensor Readings */}
              <div className={`grid grid-cols-2 gap-x-2 gap-y-1 text-xs py-2 border-t border-b font-mono ${
                isLight ? 'border-slate-200 text-slate-700' : 'border-zinc-800/60 text-zinc-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="opacity-60 text-[11px]">Ta (Air):</span>
                  <span className="font-semibold text-amber-500">{slot.ambient_temp_celsius}°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-60 text-[11px]">Evap E:</span>
                  <span className={`font-semibold ${slot.evaporation_rate >= 0.20 ? 'text-red-500 font-bold' : slot.evaporation_rate >= 0.15 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {slot.evaporation_rate.toFixed(3)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-60 text-[11px]">GHI Solar:</span>
                  <span>{Math.round(slot.solar_ghi)} W</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-60 text-[11px]">Risk Score:</span>
                  <span>{slot.penalty_score}</span>
                </div>
              </div>

              {/* Action Note */}
              <div className={`mt-2 text-[10px] leading-tight truncate ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {slot.action_item}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

