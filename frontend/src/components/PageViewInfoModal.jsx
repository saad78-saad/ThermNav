import React from 'react';
import { Info, X, CheckCircle2, ShieldCheck, Sparkles, Cpu, Layers, Activity, Leaf, Building2, Wind } from 'lucide-react';

const PAGE_INFO_DATA = {
  bim: {
    title: '3D Autodesk BIM Digital Twin & Microclimate View',
    icon: Building2,
    badge: '3D Physics & Microclimate',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    summary: 'Real-time spatial visualization combining 3D building architectural geometry with FortyGuard hyperlocal urban heat island (UHI) physics and dynamic solar trajectories.',
    sections: [
      {
        title: '☀️ Sol-Air & Radiative Flux Telemetry',
        desc: 'Calculates Stefan-Boltzmann longwave heat transfer (W/m²) and specular glass reflections from 4 surrounding towers (West, South, East, North) onto our building facades.'
      },
      {
        title: '🌬️ Real-Time CFD & Dynamic Damper Control',
        desc: 'Simulates indoor airflow particles and auto-adjusts floor VAV dampers (25% to 95%) in response to perimeter solar glare.'
      },
      {
        title: '🗺️ GIS Thermal Mapping & 24h Horizon',
        desc: 'Scrub through the 24-hour time slider to observe diurnal temperature variations from cool morning pre-cooling to peak afternoon heat sheds.'
      }
    ],
    audience: 'Chief Architects, BIM Coordinators, and Civil Logistics Engineers.'
  },
  director: {
    title: 'Facility Director Financial & ROI Dashboard',
    icon: Activity,
    badge: 'Executive Financials & Peak Shaving',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    summary: 'High-level financial control center tracking real-time utility tariff arbitrage, peak demand surcharge avoidance, and automated thermal battery pre-cooling savings.',
    sections: [
      {
        title: '⚡ ConEdison Tariff Arbitrage',
        desc: 'Pre-cools building structural concrete mass during low-cost off-peak night/morning hours ($0.11/kWh) and coasts during peak hours ($0.46/kWh).'
      },
      {
        title: '💰 Daily & Annual Cost Savings',
        desc: 'Delivers 34% to 42% HVAC electricity reduction with automated daily ROI and annualized savings reporting.'
      },
      {
        title: '🛡️ Predictive UHI Heatwave Shield',
        desc: 'Proactively charges the building thermal core 4 hours ahead of FortyGuard detected urban heat island spikes.'
      }
    ],
    audience: 'Chief Operating Officers (COOs), Asset Managers, and Facility Directors.'
  },
  technician: {
    title: 'HVAC Plant Technician & BMS Engineering Console',
    icon: Cpu,
    badge: 'Plant Mechanics & Flow Rates',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    summary: 'Granular equipment diagnostics displaying chiller plant staging, AHU variable air volume CFM, economizer enthalpy thresholds, and cooling tower delta-T.',
    sections: [
      {
        title: '❄️ Chiller COP & Power Modulation',
        desc: 'Monitors centrifugal chiller staging and coefficient of performance (COP 5.8 to 6.4) under variable thermal loads.'
      },
      {
        title: '💨 Free-Cooling Air Economizer',
        desc: 'Automatically opens 100% outdoor air dampers when outdoor air enthalpy drops below 46.0 kJ/kg, shutting off mechanical chillers.'
      },
      {
        title: '🎛️ Floor-by-Floor VAV Damper Overrides',
        desc: 'Enables individual zone setpoint tuning and damper balancing across East/West exposures.'
      }
    ],
    audience: 'HVAC Plant Engineers, BMS Operators, and Stationary Technicians.'
  },
  esg: {
    title: 'Zone Comfort & ESG Sustainability Analytics',
    icon: Leaf,
    badge: 'ASHRAE 55 & NYC Local Law 97',
    badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    summary: 'Occupant thermal comfort verification (PMV / PPD) combined with automated carbon emission accounting for municipal regulatory compliance.',
    sections: [
      {
        title: '🌡️ ASHRAE Standard 55 PMV / PPD',
        desc: 'Maintains Predicted Mean Vote (PMV) within the ±0.5 ISO comfort band, guaranteeing 94%+ occupant satisfaction.'
      },
      {
        title: '🌱 Scope 2 Carbon Abatement',
        desc: 'Quantifies daily and annual metric tons of CO₂ avoided by shifting peak electrical generation away from carbon-intensive peaker plants.'
      },
      {
        title: '📜 NYC Local Law 97 Penalty Protection',
        desc: 'Simulates building carbon caps and eliminates annual municipal emissions penalty fines ($268 per tCO2e over limit).'
      }
    ],
    audience: 'Sustainability Directors, ESG Auditors, and HR Workplace Experience Leaders.'
  }
};

export default function PageViewInfoModal({ isOpen, onClose, roleKey = 'bim', theme = 'dark' }) {
  if (!isOpen) return null;
  const isLight = theme === 'light';
  const info = PAGE_INFO_DATA[roleKey] || PAGE_INFO_DATA.bim;
  const IconComponent = info.icon;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className={`relative w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden transition-all ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700/80 text-white'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Ribbon */}
        <div className="p-6 pb-4 border-b border-slate-800/60 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-transparent flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 shadow-lg">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-base sm:text-lg text-white">{info.title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${info.badgeColor}`}>
                {info.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">{info.summary}</p>
          </div>
        </div>

        {/* Modal Body: Feature Breakdown */}
        <div className="p-6 space-y-3.5 text-xs font-sans">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Key Operational Capabilities & Analytics:
          </div>

          <div className="space-y-2.5">
            {info.sections.map((sec, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-white text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{sec.title}</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed pl-6">
                  {sec.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono flex items-center justify-between gap-2">
            <span>🎯 <strong>Primary Users:</strong> {info.audience}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
            ThermoShift AI • Microclimate Predictive Digital Twin
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
          >
            Got it, Close Info
          </button>
        </div>
      </div>
    </div>
  );
}
