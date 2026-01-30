import { useEffect, useState } from 'react';
import { Crosshair, MapPin, AlertTriangle, Satellite, ZapOff, Siren, Power, CheckCircle2 } from 'lucide-react';
import { useGridStore } from '../../store/useGridStore';

export const TheftLocationPopup = () => {
  const { status, setStatus } = useGridStore();
  const [step, setStep] = useState<'hidden' | 'scanning' | 'found' | 'isolating' | 'done'>('hidden');

  // TRIGGER: Watch for CRITICAL status
  useEffect(() => {
    if (status === 'CRITICAL') {
      setStep('scanning');
      // Simulate scanning delay
      const timer = setTimeout(() => {
        setStep('found');
      }, 3000);
      return () => clearTimeout(timer);
    } else if (status === 'NORMAL' && step !== 'hidden') {
       // Close popup if grid becomes normal externally
       setStep('hidden');
    }
  }, [status]);

  // ACTION: REMOTE ISOLATION (The Kill Switch)
  const handleIsolate = async () => {
    setStep('isolating');
    
    // Simulate the "Smart Grid" cutting power
    await new Promise(r => setTimeout(r, 2500)); // 2.5s delay for animation
    
    setStep('done');
    setStatus('HEALING'); // Fix the grid

    // Close after showing success
    setTimeout(() => {
      setStep('hidden');
    }, 2000);
  };

  const handlePolice = () => {
    alert("Dispatching local authorities to coordinates: 12.9716° N, 77.5946° E");
    setStatus('HEALING');
    setStep('hidden');
  };

  if (step === 'hidden') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      
      {/* THE POPUP CARD */}
      <div className={`relative w-full max-w-md bg-black/90 border-2 ${
        step === 'scanning' ? 'border-yellow-500' : 
        step === 'isolating' ? 'border-orange-500' :
        step === 'done' ? 'border-green-500' :
        'border-red-500'
      } rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-colors duration-500`}>
        
        {/* HEADER */}
        <div className="bg-white/5 p-3 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2 text-sm font-mono font-bold">
            {step === 'scanning' && (
              <> <Satellite className="animate-pulse text-yellow-500" size={16} /> <span className="text-yellow-500">TRIANGULATING...</span> </>
            )}
            {step === 'found' && (
              <> <AlertTriangle className="animate-pulse text-red-500" size={16} /> <span className="text-red-500 tracking-widest">TARGET ACQUIRED</span> </>
            )}
            {step === 'isolating' && (
              <> <Power className="animate-spin text-orange-500" size={16} /> <span className="text-orange-500">REMOTE DISCONNECT</span> </>
            )}
            {step === 'done' && (
              <> <CheckCircle2 className="text-green-500" size={16} /> <span className="text-green-500">THREAT NEUTRALIZED</span> </>
            )}
          </div>
          <div className="text-[10px] text-gray-500 font-mono">SAT-LINK: V4.2</div>
        </div>

        {/* CONTENT AREA */}
        <div className="relative h-56 bg-gray-900 overflow-hidden group">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>

          {/* VIEW 1: SCANNING */}
          {step === 'scanning' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-32 h-32 border-2 border-yellow-500/30 rounded-full animate-ping absolute"></div>
              <div className="text-yellow-500 font-mono text-xs animate-pulse">SEARCHING GRID...</div>
            </div>
          )}

          {/* VIEW 2: MAP / TARGET */}
          {step === 'found' && (
            <>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                 <div className="relative">
                   <div className="absolute -inset-8 bg-red-500/20 rounded-full animate-pulse"></div>
                   <MapPin className="text-red-500 relative z-10 drop-shadow-[0_0_15px_red] animate-bounce" size={40} />
                 </div>
                 <div className="mt-4 bg-black/80 text-red-400 text-[10px] px-3 py-1 rounded font-mono border border-red-500/50 backdrop-blur">
                    ILLEGAL TAP DETECTED
                 </div>
              </div>
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-white/5">
                <Crosshair size={240} strokeWidth={0.5} />
              </div>
            </>
          )}

          {/* VIEW 3: ISOLATING ANIMATION */}
          {step === 'isolating' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
               <ZapOff size={48} className="text-orange-500 mb-4 animate-pulse" />
               <div className="text-orange-500 font-mono font-bold text-lg">CUTTING POWER</div>
               <div className="w-48 h-1 bg-gray-800 rounded mt-4 overflow-hidden">
                 <div className="h-full bg-orange-500 animate-[progress_2s_ease-in-out_infinite] w-full origin-left"></div>
               </div>
               <div className="font-mono text-[10px] text-gray-500 mt-2">OPENING CIRCUIT BREAKER 7-G...</div>
            </div>
          )}

          {/* VIEW 4: SUCCESS */}
          {step === 'done' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-900/20 z-20">
               <CheckCircle2 size={48} className="text-green-500 mb-2" />
               <div className="text-green-400 font-mono font-bold">SECTOR ISOLATED</div>
               <div className="text-[10px] text-gray-400 mt-1">Power flow redirected to Safe Lines.</div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS (Only show when target found) */}
        {step === 'found' && (
           <div className="p-4 animate-in slide-in-from-bottom-2 space-y-3 bg-black">
             {/* Info Chips */}
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-800/50 p-2 rounded border border-gray-700">
                 <div className="text-[9px] text-gray-500 uppercase">Sector</div>
                 <div className="text-xs font-mono text-white">7-G (Indiranagar)</div>
               </div>
               <div className="bg-gray-800/50 p-2 rounded border border-gray-700">
                 <div className="text-[9px] text-gray-500 uppercase">Loss Rate</div>
                 <div className="text-xs font-mono text-red-400">$14.20 / sec</div>
               </div>
             </div>

             {/* DUAL BUTTONS */}
             <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={handleIsolate} 
                 className="group relative bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 text-orange-500 text-xs font-bold py-3 px-2 rounded flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02] overflow-hidden"
               >
                 <div className="absolute inset-0 bg-orange-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                 <ZapOff size={18} className="mb-1 relative z-10" />
                 <span className="relative z-10">REMOTE KILL</span>
               </button>

               <button 
                 onClick={handlePolice} 
                 className="group bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-400 text-xs font-bold py-3 px-2 rounded flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02]"
               >
                 <Siren size={18} className="mb-1" />
                 NOTIFY POLICE
               </button>
             </div>
           </div>
        )}

      </div>
    </div>
  );
};