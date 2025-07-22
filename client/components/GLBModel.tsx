import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

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

  useFrame(() => {
    if (modelRef.current) {
      // Увеличиваем чувствительность для более заметно��о эффекта
      const targetRotationY = mouseRef.current.x * 0.5;
      const targetRotationX = -mouseRef.current.y * 0.3;

      modelRef.current.rotation.y +=
        (targetRotationY - modelRef.current.rotation.y) * 0.08;
      modelRef.current.rotation.x +=
        (targetRotationX - modelRef.current.rotation.x) * 0.08;
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
        style={stableProps.style}
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

        <Suspense fallback={<ThreeLoadingFallback />}>
          <Model
            url={url}
            scale={scale}
            position={position}
            onLoad={() => setIsLoading(false)}
          />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={autoRotate}
          makeDefault
          maxDistance={10}
          minDistance={2}
        />
      </Canvas>
    </div>
  );
};

// Предзагружаем модель чтобы избежать повторных загрузок
useGLTF.preload(
  "https://cdn.builder.io/o/assets%2F4349887fbc264ef3847731359e547c4f%2Fb4ef7bf18c5549bd9f8852b83394ebc8?alt=media&token=b8c73f7a-800f-4ec6-8ff9-36107fc91a86&apiKey=4349887fbc264ef3847731359e547c4f",
);

export default GLBModel;
