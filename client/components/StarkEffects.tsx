import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ArcReactorProps {
  size?: "small" | "medium" | "large";
  pulsing?: boolean;
  className?: string;
}

export function ArcReactor({
  size = "medium",
  pulsing = true,
  className,
}: ArcReactorProps) {
  const sizes = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  return (
    <div
      className={cn(
        "relative rounded-full border-2 border-cyan-400",
        "bg-gradient-to-br from-cyan-400/20 to-blue-400/20",
        "backdrop-blur-sm",
        sizes[size],
        pulsing && "animate-pulse",
        className,
      )}
    >
      {/* Внутренний круг */}
      <div className="absolute inset-2 rounded-full border border-cyan-300/60 bg-cyan-400/10">
        <div className="absolute inset-1 rounded-full border border-cyan-200/40 bg-gradient-to-br from-cyan-300/20 to-transparent">
          {/* Центральная точка */}
          <div className="absolute inset-2 rounded-full bg-cyan-400 animate-pulse"></div>
        </div>
      </div>

      {/* Внешнее свечение */}
      <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md animate-pulse"></div>
    </div>
  );
}

interface PowerIndicatorProps {
  level: number; // 0-100
  label?: string;
  className?: string;
}

export function PowerIndicator({
  level,
  label = "POWER",
  className,
}: PowerIndicatorProps) {
  const normalizedLevel = Math.max(0, Math.min(100, level));
  const color =
    normalizedLevel > 70 ? "cyan" : normalizedLevel > 30 ? "yellow" : "red";

  const colorClasses = {
    cyan: "from-cyan-400 to-blue-400",
    yellow: "from-yellow-400 to-orange-400",
    red: "from-red-400 to-red-600",
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      {/* Индикатор уровня */}
      <div className="relative w-24 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
        <div
          className={cn(
            "absolute left-0 top-0 h-full transition-all duration-500",
            `bg-gradient-to-r ${colorClasses[color]}`,
            normalizedLevel > 0 && "animate-pulse",
          )}
          style={{ width: `${normalizedLevel}%` }}
        ></div>
        {/* Сегменты */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-gray-700 last:border-r-0"
            ></div>
          ))}
        </div>
      </div>

      {/* Текстовый индикатор */}
      <div className="text-xs text-white min-w-max">
        <div className="text-white">{label}</div>
        <div className="text-white font-bold">{normalizedLevel}%</div>
      </div>
    </div>
  );
}

interface ScannerLineProps {
  direction?: "horizontal" | "vertical";
  duration?: number;
  color?: "cyan" | "blue" | "orange" | "red";
  thickness?: "thin" | "medium" | "thick";
  className?: string;
}

export function ScannerLine({
  direction = "horizontal",
  duration = 2,
  color = "cyan",
  thickness = "medium",
  className,
}: ScannerLineProps) {
  const colorClasses = {
    cyan: "bg-cyan-400",
    blue: "bg-blue-400",
    orange: "bg-orange-400",
    red: "bg-red-400",
  };

  const thicknessClasses = {
    thin: direction === "horizontal" ? "h-px" : "w-px",
    medium: direction === "horizontal" ? "h-0.5" : "w-0.5",
    thick: direction === "horizontal" ? "h-1" : "w-1",
  };

  return (
    <div
      className={cn(
        "absolute",
        direction === "horizontal" ? "w-full left-0" : "h-full top-0",
        thicknessClasses[thickness],
        colorClasses[color],
        "opacity-80 animate-scanner",
        className,
      )}
      style={{
        animationDuration: `${duration}s`,
      }}
    ></div>
  );
}

interface MatrixRainProps {
  density?: "low" | "medium" | "high";
  speed?: "slow" | "medium" | "fast";
  color?: "green" | "cyan" | "blue";
  className?: string;
}

export function MatrixRain({
  density = "medium",
  speed = "medium",
  color = "cyan",
  className,
}: MatrixRainProps) {
  const [characters, setCharacters] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const densityCount = {
    low: 10,
    medium: 20,
    high: 30,
  };

  const speedClasses = {
    slow: "animate-matrix-slow",
    medium: "animate-matrix-medium",
    fast: "animate-matrix-fast",
  };

  const colorClasses = {
    green: "text-white",
    cyan: "text-white",
    blue: "text-white",
  };

  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
    const randomChars = Array.from(
      { length: densityCount[density] },
      () => chars[Math.floor(Math.random() * chars.length)],
    );
    setCharacters(randomChars);
  }, [density]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden",
        className,
      )}
    >
      {characters.map((char, index) => (
        <div
          key={index}
          className={cn(
            "absolute text-xs opacity-60",
            colorClasses[color],
            speedClasses[speed],
          )}
          style={{
            left: `${(index * 100) / characters.length}%`,
            animationDelay: `${index * 0.1}s`,
          }}
        >
          {char}
        </div>
      ))}
    </div>
  );
}

interface GlitchTextProps {
  children: React.ReactNode;
  intensity?: "low" | "medium" | "high";
  className?: string;
}

export function GlitchText({
  children,
  intensity = "medium",
  className,
}: GlitchTextProps) {
  return (
    <span className={cn("relative", className)}>
      <span>{children}</span>
    </span>
  );
}

interface EnergyFieldProps {
  intensity?: "low" | "medium" | "high";
  color?: "cyan" | "blue" | "purple";
  className?: string;
  children?: React.ReactNode;
}

export function EnergyField({
  intensity = "medium",
  color = "cyan",
  className,
  children,
}: EnergyFieldProps) {
  const intensityClasses = {
    low: "opacity-20",
    medium: "opacity-40",
    high: "opacity-60",
  };

  const colorClasses = {
    cyan: "from-cyan-400/20 via-transparent to-blue-400/20",
    blue: "from-blue-400/20 via-transparent to-purple-400/20",
    purple: "from-purple-400/20 via-transparent to-pink-400/20",
  };

  return (
    <div className={cn("relative", className)}>
      {children}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br pointer-events-none",
          colorClasses[color],
          intensityClasses[intensity],
          "animate-pulse",
        )}
      ></div>
    </div>
  );
}
