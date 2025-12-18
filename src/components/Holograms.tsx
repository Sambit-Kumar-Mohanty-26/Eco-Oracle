"use client";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

export function VerifiedHologram() {
  const ref = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.5;
    ref.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
  });

  return (
    <group>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#00ff88" wireframe transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.3, 32]} />
        <meshBasicMaterial color="#00ff88" side={THREE.DoubleSide} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

export function GlitchedHologram() {
  const ref = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (Math.random() > 0.9) {
        ref.current.scale.setScalar(1 + Math.random() * 0.3);
        (ref.current.material as any).color?.setHex(Math.random() > 0.5 ? 0xffffff : 0xff0000); 
    } else {
        ref.current.scale.setScalar(1);
        (ref.current.material as any).color?.setHex(0xff0000); 
    }
    
    ref.current.rotation.y += Math.random() * 0.2;
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1, 0]} /> 
      <meshBasicMaterial color="#ff0000" wireframe wireframeLinewidth={2} />
    </mesh>
  );
}