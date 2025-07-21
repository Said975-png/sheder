import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function Robot() {
  const robotRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);

  // Auto-rotate and animate the robot
  useFrame((state) => {
    if (robotRef.current) {
      robotRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  return (
    <group ref={robotRef} position={[0, 0, 0]}>
      {/* Robot Body */}
      <mesh ref={bodyRef} position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 2, 0.8]} />
        <meshPhongMaterial
          color="#8b5cf6"
          transparent
          opacity={0.9}
          emissive="#4c1d95"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Robot Head */}
      <mesh ref={headRef} position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshPhongMaterial
          color="#3b82f6"
          transparent
          opacity={0.9}
          emissive="#1e40af"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.2, 1.6, 0.5]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>
      <mesh position={[0.2, 1.6, 0.5]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.8, 0.5, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.2, 0.2, 1.5]} />
        <meshPhongMaterial color="#6366f1" />
      </mesh>
      <mesh position={[0.8, 0.5, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.2, 0.2, 1.5]} />
        <meshPhongMaterial color="#6366f1" />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.3, -1.5, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 1.5]} />
        <meshPhongMaterial color="#4338ca" />
      </mesh>
      <mesh position={[0.3, -1.5, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 1.5]} />
        <meshPhongMaterial color="#4338ca" />
      </mesh>
    </group>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center text-white/60">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
          <span className="text-2xl">🤖</span>
        </div>
        <p className="text-sm">Loading 3D Robot Model...</p>
      </div>
    </div>
  );
}

export default function RobotModel() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: "transparent" }}
        onError={(error) => {
          console.warn("Canvas error:", error);
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Enhanced Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.2}
            color="#ffffff"
            castShadow
          />
          <directionalLight
            position={[-10, -10, -5]}
            intensity={0.4}
            color="#8b5cf6"
          />
          <pointLight position={[0, 0, 3]} intensity={0.8} color="#3b82f6" />
          <pointLight position={[2, 2, 2]} intensity={0.3} color="#10b981" />

          {/* 3D Robot Model */}
          <Robot />

          {/* Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={8}
            autoRotate={true}
            autoRotateSpeed={0.8}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
