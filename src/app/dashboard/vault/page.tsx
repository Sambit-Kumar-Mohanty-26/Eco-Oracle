"use client";
import { motion } from "framer-motion";
const MOCK_ASSETS = [
  { id: 1, name: "Amazon Sector 4", score: 98, status: "VERIFIED", img: "🌳", date: "2025-12-18" },
  { id: 2, name: "Congo Basin Alpha", score: 92, status: "VERIFIED", img: "🌴", date: "2025-12-19" },
  { id: 3, name: "California Ridge", score: 12, status: "CRITICAL", img: "🔥", date: "2025-12-20" },
];

export default function AssetVault() {
  return (
    <div className="p-8">
      
      <div className="mb-10 flex justify-between items-end">
        <div>
            <h1 className="text-4xl font-bold font-heading text-white">Asset Vault</h1>
            <p className="text-gray-400 text-sm mt-1">SECURE BLOCKCHAIN STORAGE • ERC-721</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-500 text-black px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            + Mint New Asset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ASSETS.map((asset, i) => (
            <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300"
            >
                <div className="h-40 bg-black flex items-center justify-center text-6xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-t from-zinc-900 to-transparent opacity-50" />
                    <span className="z-10 group-hover:scale-125 transition-transform duration-500">{asset.img}</span>

                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold border ${asset.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
                        {asset.status}
                    </div>
                </div>

                <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-1">{asset.name}</h3>
                    <p className="text-xs text-gray-500 font-mono mb-4">MINTED: {asset.date}</p>
                    
                    <div className="flex justify-between items-center border-t border-white/5 pt-4">
                        <div className="text-center">
                            <div className="text-[10px] text-gray-500 uppercase">Biomass</div>
                            <div className="text-lg font-bold text-white">{asset.score}%</div>
                        </div>
                        <button className="text-xs text-emerald-400 hover:text-white underline underline-offset-4 decoration-emerald-500/50">
                            View Contract ↗
                        </button>
                    </div>
                </div>
            </motion.div>
        ))}
      </div>
    </div>
  );
}