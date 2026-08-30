import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Building,
  Thermometer,
  Layers,
  Search,
  Crosshair,
  Wind,
  Sun,
  Flame,
  ShieldAlert,
  Zap,
  Maximize2
} from 'lucide-react';

const TILE_PROVIDERS = {
  carto_dark: {
    name: '🌌 CartoDB Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  osm_standard: {
    name: '🗺️ OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  esri_satellite: {
    name: '🛰️ ESRI Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

export default function OpenStreetMicroclimateMap({
  lat = 40.7061,
  lng = -74.0092,
  locationName = 'Manhattan Financial Canyon, New York, NY',
  selectedHour = 14,
  ambientTemp = 34.2,
  neighbors = [],
  onSelectNeighbor,
  onLocationChange,
  theme = 'dark'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markerGroupRef = useRef(null);
  const heatCircleRef = useRef(null);

  // Default to OpenStreetMap Standard as requested
  const [activeTileKey, setActiveTileKey] = useState('osm_standard');
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const isLight = theme === 'light';

  // Compute thermal color based on ambient & hour
  const getThermalColor = (hour, temp) => {
    if (hour >= 11 && hour <= 16) {
      return { fill: '#ef4444', stroke: '#f43f5e', label: 'Critical Solar & UHI Flux' };
    } else if (hour >= 7 && hour <= 10) {
      return { fill: '#f59e0b', stroke: '#fbbf24', label: 'Morning Warming Influx' };
    } else if (hour >= 17 && hour <= 20) {
      return { fill: '#f97316', stroke: '#ea580c', label: 'Asphalt Thermal Retention' };
    } else {
      return { fill: '#06b6d4', stroke: '#38bdf8', label: 'Night Off-Peak Radiative Cool' };
    }
  };

  const thermalTheme = getThermalColor(selectedHour, ambientTemp);

  // Initialize Map & Auto-Center when Coordinates Update
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 17,
        zoomControl: false,
        attributionControl: false
      });

      // Zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

      // Add default tile layer (OpenStreetMap)
      const provider = TILE_PROVIDERS.osm_standard;
      const tileLayer = L.tileLayer(provider.url, {
        attribution: provider.attribution,
        maxZoom: 20
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Group for markers
      const markerGroup = L.layerGroup().addTo(map);
      markerGroupRef.current = markerGroup;

      mapInstanceRef.current = map;

      // Timeout to ensure perfect container sizing
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    } else {
      mapInstanceRef.current.flyTo([lat, lng], 17, { animate: true, duration: 1.0 });
      mapInstanceRef.current.invalidateSize();
    }
  }, [lat, lng]);

  // Update Tile Layer when user switches style
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const provider = TILE_PROVIDERS[activeTileKey];
    const newTileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: 20
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  }, [activeTileKey]);

  // Update Markers & Thermal Heat Radius dynamically whenever coordinates, hour, or neighbors update
  useEffect(() => {
    if (!mapInstanceRef.current || !markerGroupRef.current) return;

    const map = mapInstanceRef.current;
    const group = markerGroupRef.current;
    group.clearLayers();

    // 1. FortyGuard 150m Microclimate Thermal Buffer Circle
    const radiusMeters = 150;
    const heatCircle = L.circle([lat, lng], {
      radius: radiusMeters,
      color: thermalTheme.stroke,
      fillColor: thermalTheme.fill,
      fillOpacity: 0.18,
      weight: 2,
      dashArray: '6, 6'
    }).addTo(group);

    heatCircle.bindTooltip(
      `<strong>FortyGuard 150m Microclimate AOI</strong><br/>Hour ${selectedHour}:00 • ${ambientTemp}°C • ${thermalTheme.label}`,
      { permanent: false, direction: 'top', className: 'leaflet-tooltip-dark' }
    );
    heatCircleRef.current = heatCircle;

    // 2. Central Target Building Marker (Custom Glowing Pulse Pin)
    const targetIconHtml = `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-12 h-12 rounded-full bg-cyan-500/30 animate-ping"></span>
        <span class="absolute w-8 h-8 rounded-full bg-cyan-500/60 animate-pulse"></span>
        <div class="relative z-10 w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center font-black shadow-xl border-2 border-white text-xs">
          🏢
        </div>
      </div>
    `;

    const targetIcon = L.divIcon({
      html: targetIconHtml,
      className: 'custom-leaflet-pin',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const targetMarker = L.marker([lat, lng], { icon: targetIcon }).addTo(group);
    targetMarker.bindPopup(`
      <div style="min-width: 220px; font-family: sans-serif; padding: 4px;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
          <span style="font-size: 14px;">🏢</span>
          <strong style="color: #06b6d4; font-size: 13px;">Target Digital Twin Facility</strong>
        </div>
        <div style="font-size: 11px; color: #cbd5e1; line-height: 1.5;">
          <div>📍 <strong>Location:</strong> ${locationName}</div>
          <div>🌡️ <strong>Ambient Air:</strong> ${ambientTemp}°C (Hour ${selectedHour}:00)</div>
          <div>❄️ <strong>Indoor Setpoint:</strong> 22.8°C (Optimized)</div>
          <div>⚡ <strong>Active Mode:</strong> ${selectedHour >= 12 && selectedHour <= 17 ? 'PEAK_SHED_COASTING' : selectedHour <= 8 ? 'FREE_COOLING / PRE_COOL' : 'MODULATED_HVAC'}</div>
        </div>
      </div>
    `);

    // 3. Dynamic Surrounding Building Pins (North, South, East, West Offsets)
    const offsets = {
      WEST: { dLat: 0.0002, dLng: -0.0009 },
      SOUTH: { dLat: -0.0008, dLng: 0.0001 },
      EAST: { dLat: 0.0001, dLng: 0.0008 },
      NORTH: { dLat: 0.0007, dLng: -0.0002 }
    };

    neighbors.forEach((n, idx) => {
      const orient = (n.orientation || 'WEST').toUpperCase();
      const offset = offsets[orient] || { dLat: (idx - 1.5) * 0.0004, dLng: (idx - 1.5) * 0.0004 };
      const nLat = lat + offset.dLat;
      const nLng = lng + offset.dLng;

      // Dynamic Temperature calculation for this neighbor
      let tempDelta = 0;
      if (orient === 'EAST') {
        tempDelta = selectedHour >= 6 && selectedHour <= 14 ? 12.5 * Math.sin(((selectedHour - 6) * Math.PI) / 8.0) : 1.0;
      } else if (orient === 'SOUTH') {
        tempDelta = selectedHour >= 8 && selectedHour <= 17 ? 15.0 * Math.sin(((selectedHour - 8) * Math.PI) / 8.0) : 1.5;
      } else if (orient === 'WEST') {
        tempDelta = selectedHour >= 10 && selectedHour <= 19 ? 19.5 * Math.sin(((selectedHour - 10) * Math.PI) / 8.0) : 1.0;
      } else {
        tempDelta = selectedHour >= 9 && selectedHour <= 17 ? 4.5 * Math.sin(((selectedHour - 9) * Math.PI) / 8.0) : 0.5;
      }
      const dynTemp = Math.round((ambientTemp + tempDelta * 0.72) * 10) / 10;

      const badgeColor = dynTemp >= 48 ? '#ef4444' : dynTemp >= 40 ? '#f97316' : dynTemp >= 32 ? '#eab308' : '#10b981';

      const neighborIconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div style="background-color: ${badgeColor};" class="px-2 py-0.5 rounded-full text-slate-950 font-black text-[10px] shadow-lg border border-white flex items-center gap-1 font-mono whitespace-nowrap">
            <span>${orient}</span>
            <span>${dynTemp}°C</span>
          </div>
        </div>
      `;

      const neighborIcon = L.divIcon({
        html: neighborIconHtml,
        className: 'neighbor-leaflet-pin',
        iconSize: [70, 24],
        iconAnchor: [35, 12]
      });

      const nMarker = L.marker([nLat, nLng], { icon: neighborIcon }).addTo(group);
      
      // Draw radiative connection line from neighbor to target facility
      L.polyline([[nLat, nLng], [lat, lng]], {
        color: badgeColor,
        weight: 1.5,
        opacity: 0.6,
        dashArray: '4, 4'
      }).addTo(group);

      nMarker.on('click', () => {
        if (onSelectNeighbor) onSelectNeighbor(n);
      });

      nMarker.bindPopup(`
        <div style="min-width: 200px; font-family: sans-serif; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <strong style="color: ${badgeColor}; font-size: 12px;">${n.name || orient + ' Structure'}</strong>
          </div>
          <div style="font-size: 11px; color: #cbd5e1; line-height: 1.5;">
            <div>🌡️ <strong>Live Surface Temp:</strong> <span style="color: ${badgeColor}; font-weight: bold;">${dynTemp}°C</span></div>
            <div>⚡ <strong>Radiant Flux on Us:</strong> ${n.radiantFluxOntoTarget || n.radiant_flux_label || '+32.4 W/m²'}</div>
            <div>📐 <strong>View Factor F12:</strong> ${n.viewFactor || n.view_factor_to_target || '0.38'}</div>
            <div>📏 <strong>Distance:</strong> ${n.distanceM || n.distance_m || '35'} meters</div>
            <div>🏢 <strong>Façade Type:</strong> ${n.facadeType || n.facade_type || 'Glazed Curtain Wall'}</div>
          </div>
        </div>
      `);
    });
  }, [lat, lng, selectedHour, ambientTemp, neighbors, thermalTheme, locationName]);

  // OpenStreetMap Nominatim Geocoding Search Handler
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput.trim())}`);
      const results = await res.json();
      if (results && results.length > 0) {
        const topResult = results[0];
        const newLat = parseFloat(topResult.lat);
        const newLng = parseFloat(topResult.lon);

        if (onLocationChange) {
          onLocationChange({
            lat: newLat,
            lng: newLng,
            name: topResult.display_name
          });
        }
      }
    } catch (err) {
      console.warn('Nominatim geocode failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 17, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden border border-slate-800 flex flex-col bg-slate-950">
      {/* Top Map Floating HUD Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pointer-events-none">
        {/* Location Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-md pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl"
        >
          <Search className="w-4 h-4 text-cyan-400 ml-2 shrink-0" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search OpenStreetMap (e.g. Times Square, Wall St, JFK)..."
            className="w-full bg-transparent border-none text-xs font-mono font-bold text-white placeholder:text-slate-400 focus:outline-none px-2 py-1"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isSearching ? 'Locating...' : 'Search'}
          </button>
        </form>

        {/* Tile Provider Layer Switcher */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-2xl bg-slate-950/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-xs font-mono font-bold shrink-0">
          {Object.entries(TILE_PROVIDERS).map(([key, prov]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTileKey(key)}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                activeTileKey === key
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {prov.name.split(' ')[0]} {prov.name.split(' ')[1]}
            </button>
          ))}
          <button
            type="button"
            onClick={handleRecenter}
            className="p-1.5 rounded-xl bg-slate-800 text-cyan-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
            title="Recenter Map on Target Building"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Leaflet Map Mount Canvas */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[520px] z-0" />

      {/* Bottom Thermal Summary Pill Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] pointer-events-none flex flex-wrap items-center justify-between gap-2">
        <div className="pointer-events-auto flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-slate-950/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: thermalTheme.fill }} />
            <strong className="text-white">{locationName.split(',')[0]}</strong>
          </div>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">GPS: {lat.toFixed(4)}, {lng.toFixed(4)}</span>
          <span className="text-slate-500">•</span>
          <span className="text-rose-400 font-bold">{ambientTemp}°C Ambient</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-400 font-bold">150m Microclimate Radius</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1 text-[11px] font-mono text-slate-400 px-3 py-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md">
          <span>Click any <strong>building badge</strong> to inspect thermal flux</span>
        </div>
      </div>
    </div>
  );
}
