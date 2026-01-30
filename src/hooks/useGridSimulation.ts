import { useEffect, useRef } from 'react';
import { useGridStore } from '../store/useGridStore';

export const useGridSimulation = () => {
  const { setMetrics, setStatus, setCountdown, status, countdown } = useGridStore();
  
  // We use refs to keep track of state inside the interval without re-running the effect
  const statusRef = useRef(status);
  const countdownRef = useRef(countdown);

  // Sync refs with state
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { countdownRef.current = countdown; }, [countdown]);

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Generate fake random data (Baseline)
      let fakeTemp = Math.floor(Math.random() * (50 - 40) + 40); 
      let fakeLoad = +(Math.random() * (15 - 10) + 10).toFixed(1);
      let fakeVib = +(Math.random() * (51 - 49) + 49).toFixed(2);

      // 2. LOGIC: If we are in CRITICAL mode, make numbers go crazy
      if (statusRef.current === 'CRITICAL') {
        fakeTemp = Math.floor(Math.random() * (90 - 80) + 80); // High Temp
        fakeVib = +(Math.random() * (150 - 100) + 100).toFixed(2); // High Vibration
        
        // Handle Countdown logic
        if (countdownRef.current !== null && countdownRef.current > 0) {
           setCountdown(countdownRef.current - 1);
        }
      } 
      // 3. LOGIC: HEALING MODE (Cool down)
      else if (statusRef.current === 'HEALING') {
         fakeTemp = Math.max(45, fakeTemp - 5); // Rapidly drop temp
         fakeLoad = 5.0; // Load drops to zero-ish
         fakeVib = 50.0; // Vibration stabilizes
      }
      // 4. LOGIC: Randomly trigger a disaster (1% chance every second)
      else if (Math.random() > 0.99) {
        setStatus('CRITICAL');
        setCountdown(9); // Start 9 second countdown
      }

      setMetrics(fakeTemp, fakeLoad, fakeVib);
    }, 1000);

    return () => clearInterval(interval);
  }, []);
};