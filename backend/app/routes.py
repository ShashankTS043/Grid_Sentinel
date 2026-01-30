from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database import SessionLocal
from app.models import Reading, Event
from app.schemas import ReadingResponse, EventResponse
from app.services.state import grid_state 
from app.services.control import grid_controller
from app.config import settings
from app.services.llm import ask_grid_sentinel
from app.services.crypto import generate_event_hash # <-- Import Crypto Service

router = APIRouter()

# Dependency: Get DB Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------------------------------------
# MONITORING ENDPOINTS (Read-Only)
# ---------------------------------------------------------

@router.get("/status/live")
def get_live_status():
    """Returns the instant state of the grid (Digital Twin)"""
    return {
        "transformer_current": grid_state.transformer_current,
        "total_load": sum(grid_state.smart_meters.values()),
        "theft_detected": grid_state.check_for_theft(),
        "status": "ONLINE"
    }

@router.get("/history/readings", response_model=List[ReadingResponse])
def get_history(limit: int = 100, db: Session = Depends(get_db)):
    """Returns the last N readings for graphs"""
    readings = db.query(Reading).order_by(Reading.timestamp.desc()).limit(limit).all()
    return readings

@router.get("/history/alerts", response_model=List[EventResponse])
def get_alerts(limit: int = 20, db: Session = Depends(get_db)):
    """Returns the latest critical events"""
    alerts = db.query(Event).order_by(Event.timestamp.desc()).limit(limit).all()
    return alerts

# ---------------------------------------------------------
# CONTROL ENDPOINTS (Actionable)
# ---------------------------------------------------------

@router.post("/control/shed")
def manual_shed_load():
    """Manually cuts power (Emergency Stop)"""
    grid_controller.trigger_load_shedding("Manual Override API")
    return {"status": "COMMAND_SENT", "action": "SHED_LOAD"}

@router.post("/control/restore")
def manual_restore_power():
    """Manually restores power"""
    grid_controller.restore_power()
    return {"status": "COMMAND_SENT", "action": "RESTORE"}

# ---------------------------------------------------------
# AI ENDPOINTS (Grid-GPT)
# ---------------------------------------------------------

class ChatRequest(BaseModel):
    question: str

@router.post("/chat/ask")
def chat_with_grid(request: ChatRequest):
    """
    Ask the AI Operator about grid health.
    Uses RAG to inject live telemetry into the LLM prompt.
    """
    response_text = ask_grid_sentinel(request.question)
    return {
        "role": "SENTINEL_AI", 
        "answer": response_text,
        "mode": "MOCK" if settings.USE_MOCK_LLM else "LIVE_OPENAI"
    }

# ---------------------------------------------------------
# AUDIT ENDPOINT (The "Sherlock Holmes" Tool)
# ---------------------------------------------------------

@router.get("/audit/verify")
def verify_blockchain(db: Session = Depends(get_db)):
    """
    Re-calculates every hash in the database to prove data integrity.
    Returns: 'VALID' or 'CORRUPTED'
    """
    events = db.query(Event).order_by(Event.id.asc()).all()
    
    if not events:
        return {"status": "EMPTY_CHAIN"}

    broken_links = []
    
    # Iterate through the chain
    for i in range(len(events)):
        current = events[i]
        
        # 1. Determine what the 'previous_hash' SHOULD be
        if i == 0:
            expected_prev = "GENESIS_BLOCK"
        else:
            expected_prev = events[i-1].event_hash
            
        # 2. Check Link Integrity
        if current.previous_hash != expected_prev:
            broken_links.append(f"Broken Link at ID {current.id}: Expected {expected_prev[:8]}, Got {current.previous_hash[:8]}")
            continue

        # 3. Check Data Integrity (Did someone edit the value?)
        # Re-generate hash from raw data to see if it matches the signature
        recalc_hash = generate_event_hash(
            current.sensor_id, 
            current.event_type, 
            current.value, 
            current.timestamp, 
            current.previous_hash
        )
        
        if recalc_hash != current.event_hash:
            broken_links.append(f"Data Tampering at ID {current.id}: Content does not match Hash!")

    if broken_links:
        return {"status": "CORRUPTED", "errors": broken_links}
    else:
        return {"status": "SECURE", "chain_length": len(events), "message": "All Cryptographic Signatures Valid."}

# ---------------------------------------------------------
# ADMIN ENDPOINTS (Demo Management)
# ---------------------------------------------------------

@router.delete("/admin/reset")
def reset_system(secret: str, db: Session = Depends(get_db)):
    """Wipes all data for the next demo. Requires secret from .env"""
    if secret != settings.ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Wrong Secret")
    
    # Delete all rows in the database
    db.query(Reading).delete()
    db.query(Event).delete()
    db.commit()
    
    # Reset In-Memory State (The Digital Twin)
    grid_state.transformer_current = 0.0
    grid_state.smart_meters = {}
    
    return {"status": "SYSTEM_WIPED", "ready_for": "NEXT_JUDGE"}