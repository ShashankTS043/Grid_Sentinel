import { useEffect, useState } from 'react';
import { useGridStore } from '../store/useGridStore';

// Pointing to the FastAPI backend we just built
const BACKEND_URL = 'http://localhost:8000/api/live';

export const useRealGridData = (isEnabled: boolean) => {
  const { setMetrics, setStatus, setCountdown } = useGridStore();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;

    const fetchData = async () => {
      try {
        const response = await fetch(BACKEND_URL);
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        // --- 1. VALIDATE DATA ---
        // If the DB is empty, data.transformer might be null. Handle that safely.
        if (!data.transformer) {
           console.warn("Backend connected but no data yet.");
           return;
        }

        // --- 2. MAP BACKEND TO FRONTEND ---
        // Backend sends Vibration 0.0-1.0. Simulation used 50. 
        // We multiply by 100 to make it look "active" on the graph (0.5 -> 50Hz)
        const realTemp = data.transformer.temperature;
        const realLoad = data.transformer.current;
        const realVib  = (data.transformer.vibration || 0) * 100; 

        setMetrics(realTemp, realLoad, realVib);
        
        // --- 3. HANDLE ALERTS (AUTO-CRITICAL) ---
        // Check the latest alert from the backend
        if (data.alerts && data.alerts.length > 0) {
           const latestAlert = data.alerts[0]; // First one is newest
           
           // If alert is very recent (less than 10 seconds ago)
           const alertTime = new Date(latestAlert.timestamp).getTime();
           const now = new Date().getTime();
           const isRecent = (now - alertTime) < 10000; 

           if (isRecent) {
              setStatus('CRITICAL');
              // If the backend predicted failure, use that, else default to 10s
              setCountdown(10); 
           } else {
              // If no recent alerts, go back to Normal
              setStatus('NORMAL');
           }
        } else {
           setStatus('NORMAL');
        }

        setIsOffline(false); // Green light!

      } catch (error) {
        console.error("Backend Error:", error);
        setIsOffline(true); // Red light!
      }
    };

    // Poll every 1 second (1000ms) to match the hardware speed
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [isEnabled, setMetrics, setStatus, setCountdown]);

  return { isOffline };
};