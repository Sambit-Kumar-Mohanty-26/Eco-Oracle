"use client";
import { useEffect, useRef } from "react";
import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useSound } from "./SoundContext"; 

export default function AudioManager() {
  const { isEnabled } = useSound(); 
  const scroll = useScroll();
  const swooshRef = useRef<HTMLAudioElement | null>(null);
  const lastSection = useRef(0);

  useEffect(() => {
    swooshRef.current = new Audio("/sounds/swoosh.wav");
    swooshRef.current.volume = 0.6;
  }, []);

  useFrame(() => {
    if (!isEnabled) return;

    const offset = scroll.offset;
    const totalPages = 6; 
    const currentSection = Math.floor(offset * totalPages); 

    if (currentSection !== lastSection.current) {
      if (swooshRef.current) {
        swooshRef.current.currentTime = 0;
        swooshRef.current.play().catch(() => {});
      }
      lastSection.current = currentSection;
    }
  });

  return null;
}