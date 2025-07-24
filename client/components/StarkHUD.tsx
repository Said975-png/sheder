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
        "perspective-1000 transform-3d transition-all duration-500 group cursor-pointer",
        "hover:scale-105 hover:rotateX-12 hover:rotateY-12",
        "hover:shadow-[0_25px_50px_rgba(6,182,212,0.4),0_15px_30px_rgba(139,69,255,0.3)]",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-cyan-500/5 before:via-transparent before:to-purple-500/5 before:opacity-0 before:transition-opacity before:duration-500 group-hover:before:opacity-100",
        animated && "transition-all duration-500",
        !initialized && animated && "opacity-0 scale-95",
        initialized && animated && "opacity-100 scale-100",
        className,
      )}
    >
      {/* Основной контент */}
      <div className="relative z-10">{children}</div>

      {/* HUD углы */}
      {showCorners && (
        <>
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan-400 opacity-70"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-cyan-400 opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-cyan-400 opacity-70"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-cyan-400 opacity-70"></div>
        </>
      )}

      {/* Сканирующие линии */}
      {showScanlines && (
        <>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"></div>
          <div
            className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </>
      )}

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
        "absolute border border-cyan-400/20 rounded",
        sizes[size],
        animated && "animate-pulse",
        className,
      )}
    >
      <div className="absolute top-1/2 left-0 w-full h-px bg-cyan-400/30 transform -translate-y-1/2"></div>
      <div className="absolute top-0 left-1/2 w-px h-full bg-cyan-400/30 transform -translate-x-1/2"></div>
      <div className="absolute top-2 left-2 w-2 h-2 bg-cyan-400/50 rounded-full"></div>
      <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400/50 rounded-full"></div>
      <div className="absolute bottom-2 left-2 w-2 h-2 bg-cyan-400/50 rounded-full"></div>
      <div className="absolute bottom-2 right-2 w-2 h-2 bg-cyan-400/50 rounded-full"></div>
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
          "bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent",
        )}
      >
        {children}
      </div>
    </div>
  );
}
