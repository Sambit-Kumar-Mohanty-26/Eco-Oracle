"use client";
import { format } from 'date-fns';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ActivityFeed({ data }: { data: any[] }) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 h-full overflow-hidden">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Recent Activity Log</h3>
      
      <div className="space-y-4">
        {safeData.map((item) => (
          <div key={item._id} className="flex gap-4 items-start group">
             <div className={`mt-1 p-2 rounded-lg ${item.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {item.status === 'VERIFIED' ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-sm">
                        {item.status === 'VERIFIED' ? 'Asset Minted' : 'Fire Risk Detected'}
                    </span>
                    <span className="text-gray-600 text-[10px] font-mono">
                        {item.timestamp ? format(new Date(item.timestamp), 'HH:mm') : '--:--'}
                    </span>
                </div>
                <div className="text-gray-500 text-xs mt-1 font-mono">
                    Token ID: {item.tokenId || "PENDING"} • Score: {item.biomassScore}%
                </div>
                <div className="w-full h-px bg-white/5 mt-3 group-last:hidden" />
            </div>
          </div>
        ))}
        
        {safeData.length === 0 && (
            <div className="text-gray-600 text-sm text-center mt-10">No activity recorded yet. Check DB connection.</div>
        )}
      </div>
    </div>
  );
}