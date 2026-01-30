import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export const GlassCard = ({ children, className = "", title }: GlassCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      // ADDED: flex and flex-col to the parent to control layout
      className={`
        relative overflow-hidden
        bg-industrial-800/50 backdrop-blur-md 
        border border-industrial-700 
        rounded-xl p-6
        shadow-xl flex flex-col
        ${className}
      `}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-industrial-700 to-transparent opacity-50" />

      {title && (
        // Title stays at the top
        <h3 className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-4 border-b border-industrial-700 pb-2 shrink-0">
          {title}
        </h3>
      )}

      {/* UPDATED: This wrapper now forces full height (h-full) and flex growth */}
      <div className="relative z-10 flex-1 h-full w-full min-h-0">
        {children}
      </div>
    </motion.div>
  );
};