"use client";
import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, useScroll, Grid, Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import Earth from "./Earth";
import AudioManager from "./AudioManager";
import { VerifiedHologram, GlitchedHologram } from "./Holograms";

// --- 1. REALISTIC ANIMATED SATELLITE ---
function SatelliteModel() {
  const groupRef = useRef<THREE.Group>(null!);
  const blinkRef = useRef<THREE.Mesh>(null!);
  const laserRef = useRef<THREE.Mesh>(null!);
  const sensorRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // 1. Blinking Red Light (Heartbeat)
    if (blinkRef.current) {
        const mat = blinkRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = Math.sin(t * 6) > 0 ? 3 : 0;
    }

    // 2. Pulsing Laser Beam (Scanning Effect)
    if (laserRef.current) {
        // Pulse width
        laserRef.current.scale.x = 1 + Math.sin(t * 10) * 0.2; 
        laserRef.current.scale.z = 1 + Math.sin(t * 10) * 0.2;
        // Pulse opacity
        const mat = laserRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.3 + Math.sin(t * 5) * 0.15;
    }

    // 3. Rotating Sensor Head
    if (sensorRef.current) {
        sensorRef.current.rotation.y = Math.sin(t) * 0.5; // Scans left/right
    }

    // 4. Gentle Float Rotation
    if (groupRef.current) {
       groupRef.current.rotation.z = Math.sin(t * 0.2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} scale={0.65} rotation={[0.8, 0.5, 0]}>
      
      {/* --- MAIN BUS (Silver Body) --- */}
      <mesh>
        <boxGeometry args={[1, 1.8, 1]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* --- GOLD INSTRUMENT WRAP (Foil Look) --- */}
      <mesh position={[0, -0.2, 0.51]}>
        <planeGeometry args={[0.9, 0.8]} />
        <meshStandardMaterial 
          color="#FFCC00" 
          metalness={1} 
          roughness={0.4} 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* --- SOLAR WINGS (Deep Blue Grid) --- */}
      {/* Left Wing */}
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
         {/* Strut */}
         <mesh position={[1.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
             <cylinderGeometry args={[0.05, 0.05, 1.5]} />
             <meshStandardMaterial color="#888" />
         </mesh>
      </group>

      {/* Right Wing */}
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

      {/* --- COMMS DISH --- */}
      <group position={[0.6, 0.8, 0]} rotation={[0, 0, -0.5]}>
         <mesh rotation={[0.5, 0, 0]}>
             <cylinderGeometry args={[0.4, 0.05, 0.2, 32]} />
             <meshStandardMaterial color="#222" metalness={0.5} />
         </mesh>
      </group>

      {/* --- ROTATING SENSOR HEAD --- */}
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
      
      {/* --- BLINKING LIGHT --- */}
      <mesh ref={blinkRef} position={[0, 1.0, -0.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} />
      </mesh>

      {/* --- PULSING LASER BEAM --- */}
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

// --- 2. BRIGHT GREEN ORBITERS ---
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

// --- 3. SCENE ANIMATOR (Updated Logic) ---
function SceneAnimator() {
  const scroll = useScroll();
  const earthGroupRef = useRef<THREE.Group>(null!);
  const satelliteRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    const offset = scroll.offset; 

    // --- EARTH LOGIC ---
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

    // --- UPDATED SATELLITE LOGIC ---
    if (satelliteRef.current) {
      // Extended visibility range: 0.20 to 0.85
      const satStart = 0.20;
      const satEnd = 0.85;
      
      if (offset > satStart && offset < satEnd) {
        // Calculate progress (0 to 1)
        const progress = (offset - satStart) / (satEnd - satStart);
        satelliteRef.current.visible = true;

        // ANIMATION PATH:
        // 1. Enters from Top Right
        // 2. Hovers near Center (Scanning)
        // 3. Exits Bottom Left
        
        // Custom Curve Logic
        if (progress < 0.2) {
             // ENTRY PHASE (Fast Drop)
             satelliteRef.current.position.y = THREE.MathUtils.lerp(12, 3, progress * 5);
             satelliteRef.current.position.x = THREE.MathUtils.lerp(6, 2, progress * 5);
        } else if (progress < 0.8) {
             // HOVER/SCAN PHASE (Slow Float)
             // We map the 0.2-0.8 range to a slow movement
             const hoverProgress = (progress - 0.2) / 0.6;
             satelliteRef.current.position.y = THREE.MathUtils.lerp(3, -1, hoverProgress);
             satelliteRef.current.position.x = THREE.MathUtils.lerp(2, -1, hoverProgress);
        } else {
             // EXIT PHASE (Fast Exit)
             const exitProgress = (progress - 0.8) / 0.2;
             satelliteRef.current.position.y = THREE.MathUtils.lerp(-1, -10, exitProgress);
             satelliteRef.current.position.x = THREE.MathUtils.lerp(-1, -6, exitProgress);
        }

        // Rotation: Tumble slightly + Face Earth
        satelliteRef.current.rotation.y = progress * 1.5;
        satelliteRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

      } else {
        satelliteRef.current.visible = false;
        // Reset position so it doesn't flash
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