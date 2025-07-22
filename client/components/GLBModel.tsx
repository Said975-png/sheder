import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, PresentationControls } from '@react-three/drei';

interface GLBModelProps {
  url: string;
  scale?: number;
  position?: [number, number, number];
  autoRotate?: boolean;
}

function Model({ url, scale = 1, position = [0, 0, 0] }: { url: string; scale: number; position: [number, number, number] }) {
  const { scene } = useGLTF(url);
  
  return (
    <primitive 
      object={scene} 
      scale={scale} 
      position={position}
    />
  );
}

const GLBModel: React.FC<GLBModelProps> = ({ 
  url, 
  scale = 1, 
  position = [0, 0, 0], 
  autoRotate = true 
}) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <PresentationControls
            global
            config={{ mass: 2, tension: 500 }}
            snap={{ mass: 4, tension: 1500 }}
            rotation={[0, 0.3, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.4, Math.PI / 2]}
          >
            <Model 
              url={url} 
              scale={scale} 
              position={position}
            />
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
