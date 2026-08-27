import React from 'react';
import { Building2, Landmark, Factory, Construction, Sun, Flame } from 'lucide-react';

export const GLOBAL_CONSTRUCTION_PRESETS = [
  {
    id: 'nyc-one-vanderbilt',
    orderId: 'NYC-901',
    name: 'One Vanderbilt Grand Central Core',
    locationName: 'Midtown East, Manhattan, NY',
    description: 'Astoria Queens Batch Plant ➔ Queens Midtown Tunnel ➔ Grand Central Terminal Canyon',
    icon: Sun,
    badge: 'Midtown East Heat Island (34°C)',
    badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800',
    plant_name: 'Ferrara Bros Astoria Ready-Mix Plant',
    plant_lat: 40.7685,
    plant_lng: -73.9280,
    site_name: 'One Vanderbilt Deep Core Foundation',
    site_lat: 40.7530,
    site_lng: -73.9785,
    batch_temp_celsius: 26.0,
    volume_m3: 12.0,
    mix_spec: 'C60/75 Self-Consolidating High-Strength Mix with Microsilica',
    target_delivery_hour: 1,
    requested_time: '06:00',
    status: 'IN_TRANSIT',
  },
  {
    id: 'nyc-financial-district',
    orderId: 'NYC-404',
    name: 'Wall Street Canyon Sub-Grade Vault',
    locationName: 'Financial District, Lower Manhattan, NY',
    description: 'Brooklyn Navy Yard ➔ Brooklyn Bridge ➔ Wall St Financial Canyon',
    icon: Flame,
    badge: 'Canyon Heat Trapping (35°C)',
    badgeColor: 'text-orange-400 bg-orange-950/60 border-orange-800',
    plant_name: 'Navy Yard Marine Batch Plant #2',
    plant_lat: 40.7018,
    plant_lng: -73.9723,
    site_name: 'Wall St Security Vault Sub-Structure',
    site_lat: 40.7061,
    site_lng: -74.0092,
    batch_temp_celsius: 27.5,
    volume_m3: 10.0,
    mix_spec: 'C35/45 Low-Heat Slag Replacement Foundation Mix',
    target_delivery_hour: 2,
    requested_time: '07:00',
    status: 'SCHEDULED',
  },
  {
    id: 'nyc-hudson-yards',
    orderId: 'NYC-802',
    name: 'Hudson Yards Tower Foundation',
    locationName: 'Midtown West, Manhattan, NY',
    description: 'Long Island City Plant ➔ Queensboro Bridge ➔ Midtown West Heat Island Corridor',
    icon: Building2,
    badge: 'Manhattan Dense UHI',
    badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-800',
    plant_name: 'Ferrara Bros LIC Plant #2 (Queens)',
    plant_lat: 40.7447,
    plant_lng: -73.9485,
    site_name: 'Hudson Yards Phase 2 Commercial Tower',
    site_lat: 40.7538,
    site_lng: -74.0022,
    batch_temp_celsius: 28.5,
    volume_m3: 10.0,
    mix_spec: 'C35/45 Self-Compacting Foundation Mix',
    target_delivery_hour: 4,
    requested_time: '14:00',
    status: 'IN_TRANSIT',
  },
  {
    id: 'nyc-brooklyn-bridge',
    orderId: 'NYC-505',
    name: 'Brooklyn Bridge Pier Restoration',
    locationName: 'DUMBO / Brooklyn Waterfront, NY',
    description: 'Brooklyn Navy Yard Plant ➔ Flushing Ave ➔ DUMBO Waterfront Marine Pour',
    icon: Landmark,
    badge: 'Marine Coastal Route',
    badgeColor: 'text-emerald-400 dark:bg-emerald-950/60 border-emerald-800',
    plant_name: 'Navy Yard Ready-Mix Plant #1',
    plant_lat: 40.6995,
    plant_lng: -73.9735,
    site_name: 'Pier 1 Marine Reconstruction Site',
    site_lat: 40.7025,
    site_lng: -73.9965,
    batch_temp_celsius: 26.5,
    volume_m3: 8.0,
    mix_spec: 'C40/50 Sulfate-Resistant Marine Mix',
    target_delivery_hour: 1,
    requested_time: '09:00',
    status: 'SCHEDULED',
  },
];

export const NY_CONSTRUCTION_PRESETS = GLOBAL_CONSTRUCTION_PRESETS;
export const CONSTRUCTION_PRESETS = GLOBAL_CONSTRUCTION_PRESETS;

export default function PresetSelector({ activePresetId, onSelectPreset }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Global High-Heat Construction Projects
        </label>
        <span className="text-[11px] text-slate-500">Select preset</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {GLOBAL_CONSTRUCTION_PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isSelected = activePresetId === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`flex items-start gap-3 p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-orange-950/60 border-orange-500 ring-1 ring-orange-500/50 shadow-lg text-white'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                isSelected ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-800 text-slate-300'
              }`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="font-semibold text-xs truncate">{preset.name}</div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wider flex-shrink-0 ${preset.badgeColor}`}>
                    {preset.badge}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mb-0.5">{preset.locationName}</div>
                <p className="text-[11px] leading-snug line-clamp-2 text-slate-400">
                  {preset.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
