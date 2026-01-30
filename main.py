from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.mqtt import start_mqtt
from app.config import settings
from app.database import init_db
from app.routes import router as api_router
from app.logger import get_logger

# --- 1. IMPORT THE NEW BRIDGE FILE ---
from app.routers import api  # <--- NEW IMPORT

log = get_logger()

# 1. Professional Metadata
app = FastAPI(
    title="Grid-Sentinel Core",
    description="Nuclear-grade backend for Transformer Monitoring, Physics Analysis, and Predictive Maintenance.",
    version="1.0.0",
    contact={
        "name": "Team Delta-V",
        "email": "engineering@grid-sentinel.com",
    },
)

# 2. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Include Existing Routes (Keep this if you have other stuff there)
app.include_router(api_router, prefix="/api")

# --- 4. CONNECT THE NEW ROUTER (The Fix) ---
# This connects the /api/live endpoint we just built
app.include_router(api.router)  # <--- NEW LINE

@app.on_event("startup")
async def startup_event():
    log.info("🚀 Grid-Sentinel System Starting Up...")
    log.info("🔹 Initializing Database...")
    init_db()
    log.info("🔹 Connecting to MQTT Grid...")
    start_mqtt()
    log.info("✅ System Online and Ready.")

@app.get("/")
def health_check():
    return {
        "system": "Grid-Sentinel", 
        "status": "OPERATIONAL", 
        "environment": settings.APP_ENV
    }