import { Suspense, useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

// Fallback робот из г��ометрических фигур
function SimpleRobot() {
  const robotRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (robotRef.current) {
      robotRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
    if (bodyRef.current) {
      bodyRef.current.scale.y =
        1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
    if (headRef.current) {
      headRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
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

function Robot() {
  const robotRef = useRef<THREE.Group>(null);
  const [useFallback, setUseFallback] = useState(false);

  // Попытка загрузки новой 3D модели с обработкой ошибок
  let gltf;
  try {
    gltf = useLoader(
      GLTFLoader,
      "https://cdn.builder.io/o/assets%2F4b8ea25f0ef042cbac23e1ab53938a6b%2Fc7c8cac50bef4cc4a9a0b4eb2d43d5b5?alt=media&token=e722e790-73f6-4d64-9abd-1a737fad930f&apiKey=4b8ea25f0ef042cbac23e1ab53938a6b",
      (loader) => {
        // Настройка загрузчика для обработки проблем с текстурами
        loader.crossOrigin = "anonymous";
      },
      undefined,
      (error) => {
        console.warn("Failed to load GLTF model:", error);
        setUseFallback(true);
      }
    );
  } catch (error) {
    console.warn("Error loading model, using fallback:", error);
    return <SimpleRobot />;
  }

  // Если произошла ошибка, используем простую модель
  if (useFallback || !gltf) {
    return <SimpleRobot />;
  }

  // Оптимизируем модель
  const model = useMemo(() => {
    try {
      const clonedScene = gltf.scene.clone();

      // Применяем материалы с эффектом свечения
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material) {
            // Создаем новый материал с эффектом свечения
            const material = child.material as THREE.MeshStandardMaterial;

            // Если текстуры недоступны, создаем простой материал
            if (!material.map) {
              const newMaterial = new THREE.MeshPhongMaterial({
                color: "#8b5cf6",
                emissive: "#4c1d95",
                emissiveIntensity: 0.2,
                transparent: true,
                opacity: 0.9,
              });
              child.material = newMaterial;
            } else {
              material.emissive = new THREE.Color("#4c1d95");
              material.emissiveIntensity = 0.2;
              material.metalness = 0.3;
              material.roughness = 0.4;
            }
          }
        }
      });

      return clonedScene;
    } catch (error) {
      console.warn("Error processing model, using fallback");
      setUseFallback(true);
      return null;
    }
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

  if (!model) {
    return <SimpleRobot />;
  }

  return (
    <group ref={robotRef} position={[0, -1, 0]} scale={[2, 2, 2]}>
      <primitive object={model} />
    </group>
  );
}

// THREE.js совместимый fallback
function LoadingFallback() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhongMaterial
          color="#8b5cf6"
          emissive="#4c1d95"
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

export default function RobotModel() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ background: "transparent" }}
        onError={(error) => {
          console.warn("Canvas error:", error);
          // Fallback: показать простую анимацию при ошибке
        }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Оптимизированное освещение для новой модели */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.0}
            color="#ffffff"
            castShadow
          />
          <directionalLight
            position={[-10, -10, -5]}
            intensity={0.3}
            color="#8b5cf6"
          />
          <pointLight position={[0, 2, 3]} intensity={0.6} color="#3b82f6" />
          <pointLight position={[2, 0, 2]} intensity={0.4} color="#10b981" />
          <spotLight
            position={[0, 5, 0]}
            intensity={0.5}
            color="#ffffff"
            angle={Math.PI / 4}
            penumbra={0.3}
          />

          {/* Новая 3D модель */}
          <Robot />

          {/* Улучшенные контролы */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={4}
            maxDistance={10}
            autoRotate={true}
            autoRotateSpeed={0.5}
            enableDamping={true}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
