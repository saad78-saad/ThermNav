from fastapi import APIRouter, HTTPException
from models.schemas import DispatchRequest, DispatchResponse
from services.fortyguard_service import fetch_environmental_forecast_12h, fetch_heat_intelligence
from services.maps_service import get_route_data
from services.thermal_shader import assign_thermal_colors
from services.scheduler import evaluate_12h_schedule
from services.dispatch_optimizer import rank_and_optimize_routes
from services.task_scheduler import optimize_24h_site_schedule, get_default_demo_tasks
from typing import Dict, Any, Optional, List

router = APIRouter(tags=["Dispatch & 5-Factor Optimizer"])


@router.post("/api/dispatch/plan")
@router.post("/dispatch/optimize", response_model=Dict[str, Any])
async def plan_and_optimize_dispatch(req: DispatchRequest):
    """
    ThermNav Core Dispatch & Operations Planning Endpoint.
    Integrates:
    1. FortyGuard Large Temperature Model (LTM) API (Environmental parameters & UHI analysis)
    2. Road Navigation Engine (OSRM + Google Maps fallback)
    3. 5-Factor Route Optimization Engine with justification
    4. Worker Health & 24-Hour Predictive Task Scheduler
    5. ACI 305R / ASTM C94 Physical Compliance Verification
    """
    # 1. Fetch FortyGuard environmental forecast
    try:
        forecast = await fetch_environmental_forecast_12h(req.site_lat, req.site_lng)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"FortyGuard forecast unavailable: {str(e)}")

    # 2. Compute route geometry and transit duration
    try:
        route_data = await get_route_data(
            req.plant_lat, req.plant_lng,
            req.site_lat, req.site_lng
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Routing service unavailable: {str(e)}")

    transit_mins = route_data["transit_time_minutes"]
    route_points = route_data["points"]

    # 3. Build candidate routes for the 5-Factor Route Optimizer
    candidate_routes = [
        {
            "id": "Route-A",
            "name": "Direct Urban Highway Corridor",
            "description": "Via Direct Arterial Highway (Heavy Asphalt Heat)",
            "transit_time_minutes": max(12, int(transit_mins * 0.95)),
            "distance_km": round(transit_mins * 0.55, 1),
            "traffic_delay_minutes": 5,
            "traffic_signals_count": 9,
            "uhi_heat_spike_c": 4.8,
            "points": route_points
        },
        {
            "id": "Route-B",
            "name": "ThermNav Microclimate Shaded Route (Recommended)",
            "description": "Via Waterfront Promenade & Shaded Canopy Corridor",
            "transit_time_minutes": transit_mins,
            "distance_km": round(transit_mins * 0.58, 1),
            "traffic_delay_minutes": 2,
            "traffic_signals_count": 4,
            "uhi_heat_spike_c": 1.4,
            "points": route_points
        },
        {
            "id": "Route-C",
            "name": "Commercial Boulevard Corridor",
            "description": "Via Commercial Core Boulevard (Stop-and-Go)",
            "transit_time_minutes": int(transit_mins * 1.25),
            "distance_km": round(transit_mins * 0.62, 1),
            "traffic_delay_minutes": 10,
            "traffic_signals_count": 16,
            "uhi_heat_spike_c": 3.6,
            "points": route_points
        }
    ]

    target_env = forecast[min(req.target_delivery_hour, len(forecast) - 1)] if forecast else {}
    optimization_5factor = rank_and_optimize_routes(
        candidate_routes=candidate_routes,
        fortyguard_env=target_env,
        batch_temp_c=req.batch_temp_celsius,
        volume_m3=req.volume_m3,
        target_delivery_hour=req.target_delivery_hour
    )

    # 4. Run 12-hour predictive matrix
    schedule_result = evaluate_12h_schedule(
        transit_duration_mins=transit_mins,
        batch_temp=req.batch_temp_celsius,
        forecast_12h=forecast
    )

    # 5. Run 24-hour worker health task scheduler
    demo_tasks = get_default_demo_tasks()
    worker_schedule = optimize_24h_site_schedule(demo_tasks, forecast)

    # 6. Thermal shading of route segments
    optimal_hour = schedule_result["recommended_slot"]["dispatch_hour_offset"]
    thermal_segments = assign_thermal_colors(route_points, forecast, optimal_hour)

    return {
        "status": "OPTIMIZED",
        "recommended_dispatch_time": schedule_result["recommended_dispatch_time"],
        "recommended_slot": schedule_result["recommended_slot"],
        "route_thermal_segments": [s.model_dump() for s in thermal_segments],
        "full_12h_schedule": schedule_result["full_12h_schedule"],
        "mismatch_mitigation": schedule_result["mismatch_mitigation"].model_dump() if hasattr(schedule_result["mismatch_mitigation"], 'model_dump') else schedule_result["mismatch_mitigation"],
        "transit_time_minutes": transit_mins,
        "hydration_index": schedule_result["hydration_index"],
        "batch_rejected": schedule_result["batch_rejected"],
        # 5-Factor Optimizer Package
        "five_factor_optimization": optimization_5factor,
        "optimizer_5factor": schedule_result.get("optimizer_5factor"),
        "justification": optimization_5factor["justification"],
        "winning_route": optimization_5factor["winning_route"],
        # Worker Health Package
        "worker_health_schedule": worker_schedule,
        "worker_health_tasks": worker_schedule["scheduled_tasks"]
    }