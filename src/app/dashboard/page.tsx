"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Satellite, Activity } from "lucide-react";
import ResultModal from "@/components/ResultModal";

const MapWithNoSSR = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-900 text-emerald-500 font-mono animate-pulse">
      INITIALIZING SATELLITE UPLINK...
    </div>
  ),
});

export default function Dashboard() {
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const handleAreaSelect = (selected: { lat: number; lng: number }) => {
    setCoords(selected);
    setResult(null);
  };

  const startAudit = async () => {
    if (!coords.lat || !coords.lng) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: coords.lat, lng: coords.lng }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Connection to Oracle Failed. Is the backend running?");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="relative h-screen w-screen bg-black overflow-hidden font-sans text-white">
      
      <div className="absolute inset-0 z-0">
        <MapWithNoSSR onAreaSelect={handleAreaSelect} />
      </div>

      <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-black bg-white/90 hover:bg-white px-4 py-2 rounded-full shadow-lg transition-all font-bold text-xs tracking-widest border border-gray-300">
        <ArrowLeft size={16} /> EXIT TO ORBIT
      </Link>

      <div className="absolute top-24 left-8 z-10 w-96 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-2xl p-6 text-gray-800 font-mono">
        <div className="flex items-center gap-3 border-b border-gray-300 pb-4 mb-6">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Satellite size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-widest">Oracle Terminal</h2>
            <div className="text-[10px] text-gray-500 uppercase">Sentinel-2 Feed: Live</div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="bg-gray-100 p-3 rounded flex justify-between items-center">
            <span className="text-xs text-gray-500 font-bold">LATITUDE</span>
            <span className="font-bold tracking-widest">{coords.lat ? coords.lat.toFixed(4) : "---"}</span>
          </div>
          <div className="bg-gray-100 p-3 rounded flex justify-between items-center">
            <span className="text-xs text-gray-500 font-bold">LONGITUDE</span>
            <span className="font-bold tracking-widest">{coords.lng ? coords.lng.toFixed(4) : "---"}</span>
          </div>
        </div>

        <button
          onClick={startAudit}
          disabled={!coords.lat || isAnalyzing}
          className={`w-full py-4 text-sm font-bold tracking-[0.2em] uppercase transition-all rounded-lg shadow-md
            ${!coords.lat || isAnalyzing 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-black text-white hover:bg-gray-800 hover:shadow-lg'
            }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-2">
              <Activity className="animate-spin" size={16} /> ANALYZING BIOMASS...
            </span>
          ) : "START AI AUDIT"}
        </button>

        {!coords.lat && (
            <div className="mt-4 text-[10px] text-center text-gray-400 uppercase tracking-wider">
                ⚠ Draw a rectangle on map to lock target
            </div>
        )}
      </div>

      {result && (
        <ResultModal 
            data={result} 
            onClose={() => setResult(null)} 
        />
      )}

    </main>
  );
}