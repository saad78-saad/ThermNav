import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Play,
  Sliders,
  Activity,
  Compass,
  Building2,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  Wind,
  ThermometerSnowflake,
  Sun,
  Moon,
  HelpCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function UserManualModal({ isOpen, onClose, theme = 'light' }) {
  const [activeTab, setActiveTab] = useState('quickstart');
  const isLight = theme === 'light';

  if (!isOpen) return null;

  const tabs = [
    { id: 'quickstart', label: '🚀 60s Quick Start', icon: Zap },
    { id: 'director', label: '🏢 Facility Director', icon: Building2 },
    { id: 'technician', label: '⚙️ AHU Plant Tech', icon: Activity },
    { id: 'esg', label: '🧭 Façade & ESG', icon: Compass },
    { id: 'presets', label: '🏙️ City Presets', icon: Layers },
    { id: 'faq', label: '❓ FAQ & Troubleshooting', icon: HelpCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
      <div className={`max-w-4xl w-full border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] flex flex-col transition-all duration-300 ${
        isLight ? 'bg-white border-slate-200 text-slate-900 shadow-2xl' : 'bg-[#0f172a] border-cyan-500/30 text-slate-100 ring-1 ring-cyan-500/20'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-blue-600 text-white shadow-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">ThermoShift EcoBreeze User Manual</h3>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                  isLight ? 'bg-cyan-50 text-cyan-800 border-cyan-300' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                }`}>
                  v2.2 Official Guide
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Operational playbook and feature walkthrough for judges, facility operators, and engineers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isLight ? 'text-slate-500 hover:text-slate-950 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b pb-3 border-slate-200 dark:border-slate-800 text-xs font-bold">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? isLight
                      ? 'bg-slate-950 text-white shadow-md'
                      : 'bg-cyan-500 text-slate-950 shadow-md font-black'
                    : isLight
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 text-xs space-y-4 leading-relaxed">
          {/* 1. QUICK START */}
          {activeTab === 'quickstart' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border ${isLight ? 'bg-cyan-50/70 border-cyan-200 text-slate-800' : 'bg-cyan-950/30 border-cyan-500/30 text-slate-300'}`}>
                <h4 className={`text-sm font-black mb-1 flex items-center gap-2 ${isLight ? 'text-cyan-950' : 'text-cyan-300'}`}>
                  <Zap className="w-4 h-4 text-cyan-600" />
                  How to Demonstrate the System in 3 Simple Steps
                </h4>
                <ol className="list-decimal list-inside space-y-2 mt-2 font-medium">
                  <li><strong>Click `[▶ Auto-Play 24h Heat Cycle]`</strong> at the top of the dashboard to start the live day/night simulation.</li>
                  <li><strong>Watch the 02:00 PM Peak Window:</strong> Observe how the outdoor heat hits 43°C and peak tariffs jump to $0.88/kWh, while chillers automatically power down to 0 kW, coasting on 5 AM pre-cooled concrete.</li>
                  <li><strong>Switch Between Roles:</strong> Click through <strong>1. Facility Director</strong>, <strong>2. AHU Plant Tech</strong>, and <strong>3. Façade Auditor</strong> to view synchronized telemetry from three different user perspectives.</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">🏙️ Switching NYC Microclimate Zones</span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    Click any NYC facility card (Financial Canyon, Hudson Yards, Grand Central, Brooklyn Navy Yard) to load unique FortyGuard microclimate profiles, building envelope parameters, and ConEdison utility tariff structures.
                  </p>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">☀️ / 🌙 Theme Toggle</span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    Click the <strong>Light/Dark button</strong> in the top right to switch between the crisp Executive White Theme and the Cyberpunk Dark Mode.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. FACILITY DIRECTOR */}
          {activeTab === 'director' && (
            <div className="space-y-3">
              <h4 className={`text-sm font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>
                Role 1: Facility Energy Director Dashboard Guide
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Designed for Chief Building Engineers and Energy Managers managing utility electricity budgets and peak demand penalties.
              </p>

              <div className="space-y-2.5">
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <strong className="text-slate-900 dark:text-white">📈 Interactive SVG Multi-Curve Chart:</strong>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Plots outdoor ambient temperature (red) against indoor temperature (blue). Shaded amber areas mark on-peak electricity tariff hours. Click anywhere on the chart to jump directly to that hour.
                  </p>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <strong className="text-slate-900 dark:text-white">🔋 Thermal Battery State-of-Charge (SoC %):</strong>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Indicates how much cold energy is stored in the building's concrete slab. Charges to 90%+ during overnight pre-cooling and discharges between 12:00 PM and 5:00 PM.
                  </p>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <strong className="text-slate-900 dark:text-white">🎛️ Simulation Sliders:</strong>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Adjust <strong>Pre-Cooling Aggression (0.5x to 1.5x)</strong> to control how deeply the building sub-cools early morning, and <strong>Economizer Threshold (°C)</strong> to set the upper dry-bulb limit for free cooling.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. PLANT TECH */}
          {activeTab === 'technician' && (
            <div className="space-y-3">
              <h4 className={`text-sm font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>
                Role 2: HVAC Plant & AHU Automation Technician Guide
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Designed for Automation Technicians and Chiller Plant Engineers monitoring real-time mechanical components.
              </p>

              <div className="space-y-2.5">
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <strong className="text-slate-900 dark:text-white">🌬️ Animated AHU Flow Schematic:</strong>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Displays real-time positions of the Outdoor Air (OA) Damper (0–100%), Mixing Chamber enthalpy, Cooling Coil stage, and Supply Air fan CFM airflow with animated pulses.
                  </p>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <strong className="text-slate-900 dark:text-white">📊 Psychrometric Enthalpy Comparator (h_out vs h_in):</strong>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Computes specific air heat content. When outdoor enthalpy is below indoor setpoint (h ≤ 45.5 kJ/kg), the economizer gate unlocks 100% free outdoor air with 0 kW compressor power.
                  </p>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <strong className="text-slate-900 dark:text-white">⚡ Emergency Overrides:</strong>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Test manual plant triggers using `Force 100% Free Air`, `Force Peak Shed`, or return to `Autonomous FortyGuard Mode`.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. FAÇADE & ESG */}
          {activeTab === 'esg' && (
            <div className="space-y-3">
              <h4 className={`text-sm font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>
                Role 3: Façade Balancer & ESG Auditor Guide
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Designed for Sustainability Officers and Comfort Auditors ensuring tenant satisfaction and LEED compliance.
              </p>

              <div className="space-y-2.5">
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <strong className="text-slate-900 dark:text-white">🧭 4-Quadrant Façade Solar Balancer:</strong>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Click any quadrant (North, South, East, West) to inspect directional solar heat flux (W/m²) and dynamic VAV damper targets, preventing overcooling on shaded building faces.
                  </p>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <strong className="text-slate-900 dark:text-white">🌿 ASHRAE 55 & Scope 2 GHG Carbon Scorecard:</strong>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Logs Predicted Mean Vote (PMV: +0.12), Predicted % Dissatisfied (PPD: 5.2%), and daily carbon abatement (~248.6 kg CO2/day) for LEED & NYC Local Law 97 decarbonization compliance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <h4 className={`text-sm font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>
                NYC Microclimate Preset Architectures
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Four pre-configured real-world New York City buildings demonstrating diverse urban microclimate optimization challenges:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <strong className="text-slate-900 dark:text-white block">🏙️ Lower Manhattan (One World Financial Tower)</strong>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">Deep concrete street canyon heat trapping between Wall St skyscrapers; high ConEd peak demand arbitrage.</span>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <strong className="text-slate-900 dark:text-white block">🏢 Hudson Yards (30 Hudson Yards Supertall)</strong>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">Specular double-silver glass solar reflections & dynamic AHU plume shields avoiding chiller exhaust ingestion.</span>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <strong className="text-slate-900 dark:text-white block">🌆 Midtown East (Grand Central Plaza Core)</strong>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">High thermal mass limestone/granite absorption & Lexington Ave asphalt heat island delayed thermal release.</span>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <strong className="text-slate-900 dark:text-white block">⚓ Brooklyn Waterfront (Brooklyn Navy Yard Tech Hub)</strong>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">Maritime coastal East River cooling breeze providing 6+ hours of free-cooling economizer fresh air cycles.</span>
                </div>
              </div>
            </div>
          )}

          {/* 6. FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              <h4 className={`text-sm font-black ${isLight ? 'text-slate-950' : 'text-white'}`}>
                Frequently Asked Questions (FAQ)
              </h4>

              <div className="space-y-2.5">
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <strong className="text-slate-900 dark:text-white">Q: Why does the system pre-cool at 5:00 AM instead of 10:00 AM?</strong>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    A: Electricity tariffs at 5:00 AM are off-peak ($0.08/kWh vs. $0.88/kWh at peak), and outdoor air temperatures are at their coolest, allowing chillers to operate at their highest thermodynamic efficiency.
                  </p>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <strong className="text-slate-900 dark:text-white">Q: Will building occupants get too cold during pre-cooling or too warm during peak shedding?</strong>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    A: No. All pre-cooling and coasting setpoints are strictly bounded between 21.5°C and 24.5°C, fully compliant with ASHRAE 55 and ISO 7730 Class A comfort standards.
                  </p>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <strong className="text-slate-900 dark:text-white">Q: What happens if the FortyGuard API goes offline?</strong>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    A: The system automatically engages an internal synthetic thermodynamic simulator, ensuring seamless 24/7 continuous operation without interruption.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between text-xs pt-3 border-t ${isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'}`}>
          <span>ThermoShift EcoBreeze Operational Playbook</span>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
              isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
}
