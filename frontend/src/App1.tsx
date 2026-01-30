import { useState, useEffect } from 'react';
import { Activity, Thermometer, FileSpreadsheet, Leaf, Sun, Moon, Wind } from 'lucide-react';
import * as XLSX from 'xlsx';

import { useGridStore } from './store/useGridStore';
import { useGridSimulation } from './hooks/useGridSimulation';
import { useRealGridData } from './hooks/useRealGridData';
import { useGodMode } from './hooks/useGodMode';
import { useSoundFX } from './hooks/useSoundFX';
import { useSmsStatus } from './hooks/useSmsStatus';

// UI Components
import { GlassCard } from './components/ui/GlassCard';
import { Footer } from './components/ui/Footer';

// Visualizations
import { LiveGraph } from './components/visuals/LiveGraph';
import { TheftScale } from './components/visuals/TheftScale';
import { NoiseWave } from './components/visuals/NoiseWave';

// Overlays
import { CriticalAlert } from './components/overlays/CriticalAlert';
import { HealingOverlay } from './components/overlays/HealingOverlay';
import { GridChat } from './components/overlays/GridChat';

function App1() {
  const USE_LIVE_DATA = false;

  useGodMode();
  useSoundFX();
  useSmsStatus(); // <-- must be inside component

  if (!USE_LIVE_DATA) { useGridSimulation(); }

  const { isOffline } = useRealGridData(USE_LIVE_DATA);
  const { temperature, load, vibration, status } = useGridStore();

  // SMS STORE STATE
  const { smsStatus, smsEnabled, setSmsEnabled } = useGridStore();

  // WEATHER
  const [weather, setWeather] = useState({
    temp: 24,
    condition: 'Initializing...',
    windSpeed: 12,
    solarIntensity: 0,
    isNight: false
  });

  useEffect(() => {
    const updateWeather = () => {
      const hour = new Date().getHours();
      const isNight = hour >= 18 || hour < 6;

      setWeather(prev => ({
        ...prev,
        isNight,
        temp: isNight ? 18 : 28,
        condition: isNight ? 'Clear Night' : 'Sunny',
        windSpeed: Math.max(5, prev.windSpeed + (Math.random() - 0.5) * 4),
        solarIntensity: isNight ? 0 : Math.min(100, Math.max(60, prev.solarIntensity + (Math.random() - 0.5) * 2))
      }));
    };

    updateWeather();
    const interval = setInterval(updateWeather, 2000);
    return () => clearInterval(interval);
  }, []);

  // CO2
  const [co2Saved, setCo2Saved] = useState(1245.50);
  useEffect(() => {
    const interval = setInterval(() => setCo2Saved(prev => prev + 0.05), 1000);
    return () => clearInterval(interval);
  }, []);

  // EXPORT
  const handleExport = () => {
    const data = useGridStore.getState().history;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Grid_Log");
    XLSX.writeFile(workbook, `Grid_Sentinel_Log_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // CHAOS MODE
  useEffect(() => {
    const chaosTimer = setInterval(() => {
      if (useGridStore.getState().status === 'NORMAL' && Math.random() < 0.15) {
        useGridStore.getState().setStatus('CRITICAL');
      }
    }, 5000);

    return () => clearInterval(chaosTimer);
  }, []);

  return (
    <div className="h-screen bg-industrial-900 text-white p-6 relative overflow-hidden flex flex-col">

      {/* OVERLAYS */}
      <CriticalAlert />
      <HealingOverlay />

      {/* SMS BANNER */}
      {smsStatus?.sent && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          SMS ALERT SENT
        </div>
      )}

      {/* HEADER */}
      <header className="mb-6 flex justify-between items-center border-b border-industrial-700 pb-4">

        <div>
          <h1 className="text-4xl font-black">
            GRID<span className="text-neon-blue">SENTINEL</span>
          </h1>
          <p className="text-sm text-gray-400 font-mono">STATUS: {status}</p>
        </div>

        <div className="flex items-center gap-6">

          {/* SMS TOGGLE */}
          <button
            onClick={async () => {
              const newVal = !smsEnabled;
              setSmsEnabled(newVal);
              await fetch(`/api/alerts/toggle?enabled=${newVal}`, { method: "POST" });
            }}
            className="bg-blue-600 px-3 py-1 rounded text-xs font-mono"
          >
            SMS: {smsEnabled ? "ON" : "OFF"}
          </button>

          <button
            onClick={handleExport}
            className="hidden md:flex items-center gap-2 bg-industrial-800 border border-industrial-700 px-4 py-2 rounded text-xs font-mono"
          >
            <FileSpreadsheet size={14} /> EXPORT
          </button>

          <div className="text-right">
            <p className="text-xs text-gray-500 font-mono uppercase">Avg Load</p>
            <p className="text-xl font-mono font-bold text-neon-blue">{load} A</p>
          </div>
        </div>
      </header>

      {/* GRID */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">

        <div className="md:col-span-3 flex flex-col gap-4">
          <GlassCard title="Thermal Status">
            <Thermometer />
            <p>{temperature}°C</p>
          </GlassCard>

          <GlassCard title="Vibration">
            <NoiseWave />
            <p>{vibration} Hz</p>
          </GlassCard>
        </div>

        <div className="md:col-span-6">
          <GlassCard title="Digital Twin">
            <LiveGraph />
          </GlassCard>
        </div>

        <div className="md:col-span-3 flex flex-col gap-4">
          <GlassCard title="Security">
            <TheftScale />
          </GlassCard>

          <GlassCard title="Assistant">
            <GridChat />
          </GlassCard>
        </div>

      </div>

      <Footer />
    </div>
  );
}

export default App1;
