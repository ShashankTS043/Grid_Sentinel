import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { useGridStore } from '../../store/useGridStore';

export const HealingOverlay = () => {
  const { status, setStatus } = useGridStore();

  // Automatically switch from HEALING to NORMAL after 3 seconds
  useEffect(() => {
    if (status === 'HEALING') {
      const timer = setTimeout(() => {
        setStatus('NORMAL');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, setStatus]);

  return (
    <AnimatePresence>
      {status === 'HEALING' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-green-900/20 backdrop-blur-sm"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="inline-block mb-4"
            >
              <RefreshCw size={80} className="text-neon-blue" />
            </motion.div>
            
            <motion.h2 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-5xl font-black tracking-tighter text-white mb-2"
            >
              SYSTEM <span className="text-neon-blue">STABILIZING</span>
            </motion.h2>
            
            <div className="bg-black/50 border border-neon-blue/30 px-8 py-4 rounded-full inline-flex items-center gap-3 mt-4">
              <CheckCircle2 className="text-green-500" />
              <span className="font-mono text-neon-blue tracking-widest">
                AUTOMATED LOAD SHEDDING COMPLETE
              </span>
            </div>
          </div>

          {/* Green Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,255,0,0.1)_50%)] bg-[length:100%_4px]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};