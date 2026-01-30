import paho.mqtt.client as mqtt
import json
import time
import random

BROKER = "broker.hivemq.com"
TOPIC = "grid/sentinel/data"

client = mqtt.Client()
client.connect(BROKER, 1883, 60)

print("🔥 STARTING THERMAL SHOCK SIMULATION...")
print("The temperature will rise by ~1.5°C every second to trigger the alarm.")

# Start at a normal temperature
current_temp = 40.0 

try:
    while True:
        # 1. Simulate the "Attack" (Rapid Heating)
        # Increase temp by roughly 0.8 to 1.5 degrees every loop
        rise = random.uniform(0.8, 1.5)
        current_temp += rise
        
        # Reset if it gets too hot (so we can test again without restarting)
        if current_temp > 95.0:
            print("❄️  Cooling down system...")
            current_temp = 40.0
            time.sleep(2) # Pause for effect

        # 2. Create the Payload
        # We MUST include 'device_type' because we added it in Day 5
        payload = {
            "sensor_id": "DT-402",
            "device_type": "TRANSFORMER",
            "temperature": round(current_temp, 2),
            "current": round(random.uniform(12.0, 13.0), 2), # Load is stable
            "vibration": round(random.uniform(0.1, 0.3), 3),  # Vibration is normal
            "audio_waveform": [] # Empty list implies silent/normal audio
        }
        
        # 3. Send Data
        client.publish(TOPIC, json.dumps(payload))
        print(f"📡 Sent: Temp={payload['temperature']}°C (Rise: {round(rise, 2)})")
        
        # 4. Wait 1 second 
        # (This speed ensures the Rate-of-Rise calculation sees a > 1.0 deg/min spike)
        time.sleep(1)

except KeyboardInterrupt:
    print("\nSimulation Stopped.")
    client.disconnect()