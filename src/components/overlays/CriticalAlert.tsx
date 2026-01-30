import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ZapOff } from 'lucide-react';
import { useGridStore } from '../../store/useGridStore';

export const CriticalAlert = () => {
  const { status, countdown, setStatus, setCountdown } = useGridStore();

console.log("CRITICAL ALERT RENDER CHECK:", status);

const handleKillSwitch = () => {
    // OLD: setStatus('NORMAL');
    // NEW: Trigger the Healing Animation
    setStatus('HEALING');
    setCountdown(null);
  };

  return (
    <AnimatePresence>
      {status === 'CRITICAL' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
        >
          {/* Industrial "Hazmat" Border Animation */}
          <motion.div 
            animate={{ 
              borderColor: ["#ff0000", "#330000", "#ff0000"],
              boxShadow: ["0 0 20px #ff0000", "0 0 60px #ff0000", "0 0 20px #ff0000"]
            }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="relative p-12 border-4 border-red-600 bg-[#0B0E14] max-w-2xl w-full text-center rounded-lg"
          >
            {/* Shaking Icon */}
            <motion.div
              animate={{ x: [-5, 5, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 0.2 }}
              className="flex justify-center mb-6"
            >
              <AlertTriangle size={100} className="text-red-600" />
            </motion.div>

            <h2 className="text-5xl font-black tracking-tighter text-white mb-2 italic">
              CRITICAL FAILURE IMMINENT
            </h2>
            
            {/* The Countdown Timer */}
            <div className="bg-red-900/20 py-6 my-8 border-y border-red-600/50">
              <p className="text-red-400 text-sm font-mono tracking-widest uppercase mb-2">
                Time to Explosion
              </p>
              <p className="text-8xl font-mono text-red-500 font-bold tabular-nums">
                00:0{countdown}
              </p>
            </div>

            <p className="text-gray-400 mb-8 font-mono text-sm">
              DETECTED: Harmonic Distortion &gt; 15% (IEEE C57.91 Violation)
            </p>

            {/* "Kill Switch" Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleKillSwitch}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-6 rounded text-xl flex items-center justify-center gap-3 group cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.5)]"
            >
              <ZapOff size={30} className="group-hover:animate-pulse" />
              INITIATE EMERGENCY LOAD SHED
            </motion.button>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};