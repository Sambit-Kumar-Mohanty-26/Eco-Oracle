"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe, ExternalLink, ArrowLeft, Search, Leaf, TrendingUp } from "lucide-react";
import Link from "next/link";
import SkeletonCard from "@/components/ui/SkeletonCard";

export default function PublicRegistry() {
  const [assets, setAssets] = useState<any[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const IMAGE_BASE = API_URL.replace('/api', '/temp');

  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop";

  useEffect(() => {
    fetch(`${API_URL}/registry`)
        .then(res => res.json())
        .then(data => {
            setAssets(data);
            setFilteredAssets(data);
            setTimeout(() => setLoading(false), 1000);
        })
        .catch(err => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search) {
        setFilteredAssets(assets);
    } else {
        setFilteredAssets(assets.filter(a => 
            (a.tokenId && a.tokenId.includes(search)) || 
            (a.biomassScore && a.biomassScore.toString().includes(search))
        ));
    }
  }, [search, assets]);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">

      <div className="p-8 md:p-12 border-b border-white/10 bg-zinc-950">
        <Link href="/" className="text-gray-500 hover:text-white flex items-center gap-2 mb-8 text-xs font-bold tracking-widest uppercase transition-colors">
            <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <h1 className="text-5xl md:text-7xl font-bold font-heading mb-4 text-white">
                    GLOBAL <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-500">REGISTRY</span>
                </h1>
                <p className="text-gray-400 max-w-xl text-lg">
                    The immutable ledger of truth. Search verified forests, view carbon sequestration data, and audit the blockchain records directly.
                </p>
            </div>
            
            <div className="w-full md:w-auto relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-emerald-500 to-blue-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex items-center bg-black rounded-lg border border-white/20 p-4 w-full md:w-96">
                    <Search className="text-gray-500 mr-3" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search Token ID or Score..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent outline-none text-white w-full font-mono text-sm placeholder-gray-600"
                    />
                </div>
            </div>
        </div>
      </div>

      <div className="p-8 md:p-12">
        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAssets.map((asset, i) => (
                    <motion.div
                        key={asset._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all shadow-lg"
                    >
                        <div className="h-56 bg-black relative overflow-hidden">
                            <img 
                                src={asset.imageData || `${IMAGE_BASE}/${asset.imageName}`} 
                                className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" 
                                alt="Map"
                                onError={(e) => {
                                    e.currentTarget.src = FALLBACK_IMAGE;
                                }}
                            />
                            <div className="absolute top-0 left-0 w-full h-full bg-linear-to-t from-black via-transparent to-transparent opacity-90" />
                            
                            <div className="absolute bottom-4 left-4">
                                <h3 className="text-white font-bold text-xl">
                                    Token #{(!asset.tokenId || asset.tokenId === "PENDING" || asset.tokenId === "undefined") ? "?" : asset.tokenId}
                                </h3>
                                <div className="flex gap-4 mt-2">
                                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-mono font-bold">
                                        <Leaf size={12} /> {asset.carbonTonnes ? asset.carbonTonnes.toLocaleString() : "---"} t CO₂
                                    </div>
                                    <div className="flex items-center gap-1 text-blue-400 text-xs font-mono font-bold">
                                        <TrendingUp size={12} /> {asset.biomassScore}% Density
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-4 right-4 bg-emerald-500 text-black text-[10px] font-bold px-3 py-1 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)]">
                                VERIFIED
                            </div>
                        </div>

                        <div className="p-5 flex justify-between items-center bg-black/40 border-t border-white/5">
                            <div className="text-xs text-gray-500 font-mono">
                                {new Date(asset.timestamp).toLocaleDateString()}
                            </div>
                            
                            {asset.contractAddress && asset.contractAddress !== "N/A" ? (
                                <a 
                                    href={`https://sepolia.etherscan.io/address/${asset.contractAddress}`} 
                                    target="_blank" 
                                    className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-white transition-colors border border-blue-500/30 px-3 py-1 rounded hover:bg-blue-500/20"
                                >
                                    ETHERSCAN <ExternalLink size={12} />
                                </a>
                            ) : (
                                <span className="text-xs text-red-500 font-bold opacity-50">TX PENDING</span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
        
        {!loading && filteredAssets.length === 0 && (
            <div className="text-center py-20 text-gray-500 font-mono">
                NO ASSETS FOUND MATCHING SEARCH.
            </div>
        )}
      </div>
    </div>
  );
}