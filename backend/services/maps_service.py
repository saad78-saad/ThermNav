import os
import httpx
import math
from typing import List, Dict, Any, Tuple
from dotenv import load_dotenv

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")


async def get_route_data(
    plant_lat: float, plant_lng: float,
    site_lat: float, site_lng: float
) -> Dict[str, Any]:
    """
    Fetches real road routing data.
    Priority 1: Google Maps Directions API (if GOOGLE_MAPS_API_KEY is configured).
    Priority 2: Live Open Source Routing Machine (OSRM) on OpenStreetMap (100% free, no key required).
    Priority 3: Multi-harmonic bezier simulation fallback.
    """
    # 1. Try Google Maps if API key is provided
    if GOOGLE_MAPS_API_KEY:
        try:
            params = {
                "origin": f"{plant_lat},{plant_lng}",
                "destination": f"{site_lat},{site_lng}",
                "mode": "driving",
                "key": GOOGLE_MAPS_API_KEY
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    "https://maps.googleapis.com/maps/api/directions/json",
                    params=params
                )
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == "OK" and data.get("routes"):
                        leg = data["routes"][0]["legs"][0]
                        duration_mins = leg["duration"]["value"] // 60
                        polyline_str = data["routes"][0]["overview_polyline"]["points"]
                        points = _decode_polyline(polyline_str)
                        return {
                            "transit_time_minutes": duration_mins,
                            "points": points,
                            "source": "google_maps_directions_live"
                        }
        except Exception as e:
            print(f"[Google Maps routing warning] {e}")

    # 2. Try Live Open Source Routing Machine (OSRM) with Multi-Mirror Redundancy (100% Free & Open-Source)
    osrm_endpoints = [
        f"https://routing.openstreetmap.de/routed-car/route/v1/driving/{plant_lng},{plant_lat};{site_lng},{site_lat}?overview=full&geometries=geojson",
        f"http://router.project-osrm.org/route/v1/driving/{plant_lng},{plant_lat};{site_lng},{site_lat}?overview=full&geometries=geojson",
        f"https://routing.openstreetmap.de/routed-truck/route/v1/driving/{plant_lng},{plant_lat};{site_lng},{site_lat}?overview=full&geometries=geojson",
    ]

    for osrm_url in osrm_endpoints:
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get(osrm_url)
                if resp.status_code == 200:
                    osrm_data = resp.json()
                    if osrm_data.get("code") == "Ok" and osrm_data.get("routes"):
                        route = osrm_data["routes"][0]
                        duration_sec = route.get("duration", 1440)
                        # Mixer truck traffic adjustment factor for NYC urban corridors (1.3x for heavy transit mixer)
                        duration_mins = max(12, int((duration_sec * 1.35) / 60))
                        coords = route.get("geometry", {}).get("coordinates", [])
                        # OSRM returns coordinates as [lng, lat]
                        points = [{"lat": round(c[1], 6), "lng": round(c[0], 6)} for c in coords]
                        if points and len(points) >= 2:
                            return {
                                "transit_time_minutes": duration_mins,
                                "points": points,
                                "source": "openstreetmap_osrm_live"
                            }
        except Exception as e:
            continue

    # 3. Deterministic urban road curvature simulation fallback
    return _simulate_route(plant_lat, plant_lng, site_lat, site_lng)


def _decode_polyline(encoded: str) -> List[Dict[str, float]]:
    """Decodes a Google Maps encoded polyline string into a list of lat/lng dicts."""
    points = []
    index = 0
    lat = 0
    lng = 0

    while index < len(encoded):
        shift, result = 0, 0
        while True:
            b = ord(encoded[index]) - 63
            index += 1
            result |= (b & 0x1F) << shift
            shift += 5
            if b < 0x20:
                break
        dlat = ~(result >> 1) if result & 1 else result >> 1
        lat += dlat

        shift, result = 0, 0
        while True:
            b = ord(encoded[index]) - 63
            index += 1
            result |= (b & 0x1F) << shift
            shift += 5
            if b < 0x20:
                break
        dlng = ~(result >> 1) if result & 1 else result >> 1
        lng += dlng

        points.append({"lat": lat / 1e5, "lng": lng / 1e5})

    return points


def _simulate_route(
    plant_lat: float, plant_lng: float,
    site_lat: float, site_lng: float
) -> Dict[str, Any]:
    """
    Generates a realistic 24-point route between plant and site.
    Uses multi-harmonic bezier curves to simulate urban arterial & highway bends.
    Estimates transit time based on haversine distance at 42 km/h average with traffic.
    """
    num_points = 24
    points = []
    for i in range(num_points + 1):
        t = i / num_points
        lat = plant_lat + t * (site_lat - plant_lat)
        lng = plant_lng + t * (site_lng - plant_lng)
        
        # Add realistic highway bends and arterial turns
        if 0 < i < num_points:
            bend1 = math.sin(t * math.pi) * 0.012
            bend2 = math.sin(t * 2 * math.pi) * 0.005
            lat += (bend1 * 0.5 + bend2 * 0.3)
            lng += (bend1 * 0.8 - bend2 * 0.4)
            
        points.append({"lat": round(lat, 6), "lng": round(lng, 6)})

    # Haversine distance estimate
    R = 6371.0
    dlat = math.radians(site_lat - plant_lat)
    dlng = math.radians(site_lng - plant_lng)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(plant_lat)) * math.cos(math.radians(site_lat)) * math.sin(dlng / 2) ** 2
    distance_km = 2 * R * math.asin(math.sqrt(a)) * 1.25  # 1.25 road detour index
    transit_mins = max(12, int((distance_km / 42.0) * 60))

    return {"transit_time_minutes": transit_mins, "points": points, "source": "simulated_road_curvature"}