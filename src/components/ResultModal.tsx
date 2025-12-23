"use client";
import { useState, useEffect } from "react";
import { 
  Radio, CheckCircle, XCircle, ExternalLink, X, Flame, Wind, Droplets, 
  Trophy, AlertOctagon, FileText, Box, Loader2, ShoppingBag 
} from "lucide-react"; 
import { motion } from "framer-motion";

interface ResultModalProps {
  data: any;
  onClose: () => void;
}

export default function ResultModal({ data, onClose }: ResultModalProps) {
  if (!data) return null;

  const [tokenID, setTokenID] = useState(data.blockchain_data?.transaction_details?.tokenID || "PENDING");
  const [viewMode, setViewMode] = useState<'ANALYSIS' | 'VISUAL'>('ANALYSIS');
  const [timeTravel, setTimeTravel] = useState<'NOW' | 'PAST'>('NOW');

  const isGuardianMode = data.mode === 'GUARDIAN';
  const riskData = data.risk_data || {};
  const weather = riskData.weather || {};
  const aiData = data.ai_data || {};
  const blockchain = data.blockchain_data?.transaction_details || null;
  
  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace('/api', '');

  useEffect(() => {
    if (blockchain?.transactionHash && (tokenID === "PENDING" || tokenID === "undefined")) {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transactionHash: blockchain.transactionHash })
                });
                const syncData = await res.json();
                
                if (syncData.success && syncData.tokenId && syncData.tokenId !== "PENDING") {
                    console.log("✅ Token Synced Live:", syncData.tokenId);
                    setTokenID(syncData.tokenId);
                    clearInterval(interval);
                }
            } catch (e) {
            }
        }, 5000);

        return () => clearInterval(interval);
    }
  }, [blockchain, tokenID]);

  const getImageUrl = () => {
      if (isGuardianMode) return `${API_BASE}/temp/moisture.png?t=${Date.now()}`;
      if (viewMode === 'ANALYSIS') return `${API_BASE}/temp/input.png?t=${Date.now()}`;
      if (timeTravel === 'NOW') return `${API_BASE}/temp/rgb_new.png?t=${Date.now()}`;
      return `${API_BASE}/temp/rgb_old.png?t=${Date.now()}`;
  };

  const getAssetTier = (carbon: number) => {
      if (carbon > 5000) return { label: "APEX GOLD", color: "text-yellow-400", border: "border-yellow-500", bg: "bg-yellow-500/10" };
      return { label: "GROWTH SILVER", color: "text-gray-300", border: "border-gray-400", bg: "bg-gray-500/10" };
  };

  const tier = getAssetTier(aiData.carbon_tonnes || 0);
  const isTokenReady = tokenID && tokenID !== "PENDING" && tokenID !== "undefined";

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="absolute top-8 right-8 z-50 w-96 bg-zinc-950 rounded-xl shadow-2xl overflow-hidden border border-white/10 font-sans backdrop-blur-xl"
    >

      <div className="h-56 w-full bg-gray-900 relative group">
         <button onClick={onClose} className="absolute top-3 right-3 z-30 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500"><X size={16} /></button>
         
         <img src={getImageUrl()} alt="Satellite" className="w-full h-full object-cover transition-opacity duration-500" />
         {!isGuardianMode && aiData.status === "VERIFIED" && (
             <div className={`absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md border ${tier.border} ${tier.bg}`}>
                <Trophy size={12} className={tier.color} />
                <span className={`text-[10px] font-bold ${tier.color} tracking-widest`}>{tier.label} TIER</span>
             </div>
         )}

         {!isGuardianMode && (
             <div className="absolute top-4 right-12 z-20 flex gap-2">
                <button onClick={() => setViewMode('ANALYSIS')} className={`text-[9px] font-bold px-3 py-1 rounded border transition-all ${viewMode === 'ANALYSIS' ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-black/50 text-white border-white/20'}`}>NDVI MAP</button>
                <button onClick={() => setViewMode('VISUAL')} className={`text-[9px] font-bold px-3 py-1 rounded border transition-all ${viewMode === 'VISUAL' ? 'bg-blue-500 text-black border-blue-500' : 'bg-black/50 text-white border-white/20'}`}>REAL MAP</button>
             </div>
         )}
         
         {!isGuardianMode && viewMode === 'VISUAL' && (
             <div className="absolute bottom-12 right-4 z-20 flex bg-black/80 rounded-lg p-1 border border-white/20 backdrop-blur-md">
                <button onClick={() => setTimeTravel('PAST')} className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${timeTravel === 'PAST' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>1 YR</button>
                <button onClick={() => setTimeTravel('NOW')} className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${timeTravel === 'NOW' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>NOW</button>
             </div>
         )}

         {aiData.probable_cause && aiData.deforestation_percent > 1 && (
             <div className="absolute bottom-0 left-0 w-full bg-red-900/95 p-2 flex items-center justify-center gap-2 z-20 border-t border-red-500">
                 <AlertOctagon size={14} className="text-white animate-pulse" />
                 <span className="text-white text-[10px] font-bold uppercase tracking-widest">CAUSE: {aiData.probable_cause}</span>
             </div>
         )}

         <div className="absolute bottom-0 left-0 w-full p-4 bg-linear-to-t from-black via-black/80 to-transparent flex justify-between items-end">
            <span className="text-emerald-400 font-bold text-xs flex items-center gap-2 tracking-widest">
                <Radio size={16} className="animate-pulse" /> LIVE FEED
            </span>
            {isGuardianMode && <span className="text-[9px] font-mono text-orange-400 bg-black/50 px-2 py-1 rounded border border-orange-500/50">NDMI MOISTURE</span>}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isGuardianMode ? (
            <>
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Fire Risk</div>
                        <div className={`text-3xl font-black ${riskData.level === 'CRITICAL' ? 'text-red-500' : 'text-emerald-500'}`}>{riskData.level}</div>
                    </div>
                    {data.actions?.sms_sent && (
                         <div className="bg-orange-500/10 border border-orange-500/30 p-2 rounded text-orange-500 flex flex-col items-center">
                             <Flame size={18} className="animate-bounce" /><span className="text-[8px] font-bold mt-1">SMS SENT</span>
                         </div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-900/20 p-3 rounded border border-blue-500/20">
                        <div className="text-blue-400 text-[10px] font-bold mb-1 flex items-center gap-1"><Wind size={12}/> WIND</div>
                        <div className="text-lg font-bold text-white">{weather.wind_speed ?? 0} m/s</div>
                    </div>
                    <div className="bg-cyan-900/20 p-3 rounded border border-cyan-500/20">
                        <div className="text-cyan-400 text-[10px] font-bold mb-1 flex items-center gap-1"><Droplets size={12}/> DRYNESS</div>
                        <div className="text-lg font-bold text-white">{riskData.dryness ?? 0}%</div>
                    </div>
                </div>
            </>
        ) : (
            <>
               <div className="flex justify-between items-center">
                    <div>
                        <div className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Biomass Score</div>
                        <div className="text-5xl font-black text-white">{aiData.biomass_score ?? 0}%</div>
                    </div>
                    <div className={`px-3 py-2 rounded border ${aiData.status === "VERIFIED" ? "bg-emerald-900/30 border-emerald-500/30 text-emerald-400" : "bg-red-900/30 border-red-500/30 text-red-500"}`}>
                        {aiData.status === "VERIFIED" ? <CheckCircle size={24} /> : <XCircle size={24} />}
                        <div className="text-[9px] font-bold mt-1 tracking-widest">{aiData.status}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded border relative overflow-hidden group ${tier.bg} ${tier.border}`}>
                        <Trophy className={`absolute top-2 right-2 opacity-20 ${tier.color}`} size={32} />
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest">Est. Carbon</p>
                        <p className={`text-xl font-mono font-bold ${tier.color} mt-1`}>
                           ${((aiData.carbon_tonnes || 0) * 15).toLocaleString()}
                        </p>
                        <p className="text-xs font-bold text-emerald-500 mt-1">
                           {aiData.carbon_tonnes?.toLocaleString()} tCO₂
                        </p>
                    </div>
                    <div className={`bg-zinc-900 p-3 rounded border relative overflow-hidden ${aiData.deforestation_percent > 5 ? "border-red-500/30" : "border-white/5"}`}>
                        <AlertOctagon className={`absolute top-2 right-2 opacity-20 ${aiData.deforestation_percent > 5 ? "text-red-500" : "text-blue-500"}`} size={32} />
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest">1-Year Loss</p>
                        <p className={`text-xl font-mono font-bold mt-1 ${aiData.deforestation_percent > 5 ? "text-red-500" : "text-blue-400"}`}>
                            {aiData.deforestation_percent <= 0.1 ? "STABLE" : `-${aiData.deforestation_percent}%`}
                        </p>
                    </div>
                </div>

                {blockchain ? (
                    <div className="bg-emerald-900/10 p-3 rounded border border-emerald-500/20">
                        <div className="text-emerald-500/70 font-bold text-[9px] uppercase mb-2">Live on Blockchain</div>
                        <div className="flex gap-2">
                            <a 
                                href={`https://sepolia.etherscan.io/address/${blockchain.transactionHash}`}
                                target="_blank"
                                className="flex-1 flex items-center justify-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded text-[10px] font-bold transition-all border border-zinc-700"
                            >
                                <FileText size={12} /> HASH
                            </a>
                            
                            {isTokenReady ? (
                                <a 
                                    href={`https://eth-sepolia.blockscout.com/token/${blockchain.contractAddress}/instance/${tokenID}`}
                                    target="_blank" 
                                    className="flex-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-xs font-bold transition-all shadow-md"
                                >
                                    <Box size={12} /> VIEW ASSET
                                </a>
                            ) : (
                                <div className="flex-2 flex items-center justify-center gap-2 bg-zinc-800 text-zinc-500 py-2 rounded text-[10px] font-bold border border-zinc-700 cursor-wait">
                                    <Loader2 size={12} className="animate-spin" /> SYNCING ID...
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-red-900/10 p-2 rounded text-center text-red-400 text-xs font-bold border border-red-500/20">
                        MINTING BLOCKED <br/>
                        <span className="text-[9px] font-normal text-red-300">Biomass density too low or API error.</span>
                    </div>
                )}
            </>
        )}
      </div>
    </motion.div>
  );
}