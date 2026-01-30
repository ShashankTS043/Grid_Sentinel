import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useGridStore } from '../../store/useGridStore';

export const LiveGraph = () => {
  const { history, status } = useGridStore();

  // Dynamic color based on status
  const strokeColor = status === 'NORMAL' ? '#00F0FF' : '#FF003C';

  return (
    <div className="w-full h-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3A" vertical={false} />
          
          <XAxis 
            dataKey="time" 
            stroke="#6B7280" 
            tick={{fontSize: 10, fontFamily: 'monospace'}}
            tickLine={false}
          />
          <YAxis 
            stroke="#6B7280" 
            tick={{fontSize: 10, fontFamily: 'monospace'}}
            tickLine={false}
            domain={[30, 80]} // Temp range
          />
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#2A2F3A' }}
            itemStyle={{ color: strokeColor }}
          />

          <Area 
            type="monotone" 
            dataKey="temp" 
            stroke={strokeColor} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorTemp)" 
            isAnimationActive={false} // Disable internal animation for smoother real-time updates
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};