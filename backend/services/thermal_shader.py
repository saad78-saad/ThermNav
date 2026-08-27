from typing import List, Dict, Any
from models.schemas import RouteSegment


SEGMENT_HEAT_THRESHOLDS = [
    (28.0, "#10B981", "SAFE_CORRIDOR"),
    (34.0, "#F59E0B", "MODERATE_HEAT"),
    (float("inf"), "#EF4444", "CRITICAL_THERMAL_ZONE"),
]


def assign_thermal_colors(
    route_points: List[Dict[str, float]],
    forecast_12h: List[Dict[str, Any]],
    dispatch_hour: int
) -> List[RouteSegment]:
    """
    Partitions the route into segments and assigns thermal color classifications
    based on FortyGuard LTM data for the selected dispatch hour.
    Each segment covers a span of route points.
    """
    if not route_points or len(route_points) < 2:
        return []

    forecast = forecast_12h[min(dispatch_hour, len(forecast_12h) - 1)]
    base_temp = forecast["ambient_temp_celsius"]
    ghi = forecast["solar_irradiance_ghi"]

    # Divide route into 4 segments
    n = len(route_points)
    segment_size = max(1, n // 4)
    segments = []

    for i in range(0, n - 1, segment_size):
        seg_points = route_points[i: i + segment_size + 1]
        if len(seg_points) < 2:
            continue

        # Simulate temperature gradient along the route -- peaks near midpoint
        position_fraction = i / max(n - 1, 1)
        heat_boost = _urban_heat_island_factor(position_fraction, ghi)
        segment_temp = round(base_temp + heat_boost, 1)

        color, classification = _classify_temp(segment_temp, ghi)
        segments.append(RouteSegment(
            path=seg_points,
            heat_color=color,
            avg_temp_celsius=segment_temp,
            classification=classification
        ))

    return segments


def _urban_heat_island_factor(position: float, ghi: float) -> float:
    """
    Estimates the urban heat island temperature boost at a given route position.
    Peaks at mid-route (typical highway interchange / urban core pattern).
    Higher solar irradiance increases the surface radiant heat component.
    """
    import math
    base_uhi = 4.0 * math.sin(position * math.pi)
    solar_component = (ghi / 1000.0) * 3.5
    return round(base_uhi + solar_component, 2)


def _classify_temp(temp: float, ghi: float) -> tuple:
    if temp >= 34.0 or ghi > 800:
        return "#EF4444", "CRITICAL_THERMAL_ZONE"
    elif temp >= 28.0:
        return "#F59E0B", "MODERATE_HEAT"
    else:
        return "#10B981", "SAFE_CORRIDOR"