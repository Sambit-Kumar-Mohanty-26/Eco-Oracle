"use client";
import { motion } from "framer-motion";
import { KeyRound, Phone, UserCircle } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8 text-white">
      
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold font-heading">Global Settings</h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your API credentials, alert configurations, and user profile.
        </p>
      </div>

      <div className="space-y-12">
        
        {/* SECTION 1: API KEYS */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                <KeyRound size={18} /> API ACCESS
            </h2>
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/10">
                <p className="text-gray-400 text-sm mb-4">
                    Your private API key for programmatic access to the Eco-Oracle engine.
                </p>
                <div className="flex items-center gap-4 bg-black p-3 rounded font-mono text-sm">
                    <span className="text-gray-500">sk_live_••••••••••••••••••••1a2b</span>
                    <button className="ml-auto text-xs bg-emerald-600 hover:bg-emerald-500 text-black px-3 py-1 rounded font-bold">
                        Reveal Key
                    </button>
                </div>
            </div>
        </motion.div>

        {/* SECTION 2: ALERTING */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-lg font-bold text-blue-400 flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                <Phone size={18} /> ALERT CONFIGURATION
            </h2>
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/10">
                <p className="text-gray-400 text-sm mb-4">
                    Set the phone number to receive critical fire risk SMS alerts from the Guardian system.
                </p>
                <div className="flex items-center gap-4">
                    <input 
                        type="text"
                        defaultValue="+1 *** *** *123"
                        disabled
                        className="flex-1 bg-black/50 p-3 rounded border border-white/10 text-gray-500 font-mono"
                    />
                    <button className="bg-gray-600 text-white px-6 py-3 rounded font-bold text-xs cursor-not-allowed opacity-50">
                        Update
                    </button>
                </div>
                <p className="text-[10px] text-gray-600 mt-2">Twilio integration management is a premium feature.</p>
            </div>
        </motion.div>
        
        {/* SECTION 3: PROFILE */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-lg font-bold text-gray-400 flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                <UserCircle size={18} /> USER PROFILE
            </h2>
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/10 text-center text-gray-600">
                Profile management is handled by Clerk. Click your avatar in the top right.
            </div>
        </motion.div>

      </div>
    </div>
  );
}