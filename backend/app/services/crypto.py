import hashlib

def generate_event_hash(sensor_id, event_type, value, timestamp, prev_hash):
    """
    Creates a SHA-256 fingerprint of the event + the previous event.
    This creates the 'Chain'.
    """
    # 1. Convert timestamp to string
    time_str = str(timestamp)
    
    # 2. Combine all data points into one string (The 'Block')
    payload = f"{sensor_id}|{event_type}|{value}|{time_str}|{prev_hash}"
    
    # 3. Hash it
    return hashlib.sha256(payload.encode()).hexdigest()