import React, { useState, useMemo } from 'react';
import { PlusCircle, Clock, MapPin, Building2, ShieldCheck, AlertTriangle, CheckCircle2, Truck, Droplets, Send, Sparkles, Gauge, ArrowRight } from 'lucide-react';
import { NY_CONSTRUCTION_PRESETS } from './PresetSelector';

export default function OrderBookerView({
  orders = [],
  onCreateOrder,
  onSelectOrderForDispatch,
  selectedOrderId,
}) {
  const [selectedPreset, setSelectedPreset] = useState(NY_CONSTRUCTION_PRESETS[0]);

  // Form states
  const [projectName, setProjectName] = useState(NY_CONSTRUCTION_PRESETS[0].site_name || NY_CONSTRUCTION_PRESETS[0].name);
  const [siteLocation, setSiteLocation] = useState(NY_CONSTRUCTION_PRESETS[0].locationName);
  const [siteLat, setSiteLat] = useState(NY_CONSTRUCTION_PRESETS[0].site_lat);
  const [siteLng, setSiteLng] = useState(NY_CONSTRUCTION_PRESETS[0].site_lng);
  const [plantName, setPlantName] = useState(NY_CONSTRUCTION_PRESETS[0].plant_name);
  const [plantLat, setPlantLat] = useState(NY_CONSTRUCTION_PRESETS[0].plant_lat);
  const [plantLng, setPlantLng] = useState(NY_CONSTRUCTION_PRESETS[0].plant_lng);
  const [volumeM3, setVolumeM3] = useState(NY_CONSTRUCTION_PRESETS[0].volume_m3);
  const [mixGrade, setMixGrade] = useState(NY_CONSTRUCTION_PRESETS[0].mix_spec);
  const [targetHour, setTargetHour] = useState(NY_CONSTRUCTION_PRESETS[0].requested_time);
  const [initialBatchTemp, setInitialBatchTemp] = useState(NY_CONSTRUCTION_PRESETS[0].batch_temp_celsius);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState(null);

  // Live ACI 305R Evaporation Rate estimation
  const estimatedEvaporation = useMemo(() => {
    const Tc = parseFloat(initialBatchTemp) || 28.0;
    const hourNum = parseInt(targetHour.split(':')[0], 10) || 14;
    const Ta = 22.0 + Math.sin(((hourNum - 7) / 14) * Math.PI) * 11.0;
    const rh = Math.max(0.25, 0.65 - (Ta - 20) * 0.02);
    const windSpeedMph = 10.0;
    const Tc_F = Tc * 1.8 + 32.0;
    const Ta_F = Ta * 1.8 + 32.0;
    const E = (Math.pow(Tc_F, 2.5) - rh * Math.pow(Ta_F, 2.5)) * (1 + 0.4 * windSpeedMph) * 1e-6;
    return Math.max(0.02, Math.round(E * 1000) / 1000);
  }, [initialBatchTemp, targetHour]);

  const isCriticalRisk = estimatedEvaporation >= 0.20;
  const isModerateRisk = estimatedEvaporation >= 0.10 && estimatedEvaporation < 0.20;

  const handleApplyPreset = (p) => {
    setSelectedPreset(p);
    setProjectName(p.site_name || p.name);
    setSiteLocation(p.locationName || 'New York, NY');
    setSiteLat(p.site_lat);
    setSiteLng(p.site_lng);
    setPlantName(p.plant_name);
    setPlantLat(p.plant_lat);
    setPlantLng(p.plant_lng);
    setVolumeM3(p.volume_m3);
    setMixGrade(p.mix_spec);
    setTargetHour(p.requested_time);
    setInitialBatchTemp(p.batch_temp_celsius);
  };

  const [isGeocoding, setIsGeocoding] = useState(false);
  const handleGeocodeSiteAddress = async () => {
    if (!siteLocation) return;
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(siteLocation)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setSiteLat(parseFloat(data[0].lat).toFixed(6));
        setSiteLng(parseFloat(data[0].lon).toFixed(6));
      }
    } catch (err) {
      console.error('Failed to geocode address via OSM:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newOrder = {
      id: `ORD-${Math.floor(800 + Math.random() * 200)}`,
      name: projectName,
      site_name: projectName,
      locationName: siteLocation,
      site_lat: parseFloat(siteLat),
      site_lng: parseFloat(siteLng),
      plant_name: plantName,
      plant_lat: parseFloat(plantLat),
      plant_lng: parseFloat(plantLng),
      volume_m3: parseFloat(volumeM3),
      mix_spec: mixGrade,
      requested_time: targetHour,
      batch_temp_celsius: parseFloat(initialBatchTemp),
      target_delivery_hour: Math.max(0, parseInt(targetHour.split(':')[0], 10) - 7),
      status: 'PENDING_OPTIMIZATION',
      assignedTruck: 'Mixer Truck #402',
      badge: 'New Order',
      badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-800',
    };

    onCreateOrder(newOrder);
    setOrderSuccessMsg(`Order ${newOrder.id} queued for FortyGuard thermal dispatch!`);
    setTimeout(() => setOrderSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-8">
      {orderSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-600 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{orderSuccessMsg}</span>
          </div>
          <span className="font-mono text-[10px] uppercase text-emerald-400 bg-emerald-900/60 px-2.5 py-1 rounded-full">
            Sent to Site Manager
          </span>
        </div>
      )}

      {/* Main 2-Column: Left (Form & 1-Click Presets) + Right (Active Orders Queue) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Open Space Form */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-xl">
          <div>
            <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
              Step 1: Order Ready-Mix
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight mt-1">
              Concrete Pour Demand Entry
            </h3>
            <p className="text-xs text-slate-400">
              Fill in project details or test instantly with 1-click realistic demo presets.
            </p>
          </div>

          {/* Prominent 1-Click Preset Demo Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              ⚡ 1-Click Test Presets:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleApplyPreset(NY_CONSTRUCTION_PRESETS[0])}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-orange-500/80 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-orange-400 flex items-center gap-1.5">
                  <span>🗽 One Vanderbilt (34°C)</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">Grand Central Core</div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset(NY_CONSTRUCTION_PRESETS[1])}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-orange-500/80 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-orange-400 flex items-center gap-1.5">
                  <span>🏛️ Wall Street (35°C)</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">Financial Canyon Vault</div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset(NY_CONSTRUCTION_PRESETS[2])}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-orange-500/80 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-orange-400 flex items-center gap-1.5">
                  <span>🇺🇸 New York (32°C)</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">Hudson Yards Tower</div>
              </button>
            </div>
          </div>

          {/* Plain-English Crack Prevention Gate */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            isCriticalRisk
              ? 'bg-red-950/40 border-red-800/80 text-red-200'
              : isModerateRisk
              ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
              : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
          }`}>
            <div className="space-y-0.5">
              <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Crack Prevention Gate (Evaporation Rate):</span>
              </div>
              <p className="text-xs opacity-90">
                {isCriticalRisk
                  ? '🛑 High Risk of Plastic Cracking — Pour should be shifted to cooler morning hours.'
                  : isModerateRisk
                  ? '⚠️ Moderate Rate — Curing compound or chilled water recommended.'
                  : '✅ Safe Pouring Condition — Concrete will dry properly without surface cracks.'}
              </p>
            </div>

            <div className="text-right font-mono text-xs font-bold flex-shrink-0">
              <div>E = {estimatedEvaporation}</div>
              <span className="text-[10px] font-normal opacity-70">lb/ft²/hr</span>
            </div>
          </div>

          {/* Clean Editable Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Project Name <span className="text-orange-400">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-medium focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-300 font-semibold">
                  Pour Site Location <span className="text-orange-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGeocodeSiteAddress}
                  disabled={isGeocoding}
                  className="text-[10px] text-orange-400 hover:text-orange-300 underline font-mono"
                >
                  {isGeocoding ? 'Locating...' : 'Auto-Fill Coordinates'}
                </button>
              </div>
              <input
                type="text"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                onBlur={handleGeocodeSiteAddress}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-medium focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={siteLat}
                  onChange={(e) => setSiteLat(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={siteLng}
                  onChange={(e) => setSiteLng(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Origin Batching Plant
              </label>
              <input
                type="text"
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-medium focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Required Volume ($m^3$) <span className="text-orange-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="15"
                  value={volumeM3}
                  onChange={(e) => setVolumeM3(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-orange-400 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Desired Delivery Time <span className="text-orange-400">*</span>
                </label>
                <select
                  value={targetHour}
                  onChange={(e) => setTargetHour(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-orange-400 font-mono font-bold text-sm"
                >
                  {['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mix Grade
                </label>
                <input
                  type="text"
                  value={mixGrade}
                  onChange={(e) => setMixGrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Batch Temp (Tc)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="15"
                    max="38"
                    value={initialBatchTemp}
                    onChange={(e) => setInitialBatchTemp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                  <span className="text-slate-400 font-mono">°C</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full enterprise-btn py-3.5 text-xs tracking-wider uppercase font-bold"
            >
              <Send className="w-4 h-4" />
              <span>Queue Order & Launch 5-Factor Optimization</span>
            </button>
          </form>
        </div>

        {/* Right: Active Orders Queue */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Active Order Queue
              </h3>
              <p className="text-xs text-slate-400">Click any order to inspect dispatch plan</p>
            </div>
            <span className="text-xs font-mono font-bold text-orange-400 bg-orange-950 px-2.5 py-1 rounded-full border border-orange-800">
              {orders.length} in Queue
            </span>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {orders.map((ord) => {
              const isSelected = ord.id === selectedOrderId;
              return (
                <div
                  key={ord.id}
                  onClick={() => onSelectOrderForDispatch && onSelectOrderForDispatch(ord)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-slate-800 border-orange-500 shadow-lg ring-1 ring-orange-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-orange-400 bg-orange-950/70 px-2 py-0.5 rounded">
                      {ord.id}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white truncate">{ord.name}</h4>
                    <p className="text-xs text-slate-400 truncate">{ord.locationName}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono pt-1 border-t border-slate-800/80">
                    <span>{ord.volume_m3} m³</span>
                    <span>Target: {ord.requested_time}</span>
                    <span className="text-orange-400 font-bold flex items-center gap-1">
                      Select <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
