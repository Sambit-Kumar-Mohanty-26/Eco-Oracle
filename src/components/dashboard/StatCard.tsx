"use client";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "emerald" | "blue" | "red";
  delay: number;
}

export default function StatCard({ title, value, icon, color, delay }: StatCardProps) {
  const themes = {
    emerald: {
      text: "text-emerald-400",
      border: "group-hover:border-emerald-500/50",
      bg: "from-emerald-900/20 to-transparent",
      shadow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]"
    },
    blue: {
      text: "text-blue-400",
      border: "group-hover:border-blue-500/50",
      bg: "from-blue-900/20 to-transparent",
      shadow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]"
    },
    red: {
      text: "text-red-500",
      border: "group-hover:border-red-500/50",
      bg: "from-red-900/20 to-transparent",
      shadow: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]"
    }
  };

  const theme = themes[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }} 
      className={`
        group relative p-6 rounded-2xl border border-white/5 
        bg-linear-to-br ${theme.bg} backdrop-blur-md 
        transition-all duration-300 ${theme.border} ${theme.shadow}
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            {title}
        </h3>
        <div className={`
            p-2 rounded-lg bg-white/5 text-xl 
            group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300
            ${theme.text}
        `}>
            {icon}
        </div>
      </div>
      
      <p className={`text-4xl font-black ${theme.text} tracking-tight`}>
        {value}
      </p>
      
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}