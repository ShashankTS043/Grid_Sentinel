import threading
import time
import requests
import random

# CONFIG
API_URL = "http://127.0.0.1:8000/api"
NUM_REQUESTS = 500  # How many requests to fire?

def spam_server(thread_id):
    """Simulates a judge refreshing the dashboard aggressively"""
    for i in range(50):
        try:
            # 1. Fetch Status
            requests.get(f"{API_URL}/status/live")
            # 2. Fetch History
            requests.get(f"{API_URL}/history/readings?limit=50")
            
            if i % 10 == 0:
                print(f"Thread {thread_id}: Request {i} OK")
        except Exception as e:
            print(f"Thread {thread_id}: FAILED {e}")

print(f"🔥 STARTING STRESS TEST ({NUM_REQUESTS} requests)...")
start_time = time.time()

threads = []
# Create 10 threads (simulating 10 users at once)
for i in range(10):
    t = threading.Thread(target=spam_server, args=(i,))
    threads.append(t)
    t.start()

# Wait for all to finish
for t in threads:
    t.join()

end_time = time.time()
print(f"✅ TEST COMPLETE. Time: {round(end_time - start_time, 2)}s")
print("If the server didn't crash, you are ready.")