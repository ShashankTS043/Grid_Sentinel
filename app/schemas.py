from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Input Schema (Keep as is)
class SensorData(BaseModel):
    sensor_id: str
    device_type: str = "TRANSFORMER" 
    temperature: float
    current: float
    vibration: float
    audio_waveform: Optional[List[float]] = None 
    timestamp: datetime = Field(default_factory=datetime.now)

# Output Schema (Updated)
class ReadingResponse(BaseModel):
    id: int
    sensor_id: str
    temperature: float
    current: float
    vibration: float
    timestamp: datetime
    # NEW FIELD
    predicted_failure_min: Optional[float] = None 

    class Config:
        from_attributes = True

# Alert Schema (Keep as is)
class EventResponse(BaseModel):
    id: int
    event_type: str
    value: float
    message: str
    timestamp: datetime

    class Config:
        from_attributes = True