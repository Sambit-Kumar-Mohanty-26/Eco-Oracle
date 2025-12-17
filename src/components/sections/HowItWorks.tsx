"use client";
import { motion } from "framer-motion";
import { TextReveal } from "../ui/TextReveal";

export default function HowItWorks() {
  return (
    // Added pl-12 md:pl-32 to push text away from the edge
    <section className="h-screen flex items-center pl-12 md:pl-32 pointer-events-none">
      <div className="max-w-xl relative">
        
        {/* Title */}
        <div className="mb-12">
            <h2 className="text-6xl font-bold text-white font-heading">
              <TextReveal>THE ENGINE</TextReveal>
            </h2>
            <div className="w-20 h-1 bg-emerald-500 mt-4 rounded-full" />
        </div>
        
        {/* Steps List - Clean Vertical Layout */}
        <div className="space-y-12 border-l border-emerald-500/20 pl-8 ml-2">
          {[
            { id: "01", title: "Satellite Scan", text: "Sentinel-2 captures raw spectral data." },
            { id: "02", title: "AI Verification", text: "Our Python engine calculates biomass." },
            { id: "03", title: "Minting", text: "Verbwire creates the Carbon Credit NFT." }
          ].map((item, i) => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ delay: i * 0.2 }}
              className="relative"
            >
              {/* Dot on the timeline */}
              <div className="absolute -left-9.75 top-2 w-4 h-4 bg-black border-2 border-emerald-500 rounded-full" />
              
              <div className="text-emerald-500 font-mono text-sm font-bold tracking-widest mb-1">
                STEP {item.id}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                <TextReveal delay={i * 0.1}>{item.title}</TextReveal>
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}