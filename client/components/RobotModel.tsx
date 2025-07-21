import React from "react";



export default function RobotModel() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-full h-full max-w-md max-h-md">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F4b8ea25f0ef042cbac23e1ab53938a6b%2F0bb627ffa5ae4abe9db93059f069a7e4?format=webp&width=800"
          alt="Jarvis Robot"
          className="w-full h-full object-contain"
          style={{
            filter: "drop-shadow(0 0 20px rgba(139, 69, 255, 0.5))",
            animation: "float 3s ease-in-out infinite"
          }}
        />
      </div>
    </div>
  );
}
