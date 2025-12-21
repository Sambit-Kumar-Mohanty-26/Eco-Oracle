"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { 
  KeyRound, Phone, Save, Plus, Play, MapPin, Copy, Bell, Trash2 
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const { userId, isLoaded } = useAuth();
  
  const [phone, setPhone] = useState("");
  const [apiKey, setApiKey] = useState("Loading...");
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [newTarget, setNewTarget] = useState({ name: "", lat: "", lng: "" });
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (isLoaded && userId) {
        fetch(`${API_URL}/settings?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                if(data.phoneNumber) setPhone(data.phoneNumber);
                if(data.apiKey) setApiKey(data.apiKey);
            });

        fetch(`${API_URL}/watchlist?userId=${userId}`)
            .then(res => res.json())
            .then(data => setWatchlist(data));
    }
  }, [isLoaded, userId, API_URL]);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
        await fetch(`${API_URL}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, phoneNumber: phone })
        });
        toast.success("Alert Routing Updated");
    } catch (e) { toast.error("Failed to save"); } 
    finally { setLoading(false); }
  };

  const handleAddTarget = async () => {
    if (!newTarget.name || !newTarget.lat) return;
    try {
        const res = await fetch(`${API_URL}/watchlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newTarget, userId })
        });
        const data = await res.json();
        setWatchlist([...watchlist, data]);
        setNewTarget({ name: "", lat: "", lng: "" });
        toast.success("Target Added");
    } catch (e) { toast.error("Failed to add"); }
  };

  const handleDeleteTarget = async (id: string) => {
    const originalList = [...watchlist];
    setWatchlist(watchlist.filter(item => item._id !== id));

    try {
        const res = await fetch(`${API_URL}/watchlist/${id}?userId=${userId}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error("Failed");
        toast.success("Target Removed");
    } catch (e) {
        setWatchlist(originalList);
        toast.error("Could not delete target");
    }
  };

  const runSystemScan = async () => {
    if (watchlist.length === 0) return toast.error("Watchlist Empty");
    setIsScanning(true);
    const toastId = toast.loading("Running Global Diagnostic Scan...");
    
    try {
        const res = await fetch(`${API_URL}/guardian/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        const data = await res.json();
        const updatedList = await fetch(`${API_URL}/watchlist?userId=${userId}`).then(r => r.json());
        setWatchlist(updatedList);

        toast.success(`Scan Complete. ${data.alerts_sent} Alerts Sent.`, { id: toastId });
    } catch (e) { toast.error("Scan Failed", { id: toastId }); }
    finally { setIsScanning(false); }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 text-white font-sans">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-4xl font-bold font-heading">Global Settings</h1>
        <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-mono">
            Platform Configuration // Guardian Node v1.0
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
            <section className="bg-zinc-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h2 className="text-blue-400 font-bold flex items-center gap-2 mb-4 uppercase tracking-tighter">
                    <KeyRound size={18} /> Developer API Access
                </h2>
                <div className="flex items-center gap-4 bg-black/60 p-3 rounded-lg border border-white/5 font-mono text-xs">
                    <span className="text-gray-500 truncate">{apiKey}</span>
                    <button onClick={() => { navigator.clipboard.writeText(apiKey); toast.success("Copied"); }} className="hover:text-white text-gray-400"><Copy size={14}/></button>
                </div>
            </section>
            <section className="bg-zinc-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h2 className="text-emerald-400 font-bold flex items-center gap-2 mb-4 uppercase tracking-tighter">
                    <Phone size={18} /> Alert Routing
                </h2>
                <div className="flex gap-2">
                    <input 
                        type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 555 000 0000"
                        className="flex-1 bg-black/50 border border-white/10 p-3 rounded-xl text-sm font-mono focus:border-emerald-500 outline-none text-white"
                    />
                    <button onClick={handleSaveSettings} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-black px-6 rounded-xl font-bold text-xs transition-all disabled:opacity-50">
                        {loading ? "..." : "SAVE"}
                    </button>
                </div>
            </section>
        </div>

        <section className="bg-zinc-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-red-400 font-bold flex items-center gap-2 uppercase tracking-tighter">
                        <Bell size={18} /> Guardian Watchlist
                    </h2>
                    <p className="text-gray-400 text-xs mt-1">Autonomous monitoring zones.</p>
                </div>
                <button onClick={runSystemScan} disabled={isScanning} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-2 transition-all disabled:opacity-50">
                    <Play size={10} /> {isScanning ? "SCANNING..." : "RUN BATCH SCAN"}
                </button>
            </div>

            <div className="flex-1 space-y-3 min-h-50 overflow-y-auto pr-1 custom-scrollbar">
                <AnimatePresence>
                    {watchlist.map((item) => (
                        <motion.div 
                            key={item._id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5 group"
                        >
                            <div>
                                <p className="font-bold text-sm text-white">{item.name}</p>
                                <p className="text-[10px] text-gray-500 font-mono">{item.lat}, {item.lng}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-[9px] px-2 py-1 rounded font-black tracking-widest ${item.lastStatus === 'CRITICAL' ? 'bg-red-500 text-black' : 'bg-green-900 text-green-400'}`}>
                                    {item.lastStatus}
                                </span>
                                <button 
                                    onClick={() => handleDeleteTarget(item._id)}
                                    className="text-gray-600 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                
                {watchlist.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-700 text-xs font-mono">NO TARGETS ACTIVE</div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
                <input placeholder="Label" value={newTarget.name} onChange={e => setNewTarget({...newTarget, name: e.target.value})} className="bg-black/50 border border-white/10 p-2 rounded text-xs text-white outline-none focus:border-emerald-500" />
                <input placeholder="Lat" value={newTarget.lat} onChange={e => setNewTarget({...newTarget, lat: e.target.value})} className="bg-black/50 border border-white/10 p-2 rounded text-xs text-white outline-none focus:border-emerald-500" />
                <input placeholder="Lng" value={newTarget.lng} onChange={e => setNewTarget({...newTarget, lng: e.target.value})} className="bg-black/50 border border-white/10 p-2 rounded text-xs text-white outline-none focus:border-emerald-500" />
                <button onClick={handleAddTarget} className="col-span-3 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-[10px] font-bold flex justify-center items-center gap-2 transition-all"><Plus size={12}/> ADD TARGET</button>
            </div>
        </section>

      </div>
    </div>
  );
}