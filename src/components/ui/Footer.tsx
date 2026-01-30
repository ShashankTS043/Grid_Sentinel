import { useState, useEffect } from 'react';
import { Wifi, ShieldCheck, Server } from 'lucide-react';

export const Footer = () => {
  const [latency, setLatency] = useState(14);
  const [uptimeSeconds, setUptimeSeconds] = useState(0); // Starts at 0
  const [isSecure, setIsSecure] = useState(true);

  // 1. Simulator: Fluctuating Ping (Every 2 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      // Random latency between 12ms and 48ms
      const newPing = Math.floor(Math.random() * (48 - 12) + 12);
      setLatency(newPing);
      
      // 1% chance to flicker "Re-handshaking" just for cool factor
      if (Math.random() > 0.99) setIsSecure(false);
      else setIsSecure(true);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 2. Simulator: Uptime Counter (Every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper to format seconds into 48h 12m 30s
  const formatUptime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-industrial-700 p-2 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-gray-500 z-50 print-break-avoid no-print">
      
      {/* Left Side: Server Stats */}
      <div className="flex gap-4 md:gap-8 w-full md:w-auto justify-center md:justify-start">
        <div className="flex items-center gap-1.5">
          <Server size={12} className={latency > 100 ? "text-yellow-500" : "text-green-500"} />
          <span>SERVER: 
            <span className={latency > 100 ? "text-yellow-400" : "text-green-400"}>
              {latency > 100 ? ' LAG' : ' CONNECTED'}
            </span> 
            <span className="text-gray-600"> ({latency}ms)</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5">
          <span>UPTIME: <span className="text-white">{formatUptime(uptimeSeconds)}</span></span>
        </div>

        <div className="hidden md:flex items-center gap-1.5">
           <span>VER: <span className="text-gray-400">v2.4.0-RC3</span></span>
        </div>
      </div>

      {/* Right Side: Security */}
      <div className="flex items-center gap-2 mt-1 md:mt-0">
        <ShieldCheck size={12} className={isSecure ? "text-neon-blue" : "text-yellow-500 animate-pulse"} />
        <span className={isSecure ? "text-gray-500" : "text-yellow-500"}>
          {isSecure ? 'SECURE CONNECTION // TLS 1.3' : 'HANDSHAKE REFRESH...'}
        </span>
      </div>
      
    </div>
  );
};