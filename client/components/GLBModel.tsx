import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface GLBModelProps {
  url: string;
  scale?: number;
  position?: [number, number, number];
  autoRotate?: boolean;
  isRotating?: boolean;
  onRotationStart?: () => void;
  onRotationStop?: () => void;
  onModelChange?: (newUrl: string) => void;
}

function Model({
  url,
  scale = 1,
  position = [0, 0, 0],
  onLoad,
  isRotating = false,
}: {
  url: string;
  scale: number;
  position: [number, number, number];
  onLoad?: () => void;
  isRotating?: boolean;
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
      // Нормализуем координаты м��ши к диапазону [-1, 1]
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    if (modelRef.current) {
      const time = state.clock.getElapsedTime();

      if (isRotating) {
        // Быстрое вращение когда активирована команда
        modelRef.current.rotation.y += 0.05;
        modelRef.current.rotation.x = Math.sin(time * 2) * 0.1;
        modelRef.current.rotation.z = Math.cos(time * 1.5) * 0.05;
        // Небольшое покачивание при вращении
        modelRef.current.position.y = Math.sin(time * 3) * 0.1;
      } else {
        // Обычное поведение - легкое покачивание
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
  isRotating = false,
  onRotationStart,
  onRotationStop,
  onModelChange,
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentModelUrl, setCurrentModelUrl] = React.useState(url);

  // Функция для определения параметров модели в зависимости от URL
  const getModelParams = (modelUrl: string) => {
    // Если это новая модель (d4105e0c74e944c29631ffc49b1daf4a), применяем другие параметры
    if (modelUrl.includes("d4105e0c74e944c29631ffc49b1daf4a")) {
      return {
        scale: scale * 1.1, // Увеличиваем масштаб для новой модели
        position: [position[0], position[1] - 0.5, position[2]] as [
          number,
          number,
          number,
        ], // Опускаем немного ниже
      };
    }
    // Для исходной модели используем стандартные параметры
    return {
      scale: scale,
      position: position,
    };
  };

  // Слушаем события смены модели
  React.useEffect(() => {
    const handleModelChange = (event: CustomEvent) => {
      const newUrl = event.detail.newModelUrl;
      console.log("🔄 Получено событие смены модели:", newUrl);
      setCurrentModelUrl(newUrl);
      setIsLoading(true);

      if (onModelChange) {
        onModelChange(newUrl);
      }
    };

    window.addEventListener("changeModel", handleModelChange as EventListener);
    return () => {
      window.removeEventListener(
        "changeModel",
        handleModelChange as EventListener,
      );
    };
  }, [onModelChange]);

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
        style={{ ...stableProps.style, background: "transparent" }}
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
            url={currentModelUrl}
            scale={getModelParams(currentModelUrl).scale}
            position={getModelParams(currentModelUrl).position}
            onLoad={() => setIsLoading(false)}
            isRotating={isRotating}
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

// Предзагружаем модели чтобы избежать повторных загрузок
useGLTF.preload(
  "https://cdn.builder.io/o/assets%2F4349887fbc264ef3847731359e547c4f%2F14cdeb74660b46e6b8c349fa5339f8ae?alt=media&token=fa99e259-7582-4df0-9a1e-b9bf6cb20289&apiKey=4349887fbc264ef3847731359e547c4f",
);

useGLTF.preload(
  "https://cdn.builder.io/o/assets%2Fd75af4d8f215499ea8d0f6203e423bd8%2Fd4105e0c74e944c29631ffc49b1daf4a?alt=media&token=3f1fe075-c812-408f-ba1a-5229fc29b16a&apiKey=d75af4d8f215499ea8d0f6203e423bd8",
);

export default GLBModel;
