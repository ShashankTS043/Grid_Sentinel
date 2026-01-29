import paho.mqtt.client as mqtt
import json
import time
from app.config import settings
from app.schemas import SensorData
from app.database import SessionLocal
from app.models import Reading, Event
from app.services.physics import physics_engine
from app.services.audio import audio_engine
from app.services.state import grid_state
from app.services.prediction import oracle
from app.logger import get_logger # <-- NEW IMPORT
from pydantic import ValidationError

# Initialize Logger
log = get_logger()

# 1. DEFINE CALLBACKS
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        log.info(f"✅ Connected to MQTT Broker: {settings.MQTT_BROKER}")
        client.subscribe(settings.MQTT_TOPIC)
    else:
        log.error(f"❌ Connection Failed with code {rc}")

def on_message(client, userdata, msg):
    db = SessionLocal()
    try:
        payload = msg.payload.decode()
        data_dict = json.loads(payload)
        
        # 1. Validate
        clean_data = SensorData(**data_dict)
        
        # 2. UPDATE DIGITAL TWIN STATE
        prediction_mins = None 

        if clean_data.device_type == "TRANSFORMER":
            grid_state.update_transformer(clean_data.current)
            
            # --- AI PREDICTION LAYER ---
            current_time_sec = time.time()
            oracle.add_reading(clean_data.temperature, current_time_sec)
            
            prediction_mins = oracle.predict_failure_time(limit_temp=100.0)
            
            if prediction_mins:
                log.warning(f"🔮 PREDICTION: Critical Failure in {prediction_mins} minutes")

            # --- PHYSICS & AUDIO ---
            aging_factor = physics_engine.calculate_aging_factor(clean_data.temperature)
            rate_of_rise = physics_engine.detect_thermal_shock(clean_data.temperature, clean_data.timestamp)
            
            distortion = 0.0
            if clean_data.audio_waveform:
                distortion = audio_engine.analyze_health(clean_data.audio_waveform)

            # Log Physics periodically (not every message to avoid spam)
            # log.debug(f"Physics: Temp={clean_data.temperature} | Aging={aging_factor}x")

            # --- ALERTS & SELF-HEALING ---
            if aging_factor > 4.0:
                log.critical("🚨 ALERT: ACCELERATED AGING DETECTED!")
                db.add(Event(sensor_id=clean_data.sensor_id, event_type="CRITICAL_AGING", value=aging_factor, message="Aging High"))
                from app.services.control import grid_controller
                grid_controller.trigger_load_shedding("Aging Factor Critical")

            if rate_of_rise > 2.0:
                log.critical("🚨 ALERT: THERMAL SHOCK! POSSIBLE SHORT CIRCUIT.")
                db.add(Event(sensor_id=clean_data.sensor_id, event_type="THERMAL_SHOCK", value=rate_of_rise, message="Rapid Heat"))
                from app.services.control import grid_controller
                grid_controller.trigger_load_shedding("Thermal Shock Detected")

            if distortion > 3.0:
                log.critical("🚨 ALERT: AUDIO FAILURE (HARMONICS)!")
                db.add(Event(sensor_id=clean_data.sensor_id, event_type="AUDIO_FAIL", value=distortion, message="Bad Sound"))
            
            # Save Transformer Reading
            db.add(Reading(
                temperature=clean_data.temperature,
                current=clean_data.current,
                vibration=clean_data.vibration,
                predicted_failure_min=prediction_mins
            ))

        elif clean_data.device_type == "METER":
            grid_state.update_meter(clean_data.sensor_id, clean_data.current)
            # log.info(f"🏠 Meter {clean_data.sensor_id}: {clean_data.current}A")

        # 3. THEFT DETECTION
        theft_amount = grid_state.check_for_theft()
        if theft_amount > grid_state.THEFT_THRESHOLD:
            log.warning(f"🚫 THEFT DETECTED: {theft_amount} Amps missing!")
            new_alert = Event(
                sensor_id="GRID_SYSTEM",
                event_type="THEFT_DETECTED",
                value=theft_amount,
                message=f"{theft_amount}A unaccounted for."
            )
            db.add(new_alert)

        db.commit()

    except Exception as e:
        log.error(f"⚠️ Message Error: {e}")
    finally:
        db.close()

# 2. SETUP CLIENT
mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

# 3. PUBLISH FUNCTION
def publish_message(topic: str, payload: dict):
    try:
        import json
        payload_str = json.dumps(payload)
        mqtt_client.publish(topic, payload_str)
        log.info(f"📤 SENT COMMAND: {topic} -> {payload}")
    except Exception as e:
        log.error(f"❌ Failed to publish: {e}")

# 4. START LOOP
def start_mqtt():
    try:
        mqtt_client.connect(settings.MQTT_BROKER, settings.MQTT_PORT, 60)
        mqtt_client.loop_start()
    except Exception as e:
        log.error(f"❌ MQTT Connection Error: {e}")