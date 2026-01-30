from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import random

class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*') # Allow your React app to access this
        self.end_headers()
        
        # Fake Data Response
        data = {
            "temperature": random.randint(40, 60),
            "current_load": round(random.uniform(10, 15), 1),
            "vibration_freq": round(random.uniform(49, 51), 2),
            "status": "NORMAL",
            "predicted_failure_seconds": None
        }
        self.wfile.write(json.dumps(data).encode())

server = HTTPServer(('localhost', 8000), SimpleHandler)
print("Fake Backend running on port 8000...")
server.serve_forever()