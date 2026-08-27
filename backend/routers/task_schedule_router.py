from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from services.task_scheduler import optimize_24h_site_schedule, get_default_demo_tasks
from services.fortyguard_service import fetch_environmental_forecast_12h

router = APIRouter(prefix="/tasks", tags=["Worker Health & 24H Task Scheduler"])


class TaskItem(BaseModel):
    name: str = Field(..., description="Construction Task Name")
    type: Optional[str] = Field("concrete_pour", description="Task classification type")
    is_temp_dependent: Optional[bool] = Field(True, description="True if task quality depends on temperature")
    exposure_level: Optional[str] = Field("OUTDOOR_HIGH_RISK", description="OUTDOOR_HIGH_RISK, SHADED_MEDIUM_RISK, or INDOOR_LOW_RISK")
    crew_size: Optional[int] = Field(6, description="Number of workers assigned to task")


class ScheduleRequest(BaseModel):
    site_lat: float = Field(40.7538, description="Pour Site Latitude (e.g., Hudson Yards 40.7538)")
    site_lng: float = Field(-74.0022, description="Pour Site Longitude (e.g., Hudson Yards -74.0022)")
    tasks: Optional[List[TaskItem]] = None


@router.post("/optimize")
async def optimize_tasks(req: ScheduleRequest):
    """
    Autonomously schedules construction tasks across a 24-hour predictive timeline
    matching FortyGuard microclimate forecasts to maximize efficiency and worker health.
    """
    try:
        forecast = await fetch_environmental_forecast_12h(req.site_lat, req.site_lng)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"FortyGuard forecast unavailable: {str(e)}")

    task_list = [t.model_dump() for t in req.tasks] if req.tasks else get_default_demo_tasks()
    schedule_result = optimize_24h_site_schedule(task_list, forecast)
    return schedule_result


@router.get("/demo")
async def get_demo_schedule():
    """Returns instant optimized 24-hour schedule for demonstration."""
    forecast = await fetch_environmental_forecast_12h(40.7538, -74.0022)
    demo_tasks = get_default_demo_tasks()
    return optimize_24h_site_schedule(demo_tasks, forecast)
