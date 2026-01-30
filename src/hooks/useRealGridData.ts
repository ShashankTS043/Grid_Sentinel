import { useEffect, useState } from 'react';
import { useGridStore } from '../store/useGridStore';

// Change this to your backend team's IP address during the hackathon!
// If testing locally, use 'http://localhost:8000'
const BACKEND_URL = 'http://localhost:8000/api/status/live';

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
        
        // 1. Update the Grid Store with Real Data
        // specific mapping depends on what Member 2 names their variables
        setMetrics(data.temperature, data.current_load, data.vibration_freq);
        
        // 2. Handle Critical Status
        if (data.status === 'CRITICAL') {
           setStatus('CRITICAL');
           // If the backend sends a prediction time, use it
           if (data.predicted_failure_seconds) {
             setCountdown(data.predicted_failure_seconds);
           }
        } else if (data.status === 'NORMAL') {
           setStatus('NORMAL');
        }

        setIsOffline(false); // We are connected!

      } catch (error) {
        console.error("Backend Error:", error);
        setIsOffline(true); // Trigger the "Offline" warning
      }
    };

    // Poll every 500ms (Fast updates)
    const interval = setInterval(fetchData, 500);
    return () => clearInterval(interval);
  }, [isEnabled, setMetrics, setStatus, setCountdown]);

  return { isOffline };
};