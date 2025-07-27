import React, { useState, useEffect } from "react";

export default function StarkModeOverlay() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleActivateStarkMode = () => {
      setIsActive(true);
      // Автоматически отключаем через 30 секунд
      setTimeout(() => setIsActive(false), 30000);
    };

    const handleDeactivateStarkMode = () => {
      setIsActive(false);
    };

    window.addEventListener("activateStarkMode", handleActivateStarkMode);
    window.addEventListener("deactivateStarkMode", handleDeactivateStarkMode);

    return () => {
      window.removeEventListener("activateStarkMode", handleActivateStarkMode);
      window.removeEventListener(
        "deactivateStarkMode",
        handleDeactivateStarkMode,
      );
    };
  }, []);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Сканирующие линии */}
      <div className="absolute inset-0">
        {/* Горизонтальные сканирующие линии */}
        <div className="scanning-line-horizontal animate-scan-horizontal"></div>
        <div className="scanning-line-horizontal animate-scan-horizontal-delayed"></div>

        {/* Вертикальные сканирующие линии */}
        <div className="scanning-line-vertical animate-scan-vertical"></div>
        <div className="scanning-line-vertical animate-scan-vertical-delayed"></div>
      </div>

      {/* Угловые элементы */}
      <div className="absolute top-4 left-4 w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400 animate-pulse"></div>
      </div>

      <div className="absolute top-4 right-4 w-16 h-16">
        <div className="absolute top-0 right-0 w-full h-1 bg-cyan-400 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-1 h-full bg-cyan-400 animate-pulse"></div>
      </div>

      <div className="absolute bottom-4 left-4 w-16 h-16">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-400 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-1 h-full bg-cyan-400 animate-pulse"></div>
      </div>

      <div className="absolute bottom-4 right-4 w-16 h-16">
        <div className="absolute bottom-0 right-0 w-full h-1 bg-cyan-400 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-1 h-full bg-cyan-400 animate-pulse"></div>
      </div>

      {/* Центральный интерфейс */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-64 h-64 border-2 border-cyan-400 rounded-full animate-spin-slow relative">
          <div className="absolute inset-4 border border-cyan-400/50 rounded-full"></div>
          <div className="absolute inset-8 border border-cyan-400/30 rounded-full"></div>

          {/* Центральная точка */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Статусная информация */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-cyan-400 font-mono text-lg animate-pulse">
          STARK INDUSTRIES AI DIVISION
        </div>
        <div className="text-cyan-300 font-mono text-sm mt-2">
          JARVIS FULL ACCESS ACTIVATED
        </div>
        <div className="text-cyan-300 font-mono text-xs mt-1 opacity-60">
          System Status: ONLINE • Security Level: MAXIMUM
        </div>
      </div>

      {/* Плавающие элементы данных */}
      <div className="absolute top-32 left-8 text-cyan-400 font-mono text-xs">
        <div className="animate-pulse">CPU: 94.7%</div>
        <div className="animate-pulse delay-100">RAM: 87.2%</div>
        <div className="animate-pulse delay-200">NET: 156 Mbps</div>
      </div>

      <div className="absolute top-32 right-8 text-cyan-400 font-mono text-xs text-right">
        <div className="animate-pulse">SECURITY: ACTIVE</div>
        <div className="animate-pulse delay-100">FIREWALL: ENABLED</div>
        <div className="animate-pulse delay-200">ENCRYPTION: 256-BIT</div>
      </div>

      {/* Дополнительные визуальные эффекты */}
      <div className="absolute inset-0 bg-cyan-400/5 animate-pulse"></div>
    </div>
  );
}
