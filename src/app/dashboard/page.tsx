"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const AnimatedNumber = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = value / steps;
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count.toLocaleString()}</span>;
};

const StatCard = ({ title, value, icon, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay, duration: 0.5 }}
    className={`relative p-6 rounded-2xl border border-white/5 bg-linear-to-br from-white/5 to-transparent backdrop-blur-md overflow-hidden group hover:border-${color}-500/30 transition-colors`}
  >
    <div className={`absolute top-0 right-0 p-4 opacity-20 text-4xl group-hover:scale-110 transition-transform duration-500`}>
        {icon}
    </div>
    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">{title}</h3>
    <p className={`text-4xl font-black text-${color}-400 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
        <AnimatedNumber value={value} />
    </p>
    <div className="absolute bottom-0 left-0 h-1 w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />
  </motion.div>
);

export default function DashboardOverview() {
  return (
    <div className="p-8 space-y-10">

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-end justify-between"
      >
        <div>
            <h1 className="text-4xl font-bold font-heading text-white">Mission Control</h1>
            <p className="text-gray-500 font-mono text-xs mt-2">WELCOME BACK, COMMANDER.</p>
        </div>
        <div className="text-right hidden md:block">
            <div className="text-emerald-500 font-bold text-xl">SEPOLIA NETWORK</div>
            <div className="text-xs text-gray-500">BLOCK 492381 • <span className="text-green-500 animate-pulse">SYNCED</span></div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Protected Area (Ha)" value={14205} icon="🌳" color="emerald" delay={0.1} />
        <StatCard title="Carbon Credits Minted" value={84} icon="💎" color="blue" delay={0.2} />
        <StatCard title="Threats Neutralized" value={12} icon="🔥" color="orange" delay={0.3} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-black/40 border border-white/10 rounded-2xl p-8 h-80 relative flex items-center justify-center overflow-hidden"
        >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
            <div className="text-center z-10">
                <h3 className="text-emerald-500 font-bold tracking-[0.2em] mb-2">BIOMASS DENSITY LIVE FEED</h3>
                <div className="flex gap-1 items-end h-32 justify-center">
                    {[40, 60, 45, 70, 80, 55, 90, 65, 85, 95].map((h, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                            className="w-4 bg-emerald-500/50 hover:bg-emerald-400 rounded-t-sm transition-colors"
                        />
                    ))}
                </div>
            </div>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-black/40 border border-white/10 rounded-2xl p-6 h-80 overflow-hidden"
        >
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
                Global Event Log
            </h3>
            <div className="space-y-4 font-mono text-xs">
                {[
                    { time: "10:42:05", msg: "Satellite Uplink Established", color: "text-emerald-400" },
                    { time: "10:41:55", msg: "Minted Token #1304 on Sepolia", color: "text-blue-400" },
                    { time: "10:40:12", msg: "Fire Risk Scan: Sector 4 (SAFE)", color: "text-gray-400" },
                    { time: "10:38:00", msg: "User Login Verified", color: "text-emerald-400" },
                    { time: "10:35:22", msg: "System Boot Sequence", color: "text-gray-500" },
                ].map((log, i) => (
                    <div key={i} className="flex gap-3 items-start opacity-80 hover:opacity-100 transition-opacity">
                        <span className="text-gray-600">{log.time}</span>
                        <span className={log.color}>{log.msg}</span>
                    </div>
                ))}
            </div>
        </motion.div>

      </div>
    </div>
  );
}