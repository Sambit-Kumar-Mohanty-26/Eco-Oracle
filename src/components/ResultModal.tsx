"use client";
import { Satellite, CheckCircle, XCircle, ExternalLink, X } from "lucide-react";

interface ResultModalProps {
  data: any;
  onClose: () => void;
}

export default function ResultModal({ data, onClose }: ResultModalProps) {
  if (!data) return null;

  const isVerified = data.ai_data?.status === "VERIFIED";

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const baseUrl = apiUrl.replace(/\/api\/?$/, ""); 

  const imageUrl = `${baseUrl}/temp/input.png?t=${Date.now()}`;

  return (
    <div className="absolute top-8 right-8 z-50 w-96 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 animate-in slide-in-from-right duration-500 font-sans">
      
      <div className="h-48 w-full bg-gray-900 relative">
        <button 
            onClick={onClose}
            className="absolute top-2 right-2 z-20 bg-black/50 text-white p-1 rounded-full hover:bg-black/80 transition-all"
        >
            <X size={16} />
        </button>
        
        <img 
            src={imageUrl} 
            alt="Satellite Scan" 
            className="w-full h-full object-cover opacity-90"
            onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.style.backgroundColor = '#1f2937'; // Dark gray
            }}
        />
        
        <div className="absolute inset-0 flex items-center justify-center -z-10 text-gray-600 text-xs">
            IMAGE UPLOAD PENDING...
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 bg-linear-to-t from-black to-transparent">
            <span className="text-white font-bold text-lg flex items-center gap-2">
                <Satellite size={18} /> SATELLITE CAPTURE
            </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
            <div>
                <div className="text-gray-500 text-xs uppercase tracking-wider font-bold">Biomass Score</div>
                <div className="text-4xl font-black text-gray-800">
                    {data.ai_data?.biomass_score}%
                </div>
            </div>
            
            {isVerified ? (
                <div className="flex flex-col items-end text-green-600">
                    <CheckCircle size={40} />
                    <span className="text-xs font-bold mt-1">VERIFIED</span>
                </div>
            ) : (
                <div className="flex flex-col items-end text-red-600">
                    <XCircle size={40} />
                    <span className="text-xs font-bold mt-1">REJECTED</span>
                </div>
            )}
        </div>

        {data.blockchain_data ? (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-blue-800 font-bold text-xs uppercase mb-2 flex items-center gap-2">
                    <Satellite size={14} /> Asset Minted on Sepolia
                </div>
                <div className="text-[10px] font-mono text-blue-600 break-all mb-3 bg-white p-2 rounded border border-blue-200">
                    {data.blockchain_data.transaction_details?.transactionHash || "Hash Pending..."}
                </div>
                {data.blockchain_data.transaction_details?.transactionHash && (
                    <a 
                        href={`https://sepolia.etherscan.io/tx/${data.blockchain_data.transaction_details.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-xs font-bold transition-all"
                    >
                        VIEW ON ETHERSCAN <ExternalLink size={12} />
                    </a>
                )}
            </div>
        ) : (
            <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                <p className="text-red-800 font-bold text-xs uppercase mb-1">
                    Minting Blocked
                </p>
                <p className="text-red-600 text-[10px]">
                    Biomass density below threshold. This land is not a forest.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}