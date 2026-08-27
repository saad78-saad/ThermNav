import { useEffect, useRef, useState } from 'react';

const CLASSIFICATION_LABELS = {
  SAFE_CORRIDOR: 'Safe Corridor',
  MODERATE_HEAT: 'Moderate Heat',
  CRITICAL_THERMAL_ZONE: 'Critical Thermal Zone',
};

export default function GoogleThermalMap({ routeSegments, plantCoords, siteCoords, apiKey }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const vehicleMarker = useRef(null);
  const polylines = useRef([]);
  const animFrameRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    if (window.google) { setMapLoaded(true); return; }
    if (!apiKey) { setMapLoaded(true); return; } // simulate mode

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, [apiKey]);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google) return;

    const center = plantCoords
      ? { lat: plantCoords.lat, lng: plantCoords.lng }
      : { lat: 25.2048, lng: 55.2708 };

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#1a2035' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#8e9ab0' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#1a2035' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d3a52' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a2035' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      ],
    });

    // Plant marker
    if (plantCoords) {
      new window.google.maps.Marker({
        position: plantCoords,
        map: mapInstance.current,
        title: 'Batching Plant',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#60A5FA',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });
    }

    // Site marker
    if (siteCoords) {
      new window.google.maps.Marker({
        position: siteCoords,
        map: mapInstance.current,
        title: 'Pour Site',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#34D399',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });
    }
  }, [mapLoaded, plantCoords, siteCoords]);

  // Draw thermal polylines and animate vehicle
  useEffect(() => {
    if (!mapInstance.current || !routeSegments || routeSegments.length === 0) return;

    // Clear old polylines
    polylines.current.forEach(p => p.setMap(null));
    polylines.current = [];
    if (vehicleMarker.current) vehicleMarker.current.setMap(null);
    if (animFrameRef.current) clearInterval(animFrameRef.current);

    // Draw thermal segments
    routeSegments.forEach(segment => {
      const poly = new window.google.maps.Polyline({
        path: segment.path,
        geodesic: true,
        strokeColor: segment.heat_color,
        strokeOpacity: 0.9,
        strokeWeight: 7,
        map: mapInstance.current,
      });
      polylines.current.push(poly);
    });

    // Collect all points for animation
    const allPoints = routeSegments.flatMap(s => s.path);
    if (allPoints.length === 0) return;

    vehicleMarker.current = new window.google.maps.Marker({
      position: allPoints[0],
      map: mapInstance.current,
      title: 'Transit Mixer',
      icon: {
        path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: '#38BDF8',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#ffffff',
        rotation: 0,
      },
    });

    let idx = 0;
    animFrameRef.current = setInterval(() => {
      if (!vehicleMarker.current) return;
      idx = (idx + 1) % allPoints.length;
      vehicleMarker.current.setPosition(allPoints[idx]);

      // Compute heading
      if (idx < allPoints.length - 1) {
        const from = allPoints[idx];
        const to = allPoints[idx + 1];
        const heading = window.google.maps.geometry
          ? window.google.maps.geometry.spherical.computeHeading(
              new window.google.maps.LatLng(from.lat, from.lng),
              new window.google.maps.LatLng(to.lat, to.lng)
            )
          : 45;
        vehicleMarker.current.setIcon({
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#38BDF8',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
          rotation: heading,
        });
      }
    }, 600);

    return () => clearInterval(animFrameRef.current);
  }, [routeSegments]);

  // Fallback: render a static SVG map when Google Maps key is absent
  if (!apiKey || !window.google) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden bg-[#1a2035] border border-zinc-700" style={{ height: 480 }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-zinc-400">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-sm font-medium">Google Maps API key not configured</p>
          <p className="text-xs text-zinc-500">Route thermal data computed — map rendering requires API key</p>
        </div>

        {/* Render route data as a legend even without map */}
        {routeSegments && routeSegments.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
            {routeSegments.map((seg, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs"
              >
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: seg.heat_color }}
                />
                <span className="text-zinc-300">
                  Segment {i + 1}: {seg.avg_temp_celsius}°C — {CLASSIFICATION_LABELS[seg.classification] || seg.classification}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full rounded-xl border border-zinc-700"
      style={{ height: 480 }}
    />
  );
}
