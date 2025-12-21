"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Satellite, Activity, Flame, Trees, Wind, Thermometer } from "lucide-react";
import ResultModal from "@/components/ResultModal";
import { runAudit, runGuardian } from "@/lib/api"; 
import toast from "react-hot-toast";

const MapWithNoSSR = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-900 text-emerald-500 font-mono animate-pulse">
      INITIALIZING ORBITAL UPLINK...
    </div>
  ),
});

export default function AuditPage() {
  const { userId, isLoaded } = useAuth(); 
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [mode, setMode] = useState<'AUDIT' | 'GUARDIAN'>('AUDIT');

  const handleAreaSelect = (selected: { lat: number; lng: number }) => {
    setCoords(selected);
    setResult(null);

    toast.dismiss();
    toast.success("Coordinates Locked", { 
        icon: '📍', 
        style: { background: '#333', color: '#fff', fontSize: '12px' },
        duration: 2000
    });
  };

  const executeCommand = async () => {
    if (!coords.lat || !coords.lng) {
        toast.error("Please draw an area on the map first.");
        return;
    }
    
    if (!userId) {
        if(!userId) toast.error("User authentication missing. Please login.");
        return;
    }

    setIsAnalyzing(true);
    setResult(null);
    const toastId = toast.loading(
        mode === 'AUDIT' ? "Initializing Satellite Audit..." : "Analyzing Atmospheric Data...", 
        { style: { background: '#000', color: '#fff', border: '1px solid #333' } }
    );

    try {
      let data;
      if (mode === 'AUDIT') {
        data = await runAudit(coords.lat, coords.lng, userId);
      } else {
        data = await runGuardian(coords.lat, coords.lng);
      }
      setResult({ ...data, mode: mode }); 
      if (data.success) {
          toast.success("Command Executed Successfully", { id: toastId });
      } else {
          toast.error("Analysis Failed", { id: toastId });
      }

    } catch (error) {
      console.error(error);
      toast.error("Satellite Connection Failed. Check Backend.", { id: toastId });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const themeBorder = mode === 'AUDIT' ? 'border-emerald-500' : 'border-orange-500';
  const themeBg = mode === 'AUDIT' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-orange-600 hover:bg-orange-500';

  return (
    <main className="relative h-full w-full bg-black overflow-hidden font-sans text-white">
      <div className="absolute inset-0 z-0">
        <MapWithNoSSR onAreaSelect={handleAreaSelect} />
      </div>
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex bg-black/80 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-xl">
        <button 
            onClick={() => setMode('AUDIT')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold tracking-widest transition-all ${mode === 'AUDIT' ? 'bg-emerald-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
            <Trees size={14} /> AUDIT
        </button>
        <button 
            onClick={() => setMode('GUARDIAN')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold tracking-widest transition-all ${mode === 'GUARDIAN' ? 'bg-orange-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
            <Flame size={14} /> GUARDIAN
        </button>
      </div>

      <div className={`absolute top-24 left-8 z-10 w-96 bg-white/90 backdrop-blur-md border-l-4 ${themeBorder} rounded-r-xl shadow-2xl p-6 text-gray-800 font-mono transition-all duration-300`}>
        
        <div className="flex items-center gap-3 border-b border-gray-300 pb-4 mb-6">
          <div className={`p-2 ${mode === 'AUDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'} rounded-lg`}>
            {mode === 'AUDIT' ? <Satellite size={20} /> : <Activity size={20} />}
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-black">
                {mode === 'AUDIT' ? 'Verification' : 'Fire Prediction'}
            </h2>
            <div className={`text-[10px] font-bold ${mode === 'AUDIT' ? 'text-emerald-600' : 'text-orange-600'} uppercase`}>
                Targeting System: Active
            </div>
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

        {mode === 'GUARDIAN' && (
            <div className="mb-6 grid grid-cols-2 gap-2 text-[10px] text-gray-500 uppercase font-bold">
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                    <Wind size={12} className="text-blue-500" /> Wind Vectors
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                    <Thermometer size={12} className="text-red-500" /> Heat Sensors
                </div>
            </div>
        )}

        <button
          onClick={executeCommand}
          disabled={!coords.lat || isAnalyzing || !isLoaded}
          className={`w-full py-4 text-sm font-bold tracking-[0.2em] uppercase transition-all rounded-lg shadow-md text-white
            ${!coords.lat || isAnalyzing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : themeBg}
          `}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-2">
              <Activity className="animate-spin" size={16} /> PROCESSING...
            </span>
          ) : mode === 'AUDIT' ? "START VERIFICATION" : "PREDICT FIRE RISK"}
        </button>

        {!coords.lat && (
            <div className="mt-4 text-[10px] text-center text-gray-400 uppercase tracking-wider animate-pulse">
                ⚠ Draw Area on Map First
            </div>
        )}
      </div>     
      {result && (
        <ResultModal data={result} onClose={() => setResult(null)} />
      )}

    </main>
  );
}