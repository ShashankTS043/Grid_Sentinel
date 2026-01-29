import paho.mqtt.client as mqtt
import json
import time
import random
import sys

# CONFIG
BROKER = "broker.hivemq.com"
TOPIC_DATA = "grid/sentinel/data"
TOPIC_CONTROL = "grid/sentinel/control"

# STATE
sensor_id = "SIM-001"
temp = 40.0
current_source = 10.0
current_meter = 10.0 # Matches source = No Theft
audio_wave = []

def on_connect(client, userdata, flags, rc):
    print(f"✅ SIMULATOR CONNECTED to {BROKER}")
    client.subscribe(TOPIC_CONTROL)

def on_message(client, userdata, msg):
    """Listen for backend commands (Relay Control)"""
    payload = json.loads(msg.payload.decode())
    print(f"\n⚡ RECEIVED COMMAND: {payload} ⚡")
    if payload.get("command") == "OFF":
        print("🔴 RELAY TRIPPED! POWER CUT!")
    elif payload.get("command") == "ON":
        print("🟢 RELAY RESET. POWER RESTORED.")

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect(BROKER, 1883, 60)
client.loop_start()

print("--- GRID SIMULATOR ---")
print("[n] Normal Mode")
print("[s] Thermal Shock (Temp Spike)")
print("[t] Theft Mode (Current Mismatch)")
print("[a] Audio Fail (Arcing Noise)")
print("[q] Quit")

try:
    while True:
        cmd = input("Select Mode > ").lower().strip()
        
        if cmd == 'q':
            break
            
        # 1. Defaults (Normal)
        temp_change = random.uniform(-0.1, 0.1)
        current_source = 10.0
        current_meter = 10.0
        audio_wave = []
        
        # 2. Inject Faults based on Input
        if cmd == 's': # SHOCK
            print("🔥 INJECTING THERMAL SHOCK...")
            # We simulate a rapid rise over 3 readings
            for i in range(3):
                temp += 3.0 # Rise 3 degrees per tick (Huge!)
                payload = {
                    "sensor_id": sensor_id, "device_type": "TRANSFORMER",
                    "temperature": temp, "current": current_source, 
                    "vibration": 0.02, "audio_waveform": []
                }
                client.publish(TOPIC_DATA, json.dumps(payload))
                print(f"   -> Sent Temp: {temp:.1f}°C")
                time.sleep(1)
            continue # Skip normal loop
            
        elif cmd == 't': # THEFT
            print("🕵️ INJECTING THEFT...")
            current_source = 15.0 # Real Load
            current_meter = 10.0  # Meter Reading (Theft = 5A)
            # Send both packets
            p1 = { "sensor_id": sensor_id, "device_type": "TRANSFORMER", "temperature": temp, "current": current_source, "vibration": 0.0, "audio_waveform": [] }
            p2 = { "sensor_id": "METER-01", "device_type": "METER", "temperature": 0, "current": current_meter, "vibration": 0, "audio_waveform": [] }
            client.publish(TOPIC_DATA, json.dumps(p1))
            client.publish(TOPIC_DATA, json.dumps(p2))
            print(f"   -> Source: {current_source}A | Meter: {current_meter}A")

        elif cmd == 'a': # AUDIO
            print("🔊 INJECTING AUDIO NOISE...")
            # Simulated distorted wave (high frequency noise)
            audio_wave = [random.uniform(-1.0, 1.0) for _ in range(50)]
            payload = {
                "sensor_id": sensor_id, "device_type": "TRANSFORMER",
                "temperature": temp, "current": current_source, 
                "vibration": 0.5, "audio_waveform": audio_wave
            }
            client.publish(TOPIC_DATA, json.dumps(payload))
            print("   -> Sent Audio Packet")

        else: # NORMAL
            print("✅ Sending Normal Heartbeat...")
            payload = {
                "sensor_id": sensor_id, "device_type": "TRANSFORMER",
                "temperature": temp, "current": current_source, 
                "vibration": 0.02, "audio_waveform": []
            }
            client.publish(TOPIC_DATA, json.dumps(payload))

        time.sleep(1)

except KeyboardInterrupt:
    print("Exiting...")
    client.loop_stop()