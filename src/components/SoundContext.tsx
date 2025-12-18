"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface SoundContextType {
  isEnabled: boolean;
  toggleSound: () => void;
}

const SoundContext = createContext<SoundContextType>({ isEnabled: false, toggleSound: () => {} });

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSound = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    if (newState) {
       const audio = new Audio("/sounds/swoosh.wav");
       audio.volume = 0.2;
       audio.play().catch(() => {});
    }
  };

  return (
    <SoundContext.Provider value={{ isEnabled, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
}

export const useSound = () => useContext(SoundContext);