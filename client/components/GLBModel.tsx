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
    polar: [-Math.PI / 3, Math.PI / 3] as [number, number],
    azimuth: [-Math.PI / 1.4, Math.PI / 2] as [number, number],
  }), []);

  return (
    <div className="w-full h-full">
      <Canvas
        camera={stableProps.camera}
        style={stableProps.style}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />

        <Suspense fallback={<LoadingFallback />}>
          <PresentationControls {...controlsProps}>
            <Model url={url} scale={scale} position={position} />
          </PresentationControls>
        </Suspense>

        {autoRotate && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={2}
          />
        )}
      </Canvas>
    </div>
  );
};

export default GLBModel;
