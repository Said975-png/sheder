import React from "react";

// Fallback робот из геометрических фигур
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
  return <SimpleRobot />;
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
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-full h-full max-w-md max-h-md">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F4b8ea25f0ef042cbac23e1ab53938a6b%2F0bb627ffa5ae4abe9db93059f069a7e4?format=webp&width=800"
          alt="Jarvis Robot"
          className="w-full h-full object-contain animate-pulse"
          style={{
            filter: "drop-shadow(0 0 20px rgba(139, 69, 255, 0.5))",
            animation: "float 3s ease-in-out infinite"
          }}
        />
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-10px) scale(1.05); }
          }
        `}</style>
      </div>
    </div>
  );
}
