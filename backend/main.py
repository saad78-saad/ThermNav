from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import dispatch, fortyguard_suite, task_schedule_router, hvac_router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="ThermoShift EcoBreeze & ThermNav API",
    description="Hyperlocal Microclimate Predictive Pre-Cooling & Economizer BMS powered by FortyGuard LTM",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Core HVAC & Smart Cooling Router
app.include_router(hvac_router.router)

# FortyGuard API Suite & Diagnostics
app.include_router(fortyguard_suite.router)

# Legacy & Concrete Logistics modules
app.include_router(dispatch.router)
app.include_router(task_schedule_router.router)


@app.get("/")
async def root():
    return {
        "system": "ThermoShift EcoBreeze",
        "description": "Hyperlocal Predictive Pre-Cooling & Free-Air Economizer BMS",
        "engine": "FortyGuard Large Temperature Model (LTM)",
        "status": "operational",
        "version": "2.1.0"
    }


@app.get("/health")
async def health():
    return {"status": "ok"}