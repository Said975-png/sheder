import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Mesh } from "three";

function Model() {
  const modelRef = useRef<Mesh>(null);
  const gltf = useGLTF("https://example.com/iron_man_helmet.glb");
  
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

export default function RobotModel() {
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
        <Model />
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
          maxDistance={8}
          minDistance={3}
        />
      </Canvas>
    </div>
  );
}
