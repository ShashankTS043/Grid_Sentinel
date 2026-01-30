import { useState, useEffect } from 'react';
import { Activity, Thermometer, FileSpreadsheet, Leaf, Sun, Moon, Wind } from 'lucide-react'; 
import * as XLSX from 'xlsx'; 
import { useGridStore } from './store/useGridStore';
import { useGridSimulation } from './hooks/useGridSimulation';
import { useRealGridData } from './hooks/useRealGridData';
import { useGodMode } from './hooks/useGodMode';
import { useSoundFX } from './hooks/useSoundFX';

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
  // ---------------------------------------------------------
  // 🚀 INTEGRATION SWITCH: SET TO TRUE FOR REAL BACKEND DATA
  // ---------------------------------------------------------
  const USE_LIVE_DATA = true; 
  
  useGodMode();
  useSoundFX();

  // Conditionally run Simulation OR Real Data
  if (!USE_LIVE_DATA) { 
    useGridSimulation(); 
  }
  
  const { isOffline } = useRealGridData(USE_LIVE_DATA);
  const { temperature, load, vibration, status } = useGridStore();

  // ==========================================
  //      LOGIC ZONE
  // ==========================================

  // 1. SMART WEATHER SIMULATOR
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
        isNight: isNight,
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


  // 2. SUSTAINABILITY METRIC
  const [co2Saved, setCo2Saved] = useState(1245.50);
  useEffect(() => {
    const interval = setInterval(() => {
      setCo2Saved(prev => prev + 0.05);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3. EXCEL EXPORT
  const handleExport = () => {
    const data = useGridStore.getState().history;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Grid_Log");
    XLSX.writeFile(workbook, `Grid_Sentinel_Log_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // 4. CHAOS MODE (DISABLED FOR LIVE DEMO to avoid interference)
  useEffect(() => {
    if (USE_LIVE_DATA) return; // Don't run random chaos if using real sensors!

    const chaosTimer = setInterval(() => {
      if (useGridStore.getState().status === 'NORMAL') {
        if (Math.random() < 0.15) {
          useGridStore.getState().setStatus('CRITICAL');
        }
      }
    }, 5000); 

    return () => clearInterval(chaosTimer);
  }, [USE_LIVE_DATA]);

  return (
    // LOCKED SCREEN: 'overflow-hidden' and 'h-screen'
    <div className="h-screen bg-industrial-900 bg-grid-pattern text-white p-6 md:p-8 font-sans selection:bg-neon-blue selection:text-black relative overflow-hidden flex flex-col">
      
      {/* --- OVERLAYS --- */}
      <CriticalAlert />
      <HealingOverlay />
      
      {/* OFFLINE WARNING BADGE */}
      {USE_LIVE_DATA && isOffline && (
        <div className="fixed bottom-4 right-4 bg-red-600/90 backdrop-blur text-white px-4 py-2 rounded-full font-mono text-xs animate-pulse z-50 border border-red-400 shadow-[0_0_10px_red]">
           ⚠️ BACKEND DISCONNECTED - RUN ./run.sh
        </div>
      )}

      {/* HEADER SECTION (Compact) */}
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-industrial-700 pb-4 relative z-10 shrink-0">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-1 text-glow-blue">
            GRID<span className="text-neon-blue">SENTINEL</span>
          </h1>
          <div className="flex items-center gap-2 text-sm font-mono text-gray-400">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'NORMAL' ? 'bg-neon-blue' : status === 'HEALING' ? 'bg-green-500' : 'bg-neon-red'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${status === 'NORMAL' ? 'bg-neon-blue' : status === 'HEALING' ? 'bg-green-500' : 'bg-neon-red'}`}></span>
            </span>
            SYSTEM STATUS: 
            <span className={`ml-2 font-bold ${
              status === 'NORMAL' ? 'text-neon-blue text-glow-blue' : 
              status === 'HEALING' ? 'text-green-400 text-glow-green' : 
              'text-neon-red text-glow-red'
            }`}>
              {status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={handleExport} 
            className="hidden md:flex items-center gap-2 bg-industrial-800 border border-industrial-700 hover:border-neon-blue px-4 py-2 rounded text-xs font-mono transition-colors text-gray-400 hover:text-white"
          >
            <FileSpreadsheet size={14} /> EXPORT
          </button>

          <div className="text-right">
            <p className="text-xs text-green-500 font-mono uppercase flex items-center justify-end gap-1">
              <Leaf size={10} /> Carbon Offset
            </p>
            <p className="text-xl font-mono font-bold text-white">
              {co2Saved.toFixed(2)} <span className="text-sm text-gray-500">kg</span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500 font-mono uppercase">Avg Load</p>
            <p className="text-xl font-mono font-bold text-neon-blue text-glow-blue">{load} <span className="text-sm text-gray-500">A</span></p>
          </div>
        </div>
      </header>

      {/* MAIN GRID LAYOUT */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0 relative z-10 pb-16">
        
        {/* LEFT COLUMN: SENSOR READINGS + WEATHER */}
        <div className="md:col-span-3 flex flex-col gap-4 h-full min-h-0">
          
          {/* 1. THERMAL STATUS */}
          <GlassCard title="Thermal Status" className="h-[200px] relative flex flex-col justify-between min-h-0">
             <div className="absolute top-4 right-4 z-10">
             </div>
            <div className="flex items-center justify-between mt-4">
              <Thermometer size={30} className="text-gray-500" />
              <span className={`text-3xl font-mono font-bold ${temperature > 80 ? 'text-neon-red animate-pulse' : 'text-white'}`}>
                {temperature}°C
              </span>
            </div>
            <div className="w-full bg-gray-800 h-1 mt-auto overflow-hidden">
               <div className={`h-full transition-all duration-500 ${temperature > 60 ? 'bg-neon-red' : 'bg-neon-blue'}`} style={{ width: `${Math.min((temperature / 100) * 100, 100)}%`}} />
            </div>
          </GlassCard>

          {/* 2. WEATHER */}
          <GlassCard title="Local Renewables" className="h-[200px] shrink-0 flex flex-col justify-between">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 {weather.isNight ? (
                    <Moon className="text-blue-300" size={16} />
                 ) : (
                    <Sun className="text-yellow-400 animate-pulse" size={16} />
                 )}
                 <span className="text-lg font-bold text-white">{weather.temp}°C</span>
               </div>
               <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">{weather.condition}</span>
             </div>

             <div className="grid grid-cols-2 gap-2 mt-2">
               <div className="bg-white/5 p-2 rounded border border-white/10">
                 <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-1">
                   <Sun size={10} /> SOLAR
                 </div>
                 <div className={`text-xs font-mono ${weather.isNight ? 'text-gray-600' : 'text-yellow-400'}`}>
                    {weather.solarIntensity.toFixed(1)}%
                 </div>
               </div>
               <div className="bg-white/5 p-2 rounded border border-white/10">
                 <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-1">
                   <Wind size={10} /> WIND
                 </div>
                 <div className="text-xs font-mono text-blue-400">{weather.windSpeed.toFixed(1)} km/h</div>
               </div>
             </div>
             
             <div className="mt-2 text-[9px] text-center text-green-400 font-mono border-t border-white/10 pt-1">
               EFFICIENCY: <span className="font-bold">OPTIMAL</span>
             </div>
          </GlassCard>

          {/* 3. VIBRATION */}
          <GlassCard title="Vibration" className="h-[200px] shrink-0 overflow-hidden relative">
            <div className="absolute top-2 right-4 text-right">
              <div className="text-lg font-bold font-mono text-neon-blue leading-none">{vibration.toFixed(1)}</div>
              <div className="text-[8px] text-gray-500 font-mono">Hz</div>
            </div>
            <div className="mt-[-15px]">
               <NoiseWave />
            </div>
          </GlassCard>
        </div>

        {/* MIDDLE COLUMN: LIVE GRAPH */}
        <div className="md:col-span-6 h-full min-h-0 print-break-avoid"> 
          <GlassCard title="Real-Time Digital Twin" className="h-full border-neon-blue/20 p-0 overflow-hidden glass-panel-glow">
             <LiveGraph />
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: THEFT & CHAT */}
        <div className="md:col-span-3 flex flex-col gap-4 h-full min-h-0">
           <GlassCard title="Security & Theft" className="flex-1 bg-red-900/5 border-red-900/20 min-h-0 overflow-hidden">
             <TheftScale />
           </GlassCard>

           <GlassCard title="Grid Assistant" className="flex-1 min-h-0 overflow-hidden">
             <GridChat />
           </GlassCard>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full">
         <Footer />
      </div>
    </div>
  )
}

export default App1;