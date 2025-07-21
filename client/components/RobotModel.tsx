import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Mesh } from "three";

// Set this to your actual .glb file URL when you have one
const MODEL_URL = ""; // Leave empty until you have a real URL

function GLBModel({ url }: { url: string }) {
  const modelRef = useRef<Mesh>(null);
  const gltf = useGLTF(url);
  
  useFrame((_state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <primitive 
      ref={modelRef}
      object={gltf.scene} 
      scale={[1, 1, 1]}
      position={[0, 0, 0]}
    />
  );
}

function FallbackModel() {
  const meshRef = useRef<Mesh>(null);
  
  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial 
        color="#8b45ff" 
        emissive="#4c1d95"
        emissiveIntensity={0.2}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
          <div className="w-8 h-8 bg-white rounded opacity-80"></div>
        </div>
        <p className="text-purple-200 text-sm">Loading 3D Model...</p>
      </div>
    </div>
  );
}

export default function RobotModel() {
  // Check if we have a valid model URL
  const hasValidModel = MODEL_URL && MODEL_URL.length > 0 && MODEL_URL !== "https://example.com/iron_man_helmet.glb";

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ 
          position: [0, 0, 5], 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        style={{ 
          width: "100%", 
          height: "100%",
          filter: "drop-shadow(0 0 20px rgba(139, 69, 255, 0.5))"
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
        />
        <pointLight 
          position={[-10, -10, -5]} 
          intensity={0.3}
          color="#8b45ff"
        />
        
        {hasValidModel ? (
          <Suspense fallback={null}>
            <GLBModel url={MODEL_URL} />
          </Suspense>
        ) : (
          <FallbackModel />
        )}
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={2}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
          maxDistance={8}
          minDistance={3}
        />
      </Canvas>
    </div>
  );
}
