"use client";
import dynamic from 'next/dynamic';
import { ScrollControls } from "@react-three/drei";
import Overlay from "@/components/Overlay";
import Hud from "@/components/Hud"; 
import { SoundProvider } from "@/components/SoundContext";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Suspense } from "react";

const ThreeScene = dynamic(() => import('@/components/ThreeScene'), { 
  ssr: false,
  loading: () => null 
});

const Canvas = dynamic(() => import('@react-three/fiber').then(mod => mod.Canvas), {
  ssr: false
});

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-emerald-500 font-mono text-sm tracking-widest animate-pulse">
      INITIALIZING SATELLITE LINK...
    </div>
  );
}

export default function Home() {
  return (
    <SoundProvider>
      <main className="relative h-screen w-full bg-black overflow-hidden">
        <Hud />

        <Suspense fallback={<Loader />}>
          <Canvas 
            shadows
            camera={{ position: [0, 0, 14], fov: 30 }} 
            gl={{ antialias: false }} 
            className="absolute top-0 left-0 w-full h-full"
          >
            <EffectComposer enableNormalPass={false}>
              <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.6} />
              <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
            
            <ScrollControls pages={6} damping={0.5}>
              <ThreeScene />
              <Overlay />
            </ScrollControls>
          </Canvas>
        </Suspense>
      </main>
    </SoundProvider>
  );
}