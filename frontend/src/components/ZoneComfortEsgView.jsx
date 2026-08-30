import React, { useState } from 'react';
import {
  Compass,
  Sun,
  ShieldCheck,
  Leaf,
  Users,
  Award,
  Flame,
  Wind,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  Sparkles
} from 'lucide-react';

export default function ZoneComfortEsgView({
  scheduleData,
  hvacData,
  selectedHour = 14,
  activePreset,
  theme = 'light',
  onOpenEsgModal
}) {
  const isLight = theme === 'light';
  const dataStore = hvacData || scheduleData;
  const [activeSection, setActiveSection] = useState('working'); // 'working' | 'information'
  const [selectedOrientation, setSelectedOrientation] = useState('West Façade');

  const facadeData = dataStore?.facade_balance?.facades || [
    {
      orientation: "West Façade",
      heat_flux_wm2: 780.0,
      exposure_level: "CRITICAL_HIGH",
      vav_damper_target_pct: 95,
      solar_gain_kw: 936.0,
      recommendation: "Boost local VAV cooling airflow; activate smart dynamic glazing.",
    },
    {
      orientation: "South Façade",
      heat_flux_wm2: 680.0,
      exposure_level: "HIGH",
      vav_damper_target_pct: 78,
      solar_gain_kw: 748.0,
      recommendation: "Maintain moderate cooling stage to prevent perimeter heat soak.",
    },
    {
      orientation: "East Façade",
      heat_flux_wm2: 280.0,
      exposure_level: "LOW_SHADED",
      vav_damper_target_pct: 35,
      solar_gain_kw: 224.0,
      recommendation: "Throttle VAV damper to 35% to prevent overcooling and occupant chill.",
    },
    {
      orientation: "North Façade",
      heat_flux_wm2: 160.0,
      exposure_level: "MINIMAL",
      vav_damper_target_pct: 25,
      solar_gain_kw: 96.0,
      recommendation: "Minimum ventilation flow. Heat load negligible.",
    }
  ];

  const summary = scheduleData?.summary || {
    carbon_avoided_kg_co2: 185.4,
    free_cooling_economizer_hours: 6,
    energy_saved_pct: 21.4
  };

  return (
    <div className="space-y-6">
      {/* Primary Working vs Information Categorization Header Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Compass className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-black text-white">Zone Comfort & ESG Sustainability</h3>
            <p className="text-xs text-slate-400">ASHRAE 55 PMV/PPD Comfort, 4-Façade Solar Balance & NYC Local Law 97</p>
          </div>
        </div>

        <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveSection('working')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'working' ? 'bg-teal-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🛠️ Working Side</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('information')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'information' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📖 Reading & Reference Materials</span>
          </button>
        </div>
      </div>

      {activeSection === 'working' ? (
        <>
          {/* 1. FAÇADE SOLAR BALANCER (4-QUADRANT VIEW) */}
          <div className={`rounded-3xl p-5 md:p-6 shadow-xl border transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-slate-200/60' : 'bg-slate-900/85 border-slate-800 shadow-2xl backdrop-blur-md'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`p-2 rounded-xl border ${
                    isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    <Compass className="w-4 h-4" />
                  </span>
                  <h3 className={`text-lg font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
                    Façade-Specific Microclimate Solar Balancer
                  </h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                    isLight ? 'bg-cyan-50 text-cyan-800 border-cyan-300' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  }`}>
                    FortyGuard Streetview & Satellite Synced
                  </span>
                </div>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                  Dynamic zone-by-zone VAV damper modulation based on directional solar irradiance, street canyon albedo, and envelope heat flux.
                </p>
              </div>
            </div>

        {/* 4 Quadrants Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {facadeData.map((f, idx) => {
            const isSelected = selectedOrientation === f.orientation;
            let badgeBg = isLight ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700';
            let barColor = isLight ? 'bg-cyan-600' : 'bg-cyan-500';
            if (f.exposure_level === 'CRITICAL_HIGH') {
              badgeBg = isLight ? 'bg-rose-50 text-rose-900 border-rose-300 font-bold' : 'bg-rose-500/20 text-rose-300 border-rose-500/40';
              barColor = 'bg-rose-500';
            } else if (f.exposure_level === 'HIGH') {
              badgeBg = isLight ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold' : 'bg-amber-500/20 text-amber-300 border-amber-500/40';
              barColor = 'bg-amber-500';
            } else if (f.exposure_level === 'LOW_SHADED') {
              badgeBg = isLight ? 'bg-blue-50 text-blue-900 border-blue-300 font-bold' : 'bg-blue-500/20 text-blue-300 border-blue-500/40';
              barColor = 'bg-blue-500';
            } else {
              badgeBg = isLight ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
              barColor = 'bg-emerald-500';
            }

            return (
              <div
                key={idx}
                onClick={() => setSelectedOrientation(f.orientation)}
                className={`rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all border ${
                  isSelected
                    ? isLight
                      ? 'bg-slate-50 border-cyan-600 shadow-md ring-2 ring-cyan-500 scale-[1.02]'
                      : 'bg-slate-800/90 border-cyan-400 shadow-xl ring-2 ring-cyan-400/50 scale-[1.02]'
                    : isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-sm font-black flex items-center gap-1.5 ${isLight ? 'text-slate-950' : 'text-white'}`}>
                      <Sun className="w-4 h-4 text-amber-500" />
                      {f.orientation}
                    </h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${badgeBg}`}>
                      {f.exposure_level.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-2 mt-3 text-xs font-mono">
                    <div className={`flex justify-between items-center ${isLight ? 'text-slate-600 font-bold' : 'text-slate-400'}`}>
                      <span>Solar Flux:</span>
                      <span className={`font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>{f.heat_flux_wm2} W/m²</span>
                    </div>
                    <div className={`flex justify-between items-center ${isLight ? 'text-slate-600 font-bold' : 'text-slate-400'}`}>
                      <span>Envelope Gain:</span>
                      <span className={`font-black ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>{f.solar_gain_kw} kW</span>
                    </div>
                    <div className={`flex justify-between items-center ${isLight ? 'text-slate-600 font-bold' : 'text-slate-400'}`}>
                      <span>VAV Damper Target:</span>
                      <span className={`font-black ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>{f.vav_damper_target_pct}% Open</span>
                    </div>
                  </div>

                  {/* Damper Open Progress Bar */}
                  <div className={`mt-3 w-full h-2.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-300`}
                      style={{ width: `${f.vav_damper_target_pct}%` }}
                    />
                  </div>
                </div>

                <div className={`mt-4 pt-3 border-t text-[11px] leading-relaxed font-medium ${
                  isLight ? 'border-slate-100 text-slate-600' : 'border-slate-800/80 text-slate-400'
                }`}>
                  💡 {f.recommendation}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. OCCUPANT THERMAL COMFORT (ASHRAE 55) & ESG REPORT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ASHRAE 55 Occupant Comfort */}
        <div className={`rounded-3xl p-5 md:p-6 shadow-xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-slate-200/60' : 'bg-slate-900/85 border-slate-800'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-2 rounded-xl border ${
              isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              <Users className="w-4 h-4" />
            </div>
            <h4 className={`text-sm font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>
              ASHRAE 55 & ISO 7730 Thermal Comfort Compliance
            </h4>
          </div>
          <p className={`text-xs mb-4 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
            Predictive pre-cooling and coasting strictly respect human thermal satisfaction boundaries.
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className={`flex justify-between items-center p-3.5 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className={isLight ? 'text-slate-600 font-bold' : 'text-slate-400'}>Predicted Mean Vote (PMV):</span>
              <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">+0.12 (Neutral / Ideal)</span>
            </div>
            <div className={`flex justify-between items-center p-3.5 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className={isLight ? 'text-slate-600 font-bold' : 'text-slate-400'}>Predicted % Dissatisfied (PPD):</span>
              <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">5.2% (Class A Quality)</span>
            </div>
            <div className={`flex justify-between items-center p-3.5 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className={isLight ? 'text-slate-600 font-bold' : 'text-slate-400'}>Indoor Air Quality (CO₂ ppm):</span>
              <span className={`font-black text-sm ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>485 ppm (Fresh Air Influx)</span>
            </div>
          </div>

          <div className={`mt-4 p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
            isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            Zero thermal comfort violations recorded during pre-cooling & peak coasting cycles.
          </div>
        </div>

        {/* ESG Sustainability & Green Mark Scorecard */}
        <div className={`rounded-3xl p-5 md:p-6 shadow-xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-slate-200/60' : 'bg-slate-900/85 border-slate-800'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-2 rounded-xl border ${
              isLight ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
            }`}>
              <Award className="w-4 h-4" />
            </div>
            <h4 className={`text-sm font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>
              ESG Sustainability & Green Building Rating
            </h4>
          </div>
          <p className={`text-xs mb-4 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
            FortyGuard microclimate optimization unlocks points across LEED v4.1, NYC Local Law 97 Decarbonization Mandates, and ENERGY STAR.
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className={`flex justify-between items-center p-3.5 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className={isLight ? 'text-slate-600 font-bold' : 'text-slate-400'}>Scope 2 Carbon Abatement:</span>
              <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">{summary.carbon_avoided_kg_co2} kg CO₂ / day</span>
            </div>
            <div className={`flex justify-between items-center p-3.5 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className={isLight ? 'text-slate-600 font-bold' : 'text-slate-400'}>LEED Energy & Atmosphere:</span>
              <span className={`font-black text-sm ${isLight ? 'text-teal-700' : 'text-teal-300'}`}>+8 Credits Earned</span>
            </div>
            <div className={`flex justify-between items-center p-3.5 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className={isLight ? 'text-slate-600 font-bold' : 'text-slate-400'}>100% Free Fresh Air Hours:</span>
              <span className={`font-black text-sm ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>{summary.free_cooling_economizer_hours} Hours / day</span>
            </div>
          </div>

          <div className={`mt-4 p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
            isLight ? 'bg-teal-50 border-teal-200 text-teal-900 font-bold' : 'bg-teal-950/30 border-teal-800/40 text-teal-300'
          }`}>
            <Leaf className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
            Qualifies for Automated Demand Response (ADR) grid financial rebates.
          </div>
        </div>
      </div>
    </>
  ) : (
    /* ========================================================================= */
    /* ℹ️ ASHRAE 55 & LOCAL LAW 97 DECARBONIZATION REFERENCE (INFORMATION SIDE) */
    /* ========================================================================= */
    <div className={`rounded-3xl p-6 shadow-xl border space-y-6 animate-in fade-in duration-200 ${
      isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
    }`}>
      <div className="flex items-center gap-3 border-b pb-4 border-slate-800">
        <span className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40">
          <Compass className="w-5 h-5" />
        </span>
        <div>
          <h4 className="text-base font-black text-white">
            ASHRAE Standard 55 Thermal Comfort, Fanger PMV/PPD & NYC Local Law 97 Compliance
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Decarbonization penalty calculations, predicted mean vote algorithms, and LEED credit mapping.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ASHRAE Standard 55 Fanger Model */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-teal-400">
            <Users className="w-4 h-4" />
            <h5 className="text-xs font-black uppercase tracking-wider">
              1. Fanger Thermal Comfort Model (ASHRAE 55)
            </h5>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Predicted Mean Vote (PMV) and Predicted Percentage of Dissatisfied (PPD) are modeled per ISO 7730:
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-teal-500/30 text-teal-300 font-mono text-xs text-center">
            PMV = [0.303 · e^(-0.036·M) + 0.028] · L
          </div>
          <div className="space-y-1.5 text-xs text-slate-400">
            <div>• <strong className="text-slate-200">Optimal Comfort Band:</strong> -0.5 &lt; PMV &lt; +0.5 ensures PPD &lt; 10%.</div>
            <div>• <strong className="text-slate-200">Perimeter Glare Elimination:</strong> Compensates for mean radiant temperature (MRT) spikes near glass.</div>
          </div>
        </div>

        {/* NYC Local Law 97 Carbon Limits */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Leaf className="w-4 h-4" />
            <h5 className="text-xs font-black uppercase tracking-wider">
              2. NYC Local Law 97 Decarbonization Mandate
            </h5>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            NYC LL97 imposes severe financial penalties for commercial properties exceeding annual emissions caps:
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-300 font-mono text-xs text-center">
            Fine_Annual = Max(0, Emissions_Actual - Emissions_Cap) · $268 / tCO₂e
          </div>
          <div className="space-y-1 text-xs text-slate-400">
            <div>• ThermoShift's 185.4 kg CO₂/day abatement saves <strong>$18,140 / year</strong> in direct LL97 fines.</div>
            <div>• Avoids Class B building downgrade and protects real estate asset valuation.</div>
          </div>
        </div>

        {/* LEED v4.1 & WELL v2 Building Credits */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Award className="w-4 h-4" />
            <h5 className="text-xs font-black uppercase tracking-wider">
              3. LEED v4.1 & WELL v2 Building Certification Credits
            </h5>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              🏆 <strong>LEED EA Credit (Optimize Energy Performance):</strong> +8 Points for &gt; 20% annual HVAC energy reduction.
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              🌱 <strong>WELL Thermal Comfort Feature T01:</strong> 100% compliance with enhanced thermal environment.
            </div>
          </div>
        </div>

        {/* IEQ & Productivity Benefits */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            <h5 className="text-xs font-black uppercase tracking-wider">
              4. Occupant Health, IEQ & Cognitive Productivity
            </h5>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Harvard T.H. Chan School of Public Health studies confirm optimal IEQ and free-cooling fresh air boost tenant productivity:
          </p>
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span>Cognitive Task Performance Boost:</span>
              <strong className="text-emerald-400">+6.8%</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span>Sick Building Syndrome Complaints:</span>
              <strong className="text-cyan-400">-74% Reduction</strong>
            </div>
            <div className="flex justify-between pt-0.5">
              <span>Overcooling Chill Incidents:</span>
              <strong className="text-amber-400">0 Reported</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
    </div>
  );
}
