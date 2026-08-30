import React, { useState, useEffect } from 'react';
import {
  MapPin,
  UploadCloud,
  Layers,
  Sparkles,
  ArrowRight,
  X,
  Building2,
  Compass,
  CheckCircle2,
  Volume2,
  VolumeX,
  FileCode,
  Globe
} from 'lucide-react';
import { useVoiceAssistant } from './VoiceNarrationAssistant';

export default function StartupSetupPromptModal({
  isOpen,
  onClose,
  onApplyLocationAndBlueprint,
  onOpenUploadModal,
  theme = 'dark'
}) {
  const isLight = theme === 'light';
  const { speak, cancelSpeech } = useVoiceAssistant();

  const [locationInput, setLocationInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [buildingName, setBuildingName] = useState('');
  const [numFloors, setNumFloors] = useState(10);
  const [floorAreaM2, setFloorAreaM2] = useState(25000);
  const [showAdvancedBim, setShowAdvancedBim] = useState(false);

  // Play spoken announcement when modal opens on initial site load
  useEffect(() => {
    if (isOpen) {
      const introVoice = "Welcome to ThermoShift AI. Please note: the default simulation currently displays preloaded benchmark data for demonstration. If you would like to simulate your own custom building and site, please enter your location address. To visualize your custom building in 3D, you can also upload your architectural blueprint or CAD file. The platform will then calculate all real-time microclimate temperatures, HVAC electric loads, and financial savings specifically for your custom location and building structure, rather than preloaded presets.";
      const introTitle = "Custom Site Location & 3D Blueprint Setup";
      const timer = setTimeout(() => {
        speak(introTitle, introVoice, { isStartup: true, immediate: true, force: true });
      }, 700);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isOpen, speak]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setBuildingName(nameWithoutExt);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.floors || parsed.num_floors) setNumFloors(parsed.floors || parsed.num_floors);
          if (parsed.floor_area_m2 || parsed.area) setFloorAreaM2(parsed.floor_area_m2 || parsed.area);
          if (parsed.name) setBuildingName(parsed.name);
          if (parsed.city && !locationInput) setLocationInput(parsed.city);
        } catch (err) {
          // If plain CAD/text, keep defaults
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSearching(true);

    let lat = 40.7061;
    let lng = -74.0092;
    let resolvedLocation = locationInput.trim() || 'Custom Facility Location';

    if (locationInput.trim()) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
          resolvedLocation = data[0].display_name.split(',').slice(0, 3).join(',');
        }
      } catch (err) {
        console.warn('Geocoding fallback:', err);
      }
    }

    const customPlan = {
      name: buildingName.trim() || (selectedFile ? selectedFile.name : `Facility at ${resolvedLocation}`),
      city: resolvedLocation,
      lat,
      lng,
      num_floors: parseInt(numFloors) || 10,
      floor_area_m2: parseFloat(floorAreaM2) || 25000,
      chiller_capacity_kw: Math.round(parseFloat(floorAreaM2 || 25000) * 0.09),
      thermal_capacitance_kwh_c: Math.round(parseFloat(floorAreaM2 || 25000) * 0.07),
      hasUploadedBlueprint: Boolean(selectedFile)
    };

    setIsSearching(false);
    cancelSpeech();
    onApplyLocationAndBlueprint({
      location: resolvedLocation,
      coords: { lat, lng, locationName: resolvedLocation },
      customPlan: (selectedFile || showAdvancedBim) ? customPlan : null
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col transition-all ${
        isLight ? 'bg-white border-slate-200 text-slate-900 shadow-2xl' : 'bg-slate-900 border-cyan-500/50 text-white shadow-2xl shadow-cyan-500/20'
      }`}>
        {/* Modal Header */}
        <div className="p-5 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/30">
              🌍
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Custom Location & 3D Blueprint Setup
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold">
                  Live Setup
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Preloaded benchmark data is active. Enter your address or upload your blueprint to calculate custom microclimates.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              cancelSpeech();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
            title="Dismiss and Continue with Preloaded NYC Demo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spoken Voice Notice Badge */}
        <div className="p-3.5 px-6 bg-cyan-500/10 border-b border-cyan-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-cyan-300 font-mono">
            <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
            <span>
              <strong>Voice Guide:</strong> Preloaded benchmark data is running. Enter your location or upload a blueprint to calculate your own site.
            </span>
          </div>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* 1. Enter Custom Location */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-300 font-mono tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>1. Enter Your Facility Location / City / GPS:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="e.g. 350 5th Ave, New York, NY or Chicago, IL or Dubai Marina..."
                className="w-full pl-4 pr-3 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              FortyGuard LTM will query real-time street canyon microclimates, urban heat island flux, and solar angles for this exact location.
            </p>
          </div>

          {/* 2. Optional 3D Blueprint Upload */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-slate-300 font-mono tracking-wider flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                <span>2. Upload 3D Architectural Blueprint (Optional):</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAdvancedBim(!showAdvancedBim)}
                className="text-[11px] text-cyan-400 hover:underline font-mono"
              >
                {showAdvancedBim ? 'Hide Parameters' : '+ Manual BIM Specs'}
              </button>
            </div>

            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-2xl bg-slate-950/60 cursor-pointer transition-all hover:bg-slate-950 group">
              <div className="flex flex-col items-center justify-center space-y-1.5 text-center">
                <FileCode className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                <div className="text-xs text-slate-300">
                  {selectedFile ? (
                    <strong className="text-cyan-300">{selectedFile.name} (Ready to ingest)</strong>
                  ) : (
                    <span><strong>Click to Upload</strong> or drag & drop CAD/BIM blueprint (.json, .ifc, .dwg, .dxf, .csv)</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500">
                  Auto-extracts floor count, envelope U-values, and ductwork topology
                </span>
              </div>
              <input
                type="file"
                accept=".json,.ifc,.dwg,.dxf,.csv,.xml,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Advanced Manual BIM Parameters (If toggled or file loaded) */}
          {(showAdvancedBim || selectedFile) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 animate-in fade-in duration-150 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px]">Building Name:</span>
                <input
                  type="text"
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  placeholder="Facility Name"
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px]">Floor Count:</span>
                <input
                  type="number"
                  min="1"
                  max="80"
                  value={numFloors}
                  onChange={(e) => setNumFloors(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px]">Total Area (m²):</span>
                <input
                  type="number"
                  min="500"
                  value={floorAreaM2}
                  onChange={(e) => setFloorAreaM2(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                cancelSpeech();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              ⚡ Explore with Preloaded NYC Demo
            </button>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-600 hover:opacity-90 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>{isSearching ? 'Calculating Site...' : '🚀 Calculate My Custom Site'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
