import { useEffect } from 'react';
import { useGridStore } from '../store/useGridStore';

export const useGodMode = () => {
  const { setStatus, setCountdown, setMetrics } = useGridStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input box (not that we have any)
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case 'n': // Press 'N' for NORMAL
          console.log("GOD MODE: Force Normal");
          setStatus('NORMAL');
          setCountdown(null);
          setMetrics(45, 12.5, 50); // Reset numbers
          break;

        case 'c': // Press 'C' for CRITICAL (Explosion)
          console.log("GOD MODE: Force Critical");
          setStatus('CRITICAL');
          setCountdown(10); // Start 10s countdown
          setMetrics(89, 16.2, 105); // Spike numbers
          break;

        case 'h': // Press 'H' for HEALING
          console.log("GOD MODE: Force Heal");
          setStatus('HEALING');
          setCountdown(null);
          break;
          
        case 't': // Press 'T' for THEFT DETECTED
           // You can add a specific theft state later if you want
           console.log("GOD MODE: Theft Triggered (Visual Only for now)");
           break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setStatus, setCountdown, setMetrics]);
};