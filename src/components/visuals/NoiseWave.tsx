import { motion } from 'framer-motion';
import { useGridStore } from '../../store/useGridStore';

export const NoiseWave = () => {
  const { status } = useGridStore();
  
  // Wave color changes based on status
  const color = status === 'NORMAL' ? '#00F0FF' : status === 'CRITICAL' ? '#FF003C' : '#10B981';
  
  // Speed of animation increases in CRITICAL mode
  const duration = status === 'CRITICAL' ? 0.2 : 1.5;

  return (
    <div className="w-full h-24 flex items-center justify-center gap-1 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            height: status === 'CRITICAL' 
              ? [10, Math.random() * 80 + 20, 10] // Crazy spikes
              : [10, Math.random() * 40 + 10, 10] // Gentle hum
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: i * 0.05 // Stagger effect for "wave" look
          }}
        />
      ))}
    </div>
  );
};