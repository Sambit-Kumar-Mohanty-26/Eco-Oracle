"use client";
import { UserButton } from "@clerk/nextjs";

export default function TopBar() {
  return (
    <header className="h-16 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="text-sm font-mono text-gray-400">
        COMMAND CENTER <span className="text-emerald-500">//</span> ACTIVE
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-900/20 border border-emerald-500/30 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-mono">System: Online</span>
        </div>
        <div className="scale-110">
            <UserButton 
                afterSignOutUrl="/"
                appearance={{
                    elements: {
                        avatarBox: "border-2 border-emerald-500"
                    }
                }}
            />
        </div>
      </div>
    </header>
  );
}