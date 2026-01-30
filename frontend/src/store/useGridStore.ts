import { create } from 'zustand';

interface GridState {
  temperature: number;
  load: number;
  vibration: number;

  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'HEALING';
  countdown: number | null;
  history: { time: string; temp: number; load: number }[];

  // --- SMS STATE ---
  smsStatus: { sent: boolean; reason?: string } | null;
  smsEnabled: boolean;

  // --- ACTIONS ---
  setMetrics: (temp: number, load: number, vib: number) => void;
  setStatus: (status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'HEALING') => void;
  setCountdown: (val: number | null) => void;

  setSmsStatus: (s: { sent: boolean; reason?: string } | null) => void;
  setSmsEnabled: (v: boolean) => void;
}

export const useGridStore = create<GridState>((set) => ({
  temperature: 45,
  load: 12.5,
  vibration: 50,
  status: 'NORMAL',
  countdown: null,
  history: [],

  // --- SMS DEFAULTS ---
  smsStatus: null,
  smsEnabled: true,

  // --- METRICS ---
  setMetrics: (temp, load, vib) =>
    set((state) => {
      const newPoint = {
        time: new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        temp,
        load,
      };

      return {
        temperature: temp,
        load,
        vibration: vib,
        history: [...state.history, newPoint].slice(-20),
      };
    }),

  setStatus: (status) => set({ status }),
  setCountdown: (val) => set({ countdown: val }),

  // --- SMS ACTIONS ---
  setSmsStatus: (s) => set({ smsStatus: s }),
  setSmsEnabled: (v) => set({ smsEnabled: v }),
}));
