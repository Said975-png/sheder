import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StarkHUDProps {
  children?: React.ReactNode;
  className?: string;
  showCorners?: boolean;
  showScanlines?: boolean;
  animated?: boolean;
}

export function StarkHUD({
  children,
  className,
  showCorners = true,
  showScanlines = true,
  animated = true,
}: StarkHUDProps) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setInitialized(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        animated && "transition-all duration-500",
        !initialized && animated && "opacity-0 scale-95",
        initialized && animated && "opacity-100 scale-100",
        className,
      )}
    >
      {/* Основной контент */}
      <div className="relative z-10">{children}</div>

      {/* Убраны HUD углы */}

      {/* Убраны сканирующие линии */}

      {/* Энергетическое поле */}
      {animated && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-blue-400/5 pointer-events-none"></div>
      )}
    </div>
  );
}

interface DataStreamProps {
  direction?: "horizontal" | "vertical";
  speed?: "slow" | "medium" | "fast";
  color?: "cyan" | "blue" | "orange";
  className?: string;
}

export function DataStream({
  direction = "vertical",
  speed = "medium",
  color = "cyan",
  className,
}: DataStreamProps) {
  const colors = {
    cyan: "from-transparent via-cyan-400 to-transparent",
    blue: "from-transparent via-blue-400 to-transparent",
    orange: "from-transparent via-orange-400 to-transparent",
  };

  const speeds = {
    slow: "4s",
    medium: "3s",
    fast: "2s",
  };

  const isVertical = direction === "vertical";

  return (
    <div
      className={cn(
        "absolute pointer-events-none",
        isVertical ? "w-px h-32" : "w-32 h-px",
        className,
      )}
    >
      <div
        className={cn(
          "absolute",
          isVertical
            ? `w-full h-full bg-gradient-to-b ${colors[color]}`
            : `w-full h-full bg-gradient-to-r ${colors[color]}`,
          "animate-pulse opacity-80",
        )}
        style={{
          animationDuration: speeds[speed],
        }}
      ></div>
    </div>
  );
}

interface CircuitPatternProps {
  size?: "small" | "medium" | "large";
  animated?: boolean;
  className?: string;
}

export function CircuitPattern({
  size = "medium",
  animated = true,
  className,
}: CircuitPatternProps) {
  const sizes = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32",
  };

  return (
    <div
      className={cn(
        "absolute rounded",
        sizes[size],
        animated && "animate-pulse",
        className,
      )}
    >
      {/* Убраны линии и точки */}
    </div>
  );
}

interface HologramTextProps {
  children: React.ReactNode;
  className?: string;
  glitch?: boolean;
}

export function HologramText({
  children,
  className,
  glitch = false,
}: HologramTextProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent underline font-bold",
        )}
        style={{ paddingRight: "-2px" }}
      >
        {children}
      </div>
    </div>
  );
}
