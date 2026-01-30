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
from app.logger import get_logger 
from pydantic import ValidationError

# --- NEW: IMPORT SMS SERVICE ---
from app.services.sms import send_sms_alert

# Initialize Logger
log = get_logger()

# --- 1. GLOBAL MEMORY ---
latest_readings = {
    "TX_MAIN_01": 0.0,
    "HOUSE_01": 0.0
}
THEFT_THRESHOLD = 0.30  # 300mA difference triggers alert

# --- 2. DEFINE CALLBACKS ---
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        log.info(f"✅ Connected to MQTT Broker: {settings.MQTT_BROKER}")
        client.subscribe(settings.MQTT_TOPIC)
        print(f"📡 LISTENING ON TOPIC: {settings.MQTT_TOPIC}")
    else:
        log.error(f"❌ Connection Failed with code {rc}")

def on_message(client, userdata, msg):
    db = SessionLocal()
    try:
        payload = msg.payload.decode()
        data_dict = json.loads(payload)
        
        # 1. Validate & Parse
        clean_data = SensorData(**data_dict)
        
        # ---------------------------------------------------------
        # 2. UPDATE MEMORY (CRITICAL STEP)
        # ---------------------------------------------------------
        if clean_data.sensor_id in latest_readings:
            latest_readings[clean_data.sensor_id] = clean_data.current
            
        # Perform the Math IMMEDIATELY
        tx_amps = latest_readings["TX_MAIN_01"]
        house_amps = latest_readings["HOUSE_01"]
        diff = tx_amps - house_amps
        
        if clean_data.device_type == "TRANSFORMER":
            print(f"📊 MONITOR: Tx({tx_amps:.2f}A) - House({house_amps:.2f}A) = Diff({diff:.2f}A)")

        # ---------------------------------------------------------
        # 3. PROCESS DEVICE SPECIFIC LOGIC (AI / Physics)
        # ---------------------------------------------------------
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

            # --- ALERTS & SELF-HEALING ---
            
            # A. AGING CHECK
            if aging_factor > 4.0:
                log.critical("🚨 ALERT: ACCELERATED AGING DETECTED!")
                db.add(Event(sensor_id=clean_data.sensor_id, event_type="CRITICAL_AGING", value=aging_factor, message="Aging High"))
                
            # B. THERMAL SHOCK CHECK
            if rate_of_rise > 2.0 and clean_data.temperature > 29.0:
                log.critical("🚨 ALERT: THERMAL SHOCK! POSSIBLE SHORT CIRCUIT.")
                db.add(Event(sensor_id=clean_data.sensor_id, event_type="THERMAL_SHOCK", value=rate_of_rise, message="Rapid Heat"))
                
                # Cut Power
                client.publish("grid/control", json.dumps({"command": "OFF"}))
                print("⚡ SAFETY CUT TRIGGERED: THERMAL SHOCK")
                
                # ---> SEND SMS ALERT
                send_sms_alert(f"Thermal Shock! Temp rose rapidly to {clean_data.temperature}C. Power Cut Triggered.")

            # C. PHYSICAL TAMPERING CHECK
            # Threshold set to 0.6 to catch the coin scratch (1.0) but ignore noise (0.3)
            if clean_data.vibration > 0.6:
                log.critical(f"🔨 TAMPERING DETECTED! Level: {clean_data.vibration}")
                db.add(Event(
                    sensor_id=clean_data.sensor_id, 
                    event_type="PHYSICAL_TAMPERING", 
                    value=clean_data.vibration, 
                    message="Vibration detected (Hammering/Sawing)"
                ))
                print("🚨 ALERT TRIGGERED: PHYSICAL TAMPERING DETECTED!")
                
                # ---> SEND SMS ALERT
                send_sms_alert(f"Physical Tampering Detected! Vibration Level: {clean_data.vibration}")

            # D. AUDIO HARMONICS CHECK
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

        # ---------------------------------------------------------
        # 4. THEFT DETECTION
        # ---------------------------------------------------------
        if diff > THEFT_THRESHOLD:
            log.warning(f"🚫 THEFT DETECTED: {diff:.2f} Amps missing!")
            print(f"🚨 ALERT TRIGGERED: Theft of {diff:.2f}A")
            
            new_alert = Event(
                sensor_id="GRID_SYSTEM",
                event_type="THEFT_DETECTED",
                value=diff,
                message=f"{diff:.2f}A unaccounted for."
            )
            db.add(new_alert)
            
            # ---> SEND SMS ALERT
            send_sms_alert(f"Power Theft Detected! {diff:.2f}A stolen. Check Grid Line 1.")

        db.commit()

    except Exception as e:
        log.error(f"⚠️ Message Error: {e}")
    finally:
        db.close()

# --- 3. SETUP CLIENT ---
mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

# --- 4. PUBLISH FUNCTION ---
def publish_message(topic: str, payload: dict):
    try:
        payload_str = json.dumps(payload)
        mqtt_client.publish(topic, payload_str)
        log.info(f"📤 SENT COMMAND: {topic} -> {payload}")
    except Exception as e:
        log.error(f"❌ Failed to publish: {e}")

# --- 5. START LOOP ---
def start_mqtt():
    try:
        mqtt_client.connect(settings.MQTT_BROKER, settings.MQTT_PORT, 60)
        mqtt_client.loop_start()
    except Exception as e:
        log.error(f"❌ MQTT Connection Error: {e}")