"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";

const menuItems = [
  { name: "Mission Control", icon: "📊", path: "/dashboard" },
  { name: "Launch Audit", icon: "🛰️", path: "/dashboard/audit" }, 
  { name: "Asset Vault", icon: "💎", path: "/dashboard/vault" },
  { name: "Global Settings", icon: "⚙️", path: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen border-r border-white/10 bg-black/80 backdrop-blur-xl flex flex-col fixed left-0 top-0 z-50 shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
      <div className="p-8 border-b border-white/10">
        <h1 className="text-2xl font-bold font-heading tracking-widest text-white drop-shadow-md">
          ECO<span className="text-emerald-500">ORACLE</span>
        </h1>
        <div className="flex items-center gap-2 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-[10px] text-emerald-500/80 font-mono tracking-wider">SYSTEM ONLINE</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-3 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`group flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 relative overflow-hidden
                ${isActive
                  ? "bg-linear-to-r from-emerald-900/40 to-transparent text-emerald-400 border-l-4 border-emerald-500"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <span className="text-xl filter drop-shadow-lg group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/10">
        <SignOutButton>
            <button className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-950/30 hover:text-red-300 border border-transparent hover:border-red-900/50 rounded-lg transition-all text-xs font-bold tracking-widest uppercase">
                🔴 Disconnect
            </button>
        </SignOutButton>
      </div>
    </aside>
  );
}