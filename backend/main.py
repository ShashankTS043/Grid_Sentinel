from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # <-- NEW
from app.services.mqtt import start_mqtt
from app.config import settings
from app.database import init_db
from app.routes import router as api_router
from app.logger import get_logger

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

# 2. CORS Middleware (Essential for Frontend/React/Streamlit)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

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