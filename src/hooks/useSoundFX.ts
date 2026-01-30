import { useEffect, useRef } from 'react';
import { useGridStore } from '../store/useGridStore';

export const useSoundFX = () => {
  const { status } = useGridStore();
  // We use refs to keep track of the oscillator so we can stop it
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // ONLY run this if status is CRITICAL
    if (status === 'CRITICAL') {
      try {
        // 1. Create Audio Context (Cross-browser support)
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        audioContextRef.current = new AudioContext();
        
        // 2. Create Oscillator (The sound generator)
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();

        // 3. Configure Sound (Siren Effect)
        osc.type = 'sawtooth'; // 'sawtooth' sounds like an alarm
        osc.frequency.setValueAtTime(440, audioContextRef.current.currentTime); // Start low
        // Ramp frequency up and down to sound like a siren
        osc.frequency.linearRampToValueAtTime(880, audioContextRef.current.currentTime + 0.5);
        osc.frequency.linearRampToValueAtTime(440, audioContextRef.current.currentTime + 1.0);
        osc.frequency.linearRampToValueAtTime(880, audioContextRef.current.currentTime + 1.5);
        osc.frequency.linearRampToValueAtTime(440, audioContextRef.current.currentTime + 2.0);
        osc.frequency.linearRampToValueAtTime(880, audioContextRef.current.currentTime + 2.5);

        // 4. Configure Volume
        gain.gain.value = 0.1; // Keep it low (10%) so it doesn't hurt ears

        // 5. Connect the wires
        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);

        // 6. START
        osc.start();
        oscillatorRef.current = osc;
        gainNodeRef.current = gain;

        console.log("🔊 ALARM TRIGGERED");

        // 7. Auto-stop after 3 seconds
        const stopTimer = setTimeout(() => {
            stopAlarm();
        }, 3000);

        return () => {
            clearTimeout(stopTimer);
            stopAlarm();
        };

      } catch (e) {
        console.error("Audio Error:", e);
      }
    } else {
        // If we switch away from CRITICAL, kill the sound immediately
        stopAlarm();
    }
  }, [status]);

  const stopAlarm = () => {
    if (oscillatorRef.current) {
        try {
            oscillatorRef.current.stop();
            oscillatorRef.current.disconnect();
        } catch (e) {} // Ignore errors if already stopped
        oscillatorRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
  };
};