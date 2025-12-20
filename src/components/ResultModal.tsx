"use client";
import { Satellite, CheckCircle, XCircle, ExternalLink, X, Flame, Wind, Droplets } from "lucide-react";

interface ResultModalProps {
  data: any;
  onClose: () => void;
}

export default function ResultModal({ data, onClose }: ResultModalProps) {
  if (!data) return null;
  const isGuardianMode = data.mode === 'GUARDIAN';
  const riskData = data.risk_data || {};
  const weather = riskData.weather || {};
  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace('/api', '');
  const IMAGE_URL = `${API_BASE}/temp/input.png`;

  return (
    <div className="absolute top-8 right-8 z-50 w-96 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 animate-in slide-in-from-right duration-500 font-sans">
      <div className="h-40 w-full bg-gray-900 relative">
         <button onClick={onClose} className="absolute top-2 right-2 z-20 bg-black/50 text-white p-1 rounded-full hover:bg-black/80"><X size={16} /></button>
         <img src={`${IMAGE_URL}?t=${Date.now()}`} alt="Satellite" className="w-full h-full object-cover opacity-90" />
         
         <div className="absolute bottom-0 left-0 w-full p-3 bg-linear-to-t from-black/90 to-transparent flex justify-between items-end">
            <span className="text-white font-bold text-sm flex items-center gap-2">
                <Satellite size={14} /> LIVE SATELLITE FEED
            </span>
            {isGuardianMode && (
                <span className="text-[10px] font-mono text-orange-400 bg-black/50 px-2 py-1 rounded border border-orange-500/50">
                    MOISTURE LAYER (NDMI)
                </span>
            )}
        </div>
      </div>

      <div className="p-6">
        {isGuardianMode ? (
            <>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Fire Risk Level</div>
                        <div className={`text-3xl font-black ${riskData?.level === 'CRITICAL' ? 'text-red-600' : 'text-green-600'}`}>
                            {riskData?.level || "ANALYZING..."}
                        </div>
                    </div>
                    {data.actions?.sms_sent && (
                        <div className="flex flex-col items-end text-orange-500">
                            <div className="animate-pulse bg-orange-100 p-2 rounded-full"><Flame size={24} /></div>
                            <span className="text-[10px] font-bold mt-1 uppercase">SMS Sent</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-800 text-xs font-bold mb-1"><Wind size={12}/> Wind Speed</div>
                        <div className="text-lg font-bold text-gray-800">{weather?.wind_speed ?? 0} m/s</div>
                    </div>
                    <div className="bg-cyan-50 p-3 rounded border border-cyan-100">
                        <div className="flex items-center gap-2 text-cyan-800 text-xs font-bold mb-1"><Droplets size={12}/> Fuel Dryness</div>
                        <div className="text-lg font-bold text-gray-800">{riskData?.dryness ?? 0}%</div>
                    </div>
                </div>
            </>
        ) : (
            <>
               <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="text-gray-500 text-xs uppercase tracking-wider font-bold">Biomass Score</div>
                        <div className="text-4xl font-black text-gray-800">{data.ai_data?.biomass_score ?? 0}%</div>
                    </div>
                    {data.ai_data?.status === "VERIFIED" ? (
                        <div className="flex flex-col items-end text-green-600"><CheckCircle size={40} /><span className="text-xs font-bold mt-1">VERIFIED</span></div>
                    ) : (
                        <div className="flex flex-col items-end text-red-600"><XCircle size={40} /><span className="text-xs font-bold mt-1">REJECTED</span></div>
                    )}
                </div>

                {data.blockchain_data && (
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                        <div className="text-emerald-800 font-bold text-xs uppercase mb-2">Asset Minted on Sepolia</div>
                        <a 
                            href={`https://sepolia.etherscan.io/tx/${data.blockchain_data.transaction_details?.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded text-xs font-bold transition-all"
                        >
                            VIEW ON ETHERSCAN <ExternalLink size={12} />
                        </a>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
}