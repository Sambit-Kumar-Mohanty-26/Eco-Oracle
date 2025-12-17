"use client";
import { Canvas } from "@react-three/fiber";
import { ScrollControls } from "@react-three/drei";
import ThreeScene from "@/components/ThreeScene";
import Overlay from "@/components/Overlay";
import Hud from "@/components/Hud"; 
import { SoundProvider } from "@/components/SoundContext";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Suspense } from "react";

export default function Home() {
  return (
    <SoundProvider>
      <main className="relative h-screen w-full bg-black overflow-hidden">
        <Hud />

        <Canvas 
          shadows
          camera={{ position: [0, 0, 14], fov: 30 }} 
          gl={{ antialias: false }} 
          className="absolute top-0 left-0 w-full h-full"
        >
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.6} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
          
          {/* 
             DAMPING = 0.4 IS THE SECRET SAUCE.
             It replicates the "Heavy/Smooth" feel of Lenis 
             without breaking the 3D synchronization.
          */}
          <ScrollControls pages={6} damping={0.4}>
            <Suspense fallback={null}>
              <ThreeScene />
              <Overlay />
            </Suspense>
          </ScrollControls>
        </Canvas>
      </main>
    </SoundProvider>
  );
}