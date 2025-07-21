import { Suspense, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

function Robot() {
  const robotRef = useRef<THREE.Group>(null);

  // Load the GLB model
  const gltf = useLoader(
    GLTFLoader,
    "https://cdn.builder.io/o/assets%2Fce326d6fc01a49c8950b47b8e8656b05%2F19fc8fb46c894fc38df80d3555d4baae?alt=media&token=b3970bf3-ed76-4714-9e12-1bfd60357c8e&apiKey=ce326d6fc01a49c8950b47b8e8656b05",
  );

  // Auto-rotate the model
  useFrame((state) => {
    if (robotRef.current) {
      robotRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <group ref={robotRef}>
      <primitive object={gltf.scene} scale={[3, 3, 3]} position={[0, 0.5, 0]} />
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
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            color="#ffffff"
          />
          <directionalLight
            position={[-10, -10, -5]}
            intensity={0.3}
            color="#8b5cf6"
          />
          <pointLight position={[0, 0, 3]} intensity={0.5} color="#3b82f6" />

          {/* Environment for reflections */}
          <Environment preset="city" />

          {/* 3D Robot Model */}
          <Robot />

          {/* Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate={true}
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
