"use client";
import { useState } from 'react';
import { runAudit, runGuardian } from '@/lib/api';
import { motion } from 'framer-motion';

export default function ControlPanel() {
  const [coords, setCoords] = useState({ lat: "1.8333", lng: "-54.0000" });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [`> ${msg}`, ...prev]);

  const handleAction = async (mode: 'AUDIT' | 'GUARDIAN') => {
    setLoading(true);
    setLogs([]);
    addLog(`INITIALIZING ${mode} PROTOCOL...`);
    
    try {
      if (mode === 'AUDIT') {
        const res = await runAudit(Number(coords.lat), Number(coords.lng));
        if (res.success) {
            addLog(`BIOMASS SCORE: ${res.ai_data.biomass_score}%`);
            addLog(`STATUS: ${res.ai_data.status}`);
            if (res.blockchain_data) {
                addLog(`MINTED: ${res.blockchain_data.transaction_details.transactionHash.slice(0, 15)}...`);
            }
        } else {
            addLog(`ERROR: ${res.error}`);
        }
      } 
      else {
        const res = await runGuardian(Number(coords.lat), Number(coords.lng));
        if (res.success) {
            addLog(`WIND: ${res.risk_data.weather.wind_speed} m/s`);
            addLog(`FUEL DRYNESS: ${res.risk_data.dryness}%`);
            addLog(`RISK LEVEL: ${res.risk_data.level}`);
            if (res.alert_sent) addLog(`🚨 SMS ALERT SENT TO CREW.`);
        }
      }
    } catch (e) {
      addLog("CONNECTION FAILED. CHECK SERVER.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-black/80 border border-emerald-500/30 rounded-xl backdrop-blur-xl w-80 font-mono text-sm shadow-2xl">
      <h3 className="text-emerald-400 font-bold mb-4 tracking-widest border-b border-emerald-500/20 pb-2">COMMAND TERMINAL</h3>
      
      <div className="space-y-3 mb-6">
        <div>
            <label className="text-xs text-gray-500">LATITUDE</label>
            <input 
              value={coords.lat} 
              onChange={e => setCoords({...coords, lat: e.target.value})}
              className="w-full bg-black border border-gray-700 text-white p-2 rounded focus:border-emerald-500 outline-none"
            />
        </div>
        <div>
            <label className="text-xs text-gray-500">LONGITUDE</label>
            <input 
              value={coords.lng} 
              onChange={e => setCoords({...coords, lng: e.target.value})}
              className="w-full bg-black border border-gray-700 text-white p-2 rounded focus:border-emerald-500 outline-none"
            />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button 
            onClick={() => handleAction('AUDIT')}
            disabled={loading}
            className="bg-emerald-900/50 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-emerald-500/50 py-2 rounded transition-all disabled:opacity-50"
        >
            RUN AUDIT
        </button>
        <button 
            onClick={() => handleAction('GUARDIAN')}
            disabled={loading}
            className="bg-blue-900/50 hover:bg-blue-500 hover:text-black text-blue-400 border border-blue-500/50 py-2 rounded transition-all disabled:opacity-50"
        >
            PREDICT FIRE
        </button>
      </div>

      <div className="h-32 bg-black border border-gray-800 p-2 overflow-y-auto rounded text-xs text-gray-300">
        {logs.length === 0 ? <span className="text-gray-600">Waiting for command...</span> : logs.map((log, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                {log}
            </motion.div>
        ))}
      </div>
    </div>
  );
}