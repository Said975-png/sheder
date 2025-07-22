import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  PresentationControls,
} from "@react-three/drei";

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

  // Клонируем сцену для избежания конфликтов при повторном использовании
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return <primitive object={clonedScene} scale={scale} position={position} />;
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
  const stableProps = useMemo(() => ({
    camera: { position: [0, 0, 5] as [number, number, number], fov: 50 },
    style: { width: "100%", height: "100%" },
  }), []);

  const controlsProps = useMemo(() => ({
    global: true,
    config: { mass: 2, tension: 500 },
    snap: { mass: 4, tension: 1500 },
    rotation: [0, 0.3, 0] as [number, number, number],
    polar: [-Math.PI / 2, Math.PI / 2] as [number, number],
    azimuth: [-Math.PI, Math.PI] as [number, number],
  }), []);

  return (
    <div className="w-full h-full">
      <Canvas
        camera={stableProps.camera}
        style={stableProps.style}
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
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
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          makeDefault
          maxDistance={10}
          minDistance={2}
        />
      </Canvas>
    </div>
  );
};

// Предзагружаем модель чтобы избежать повторных загрузок
useGLTF.preload("https://cdn.builder.io/o/assets%2Fd1c3ee1ec7be40678f2e6792ec37e2b0%2Fa3ddf442a35840a8ae7950219d9bdb2f?alt=media&token=138b2881-8b51-43df-b3e5-81d9e6d6983f&apiKey=d1c3ee1ec7be40678f2e6792ec37e2b0");

export default GLBModel;
