from app.config import settings

# We need to import the mqtt client to send messages
# Note: We will fix the circular import in the next step
import app.services.mqtt as mqtt_service

class GridController:
    def __init__(self):
        self.TOPIC_CONTROL = "grid/sentinel/control"

    def trigger_load_shedding(self, reason: str):
        """
        Sends the KILL command to the smart plug/relay.
        """
        print(f"⚡ ACTION: SHEDDING LOAD! Reason: {reason}")
        
        # Payload: simple text or JSON. Let's use JSON for professionalism.
        payload = {
            "command": "OFF",
            "priority": "CRITICAL",
            "reason": reason
        }
        
        # Use the MQTT service to publish
        mqtt_service.publish_message(self.TOPIC_CONTROL, payload)

    def restore_power(self):
        """
        Sends the RESTORE command.
        """
        print("⚡ ACTION: RESTORING POWER.")
        payload = {
            "command": "ON",
            "priority": "NORMAL",
            "reason": "Manual Restore"
        }
        mqtt_service.publish_message(self.TOPIC_CONTROL, payload)

# Global Instance
grid_controller = GridController()