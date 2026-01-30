import { create } from 'zustand';

interface GridState {
  temperature: number;
  load: number;
  vibration: number;
  // ADDED 'HEALING' TO THE LIST
  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'HEALING'; 
  countdown: number | null;
  history: { time: string; temp: number; load: number }[]; 
  
  setMetrics: (temp: number, load: number, vib: number) => void;
  // UPDATE HERE TOO
  setStatus: (status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'HEALING') => void; 
  setCountdown: (val: number | null) => void;
}

export const useGridStore = create<GridState>((set) => ({
  temperature: 45,
  load: 12.5,
  vibration: 50,
  status: 'NORMAL',
  countdown: null,
  history: [],

  setMetrics: (temp, load, vib) => set((state) => {
    const newPoint = { 
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }), 
      temp, 
      load 
    };
    const newHistory = [...state.history, newPoint].slice(-20);
    return { 
      temperature: temp, 
      load: load, 
      vibration: vib,
      history: newHistory
    };
  }),

  setStatus: (status) => set({ status }),
  setCountdown: (val) => set({ countdown: val }),
}));