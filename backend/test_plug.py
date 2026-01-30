import paho.mqtt.client as mqtt
import json

BROKER = "broker.hivemq.com"
TOPIC_CONTROL = "grid/sentinel/control"

def on_connect(client, userdata, flags, rc):
    print("🔌 SMART PLUG ONLINE. Waiting for commands...")
    client.subscribe(TOPIC_CONTROL)

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        command = payload.get("command")
        reason = payload.get("reason")
        
        if command == "OFF":
            print(f"\n⚡ COMMAND RECEIVED: CUT POWER! ({reason})")
            print("🔴 [CLICK] --- RELAY OPEN --- (Lights OFF)")
            
        elif command == "ON":
            print(f"\n⚡ COMMAND RECEIVED: RESTORE POWER. ({reason})")
            print("🟢 [CLICK] --- RELAY CLOSED --- (Lights ON)")
            
    except Exception as e:
        print(f"Error: {e}")

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect(BROKER, 1883, 60)
client.loop_forever()