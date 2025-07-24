import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Компонент для частиц, поднимающихся вверх
function RisingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 100;

  const particlesData = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Случайные позиции в области за моделью
      positions[i3] = (Math.random() - 0.5) * 8; // x
      positions[i3 + 1] = (Math.random() - 0.5) * 6 - 3; // y (начинаем снизу)
      positions[i3 + 2] = -2 - Math.random() * 3; // z (за моделью)

      // Скорости подъёма
      velocities[i3] = (Math.random() - 0.5) * 0.02; // небольшое горизонтальное движение
      velocities[i3 + 1] = 0.01 + Math.random() * 0.02; // подъём вверх
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01; // небольшое движение по z

      scales[i] = 0.5 + Math.random() * 1.5;
    }

    return { positions, velocities, scales };
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const { velocities } = particlesData;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Обновляем позиции
        positions[i3] += velocities[i3]; // x
        positions[i3 + 1] += velocities[i3 + 1]; // y
        positions[i3 + 2] += velocities[i3 + 2]; // z

        // Если частица подняла��ь слишком высоко, возвращаем её вниз
        if (positions[i3 + 1] > 4) {
          positions[i3] = (Math.random() - 0.5) * 8;
          positions[i3 + 1] = -3 - Math.random() * 2;
          positions[i3 + 2] = -2 - Math.random() * 3;
        }
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particlesData.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#a855f7"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}



interface GLBModelProps {
  url: string;
  scale?: number;
  position?: [number, number, number];
  autoRotate?: boolean;
}

function Model({
  url,
  scale = 1,
  position = [0, 0, 0],
  onLoad,
}: {
  url: string;
  scale: number;
  position: [number, number, number];
  onLoad?: () => void;
}) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Клонируем сцену для избежания конфликтов при повторном использовании
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Вызываем onLoad после загрузки модели
  React.useEffect(() => {
    if (scene && onLoad) {
      onLoad();
    }
  }, [scene, onLoad]);

  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Нормализуем координаты мыши к диапазону [-1, 1]
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    if (modelRef.current) {
      // Добавляем эффект гравитации - модель слегка покачивается
      const time = state.clock.getElapsedTime();

      // Гравитационное покачивание
      modelRef.current.position.y = Math.sin(time * 0.8) * 0.2;
      modelRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;

      // Легкое вращение от мыши (уменьшенное)
      const targetRotationY = mouseRef.current.x * 0.2;
      const targetRotationX = -mouseRef.current.y * 0.1;

      modelRef.current.rotation.y +=
        (targetRotationY - modelRef.current.rotation.y) * 0.05;
      modelRef.current.rotation.x +=
        (targetRotationX - modelRef.current.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={modelRef} scale={scale} position={position}>
      <primitive object={clonedScene} />
    </group>
  );
}

// 3D Loading fallback для использования внутри Canvas
function ThreeLoadingFallback() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#8b45ff"
        emissive="#4c1d95"
        emissiveIntensity={0.2}
        wireframe
      />
    </mesh>
  );
}

// HTML Loading fallback для использования вне Canvas
function HTMLLoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center absolute inset-0">
      <div className="text-center">
        <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
          <div className="w-4 h-4 bg-white rounded-full opacity-80"></div>
        </div>
        <p className="text-cyan-200 text-xs">Loading...</p>
      </div>
    </div>
  );
}

const GLBModel: React.FC<GLBModelProps> = ({
  url,
  scale = 1,
  position = [0, 0, 0],
  autoRotate = true,
}) => {
  const [isLoading, setIsLoading] = React.useState(true);

  // Стабилизируем параметры чтобы избежать пересоздания Canvas
  const stableProps = useMemo(
    () => ({
      camera: { position: [0, 0, 5] as [number, number, number], fov: 50 },
      style: { width: "100%", height: "100%" },
    }),
    [],
  );

  return (
    <div className="w-full h-full relative">
      {isLoading && <HTMLLoadingFallback />}
      <Canvas
        camera={stableProps.camera}
        style={{
          ...stableProps.style,
          background: "transparent",
          border: "none",
          outline: "none",
          boxShadow: "none"
        }}
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        frameloop="always"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />

        {/* Поднимающиеся частицы */}
        <RisingParticles />

        <Suspense fallback={<ThreeLoadingFallback />}>
          <Model
            url={url}
            scale={scale}
            position={position}
            onLoad={() => setIsLoading(false)}
          />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          autoRotate={autoRotate}
          makeDefault
        />
      </Canvas>
    </div>
  );
};

// Предзагружаем модель чтобы избежать повторных загрузок
useGLTF.preload(
  "https://cdn.builder.io/o/assets%2F4349887fbc264ef3847731359e547c4f%2F14cdeb74660b46e6b8c349fa5339f8ae?alt=media&token=fa99e259-7582-4df0-9a1e-b9bf6cb20289&apiKey=4349887fbc264ef3847731359e547c4f",
);

export default GLBModel;
