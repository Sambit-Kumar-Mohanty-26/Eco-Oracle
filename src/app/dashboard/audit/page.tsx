"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Satellite, Activity, Flame, Trees, Wind, Thermometer, Bot, TestTube } from "lucide-react";
import ResultModal from "@/components/ResultModal";
import { runAudit, runGuardian } from "@/lib/api"; 
import toast from "react-hot-toast";

const MapWithNoSSR = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-black/90" />
});

export default function AuditPage() {
  const { userId, isLoaded } = useAuth(); 
  const [inputLat, setInputLat] = useState("");
  const [inputLng, setInputLng] = useState("");
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [mode, setMode] = useState<'AUDIT' | 'GUARDIAN'>('AUDIT');

  const handleAreaSelect = (selected: { lat: number; lng: number }) => {
    setCoords(selected);
    setInputLat(selected.lat.toFixed(4));
    setInputLng(selected.lng.toFixed(4));  
    setResult(null);
    toast.dismiss();
    toast.success("Coordinates Locked", { 
        icon: '📍', 
        style: { background: '#333', color: '#fff', fontSize: '12px' },
        duration: 2000
    });
  };
  const handleManualInput = (type: 'lat' | 'lng', value: string) => {
    if (type === 'lat') setInputLat(value);
    if (type === 'lng') setInputLng(value);

    const l = parseFloat(type === 'lat' ? value : inputLat);
    const g = parseFloat(type === 'lng' ? value : inputLng);

    if (!isNaN(l) && !isNaN(g)) {
        setCoords({ lat: l, lng: g });
    }
  };

  const executeCommand = async (isSimulation: boolean = false) => {
    if (!coords.lat || !coords.lng) {
        toast.error("Enter coordinates or draw on map.");
        return;
    }
    
    if (!userId) {
        if(!userId) toast.error("Authentication Error.");
        return;
    }

    setIsAnalyzing(true);
    setResult(null);
    const loadMsg = mode === 'AUDIT' 
        ? (isSimulation ? "Running Simulation..." : "Verifying & Minting Asset...") 
        : "Analyzing Atmospheric Data...";

    const toastId = toast.loading(loadMsg, { 
        style: { background: '#000', color: '#fff', border: '1px solid #333' } 
    });

    try {
      let data;
      if (mode === 'AUDIT') {
        data = await runAudit(coords.lat, coords.lng, userId, isSimulation);
      } else {
        data = await runGuardian(coords.lat, coords.lng);
      }
      
      setResult({ ...data, mode: mode }); 
      if (data.success) {
          toast.success("Analysis Complete", { id: toastId });
      } else {
          toast.error("Analysis Failed", { id: toastId });
      }

    } catch (error) {
      console.error(error);
      toast.error("Connection Failed.", { id: toastId });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const themeBorder = mode === 'AUDIT' ? 'border-emerald-500' : 'border-orange-500';
  const themeBg = mode === 'AUDIT' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-orange-600 hover:bg-orange-500';
  const themeLightBg = mode === 'AUDIT' ? 'bg-emerald-50' : 'bg-orange-50';

  return (
    <main className="relative h-full w-full bg-black overflow-hidden font-sans text-white">
      <div className="absolute inset-0 z-0">
        <MapWithNoSSR onAreaSelect={handleAreaSelect} targetCoords={coords} />
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

      <div className={`absolute top-24 left-8 z-10 w-96 bg-white/95 backdrop-blur-xl border-l-4 ${themeBorder} rounded-r-xl shadow-2xl p-6 text-gray-800 font-mono transition-all duration-300`}>
        
        <div className="flex items-center gap-3 border-b border-gray-300 pb-4 mb-6">
          <div className={`p-2 ${mode === 'AUDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'} rounded-lg`}>
            {mode === 'AUDIT' ? <Bot size={24} /> : <Activity size={24} />}
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-black">
                {mode === 'AUDIT' ? 'AI Verification' : 'Fire Prediction'}
            </h2>
            <div className={`text-[10px] font-bold ${mode === 'AUDIT' ? 'text-emerald-600' : 'text-orange-600'} uppercase`}>
                Targeting System: Active
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className={`${themeLightBg} p-3 rounded border border-gray-200`}>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Target Latitude</label>
            <input 
                type="number" 
                placeholder="e.g. -3.46"
                value={inputLat}
                onChange={(e) => handleManualInput('lat', e.target.value)}
                className="w-full bg-transparent font-bold text-lg text-gray-800 outline-none placeholder-gray-300"
            />
          </div>
          <div className={`${themeLightBg} p-3 rounded border border-gray-200`}>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Target Longitude</label>
            <input 
                type="number" 
                placeholder="e.g. -62.21"
                value={inputLng}
                onChange={(e) => handleManualInput('lng', e.target.value)}
                className="w-full bg-transparent font-bold text-lg text-gray-800 outline-none placeholder-gray-300"
            />
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

        <div className="flex flex-col gap-3">
            <button
              onClick={() => executeCommand(false)}
              disabled={!coords.lat || isAnalyzing || !isLoaded}
              className={`w-full py-3 text-sm font-bold tracking-[0.2em] uppercase transition-all rounded-lg shadow-md text-white
                ${!coords.lat || isAnalyzing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : themeBg}
              `}
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <Activity className="animate-spin" size={16} /> PROCESSING...
                </span>
              ) : mode === 'AUDIT' ? "VERIFY & MINT ASSET" : "PREDICT FIRE RISK"}
            </button>

            {mode === 'AUDIT' && !isAnalyzing && (
                 <button
                    onClick={() => executeCommand(true)}
                    disabled={!coords.lat}
                    className="w-full py-2 text-[10px] font-bold tracking-widest uppercase transition-all rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-emerald-600 flex items-center justify-center gap-2"
                >
                    <TestTube size={14} /> RUN SIMULATION (NO MINT)
                </button>
            )}
        </div>

        {!coords.lat && (
            <div className="mt-4 text-[10px] text-center text-gray-400 uppercase tracking-wider">
                Type coordinates OR Draw on Map
            </div>
        )}
      </div>

      {result && (
        <ResultModal data={result} onClose={() => setResult(null)} />
      )}
    </main>
  );
}