"use client";
import { useState, useEffect } from "react";
import { useSound } from "./SoundContext";

export default function Hud() {
  const { isEnabled, toggleSound } = useSound();
  const [coords, setCoords] = useState({ lat: -3.46, lng: -62.21 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCoords({
        lat: parseFloat((-3.46 + Math.random() * 0.01).toFixed(4)),
        lng: parseFloat((-62.21 + Math.random() * 0.01).toFixed(4)),
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50">
      
      {/* Top Left Coords */}
      <div className="absolute top-6 left-6 border-l border-t border-emerald-500/30 p-2 text-emerald-500/50 font-mono text-xs">
        <p>LAT: {coords.lat}</p>
        <p>LNG: {coords.lng}</p>
      </div>

      {/* Top Right Status */}
      <div className="absolute top-6 right-6 text-right text-emerald-500/50 font-mono text-xs">
        <p className="flex items-center justify-end gap-2">
          SAT_LINK: CONNECTED <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </p>
      </div>

      {/* 
          AUDIO BUTTON 
          - pointer-events-auto: Makes it clickable
          - fixed bottom-10 right-10: Locks it to screen corner
      */}
      <div className="fixed bottom-10 right-10 pointer-events-auto">
         <button 
            onClick={toggleSound}
            className={`
                flex items-center gap-3 px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-2xl border
                ${isEnabled 
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)] scale-105' 
                    : 'bg-black text-gray-400 border-gray-700 hover:border-white hover:text-white'
                }
            `}
         >
            {isEnabled ? (
                <><span>🔊</span> SOUND ON</>
            ) : (
                <><span>🔇</span> SOUND OFF</>
            )}
         </button>
      </div>

      {/* Bottom Left Version */}
      <div className="absolute bottom-6 left-6 text-emerald-500/50 font-mono text-xs">
        <p>ECO-ORACLE // v1.0</p>
      </div>
    </div>
  );
}