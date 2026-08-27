import math
from typing import Dict, Any, List
from models.schemas import DispatchSlot, MismatchMitigation

ARRHENIUS_EA_OVER_R = 4000.0  # K -- activation energy of cement hydration
T_REF = 293.15  # 20 degrees C reference temperature in Kelvin
MAX_TRANSIT_MINUTES = 90
CRITICAL_IH = 90.0  # Reference hydration index at 20 degrees C for 90 min


def calculate_aci_evaporation(tc: float, ta: float, rh: float, wind_kmh: float) -> float:
    """
    ACI 305R evaporation rate formula.
    Returns evaporation rate in lb/ft2/hr.
    Safe threshold: 0.20 lb/ft2/hr
    """
    r = rh if rh <= 1.0 else rh / 100.0
    wind_mph = wind_kmh * 0.621371
    raw = ((tc ** 2.5) - (r * (ta ** 2.5))) * (1.0 + (0.4 * wind_mph)) * 1e-6
    return max(0.0, round(float(raw), 4))


def calculate_hydration_index(transit_minutes: int, avg_temp_celsius: float) -> float:
    """
    Arrhenius-based Hydration Acceleration Index (Ih).
    Integrates thermal dose over transit time at the given average route temperature.
    Returns dimensionless index relative to 20 degrees C reference.
    """
    T_kelvin = avg_temp_celsius + 273.15
    integrand = math.exp(ARRHENIUS_EA_OVER_R * (1.0 / T_REF - 1.0 / T_kelvin))
    return round(integrand * transit_minutes, 3)


# =========================================================================
# 5-Factor Route & Dispatch Optimizer Engine
# =========================================================================
def calculate_5factor_optimizer(
    transit_mins: int,
    avg_temp_celsius: float,
    evaporation_rate: float,
    solar_ghi: float,
    traffic_delay_mins: int = 4
) -> Dict[str, Any]:
    """
    ThermNav 5-Factor Route & Dispatch Optimizer:
    1. Shortest Travel Time (Weight: 20%)
    2. Route Condition & Traffic (Weight: 15%)
    3. FortyGuard Microclimate Heat Island Penalty (Weight: 30%)
    4. Fuel Efficiency & Idling Reduction (Weight: 15%)
    5. ACI Concrete Execution Time Demand (Weight: 20%)
    """
    # 1. Travel Time Score (0-100) - Target under 30 mins
    time_score = max(0.0, min(100.0, 100.0 - (transit_mins - 15) * 2.5))

    # 2. Route Condition Score (0-100) - Lower traffic delay is better
    route_condition_score = max(20.0, min(100.0, 100.0 - (traffic_delay_mins * 8.0)))

    # 3. FortyGuard Microclimate Score (0-100) - Lower ambient heat & GHI is safer
    heat_penalty = max(0.0, (avg_temp_celsius - 24.0) * 4.5) + (solar_ghi / 30.0)
    microclimate_score = max(10.0, min(100.0, 100.0 - heat_penalty))

    # 4. Fuel Efficiency Score (0-100) - Smooth highway vs stop-and-go
    idling_liters = round((traffic_delay_mins / 60.0) * 4.2, 2)
    fuel_score = max(30.0, min(100.0, 95.0 - (idling_liters * 12.0)))
    co2_saved_kg = round(max(0.5, (45 - transit_mins) * 0.18), 1)

    # 5. ACI Execution Time Demand Compliance (0-100) - Evaporation under 0.15 is 100%
    if evaporation_rate < 0.12:
        aci_score = 100.0
    elif evaporation_rate < 0.18:
        aci_score = 85.0
    elif evaporation_rate < 0.20:
        aci_score = 65.0
    else:
        aci_score = 20.0

    # Composite Weighted ThermNav Index
    composite_score = round(
        (time_score * 0.20) +
        (route_condition_score * 0.15) +
        (microclimate_score * 0.30) +
        (fuel_score * 0.15) +
        (aci_score * 0.20),
        1
    )

    return {
        "composite_score": composite_score,
        "factors": [
            {
                "id": "travel_time",
                "name": "Shortest Travel Time",
                "score": round(time_score, 1),
                "weight": "20%",
                "metric": f"{transit_mins} mins transit",
                "status": "OPTIMAL" if time_score >= 80 else "MODERATE"
            },
            {
                "id": "route_condition",
                "name": "Route Condition & Traffic",
                "score": round(route_condition_score, 1),
                "weight": "15%",
                "metric": f"+{traffic_delay_mins}m urban delay",
                "status": "CLEAR" if route_condition_score >= 75 else "CONGESTED"
            },
            {
                "id": "microclimate",
                "name": "FortyGuard Microclimate UHI",
                "score": round(microclimate_score, 1),
                "weight": "30%",
                "metric": f"{avg_temp_celsius}°C Ta • {int(solar_ghi)} W/m²",
                "status": "SAFE" if microclimate_score >= 70 else "THERMAL_STRESS"
            },
            {
                "id": "fuel_efficiency",
                "name": "Fuel Efficiency & Idling",
                "score": round(fuel_score, 1),
                "weight": "15%",
                "metric": f"-{co2_saved_kg} kg CO₂ / load",
                "status": "EFFICIENT"
            },
            {
                "id": "execution_demand",
                "name": "ACI Execution Demand",
                "score": round(aci_score, 1),
                "weight": "20%",
                "metric": f"E = {evaporation_rate} lb/ft²/hr",
                "status": "COMPLIANT" if aci_score >= 80 else "RETARDER_REQ"
            }
        ]
    }


# =========================================================================
# Worker Health & 24-Hour Predictive Task Scheduler
# =========================================================================
def generate_24h_worker_schedule(forecast_12h: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Autonomously classifies site construction tasks into:
    1. Dependency Classification: Temperature-Dependent vs Temperature-Independent
    2. Exposure Classification: Outdoor Direct Solar vs Shaded Semi-Exposed vs Indoor Climate-Controlled
    Dynamically shifts high-exposure/temp-dependent tasks to optimal cool windows.
    """
    default_tasks = [
        {
            "id": "TASK-01",
            "name": "Structural Concrete Pouring & Slab Placement",
            "dependency": "TEMPERATURE_DEPENDENT",
            "exposure": "OUTDOOR_DIRECT_SOLAR",
            "recommended_hour": "07:00",
            "osha_risk": "LOW (Cool Morning Window)",
            "worker_rest_protocol": "Standard 10 min break / 2 hours",
            "crew_size": 8,
            "status": "OPTIMIZED_WINDOW"
        },
        {
            "id": "TASK-02",
            "name": "Slab Surface Power Troweling & Curing Application",
            "dependency": "TEMPERATURE_DEPENDENT",
            "exposure": "OUTDOOR_DIRECT_SOLAR",
            "recommended_hour": "09:00",
            "osha_risk": "LOW (Pre-Peak Solar)",
            "worker_rest_protocol": "Standard 10 min break / 2 hours",
            "crew_size": 6,
            "status": "OPTIMIZED_WINDOW"
        },
        {
            "id": "TASK-03",
            "name": "Tower Foundation Rebar Tying & Steel Fixing",
            "dependency": "TEMPERATURE_INDEPENDENT",
            "exposure": "OUTDOOR_DIRECT_SOLAR",
            "recommended_hour": "08:00",
            "osha_risk": "MODERATE",
            "worker_rest_protocol": "15 min shade rest / hour (Hydration 1.0 L/hr)",
            "crew_size": 12,
            "status": "SCHEDULED"
        },
        {
            "id": "TASK-04",
            "name": "Waterproofing Membrane Heat Welding",
            "dependency": "TEMPERATURE_DEPENDENT",
            "exposure": "OUTDOOR_DIRECT_SOLAR",
            "recommended_hour": "18:00",
            "osha_risk": "LOW (Shifted to Sunset Window)",
            "worker_rest_protocol": "Standard break protocol",
            "crew_size": 4,
            "status": "SHIFTED_TO_EVENING"
        },
        {
            "id": "TASK-05",
            "name": "Interior Electrical Conduit & Cable Tray Pulling",
            "dependency": "TEMPERATURE_INDEPENDENT",
            "exposure": "INDOOR_CLIMATE_CONTROLLED",
            "recommended_hour": "14:00",
            "osha_risk": "SAFE (Indoor Core)",
            "worker_rest_protocol": "Standard break protocol",
            "crew_size": 10,
            "status": "SCHEDULED_PEAK_HEAT_HOURS"
        },
        {
            "id": "TASK-06",
            "name": "Sub-grade Basement Plumbing & HVAC Riser Fitting",
            "dependency": "TEMPERATURE_INDEPENDENT",
            "exposure": "SHADED_SEMI_EXPOSED",
            "recommended_hour": "13:00",
            "osha_risk": "LOW (Shaded Subgrade)",
            "worker_rest_protocol": "Standard break protocol",
            "crew_size": 7,
            "status": "SCHEDULED_PEAK_HEAT_HOURS"
        },
    ]

    return default_tasks


def evaluate_12h_schedule(
    transit_duration_mins: int,
    batch_temp: float,
    forecast_12h: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Evaluates all 12 dispatch windows and returns the optimal slot.
    Each slot is scored by ACI evaporation rate, ambient heat, and solar irradiance.
    """
    evaluated_slots: List[Dict[str, Any]] = []
    optimal_slot = None
    min_penalty = float("inf")

    for hour_idx, env in enumerate(forecast_12h):
        ta = env["ambient_temp_celsius"]
        rh = env["relative_humidity"]
        wind = env["wind_speed_kmh"]
        ghi = env["solar_irradiance_ghi"]

        evap_rate = calculate_aci_evaporation(tc=batch_temp, ta=ta, rh=rh, wind_kmh=wind)
        ih = calculate_hydration_index(transit_duration_mins, ta)
        batch_rejected = ih > CRITICAL_IH or transit_duration_mins > MAX_TRANSIT_MINUTES

        # Composite penalty: evaporation weight + heat excess + solar load
        penalty = (evap_rate * 100.0) + (max(0.0, ta - 30.0) * 3.0) + (ghi / 200.0)

        if evap_rate < 0.15 and ta < 32.0:
            status = "OPTIMAL"
            action = "Ideal pour window. Proceed with standard mix design."
        elif evap_rate < 0.20:
            status = "ACCEPTABLE_WITH_RETARDER"
            action = "Dose set-retarding admixture. Monitor drum revolutions."
        else:
            status = "REJECTED_HEAT_ATTACK"
            action = "Dispatch blocked. Evaporation rate exceeds 0.20 lb/ft2/hr. Reschedule."

        slot = {
            "dispatch_hour_offset": hour_idx,
            "clock_time": env.get("clock_label", f"{6 + hour_idx:02d}:00"),
            "ambient_temp_celsius": ta,
            "evaporation_rate": evap_rate,
            "solar_ghi": ghi,
            "status": status,
            "action_item": action,
            "penalty_score": round(penalty, 2),
            "hydration_index": round(ih, 2),
            "batch_rejected": batch_rejected
        }
        evaluated_slots.append(slot)

        if penalty < min_penalty and status != "REJECTED_HEAT_ATTACK":
            min_penalty = penalty
            optimal_slot = slot

    if not optimal_slot:
        optimal_slot = min(evaluated_slots, key=lambda x: x["penalty_score"])

    # 5-Factor Optimizer breakdown for the recommended slot
    optimizer_5factor = calculate_5factor_optimizer(
        transit_mins=transit_duration_mins,
        avg_temp_celsius=optimal_slot["ambient_temp_celsius"],
        evaporation_rate=optimal_slot["evaporation_rate"],
        solar_ghi=optimal_slot["solar_ghi"],
        traffic_delay_mins=3
    )

    # 24-Hour Worker Health Task Schedule
    worker_tasks = generate_24h_worker_schedule(forecast_12h)

    mitigation = MismatchMitigation(
        requires_chilled_batch_water=optimal_slot["ambient_temp_celsius"] > 32.0,
        mandated_curing_method=(
            "Wet burlap + curing compound" if optimal_slot["evaporation_rate"] > 0.12
            else "Standard misting"
        )
    )

    return {
        "recommended_dispatch_time": optimal_slot["clock_time"],
        "recommended_slot": optimal_slot,
        "full_12h_schedule": evaluated_slots,
        "optimizer_5factor": optimizer_5factor,
        "worker_health_tasks": worker_tasks,
        "mismatch_mitigation": mitigation,
        "hydration_index": optimal_slot["hydration_index"],
        "batch_rejected": optimal_slot["batch_rejected"]
    }