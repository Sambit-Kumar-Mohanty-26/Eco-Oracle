"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TextReveal } from "../ui/TextReveal";

// --- THE "MATRIX RAIN" COMPONENT ---
const MatrixRain = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const characters = "01█▓▒░";

  return (
    <div 
      ref={ref} 
      className="absolute inset-0 z-0 opacity-20 pointer-events-none"
      aria-hidden="true"
    >
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.span 
          key={i}
          initial={{ y: "-20vh", opacity: 0 }}
          animate={isInView ? { y: "100vh", opacity: [0, 1, 0] } : {}}
          transition={{ 
            duration: 1.5 + Math.random() * 1.5,
            delay: Math.random() * 1,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          style={{ 
            left: `${Math.random() * 100}%`,
            fontSize: `${0.5 + Math.random()}rem`,
            position: 'absolute',
            color: '#39ff14', 
          }}
        >
          {characters[Math.floor(Math.random() * characters.length)]}
        </motion.span>
      ))}
    </div>
  );
};

// --- THE ANIMATED CHECKMARK COMPONENT ---
const AnimatedCheckmark = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-20%" });

    return (
        <svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
            className="w-24 h-24 mb-8"
        >
            <motion.circle
                cx="26"
                cy="26"
                r="25"
                fill="none"
                stroke="#39ff14"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />
            <motion.path
                fill="none"
                stroke="#39ff14"
                strokeWidth="4"
                strokeLinecap="round"
                d="M14 27l5 5 16-16"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.8 }}
            />
        </svg>
    );
};


export default function TrustLayer() {
  return (
    <section className="h-screen flex flex-col items-center justify-center px-4 md:px-8 text-center pointer-events-none relative overflow-hidden">
      
      {/* 
         FIX 1: Dark Radial Gradient 
         This makes the text readable even if the Earth is bright white behind it.
      */}
      <div className="absolute inset-0 bg-radial-gradient from-black/90 via-black/60 to-transparent z-0" />

      {/* 1. VISUAL EFFECTS */}
      <MatrixRain />
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-5xl">
        
        {/* 2. THE ANIMATED CHECKMARK */}
        <AnimatedCheckmark />

        {/* 3. MAIN TITLE */}
        <h2 className="text-5xl md:text-7xl font-bold text-white font-heading mb-4 drop-shadow-[0_0_15px_rgba(0,0,0,1)]">
            <TextReveal delay={0.4}>TRUSTLESS VERIFICATION</TextReveal>
        </h2>
        
        {/* 
            FIX 2: Changed <p> to <div> to solve the "div inside p" error 
        */}
        <div className="text-3xl font-mono text-emerald-400 mb-12 drop-shadow-md">
            <TextReveal delay={0.8}>CODE {">"} HUMANS</TextReveal>
        </div>
        
        {/* 5. DETAILED CONTENT */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 w-full text-left">
            
            {/* DETAIL 1: IMMUTABILITY */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 1.0 }}
                className="flex-1 md:text-right"
            >
                <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">Immutable Proof</h3>
                {/* FIX 3: Changed color to Cyan + Shadow for visibility */}
                <p className="text-cyan-300 font-medium text-lg leading-relaxed drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    Satellite data is cryptographically hashed on-chain. Once verified, the record of a forest's health cannot be altered or deleted.
                </p>
            </motion.div>

            {/* DETAIL 2: TRANSPARENCY */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 1.2 }}
                className="flex-1 md:text-left"
            >
                <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">Radical Transparency</h3>
                {/* FIX 3: Changed color to Cyan + Shadow for visibility */}
                <p className="text-cyan-300 font-medium text-lg leading-relaxed drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    Anyone, anywhere can query our public API or view the satellite imagery linked to a specific Carbon Credit NFT. No more "black boxes."
                </p>
            </motion.div>
        </div>
      </div>
    </section>
  );
}