from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class Reading(Base):
    __tablename__ = "readings"
    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Float)
    current = Column(Float)
    vibration = Column(Float)
    timestamp = Column(DateTime, default=datetime.now)
    # AI Prediction Field
    predicted_failure_min = Column(Integer, nullable=True)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, index=True)
    event_type = Column(String)
    value = Column(Float)
    message = Column(String)
    timestamp = Column(DateTime, default=datetime.now)

    # --- THE BLACK BOX FIELDS ---
    previous_hash = Column(String, default="GENESIS") 
    event_hash = Column(String)