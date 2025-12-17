"use client";
import { TextReveal } from "../ui/TextReveal";

export default function RiskEngine() {
  return (
    // Clean alignment to the right
    <section className="h-screen flex items-center justify-end px-8 md:px-20 text-right pointer-events-none">
      <div className="max-w-2xl relative">
        
        <div className="flex flex-col items-end mb-10">
            <span className="text-blue-400 font-mono text-sm tracking-[0.4em] mb-2 uppercase">
                <TextReveal>Predictive Analysis</TextReveal>
            </span>
            <h2 className="text-7xl font-bold text-white font-heading">
              <TextReveal delay={0.1}>THE GUARDIAN</TextReveal>
            </h2>
        </div>
        
        {/* Main Quote - Big and Bold */}
        <div className="border-r-4 border-blue-500 pr-8 py-2 mb-10">
            <p className="text-3xl md:text-4xl text-white font-bold leading-tight">
               <TextReveal delay={0.3}>"WE DON'T JUST SECURE MONEY."</TextReveal>
            </p>
            <p className="text-3xl md:text-4xl text-blue-400 font-bold leading-tight mt-2">
               <TextReveal delay={0.5}>"WE SECURE THE FOREST."</TextReveal>
            </p>
        </div>
        
        {/* Description */}
        <div className="text-gray-300 text-xl font-light">
          <p className="mb-2"><TextReveal delay={0.7}>Live fusion of Satellite Moisture Data</TextReveal></p>
          <p><TextReveal delay={0.8}>& Wind Vector Analysis.</TextReveal></p>
        </div>

      </div>
    </section>
  );
}