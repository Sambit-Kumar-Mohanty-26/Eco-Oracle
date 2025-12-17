"use client";
import { useLoader, useFrame } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";
import { useRef } from "react";

export default function Earth() {
  const [dayMap, nightMap, cloudsMap] = useLoader(TextureLoader, [
    "/textures/8k_earth_daymap.jpg",
    "/textures/8k_earth_nightmap.jpg",
    "/textures/8k_earth_clouds.jpg",
  ]);

  const earthRef = useRef<THREE.Group>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (earthRef.current) earthRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    if (cloudsRef.current) cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.07;
  });

  return (
    <group ref={earthRef} rotation={[0, 0, 0.4]}> 
      {/* 1. EARTH SURFACE */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={dayMap}
          emissiveMap={nightMap}
          emissive={new THREE.Color(0xffff88)}
          emissiveIntensity={0.2}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* 2. CLOUDS */}
      <mesh ref={cloudsRef} scale={[1.01, 1.01, 1.01]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false} 
        />
      </mesh>

      {/* 3. ATMOSPHERE (The Blue Halo) */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          color="#00aaff" // Cyan Blue
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide} // Shows only on edges
        />
      </mesh>
    </group>
  );
}