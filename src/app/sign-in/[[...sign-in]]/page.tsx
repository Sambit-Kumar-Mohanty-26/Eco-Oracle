"use client";
import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, Float, Environment, SpotLight } from "@react-three/drei";
import Earth from "@/components/Earth"; 
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { motion } from "framer-motion";

function LoginScene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <SpotLight 
        position={[10, 10, 10]} 
        angle={0.15} 
        penumbra={1} 
        intensity={2} 
        color="#D0E0FF"
      />
      <Environment preset="city" />
      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <group position={[8, 0, -10]} scale={3.5}>
           <Earth /> 
        </group>
      </Float>
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

      <EffectComposer enableNormalPass={false}>
        <Bloom luminanceThreshold={0.1} mipmapBlur intensity={0.5} radius={0.5} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
}

export default function SignInPage() {
  return (
    <div className="relative h-screen w-full bg-black overflow-hidden flex items-center justify-center p-8">

      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 25 }}>
          <Suspense fallback={null}>
            <LoginScene />
          </Suspense>
        </Canvas>
      </div>
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">

        <motion.div 
            initial={{ opacity: 0, y: -20, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-center mb-10"
        >
            <h1 className="text-4xl font-bold text-white font-heading tracking-[0.4em] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              TERMINAL<span className="text-emerald-500">_ACCESS</span>
            </h1>
            <p className="text-[10px] text-emerald-500/70 font-mono mt-2 tracking-widest uppercase animate-pulse">
               _ESTABLISHING ENCRYPTED SATELLITE LINK...
            </p>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="relative p-px overflow-hidden rounded-xl group"
        >
            <div className="absolute inset-[-1000%] animate-border-spin bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#ffffff_50%,#000000_100%)] opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative h-full w-full bg-black/60 backdrop-blur-xl rounded-xl p-1">
                <SignIn 
                  appearance={{
                    elements: {
                      card: "bg-transparent shadow-none border-none",
                      headerTitle: "text-white font-heading text-xl",
                      headerSubtitle: "text-gray-400 font-sans",
                      socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all",
                      formButtonPrimary: "bg-emerald-600 hover:bg-emerald-500 text-black font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.4)]",
                      formFieldLabel: "text-gray-400 font-mono text-[10px] uppercase",
                      formFieldInput: "bg-black/50 border-white/10 text-white focus:border-emerald-500 transition-all",
                      footerActionText: "text-gray-400",
                      footerActionLink: "text-emerald-400 hover:text-emerald-300",
                    }
                  }}
                />
            </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 right-10 z-30 font-mono text-[10px] text-emerald-500/50 text-right">
          LAT: -3.4653 <br />
          LNG: -62.2159 <br />
          SECURE_MODE: ACTIVE
      </div>
    </div>
  );
}