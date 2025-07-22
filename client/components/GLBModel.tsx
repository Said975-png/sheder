import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Vector2 } from "three";

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
}: {
  url: string;
  scale: number;
  position: [number, number, number];
}) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<any>();
  const mouseRef = useRef({ x: 0, y: 0 });

  // Клонируем сцену для избежания конфликтов при повторном использовании
  const clonedScene = useMemo(() => scene.clone(), [scene]);

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
    <primitive
      ref={modelRef}
      object={clonedScene}
      scale={scale}
      position={position}
    />
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

const GLBModel: React.FC<GLBModelProps> = ({
  url,
  scale = 1,
  position = [0, 0, 0],
  autoRotate = true,
}) => {
  // Стабилизируем параметры чтобы избежать пересоздания Canvas
  const stableProps = useMemo(
    () => ({
      camera: { position: [0, 0, 5] as [number, number, number], fov: 50 },
      style: { width: "100%", height: "100%" },
    }),
    [],
  );

  return (
    <div className="w-full h-full">
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

        <Suspense fallback={<LoadingFallback />}>
          <Model url={url} scale={scale} position={position} />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={false}
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
  "https://cdn.builder.io/o/assets%2Fd1c3ee1ec7be40678f2e6792ec37e2b0%2Fa3ddf442a35840a8ae7950219d9bdb2f?alt=media&token=138b2881-8b51-43df-b3e5-81d9e6d6983f&apiKey=d1c3ee1ec7be40678f2e6792ec37e2b0",
);

export default GLBModel;
