"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ExternalLink, Loader2 } from "lucide-react";

export default function AssetVault() {
  const { userId, isLoaded } = useAuth();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const IMAGE_BASE = API_URL.replace('/api', '/temp');

  useEffect(() => {
    if (isLoaded && userId) {
        fetch(`${API_URL}/audits?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                setAssets(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }
  }, [isLoaded, userId]);

  if (loading) return <div className="p-10 flex justify-center text-emerald-500"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold font-heading text-white mb-8">Asset Vault</h1>

      {assets.length === 0 ? (
        <div className="text-gray-500 text-center mt-20">No Assets Found. Launch an Audit to begin.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset, i) => (
                <motion.div
                    key={asset._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all"
                >
                    <div className="h-40 bg-black relative">
                        <img 
                            src={`${IMAGE_BASE}/${asset.imageName}`} 
                            alt="Map" 
                            className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-900/80 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/30">
                            {asset.status}
                        </div>
                    </div>

                    <div className="p-5">
                        <h3 className="text-white font-bold text-lg mb-1">Eco-Credit #{asset.tokenId}</h3>
                        <p className="text-xs text-gray-500 font-mono mb-4">
                            {new Date(asset.timestamp).toLocaleDateString()} • Score: {asset.biomassScore}%
                        </p>
                        
                        <a 
                            href={`https://sepolia.etherscan.io/tx/${asset.contractAddress}`}
                            target="_blank"
                            className="flex items-center gap-2 text-xs text-blue-400 hover:text-white transition-colors"
                        >
                            View on Blockchain <ExternalLink size={10} />
                        </a>
                    </div>
                </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}