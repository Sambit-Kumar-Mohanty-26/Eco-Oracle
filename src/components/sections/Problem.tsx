"use client";
import { motion } from "framer-motion";
import { Ghost, Flame, Lock, AlertOctagon, Activity } from "lucide-react";

const AlertCard = ({ 
  icon: Icon, title, desc, delay, color 
}: { 
  icon: any, title: string, desc: string, delay: number, color: string 
}) => (
  <motion.div 
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay: delay, type: "spring", stiffness: 50 }}
    className="relative pl-6 py-4 pr-4 border-l-2 border-white/10 bg-linear-to-r from-black/80 to-transparent hover:border-red-500/50 transition-colors group"
  >
    <div className={`absolute top-0 -left-0.5 h-0 w-0.5 ${color} group-hover:h-full transition-all duration-500 ease-out`} />

    <div className="flex items-center gap-4 mb-2">
        <div className={`p-2 rounded bg-white/5 ${color.replace('bg-', 'text-')}`}>
            <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-white font-heading uppercase tracking-wider">
            {title}
        </h3>
    </div>
    
    <p className="text-gray-400 font-mono text-sm leading-relaxed pl-1">
      {desc}
    </p>
  </motion.div>
);

export default function Problem() {
  return (
    <section className="min-h-screen flex items-center px-8 md:px-20 relative z-20 overflow-hidden">
      <div className="w-full md:w-[50%] ml-auto flex flex-col justify-center">
        <div className="mb-8 border-b border-red-900/30 pb-4 relative">
             <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="flex items-center gap-2 text-red-500 mb-2 font-mono text-xs tracking-[0.2em] uppercase"
             >
                <AlertOctagon className="w-4 h-4 animate-pulse" />
                <span>System Diagnostics // Failures Detected</span>
             </motion.div>
             
             <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-bold text-white font-heading leading-none"
             >
               CRITICAL <br />
               <span className="text-transparent bg-clip-text bg-linear-to-r from-red-500 to-orange-600">
                 ERRORS
               </span>
             </motion.h2>
             <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                 <h2 className="text-9xl font-bold text-red-500 font-heading">3</h2>
             </div>
        </div>
        <div className="flex flex-col gap-4">
            <AlertCard 
                icon={Ghost} 
                title="Phantom Forests" 
                desc="Credits are sold for trees that don't exist. 60% of offsets are essentially worthless ghost data." 
                color="bg-red-500" 
                delay={0.2} 
            />
            <AlertCard 
                icon={Flame} 
                title="Reactive Tech" 
                desc="Current detection relies on thermal spikes. By the time satellites see the fire, the forest is already gone." 
                color="bg-orange-500" 
                delay={0.4} 
            />
            <AlertCard 
                icon={Lock} 
                title="Black Box" 
                desc="Centralized ledgers hide the truth. Buyers have zero transparency into where their money actually goes." 
                color="bg-red-600" 
                delay={0.6} 
            />
        </div>

        <motion.div 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 flex items-center gap-4 bg-red-500/10 p-4 border border-red-500/20 rounded-lg backdrop-blur-sm"
        >
            <Activity className="w-8 h-8 text-red-500" />
            <div>
                <p className="text-red-400 text-xs font-mono uppercase tracking-widest">Estimated Annual Loss</p>
                <p className="text-3xl font-bold text-white font-heading">$85,000,000,000</p>
            </div>
        </motion.div>

      </div>
    </section>
  );
}