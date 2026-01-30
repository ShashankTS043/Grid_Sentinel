import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useGridStore } from '../../store/useGridStore';

export const TheftScale = () => {
  const { load } = useGridStore();
  
  // SIMULATION LOGIC: 
  // Let's pretend the "Source" is always slightly higher than the load.
  // If the difference is huge (> 5A), it's theft.
  const sourceCurrent = (load + 1.2).toFixed(1); // Normal loss
  const detectedTheft = 0; // Set this to > 0 later to trigger the alarm

  const isTheft = detectedTheft > 2;

  return (
    <div className="flex flex-col h-full justify-between">
      
      {/* Visual Balance Bars */}
      <div className="space-y-6 mt-4">
        {/* Source Bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1 uppercase font-mono">
            <span>Transformer Output</span>
            <span>{sourceCurrent} A</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(Number(sourceCurrent) / 30) * 100}%` }}
              className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
            />
          </div>
        </div>

        {/* Meter Sum Bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1 uppercase font-mono">
            <span>Sum of Meters</span>
            <span>{load} A</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(load / 30) * 100}%` }}
              className={`h-full ${isTheft ? 'bg-red-500' : 'bg-green-500'} transition-colors duration-500`}
            />
          </div>
        </div>
      </div>

      {/* Status Box */}
      <div className={`mt-6 p-4 rounded-lg border ${isTheft ? 'bg-red-900/20 border-red-500/50' : 'bg-green-900/10 border-green-500/30'}`}>
        <div className="flex items-center gap-3">
          {isTheft ? (
            <AlertTriangle className="text-red-500 animate-pulse" />
          ) : (
            <CheckCircle2 className="text-green-500" />
          )}
          <div>
            <h4 className={`font-bold text-sm ${isTheft ? 'text-red-400' : 'text-green-400'}`}>
              {isTheft ? 'THEFT DETECTED' : 'GRID SECURE'}
            </h4>
            <p className="text-xs text-gray-500 font-mono mt-1">
              {isTheft ? 'MISMATCH > 5A LOCATED' : 'No unauthorized taps found.'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};