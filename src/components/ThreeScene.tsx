"use client";
import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, useScroll, Grid, Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import Earth from "./Earth";
import AudioManager from "./AudioManager";
import { VerifiedHologram, GlitchedHologram } from "./Holograms";

function SatelliteModel() {
  const groupRef = useRef<THREE.Group>(null!);
  const blinkRef = useRef<THREE.Mesh>(null!);
  const laserRef = useRef<THREE.Mesh>(null!);
  const sensorRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (blinkRef.current) {
        const mat = blinkRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = Math.sin(t * 6) > 0 ? 3 : 0;
    }

    if (laserRef.current) {
        laserRef.current.scale.x = 1 + Math.sin(t * 10) * 0.2; 
        laserRef.current.scale.z = 1 + Math.sin(t * 10) * 0.2;
        const mat = laserRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.3 + Math.sin(t * 5) * 0.15;
    }

    if (sensorRef.current) {
        sensorRef.current.rotation.y = Math.sin(t) * 0.5; 
    }
    if (groupRef.current) {
       groupRef.current.rotation.z = Math.sin(t * 0.2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} scale={0.65} rotation={[0.8, 0.5, 0]}>
      <mesh>
        <boxGeometry args={[1, 1.8, 1]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.2, 0.51]}>
        <planeGeometry args={[0.9, 0.8]} />
        <meshStandardMaterial 
          color="#FFCC00" 
          metalness={1} 
          roughness={0.4} 
          side={THREE.DoubleSide}
        />
      </mesh>

      <group position={[-2.8, 0, 0]}>
         <mesh>
            <boxGeometry args={[3.5, 1.2, 0.05]} />
            <meshStandardMaterial 
                color="#001144" 
                metalness={0.8} 
                roughness={0.2}
                emissive="#000033"
                emissiveIntensity={0.4}
            />
         </mesh>
         <mesh position={[1.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
             <cylinderGeometry args={[0.05, 0.05, 1.5]} />
             <meshStandardMaterial color="#888" />
         </mesh>
      </group>

      <group position={[2.8, 0, 0]}>
         <mesh>
            <boxGeometry args={[3.5, 1.2, 0.05]} />
            <meshStandardMaterial 
                color="#001144" 
                metalness={0.8} 
                roughness={0.2}
                emissive="#000033"
                emissiveIntensity={0.4}
            />
         </mesh>
         <mesh position={[-1.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
             <cylinderGeometry args={[0.05, 0.05, 1.5]} />
             <meshStandardMaterial color="#888" />
         </mesh>
      </group>

      <group position={[0.6, 0.8, 0]} rotation={[0, 0, -0.5]}>
         <mesh rotation={[0.5, 0, 0]}>
             <cylinderGeometry args={[0.4, 0.05, 0.2, 32]} />
             <meshStandardMaterial color="#222" metalness={0.5} />
         </mesh>
      </group>

      <group ref={sensorRef} position={[0, -1, 0]}>
          <mesh>
             <cylinderGeometry args={[0.2, 0.1, 0.3, 16]} />
             <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#00ff88" emissive="#00ff88" />
          </mesh>
      </group>
      
      <mesh ref={blinkRef} position={[0, 1.0, -0.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} />
      </mesh>

      <mesh ref={laserRef} position={[0, -6, 0]}>
         <cylinderGeometry args={[0.04, 0.15, 10, 8]} />
         <meshBasicMaterial 
            color="#00ff88" 
            transparent 
            opacity={0.3} 
            blending={THREE.AdditiveBlending} 
         />
      </mesh>
    </group>
  );
}

function GreenOrbiters() {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame(() => {
    if (groupRef.current) {
        groupRef.current.rotation.y += 0.005; 
        groupRef.current.rotation.z += 0.002; 
    }
  });
  const BrightStar = ({ position }: { position: [number, number, number] }) => (
    <mesh position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial color="#00ff88" emissive="#39ff14" emissiveIntensity={4} toneMapped={false} />
    </mesh>
  );
  return (
    <group ref={groupRef}>
      <BrightStar position={[1.5, 1, 0]} />
      <BrightStar position={[-1.8, -0.5, 0.5]} />
      <BrightStar position={[0, 0.5, -1.5]} />
    </group>
  );
}

function SceneAnimator() {
  const scroll = useScroll();
  const earthGroupRef = useRef<THREE.Group>(null!);
  const satelliteRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    const offset = scroll.offset; 
    let targetX = 3.5;
    let targetY = 0;
    let targetScale = 1.8;

    if (offset < 0.16) { targetX = 3.5; } 
    else if (offset < 0.32) { targetX = -4.5; } 
    else if (offset < 0.48) { targetX = 4.5; } 
    else if (offset < 0.64) { targetX = -4.5; }
    else { targetX = 0; targetY = -1.5; targetScale = 1.1; }

    if (earthGroupRef.current) {
      earthGroupRef.current.position.x = THREE.MathUtils.lerp(earthGroupRef.current.position.x, targetX, 0.06);
      earthGroupRef.current.position.y = THREE.MathUtils.lerp(earthGroupRef.current.position.y, targetY, 0.06);
      const currentScale = earthGroupRef.current.scale.x;
      earthGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(currentScale, targetScale, 0.06));
      earthGroupRef.current.rotation.y += delta * 0.1 + (scroll.delta * 5);
    }
    if (satelliteRef.current) {
      const satStart = 0.20;
      const satEnd = 0.85;
      
      if (offset > satStart && offset < satEnd) {
        const progress = (offset - satStart) / (satEnd - satStart);
        satelliteRef.current.visible = true;
        if (progress < 0.2) {
             satelliteRef.current.position.y = THREE.MathUtils.lerp(12, 3, progress * 5);
             satelliteRef.current.position.x = THREE.MathUtils.lerp(6, 2, progress * 5);
        } else if (progress < 0.8) {
             const hoverProgress = (progress - 0.2) / 0.6;
             satelliteRef.current.position.y = THREE.MathUtils.lerp(3, -1, hoverProgress);
             satelliteRef.current.position.x = THREE.MathUtils.lerp(2, -1, hoverProgress);
        } else {
             const exitProgress = (progress - 0.8) / 0.2;
             satelliteRef.current.position.y = THREE.MathUtils.lerp(-1, -10, exitProgress);
             satelliteRef.current.position.x = THREE.MathUtils.lerp(-1, -6, exitProgress);
        }

        satelliteRef.current.rotation.y = progress * 1.5;
        satelliteRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

      } else {
        satelliteRef.current.visible = false;
        satelliteRef.current.position.set(6, 15, 0); 
      }
    }
  });

  return (
    <group>
      <AudioManager />

      <group ref={earthGroupRef}>
        <Suspense fallback={null}><Earth /></Suspense>
        <GreenOrbiters />
      </group>

      <group ref={satelliteRef} position={[6, 15, 0]}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
           <SatelliteModel />
        </Float>
      </group>
      
      <group position={[6, 0, -4]}> <GlitchedHologram /> </group>
      <group position={[-6, 0, -4]}> <VerifiedHologram /> </group>
    </group>
  );
}

export default function ThreeScene() {
  return (
    <>
      <Environment preset="city" /> 
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={4} color="#ffffff" />
      <spotLight position={[0, 5, 10]} angle={0.5} penumbra={1} intensity={5} />
      <fogExp2 attach="fog" args={['#000000', 0.03]} />

      <Grid 
        position={[0, -2, 0]} 
        infiniteGrid 
        fadeDistance={35} 
        sectionColor="#39ff14" 
        cellColor="#059669" 
        sectionThickness={1.5}
        cellThickness={0.6}
      />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      <SceneAnimator />
    </>
  );
}