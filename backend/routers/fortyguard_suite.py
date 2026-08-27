from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from services.fortyguard_service import (
    fetch_heat_intelligence,
    generate_thermal_heatmap,
    analyze_satellite_segmentation,
    analyze_streetview_segmentation,
    fetch_environmental_forecast_12h,
    check_job_status,
    check_api_credits,
)

router = APIRouter(prefix="/fortyguard", tags=["FortyGuard API Suite"])


class CoordinateRequest(BaseModel):
    latitude: float = Field(40.7538, description="Target Latitude (NYC default)")
    longitude: float = Field(-74.0022, description="Target Longitude (NYC default)")
    lat: Optional[float] = None
    lng: Optional[float] = None
    temp: Optional[float] = None
    temperature: Optional[float] = Field(28.5, description="Reference ambient temperature (°C)")

    def get_lat(self) -> float:
        return self.lat if self.lat is not None else self.latitude

    def get_lng(self) -> float:
        return self.lng if self.lng is not None else self.longitude

    def get_temp(self) -> float:
        return self.temp if self.temp is not None else (self.temperature or 28.5)


@router.post("/heat-intelligence")
@router.post("/heat_intelligence")
async def get_heat_intelligence(req: CoordinateRequest):
    """POST /v1/heat_intelligence - Multi-dimensional urban heat risk report."""
    return await fetch_heat_intelligence(req.get_lat(), req.get_lng(), req.get_temp())


@router.post("/heatmap")
async def get_heatmap(req: CoordinateRequest):
    """POST /v1/heatmap - High-resolution GeoJSON thermal heatmap."""
    return await generate_thermal_heatmap(req.latitude, req.longitude)


@router.post("/satellite")
async def get_satellite_segmentation(req: CoordinateRequest):
    """POST /v1/satellite - Satellite land surface segmentation & albedo metrics."""
    return await analyze_satellite_segmentation(req.latitude, req.longitude)


@router.post("/streetview")
async def get_streetview_segmentation(req: CoordinateRequest):
    """POST /v1/streetview - Ground-level urban canyon shading & façade temperatures."""
    return await analyze_streetview_segmentation(req.latitude, req.longitude)


@router.post("/env-params")
async def get_env_params(req: CoordinateRequest):
    """POST /v1/env_params - Hyperlocal environmental parameters & ACI 305R inputs."""
    return await fetch_environmental_forecast_12h(req.latitude, req.longitude)


@router.get("/status/{activity_id}")
async def get_job_status(activity_id: str):
    """GET /v1/status/{activity_id} - Task management and async job polling."""
    return await check_job_status(activity_id)


@router.get("/credits")
async def get_credits_usage():
    """GET /v1/credits - Real-time API credits usage, quota, and SLA health."""
    return await check_api_credits()
