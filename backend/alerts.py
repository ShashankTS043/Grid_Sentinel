import os, time
from smsmobileapi import SMSSender
from threading import Lock

API_KEY = os.getenv("SMS_API_KEY")
PHONE = os.getenv("TECHNICIAN_PHONE")
SMS_ENABLED = os.getenv("SMS_ENABLED", "true").lower() == "true"

COOLDOWN = 300
last_sent = 0
lock = Lock()

def send_sms_alert(temp, load):
    global last_sent
    if not SMS_ENABLED or not API_KEY or not PHONE:
        return {"sent": False, "reason": "disabled_or_missing_config"}

    with lock:
        now = time.time()
        if now - last_sent < COOLDOWN:
            return {"sent": False, "reason": "cooldown"}

        try:
            sms = SMSSender(API_KEY)
            msg = f"⚠ GRID-SENTINEL\nTemp: {temp}°C\nLoad: {load}A\nImmediate inspection required."
            resp = sms.send_message(to=PHONE, message=msg, sendsms=1, sendwa=0)
            last_sent = now
            return {"sent": True, "response": str(resp)}
        except Exception as e:
            return {"sent": False, "reason": str(e)}
