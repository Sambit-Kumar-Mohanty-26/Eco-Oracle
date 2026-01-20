"use client";
import { motion } from "framer-motion";
import { TextReveal } from "../ui/TextReveal";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="h-screen flex flex-col justify-center px-8 md:px-20 max-w-7xl mx-auto relative z-10 pointer-events-none">
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

      <div className="relative">
        <h1 className="text-7xl md:text-[10rem] font-bold text-white leading-[0.85] font-heading tracking-tight">
            <TextReveal delay={0.2}>ECO</TextReveal>
        </h1>

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
      
      <motion.div 
         initial={{ opacity: 0, x: -20 }} 
         whileInView={{ opacity: 1, x: 0 }} 
         transition={{ delay: 0.8, duration: 1 }}
         className="mt-12 p-6 border-l-2 border-emerald-500/50 bg-black/40 backdrop-blur-sm max-w-lg pointer-events-auto"
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
        className="mt-8 pointer-events-auto"
      >
        <Link href="/dashboard" className="inline-block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center gap-3 bg-emerald-500 text-black px-8 py-4 font-mono font-bold tracking-wider overflow-hidden clip-path-slant"
            >
              <span className="relative z-10">[ LAUNCH_DASHBOARD ]</span>

              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>

              <div className="absolute inset-0 bg-white/40 -translate-x-full skew-x-[-15deg] group-hover:translate-x-full transition-transform duration-500 ease-in-out" />
              
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 shadow-[0_0_40px_rgba(16,185,129,0.8)] transition-opacity duration-300" />
            </motion.button>
        </Link>
      </motion.div>

    </section>
  );
}