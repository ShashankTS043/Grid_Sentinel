from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    MQTT_BROKER: str
    MQTT_PORT: int
    # Force the topic to match what you see on the website
    MQTT_TOPIC: str = "grid/sentinel/data"
    APP_ENV: str
    
    # Existing Demo settings
    DEMO_MODE: bool = True
    ADMIN_SECRET: str = "hackathon2026"
    
    # --- NEW: LLM SETTINGS ---
    # Set to True if you don't have an API Key yet or no Internet
    USE_MOCK_LLM: bool = True 
    OPENAI_API_KEY: Optional[str] = None 

    class Config:
        env_file = ".env"

settings = Settings()