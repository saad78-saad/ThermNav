from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class DispatchRequest(BaseModel):
    plant_lat: float = Field(..., description="Batching plant latitude")
    plant_lng: float = Field(..., description="Batching plant longitude")
    site_lat: float = Field(..., description="Construction site latitude")
    site_lng: float = Field(..., description="Construction site longitude")
    batch_temp_celsius: float = Field(28.0, ge=10.0, le=50.0, description="Initial concrete batch temperature (Tc) in Celsius")
    volume_m3: float = Field(6.0, ge=1.0, le=15.0, description="Concrete volume in cubic metres")
    target_delivery_hour: int = Field(3, ge=0, le=11, description="Desired delivery hour offset (0-11) within 12h window")

class RouteSegment(BaseModel):
    path: List[Dict[str, float]]
    heat_color: str
    avg_temp_celsius: float
    classification: str

class DispatchSlot(BaseModel):
    dispatch_hour_offset: int
    clock_time: str
    ambient_temp_celsius: float
    evaporation_rate: float
    solar_ghi: float
    status: str
    action_item: str
    penalty_score: float

class MismatchMitigation(BaseModel):
    requires_chilled_batch_water: bool
    mandated_curing_method: str

class DispatchResponse(BaseModel):
    recommended_dispatch_time: str
    recommended_slot: DispatchSlot
    route_thermal_segments: List[RouteSegment]
    full_12h_schedule: List[DispatchSlot]
    optimizer_5factor: Optional[Dict[str, Any]] = None
    worker_health_tasks: Optional[List[Dict[str, Any]]] = None
    mismatch_mitigation: MismatchMitigation
    transit_time_minutes: int
    hydration_index: float
    batch_rejected: bool