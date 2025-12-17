"use client";
import { motion } from "framer-motion";
import { TextReveal } from "../ui/TextReveal";

export default function Hero() {
  return (
    <section className="h-screen flex flex-col justify-center px-8 md:px-20 max-w-7xl mx-auto relative z-10 pointer-events-none">
      
      {/* Small Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "3rem" }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-0.5 bg-emerald-400 shadow-[0_0_10px_#34d399]" 
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-emerald-400 tracking-[0.3em] text-sm uppercase font-bold drop-shadow-md"
        >
          SATELLITE AUDIT NETWORK
        </motion.div>
      </div>
      
      {/* Big Title */}
      <div className="relative">
        <h1 className="text-7xl md:text-[10rem] font-bold text-white leading-[0.85] font-heading tracking-tight">
            <TextReveal delay={0.2}>ECO</TextReveal>
        </h1>
        
        {/* FIXED: Removed TextReveal for ORACLE to fix gradient bug */}
        <h1 className="text-7xl md:text-[10rem] font-bold leading-[0.85] font-heading tracking-tight pb-4">
            <motion.span 
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="inline-block text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-cyan-400 to-emerald-600 drop-shadow-[0_0_25px_rgba(52,211,153,0.4)]"
            >
              ORACLE
            </motion.span>
        </h1>
      </div>
      
      {/* Description Card */}
      <motion.div 
         initial={{ opacity: 0, x: -20 }} 
         whileInView={{ opacity: 1, x: 0 }} 
         transition={{ delay: 0.8, duration: 1 }}
         className="mt-12 p-6 border-l-2 border-emerald-500/50 bg-black/40 backdrop-blur-sm max-w-lg"
      >
        <div className="text-xl text-gray-300 leading-relaxed font-body">
          <span className="text-emerald-400 font-bold block mb-2 font-mono text-sm tracking-widest">
             /// SYSTEM ONLINE:
          </span>
          <span className="text-base md:text-lg block text-gray-200">
             The first DePIN network using Satellite AI to verify carbon credits and predict wildfires.
          </span>
        </div>
      </motion.div>
    </section>
  );
}