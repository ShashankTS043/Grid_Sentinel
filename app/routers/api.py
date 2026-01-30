from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Reading, Event
# If you have specific schemas, import them, otherwise we return ORM models directly
# from app.schemas import ... 

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 1. THE ENDPOINT YOUR FRONTEND IS SCREAMING FOR ---
@router.get("/api/live")
def get_live_data(db: Session = Depends(get_db)):
    # Get the very latest reading from the Transformer
    tx = db.query(Reading).order_by(Reading.timestamp.desc()).first()
    
    # Get the latest 5 alerts
    alerts = db.query(Event).order_by(Event.timestamp.desc()).limit(5).all()
    
    # Return them in the format the React hook expects
    return {
        "transformer": tx,
        "alerts": alerts
    }

# --- 2. ENDPOINT FOR HISTORY/ALERTS TAB ---
@router.get("/api/alerts")
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.timestamp.desc()).limit(20).all()
