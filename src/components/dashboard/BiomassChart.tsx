"use client";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine,
  Brush 
} from 'recharts';
import { format } from 'date-fns';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    const isCritical = score < 30;

    return (
      <div className={`
        backdrop-blur-xl border p-3 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)]
        ${isCritical ? 'bg-red-900/80 border-red-500' : 'bg-black/90 border-emerald-500/50'}
      `}>
        <p className="text-gray-400 text-[10px] font-mono mb-1 tracking-widest uppercase">{label}</p>
        <div className="flex items-center gap-3">
            <span className={`text-2xl font-black ${isCritical ? 'text-red-400' : 'text-white'}`}>
                {score}%
            </span>
            {isCritical && <span className="text-[10px] font-bold bg-red-500 text-black px-1 rounded">CRITICAL</span>}
        </div>
        <p className={`${isCritical ? 'text-red-300' : 'text-emerald-500/70'} text-[10px] uppercase font-bold`}>
            BIOMASS DENSITY
        </p>
      </div>
    );
  }
  return null;
};

export default function BiomassChart({ data }: { data: any[] }) {
  const safeData = Array.isArray(data) ? data : [];
  const chartData = [...safeData].reverse().map(item => ({
    date: item.timestamp ? format(new Date(item.timestamp), 'MMM d HH:mm') : 'N/A',
    score: item.biomassScore || 0
  }));

  if (safeData.length === 0) {
    return (
        <div className="bg-zinc-900/30 border border-white/10 rounded-xl p-6 h-full flex flex-col items-center justify-center text-gray-500">
            <div className="w-12 h-12 border-2 border-dashed border-gray-700 rounded-full animate-spin-slow mb-4 opacity-50" />
            <p className="text-xs tracking-widest font-mono">WAITING FOR SATELLITE DATA...</p>
        </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-6 h-full relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500 flex flex-col">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />

      <h3 className="text-white font-bold mb-2 flex items-center gap-3 relative z-10">
        <div className="relative">
            <span className="w-2 h-2 bg-emerald-500 rounded-full absolute animate-ping opacity-75"/>
            <span className="w-2 h-2 bg-emerald-500 rounded-full relative block"/>
        </div>
        <span className="tracking-widest text-sm text-gray-300">
            BIOMASS ANALYTICS
        </span>
      </h3>
      
      <div className="flex-1 w-full text-xs relative z-10 min-h-62.5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDanger" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            
            <XAxis 
                dataKey="date" 
                stroke="#555" 
                tick={{fill: '#666', fontSize: 10}}
                tickLine={false} 
                axisLine={false} 
                minTickGap={30}
            />
            
            <YAxis 
                stroke="#555" 
                tick={{fill: '#666', fontSize: 10}}
                tickLine={false} 
                axisLine={false} 
                domain={[0, 100]} 
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#fff', strokeWidth: 1, strokeDasharray: '5 5' }} />
            <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'CRITICAL THRESHOLD', position: 'insideBottomRight', fill: '#ef4444', fontSize: 10 }} />

            <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorScore)" 
                animationDuration={1500}
            />

            <Brush 
                dataKey="date" 
                height={30} 
                stroke="#10b981" 
                fill="#000" 
                tickFormatter={() => ""}
                className="opacity-50 hover:opacity-100 transition-opacity"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}