import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

function Robot() {
  const robotRef = useRef<THREE.Group>(null);

  // Загружаем новую 3D модель
  const gltf = useLoader(
    GLTFLoader,
    "https://cdn.builder.io/o/assets%2F4b8ea25f0ef042cbac23e1ab53938a6b%2Fc7c8cac50bef4cc4a9a0b4eb2d43d5b5?alt=media&token=e722e790-73f6-4d64-9abd-1a737fad930f&apiKey=4b8ea25f0ef042cbac23e1ab53938a6b"
  );

  // Оптимизируем модель
  const model = useMemo(() => {
    const clonedScene = gltf.scene.clone();

    // Применяем материалы с эффектом свечения
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          // Создаем новый материал с эффектом свечения
          const material = child.material as THREE.MeshStandardMaterial;
          material.emissive = new THREE.Color("#4c1d95");
          material.emissiveIntensity = 0.2;
          material.metalness = 0.3;
          material.roughness = 0.4;
        }
      }
    });

    return clonedScene;
  }, [gltf]);

  // Анимация модели
  useFrame((state) => {
    if (robotRef.current) {
      robotRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      robotRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 2) * 0.02
      );
    }
  });

  return (
    <group ref={robotRef} position={[0, -1, 0]} scale={[2, 2, 2]}>
      <primitive object={model} />
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
