import { Activity, Thermometer } from 'lucide-react';
import { useGridStore } from './store/useGridStore';
import { useGridSimulation } from './hooks/useGridSimulation';
import { useRealGridData } from './hooks/useRealGridData'; // Day 8 Hook
import { GlassCard } from './components/ui/GlassCard';
import { LiveGraph } from './components/visuals/LiveGraph';
import { TheftScale } from './components/visuals/TheftScale';
import { CriticalAlert } from './components/overlays/CriticalAlert';
import { HealingOverlay } from './components/overlays/HealingOverlay';
import { useGodMode } from './hooks/useGodMode';

function App() {
  // --- HACKATHON CONFIGURATION ---
  // Set this to TRUE only when Member 2 (Backend) is ready.
  // Set to FALSE to use the built-in Simulator (Safe Mode).
  const USE_LIVE_DATA = false; 
  useGodMode();

  // 1. Logic Hooks
  // If Live Data is OFF, run the internal simulation
  if (!USE_LIVE_DATA) {
    useGridSimulation();
  }
  
  // Always initialize the Real Data hook (it only activates if USE_LIVE_DATA is true)
  const { isOffline } = useRealGridData(USE_LIVE_DATA);

  // 2. State Management
  const { temperature, load, vibration, status } = useGridStore();

  return (
    <div className="min-h-screen bg-industrial-900 text-white p-6 md:p-12 font-sans selection:bg-neon-blue selection:text-black relative overflow-hidden">
      
      {/* --- LAYER 1: VISUAL EFFECTS --- */}

      {/* --- LAYER 2: OVERLAYS (Z-Index High) --- */}
      <CriticalAlert />
      <HealingOverlay />

      {/* --- LAYER 3: OFFLINE WARNING (Only if Live Data fails) --- */}
      {USE_LIVE_DATA && isOffline && (
        <div className="fixed bottom-4 right-4 bg-red-600/90 backdrop-blur text-white px-4 py-2 rounded-full font-mono text-xs animate-pulse z-50 border border-red-400 shadow-[0_0_10px_red]">
           ⚠️ BACKEND DISCONNECTED - CHECK API
        </div>
      )}

      {/* --- LAYER 4: MAIN DASHBOARD CONTENT --- */}
      
      {/* HEADER SECTION */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-industrial-700 pb-6 relative z-10">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 text-glow-blue">
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

        {/* TOP RIGHT METRICS */}
        <div className="flex gap-8">
          <div className="text-right">
            <p className="text-xs text-gray-500 font-mono uppercase">Grid Freq</p>
            <p className="text-2xl font-mono font-bold text-white">50.0 <span className="text-sm text-gray-500">Hz</span></p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-mono uppercase">Avg Load</p>
            <p className="text-2xl font-mono font-bold text-neon-blue text-glow-blue">{load} <span className="text-sm text-gray-500">A</span></p>
          </div>
        </div>
      </header>

      {/* MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px] relative z-10">
        
        {/* LEFT COLUMN: SENSOR READINGS (3 Cols) */}
        <div className="md:col-span-3 flex flex-col gap-6">
          <GlassCard title="Thermal Status" className="flex-1 relative">
             {/* Badge stays here */}
             <div className="absolute top-4 right-4 bg-green-900/30 border border-green-500/30 px-2 py-1 rounded text-[10px] font-mono text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.1)]">
               Est. Savings: $45k
             </div>

            {/* FIX: Added 'mt-6' to push this row down so it doesn't hit the badge */}
            <div className="flex items-center justify-between mb-4 mt-14">
              <Thermometer size={40} className="text-gray-500" />
              <span className={`text-4xl font-mono font-bold ${temperature > 80 ? 'text-neon-red animate-pulse' : 'text-white'}`}>
                {temperature}°C
              </span>
            </div>
            
            <p className="text-xs text-gray-500">
              Optimal Operating Range: <span className="text-white">30-60°C</span>
            </p>
            
            <div className="w-full bg-gray-800 h-1 mt-4 overflow-hidden">
               <div 
                 className={`h-full transition-all duration-500 ${temperature > 60 ? 'bg-neon-red' : 'bg-neon-blue'}`} 
                 style={{ width: `${Math.min((temperature / 100) * 100, 100)}%`}} 
               />
            </div>
          </GlassCard>
          <GlassCard title="Vibration Analysis" className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <Activity size={40} className="text-gray-500" />
              <span className="text-4xl font-mono font-bold">{vibration} <span className="text-sm">Hz</span></span>
            </div>
            <p className="text-xs text-gray-500">
              Harmonic Stability: <span className="text-neon-blue">98%</span>
            </p>
          </GlassCard>
        </div>

        {/* MIDDLE COLUMN: MAIN VISUALIZER (6 Cols) */}
        <div className="md:col-span-6 h-[400px] md:h-full">
          <GlassCard title="Real-Time Digital Twin" className="h-full border-neon-blue/20 p-0 overflow-hidden glass-panel-glow">
             <LiveGraph />
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: ALERTS & THEFT (3 Cols) */}
        <div className="md:col-span-3 h-[400px] md:h-full">
           <GlassCard title="Security & Theft" className="h-full bg-red-900/5 border-red-900/20">
             <TheftScale />
           </GlassCard>
        </div>

      </div>
    </div>
  )
}

export default App;