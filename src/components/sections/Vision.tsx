"use client";
import { TextReveal } from "../ui/TextReveal";
import Link from "next/link"; 

export default function Vision() {
  return (
    <section className="h-[60vh] flex flex-col items-center justify-center text-center px-6 pointer-events-auto">
      <h1 className="text-5xl font-bold text-white mb-8 font-heading">
         <TextReveal delay={0.2}>ECO-ORACLE</TextReveal>
      </h1>
      
      <div className="flex gap-6">
          <Link href="/dashboard/audit">
            <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.5)]">
               LAUNCH DASHBOARD
            </button>
          </Link>

          <Link href="/registry">
            <button className="px-8 py-4 bg-transparent border border-white/20 text-white hover:bg-white hover:text-black font-bold rounded-lg transition-all">
               VIEW REGISTRY
            </button>
          </Link>
      </div>
      
    </section>
  );
}