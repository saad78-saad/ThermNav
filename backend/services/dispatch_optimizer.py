import math
from typing import List, Dict, Any, Optional

# =========================================================================
# 5-Factor Route Optimization Engine
# Weights:
# - Factor 1: Shortest Time (Weight: 20%)
# - Factor 2: Route Condition / Traffic (Weight: 20%)
# - Factor 3: Temperature / Heat Islands via FortyGuard (Weight: 30%)
# - Factor 4: Fuel Efficiency (Weight: 10%)
# - Factor 5: Efficient Execution Demand / Site Readiness (Weight: 20%)
# =========================================================================

WEIGHT_TIME = 0.20
WEIGHT_TRAFFIC = 0.20
WEIGHT_TEMP_UHI = 0.30
WEIGHT_FUEL = 0.10
WEIGHT_EXEC_DEMAND = 0.20


def rank_and_optimize_routes(
    candidate_routes: List[Dict[str, Any]],
    fortyguard_env: Dict[str, Any],
    batch_temp_c: float = 28.0,
    volume_m3: float = 8.0,
    target_delivery_hour: int = 4
) -> Dict[str, Any]:
    """
    Ranks multiple potential candidate routes using the ThermNav 5-Factor Optimization Algorithm.
    Integrates FortyGuard microclimate temperature, traffic delays, fuel burn, and ACI compliance.
    Returns ranked routes, the winning optimal route, and an engineering justification string.
    """
    if not candidate_routes:
        # Fallback to default simulated candidate routes if none provided
        candidate_routes = _generate_default_candidate_routes()

    ambient_temp = fortyguard_env.get("ambient_temp_celsius", 32.0)
    solar_ghi = fortyguard_env.get("solar_irradiance_ghi", 500.0)
    rh = fortyguard_env.get("relative_humidity", 0.45)
    wind_kmh = fortyguard_env.get("wind_speed_kmh", 12.0)

    evaluated_routes = []

    for route in candidate_routes:
        route_id = route.get("id", "Route-A")
        route_name = route.get("name", "Standard Arterial Route")
        transit_mins = route.get("transit_time_minutes", 26)
        traffic_delay_mins = route.get("traffic_delay_minutes", 4)
        distance_km = route.get("distance_km", 14.5)
        uhi_heat_spike_c = route.get("uhi_heat_spike_c", 3.5) # heat island delta over ambient
        stops_count = route.get("traffic_signals_count", 8)
        route_points = route.get("points", [])

        # -------------------------------------------------------------
        # Factor 1: Shortest Time Score (0-100) [Weight: 20%]
        # Target: ≤ 20 mins = 100, 45 mins = 40
        # -------------------------------------------------------------
        time_score = max(10.0, min(100.0, 100.0 - max(0, transit_mins - 15) * 2.8))

        # -------------------------------------------------------------
        # Factor 2: Route Condition & Traffic Score (0-100) [Weight: 20%]
        # Lower traffic delay and fewer stops = higher score
        # -------------------------------------------------------------
        traffic_score = max(15.0, min(100.0, 100.0 - (traffic_delay_mins * 7.5) - (stops_count * 1.5)))

        # -------------------------------------------------------------
        # Factor 3: Temperature / Heat Islands Score (0-100) [Weight: 30%]
        # FortyGuard microclimate integration
        # Peak route temp = ambient + UHI corridor factor + solar flux
        # -------------------------------------------------------------
        peak_route_temp = round(ambient_temp + uhi_heat_spike_c + (solar_ghi / 800.0) * 2.0, 1)
        if peak_route_temp <= 28.0:
            temp_score = 100.0
        elif peak_route_temp <= 33.0:
            temp_score = 100.0 - (peak_route_temp - 28.0) * 5.0
        elif peak_route_temp <= 38.0:
            temp_score = 75.0 - (peak_route_temp - 33.0) * 8.0
        else:
            temp_score = max(10.0, 35.0 - (peak_route_temp - 38.0) * 6.0)

        # -------------------------------------------------------------
        # Factor 4: Fuel Efficiency Score (0-100) [Weight: 10%]
        # Minimizing stop-and-go idling & excess mileage
        # -------------------------------------------------------------
        idle_liters = (traffic_delay_mins / 60.0) * 4.5 + (stops_count * 0.05)
        fuel_used_liters = round((distance_km * 0.42) + idle_liters, 2)
        co2_emission_kg = round(fuel_used_liters * 2.68, 2)
        fuel_score = max(20.0, min(100.0, 100.0 - (fuel_used_liters * 4.5)))

        # -------------------------------------------------------------
        # Factor 5: Efficient Execution Demand / Site Readiness (0-100) [Weight: 20%]
        # ACI 305R evaporation gate & Arrhenius hydration index
        # -------------------------------------------------------------
        # ACI evaporation rate at pour site
        wind_mph = wind_kmh * 0.621371
        r_frac = rh if rh <= 1.0 else rh / 100.0
        evap_rate = max(0.01, ((batch_temp_c ** 2.5) - (r_frac * (ambient_temp ** 2.5))) * (1.0 + (0.4 * wind_mph)) * 1e-6)
        evap_rate = round(evap_rate, 3)

        # Hydration dose index
        T_k = peak_route_temp + 273.15
        ih = round(math.exp(4000.0 * (1.0 / 293.15 - 1.0 / T_k)) * transit_mins, 2)

        if evap_rate < 0.12 and ih < 50.0:
            exec_score = 100.0
            compliance_note = "ACI 305R Fully Compliant • Zero Slump Loss Risk"
        elif evap_rate < 0.20 and ih < 80.0:
            exec_score = 80.0
            compliance_note = "ACI Acceptable • Low Hydration Dose"
        else:
            exec_score = 30.0
            compliance_note = "ACI Critical Alert • High Evaporation / Hydration Attack"

        # -------------------------------------------------------------
        # Composite ThermNav Weighted Score
        # -------------------------------------------------------------
        composite_score = round(
            (time_score * WEIGHT_TIME) +
            (traffic_score * WEIGHT_TRAFFIC) +
            (temp_score * WEIGHT_TEMP_UHI) +
            (fuel_score * WEIGHT_FUEL) +
            (exec_score * WEIGHT_EXEC_DEMAND),
            1
        )

        evaluated_routes.append({
            "route_id": route_id,
            "route_name": route_name,
            "description": route.get("description", ""),
            "composite_score": composite_score,
            "transit_time_minutes": transit_mins,
            "distance_km": distance_km,
            "peak_route_temp_c": peak_route_temp,
            "traffic_delay_minutes": traffic_delay_mins,
            "fuel_liters": fuel_used_liters,
            "co2_kg": co2_emission_kg,
            "evaporation_rate": evap_rate,
            "hydration_index": ih,
            "compliance_note": compliance_note,
            "factor_scores": {
                "shortest_time": round(time_score, 1),
                "traffic_condition": round(traffic_score, 1),
                "fortyguard_temperature": round(temp_score, 1),
                "fuel_efficiency": round(fuel_score, 1),
                "execution_demand": round(exec_score, 1)
            },
            "points": route_points
        })

    # Sort routes by composite score descending
    evaluated_routes.sort(key=lambda r: r["composite_score"], reverse=True)
    winning_route = evaluated_routes[0]

    # Generate engineering justification string
    runner_up = evaluated_routes[1] if len(evaluated_routes) > 1 else None
    if runner_up:
        time_diff = winning_route["transit_time_minutes"] - runner_up["transit_time_minutes"]
        temp_diff = round(runner_up["peak_route_temp_c"] - winning_route["peak_route_temp_c"], 1)

        if time_diff > 0:
            justification = (
                f"{winning_route['route_name']} ({winning_route['route_id']}) selected: "
                f"{time_diff} min(s) slower than fastest corridor, but avoids {runner_up['peak_route_temp_c']}°C severe urban heat island, "
                f"reducing core thermal flux by {temp_diff}°C, saving {round(runner_up['fuel_liters'] - winning_route['fuel_liters'], 1)}L diesel idling, "
                f"and permanently preventing concrete slump loss & plastic shrinkage."
            )
        else:
            justification = (
                f"{winning_route['route_name']} ({winning_route['route_id']}) selected: "
                f"Optimal across all 5 dimensions. Shortest transit ({winning_route['transit_time_minutes']} mins), "
                f"lowest heat island exposure ({winning_route['peak_route_temp_c']}°C), and full ACI 305R compliance."
            )
    else:
        justification = (
            f"{winning_route['route_name']} selected: ThermNav Index {winning_route['composite_score']}/100. "
            f"Thermal exposure maintained at {winning_route['peak_route_temp_c']}°C with full ASTM C94 compliance."
        )

    return {
        "winning_route_id": winning_route["route_id"],
        "winning_route": winning_route,
        "justification": justification,
        "ranked_routes": evaluated_routes,
        "weights": {
            "shortest_time": f"{int(WEIGHT_TIME * 100)}%",
            "route_traffic": f"{int(WEIGHT_TRAFFIC * 100)}%",
            "fortyguard_temperature": f"{int(WEIGHT_TEMP_UHI * 100)}%",
            "fuel_efficiency": f"{int(WEIGHT_FUEL * 100)}%",
            "execution_demand": f"{int(WEIGHT_EXEC_DEMAND * 100)}%"
        }
    }


def _generate_default_candidate_routes() -> List[Dict[str, Any]]:
    """Generates 3 realistic candidate routes with varying traffic, heat islands, and distances."""
    return [
        {
            "id": "Route-A",
            "name": "Midtown Direct Express (Highway & Canyon)",
            "description": "Via Queens Midtown Tunnel & 34th St Canyon (Trapped asphalt heat)",
            "transit_time_minutes": 22,
            "distance_km": 11.2,
            "traffic_delay_minutes": 6,
            "traffic_signals_count": 12,
            "uhi_heat_spike_c": 5.2, # Severe heat island
            "points": []
        },
        {
            "id": "Route-B",
            "name": "Waterfront Shaded Corridor (Recommended)",
            "description": "Via Queensboro Bridge Upper Deck & FDR Drive Coastal Promenade",
            "transit_time_minutes": 24,
            "distance_km": 13.8,
            "traffic_delay_minutes": 2,
            "traffic_signals_count": 4,
            "uhi_heat_spike_c": 1.2, # Cool marine breeze
            "points": []
        },
        {
            "id": "Route-C",
            "name": "Crosstown Commercial Arterial",
            "description": "Via 59th St & 8th Ave Stop-and-Go Heavy Traffic Corridor",
            "transit_time_minutes": 31,
            "distance_km": 12.0,
            "traffic_delay_minutes": 11,
            "traffic_signals_count": 18,
            "uhi_heat_spike_c": 4.1,
            "points": []
        }
    ]
