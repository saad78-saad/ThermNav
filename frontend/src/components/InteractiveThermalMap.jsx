import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix for default Leaflet icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CLASSIFICATION_META = {
  SAFE_CORRIDOR: { color: '#10B981', label: 'Safe Corridor (< 28°C)', bg: '#064e3b' },
  MODERATE_HEAT: { color: '#F59E0B', label: 'Moderate Heat (28–34°C)', bg: '#78350f' },
  CRITICAL_THERMAL_ZONE: { color: '#EF4444', label: 'Critical Thermal Island (≥ 34°C)', bg: '#7f1d1d' },
};

export default function InteractiveThermalMap({
  routeSegments = [],
  plantCoords,
  siteCoords,
  truckProgress = 0, // 0.0 to 1.0 along the route
  isPlaying = false,
  selectedHourLabel = '18:00',
  showHeatmap = true,
  onSegmentClick,
  theme = 'dark',
}) {
  const isLight = theme === 'light';
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layerGroupRef = useRef(null);
  const truckMarkerRef = useRef(null);
  const heatmapLayerRef = useRef(null);

  // Flatten all route points
  const allPoints = React.useMemo(() => {
    if (!routeSegments || routeSegments.length === 0) return [];
    return routeSegments.flatMap(s => s.path || []);
  }, [routeSegments]);

  // Compute truck coordinates along the path given truckProgress (0 to 1)
  const truckPos = React.useMemo(() => {
    if (allPoints.length === 0) return null;
    if (truckProgress <= 0) return allPoints[0];
    if (truckProgress >= 1) return allPoints[allPoints.length - 1];

    const totalSegments = allPoints.length - 1;
    const exactIndex = truckProgress * totalSegments;
    const index = Math.floor(exactIndex);
    const fraction = exactIndex - index;

    const p1 = allPoints[index];
    const p2 = allPoints[Math.min(index + 1, allPoints.length - 1)];

    return {
      lat: p1.lat + (p2.lat - p1.lat) * fraction,
      lng: p1.lng + (p2.lng - p1.lng) * fraction,
    };
  }, [allPoints, truckProgress]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialCenter = plantCoords ? [plantCoords.lat, plantCoords.lng] : [40.7306, -73.9352];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    const tileUrl = isLight
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    const tiles = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = tiles;
    layerGroupRef.current = L.layerGroup().addTo(map);
    heatmapLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Tile Layer when theme switches between Dark and Light
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    const newTileUrl = isLight
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    tileLayerRef.current.setUrl(newTileUrl);
  }, [isLight]);

  // Update Route Polylines, Thermal Heatmap Circles, and Waypoint Markers
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    const heatmapGroup = heatmapLayerRef.current;
    if (!map || !layerGroup || !heatmapGroup) return;

    layerGroup.clearLayers();
    heatmapGroup.clearLayers();

    if (!routeSegments || routeSegments.length === 0) return;

    const latLngBounds = [];

    // 1. Render FortyGuard Microclimate Thermal Heatmap Gradient Overlay
    if (showHeatmap) {
      routeSegments.forEach((segment) => {
        if (!segment.path || segment.path.length === 0) return;
        const midIdx = Math.floor(segment.path.length / 2);
        const midPoint = segment.path[midIdx];
        const isCritical = segment.heat_color === '#EF4444';
        const isModerate = segment.heat_color === '#F59E0B';

        const circle = L.circle([midPoint.lat, midPoint.lng], {
          radius: isCritical ? 2400 : isModerate ? 1800 : 1200,
          color: segment.heat_color,
          fillColor: segment.heat_color,
          fillOpacity: isCritical ? 0.28 : isModerate ? 0.18 : 0.10,
          weight: 0,
        });

        circle.bindTooltip(
          `<b>FortyGuard LTM Thermal Zone</b><br/>Hour: ${selectedHourLabel}<br/>Surface Temp: ${segment.avg_temp_celsius}°C<br/>Risk: ${segment.classification}`,
          { className: 'bg-zinc-950 text-xs text-white border border-zinc-700 rounded-lg p-2' }
        );

        heatmapGroup.addLayer(circle);
      });
    }

    // 2. Render Thermal Polylines with Glow
    routeSegments.forEach((segment, idx) => {
      if (!segment.path || segment.path.length === 0) return;
      const latLngs = segment.path.map(p => [p.lat, p.lng]);
      latLngs.forEach(p => latLngBounds.push(p));

      // Glow effect background polyline
      const glowLine = L.polyline(latLngs, {
        color: segment.heat_color,
        weight: 12,
        opacity: isLight ? 0.25 : 0.4,
        lineCap: 'round',
        lineJoin: 'round',
      });
      layerGroup.addLayer(glowLine);

      // Main route polyline
      const polyline = L.polyline(latLngs, {
        color: segment.heat_color,
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      });

      polyline.bindPopup(`
        <div style="font-family: system-ui; min-width: 180px;">
          <div style="font-weight: 700; font-size: 13px; color: ${segment.heat_color}; margin-bottom: 4px;">
            Segment #${idx + 1}: ${segment.classification}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            Forecast Hour: <b>${selectedHourLabel}</b>
          </div>
          <div style="background: rgba(15, 23, 42, 0.08); padding: 8px; border-radius: 6px; font-size: 11px;">
            <div>🌡️ <b>Temp:</b> ${segment.avg_temp_celsius}°C</div>
            <div>⚡ <b>Status:</b> ${segment.classification.replace(/_/g, ' ')}</div>
          </div>
        </div>
      `);

      layerGroup.addLayer(polyline);
    });

    // 3. Batching Plant Marker (Origin)
    if (plantCoords) {
      const plantIcon = L.divIcon({
        className: 'custom-plant-marker',
        html: `
          <div style="
            background: #2563eb;
            color: #ffffff;
            border: 2px solid #ffffff;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.7);
            font-size: 15px;
          ">
            🏗️
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const plantMarker = L.marker([plantCoords.lat, plantCoords.lng], { icon: plantIcon });
      plantMarker.bindPopup(`
        <div style="font-family: system-ui; padding: 2px;">
          <b style="color: #2563eb; font-size: 13px;">🏗️ Ready-Mix Batching Plant</b>
          <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">Hydration timer initiated upon water-cement contact.</p>
        </div>
      `);
      layerGroup.addLayer(plantMarker);
      latLngBounds.push([plantCoords.lat, plantCoords.lng]);
    }

    // 4. Construction Pour Site Marker (Destination)
    if (siteCoords) {
      const siteIcon = L.divIcon({
        className: 'custom-site-marker',
        html: `
          <div style="
            background: #059669;
            color: #ffffff;
            border: 2px solid #ffffff;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 15px rgba(5, 150, 105, 0.7);
            font-size: 15px;
          ">
            📍
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const siteMarker = L.marker([siteCoords.lat, siteCoords.lng], { icon: siteIcon });
      siteMarker.bindPopup(`
        <div style="font-family: system-ui; padding: 2px;">
          <b style="color: #059669; font-size: 13px;">📍 Construction Site Pour Point</b>
          <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">Target discharge point. ACI 305R Evaporation gate active.</p>
        </div>
      `);
      layerGroup.addLayer(siteMarker);
      latLngBounds.push([siteCoords.lat, siteCoords.lng]);
    }

    // Auto-fit map bounds with padding
    if (latLngBounds.length > 0) {
      map.fitBounds(latLngBounds, { padding: [45, 45], maxZoom: 14 });
    }
  }, [routeSegments, plantCoords, siteCoords, selectedHourLabel, showHeatmap, isLight]);

  // Update Animated Transit Mixer Truck Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !truckPos) return;

    if (!truckMarkerRef.current) {
      const truckIcon = L.divIcon({
        className: 'custom-truck-marker',
        html: `
          <div style="
            background: #ea580c;
            border: 2px solid #ffffff;
            border-radius: 10px;
            width: 38px;
            height: 38px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 20px rgba(234, 88, 12, 0.9);
            color: #ffffff;
            font-size: 18px;
            cursor: pointer;
          ">
            🚛
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      truckMarkerRef.current = L.marker([truckPos.lat, truckPos.lng], { icon: truckIcon, zIndexOffset: 1000 });
      truckMarkerRef.current.bindTooltip(
        `<b>Transit Mixer #402</b><br/>Live Mission Active<br/>Progress: ${(truckProgress * 100).toFixed(0)}%`,
        { permanent: false, direction: 'top', className: isLight ? 'bg-white text-xs text-slate-800 border border-slate-300 shadow-md' : 'bg-zinc-950 text-xs text-white border border-zinc-700' }
      );
      truckMarkerRef.current.addTo(map);
    } else {
      truckMarkerRef.current.setLatLng([truckPos.lat, truckPos.lng]);
      truckMarkerRef.current.setTooltipContent(
        `<b>Transit Mixer #402</b><br/>Live Mission Active<br/>Progress: ${(truckProgress * 100).toFixed(0)}%`
      );
    }
  }, [truckPos, truckProgress, isLight]);

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border shadow-2xl transition-all duration-300 ${
      isLight ? 'border-slate-200 bg-slate-100 shadow-slate-200/60' : 'border-white/10 bg-[#090e17]'
    }`}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '520px' }} />

      {/* Top Map HUD Bar */}
      <div className={`absolute top-4 left-4 z-[400] flex items-center gap-2 backdrop-blur-md border px-4 py-2 rounded-2xl text-xs shadow-xl ${
        isLight
          ? 'bg-white/90 border-slate-200 text-slate-800'
          : 'bg-zinc-950/90 border-zinc-700 text-zinc-300'
      }`}>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-sans-luxury font-bold uppercase tracking-wider text-[11px]">FortyGuard LTM Thermal Map:</span>
        <span className="font-mono font-bold bg-amber-500 text-white px-2.5 py-0.5 rounded-xl shadow-sm">
          {selectedHourLabel}
        </span>
      </div>

      {/* Map Legend Overlay at Bottom Right */}
      <div className={`absolute bottom-4 right-4 z-[400] backdrop-blur-md border p-3.5 rounded-2xl shadow-xl text-xs space-y-1.5 max-w-xs ${
        isLight
          ? 'bg-white/90 border-slate-200 text-slate-700'
          : 'bg-zinc-950/90 border-zinc-700 text-zinc-300'
      }`}>
        <div className="text-[10px] uppercase font-bold font-sans-luxury tracking-wider mb-1 opacity-70">
          FortyGuard Microclimate Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-[11px] font-medium">Safe Corridor (&lt; 28°C)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
          <span className="text-[11px] font-medium">Moderate Heat (28–34°C)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-[11px] font-medium">Critical Heat Island (≥ 34°C)</span>
        </div>
      </div>
    </div>
  );
}

