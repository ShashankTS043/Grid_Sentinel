import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, Shield, Terminal, Sparkles, Lock } from 'lucide-react';
import { useGridStore } from '../../store/useGridStore';

export const GridChat = () => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{sender: 'bot' | 'user', text: string, type?: 'info' | 'success' | 'warn' | 'error'}[]>([]);
  
  const { temperature, load, status, setStatus } = useGridStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // 1. BOOT SEQUENCE
  useEffect(() => {
    const bootSequence = async () => {
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 600));
      setMessages(prev => [...prev, { sender: 'bot', text: 'CONNECTING TO GRID CORE...', type: 'info' }]);
      await new Promise(r => setTimeout(r, 400));
      setMessages(prev => [...prev, { sender: 'bot', text: 'AI_SENTINEL ONLINE. READY.', type: 'success' }]);
      setIsTyping(false);
    };
    bootSequence();
  }, []);

  // Auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const handleSend = async (textOverride?: string) => {
    const userMsg = textOverride || input;
    if (!userMsg.trim()) return;
    
    // Add User Message
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    // AI DELAY
    await new Promise(r => setTimeout(r, 600));

    let botResponse = "Command not recognized. Try /help.";
    let msgType: 'info' | 'success' | 'warn' | 'error' = 'info';
    const lower = userMsg.toLowerCase();

    // --- COMMAND LOGIC ---

    // 1. GRID LOCK (The New Feature)
    if (lower.includes('lock') || lower.includes('shutdown')) {
      setStatus('NORMAL'); // Force stable state during lock
      botResponse = "⛔ EMERGENCY LOCKDOWN INITIATED.\n> Physical Access: RESTRICTED\n> Inputs: BLOCKED\n> Grid is now LOCKED.";
      msgType = 'error'; // Red text
    } 
    // 2. STATUS
    else if (lower.includes('status') || lower.includes('report')) {
      botResponse = `SYSTEM REPORT:\n> Status: ${status}\n> Load: ${load}A\n> Temp: ${temperature}°C\n> Integrity: 98%`;
      msgType = status === 'NORMAL' ? 'success' : 'warn';
    } 
    // 3. SECURE
    else if (lower.includes('secure') || lower.includes('protect')) {
      botResponse = "SECURITY PROTOCOL ENGAGED.\n> Firewall: ACTIVE\n> Encrypting traffic... [OK]\n> Threat Level: ZERO";
      msgType = 'success';
    } 
    // 4. OPTIMIZE
    else if (lower.includes('optimize') || lower.includes('fix')) {
      setStatus('HEALING');
      botResponse = "OPTIMIZING POWER FLOW...\n> Rerouting efficiency...\n> Reducing harmonics...\n> System SELF-HEALING active.";
      msgType = 'success';
    } 
    // 5. CRITICAL (Testing)
    else if (lower.includes('critical')) {
      setStatus('CRITICAL');
      botResponse = "⚠️ WARNING: CRITICAL OVERLOAD SIMULATION STARTED.";
      msgType = 'warn';
    }
    else if (lower.includes('help')) {
      botResponse = "Available Commands:\n- Status\n- Secure\n- Optimize\n- Grid Lock";
    }

    setMessages(prev => [...prev, { sender: 'bot', text: botResponse, type: msgType }]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-black/20 backdrop-blur-sm relative">
      
      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-0 p-2 font-mono text-xs">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[90%] p-2 rounded-lg border ${
              msg.sender === 'user' 
                ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue rounded-tr-none' 
                : msg.type === 'error' ? 'bg-red-950/50 border-red-500 text-red-500 rounded-tl-none font-bold'
                : msg.type === 'warn' ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400 rounded-tl-none'
                : msg.type === 'success' ? 'bg-green-900/20 border-green-500/30 text-green-400 rounded-tl-none'
                : 'bg-gray-800/50 border-gray-700 text-gray-300 rounded-tl-none'
            }`}>
              <div className="flex items-center gap-1 mb-1 opacity-50 text-[8px] uppercase tracking-wider">
                {msg.sender === 'bot' ? <Bot size={8} /> : <User size={8} />}
                {msg.sender === 'bot' ? 'AI_CORE' : 'OP_01'}
              </div>
              <div className="whitespace-pre-line leading-relaxed">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-gray-800/50 border border-gray-700 text-gray-400 px-3 py-2 rounded-lg rounded-tl-none text-[10px] flex items-center gap-2">
              <Sparkles size={10} className="animate-spin" /> PROCESSING...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* QUICK ACTIONS */}
      <div className="flex gap-2 p-2 overflow-x-auto border-t border-white/5 no-scrollbar">
        <button onClick={() => handleSend('Grid Lock')} className="flex items-center gap-1 px-3 py-1 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 rounded-full text-[10px] text-red-400 whitespace-nowrap transition-colors">
          <Lock size={10} /> LOCK
        </button>
        <button onClick={() => handleSend('System Status')} className="flex items-center gap-1 px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-full text-[10px] text-gray-300 whitespace-nowrap transition-colors">
          <Terminal size={10} /> STATUS
        </button>
        <button onClick={() => handleSend('Secure Grid')} className="flex items-center gap-1 px-3 py-1 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-500/30 rounded-full text-[10px] text-blue-400 whitespace-nowrap transition-colors">
          <Shield size={10} /> SECURE
        </button>
        <button onClick={() => handleSend('Optimize Flow')} className="flex items-center gap-1 px-3 py-1 bg-green-900/20 hover:bg-green-900/40 border border-green-500/30 rounded-full text-[10px] text-green-400 whitespace-nowrap transition-colors">
          <Zap size={10} /> OPTIMIZE
        </button>
      </div>

      {/* INPUT AREA */}
      <div className="p-2 border-t border-white/10 bg-black/40">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Enter command (e.g., 'Grid Lock')..."
            className="flex-1 bg-transparent border-none text-xs text-white focus:ring-0 placeholder:text-gray-600 font-mono"
            autoComplete="off"
          />
          <button onClick={() => handleSend()} className="text-neon-blue hover:text-white transition-colors">
            <Send size={14} />
          </button>
        </div>
      </div>

    </div>
  );
};