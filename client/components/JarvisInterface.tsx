import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Volume2,
  Power,
  Cpu,
  Activity,
  Zap,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StarkHUD, HologramText } from "@/components/StarkHUD";
import {
  ArcReactor,
  PowerIndicator,
  GlitchText,
} from "@/components/StarkEffects";


interface JarvisInterfaceProps {
  onAddBasicPlan: () => void;
  onAddProPlan: () => void;
  onAddMaxPlan: () => void;
  inNavbar?: boolean;
  onListeningChange?: (isListening: boolean, transcript?: string) => void;
  forceStop?: boolean;
  onModelRotateStart?: () => void;
  onModelRotateStop?: () => void;
}

export default function JarvisInterface({
  onAddBasicPlan,
  onAddProPlan,
  onAddMaxPlan,
  inNavbar = false,
  onListeningChange,
  forceStop = false,
  onModelRotateStart,
  onModelRotateStop,
}: JarvisInterfaceProps) {
  const [isActive, setIsActive] = useState(false);
  const [systemStatus, setSystemStatus] = useState("STANDBY");
  const [powerLevel, setPowerLevel] = useState(85);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isActive) {
      setIsInitializing(true);
      setSystemStatus("INITIALIZING");

      setTimeout(() => {
        setSystemStatus("ONLINE");
        setIsInitializing(false);
      }, 2000);
    } else {
      setSystemStatus("STANDBY");
      setIsInitializing(false);
    }
  }, [isActive]);

  const statusColors = {
    STANDBY: "text-gray-400",
    INITIALIZING: "text-yellow-400 animate-pulse",
    ONLINE: "text-cyan-400",
    ERROR: "text-red-400",
  };

  if (inNavbar) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <StarkHUD
        className="bg-black/90 backdrop-blur-lg border border-cyan-400/30 rounded-lg p-4 min-w-80"
        showCorners={true}
        showScanlines={true}
        animated={true}
      >
        {/* Заголовок интерфейса */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <ArcReactor size="medium" pulsing={isActive} />
            <div>
              <HologramText className="text-lg font-bold">
                J.A.R.V.I.S
              </HologramText>
              <div className="text-xs text-cyan-300 font-mono">
                Just A Rather Very Intelligent System
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsActive(!isActive)}
            className={cn(
              "w-10 h-10 rounded-full p-0 transition-all duration-300",
              isActive
                ? "bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-400/50"
                : "bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50",
            )}
          >
            <Power
              className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-cyan-400" : "text-gray-400",
              )}
            />
          </Button>
        </div>

        {/* Статус системы */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-300">STATUS</span>
            </div>
            <div
              className={cn(
                "text-sm font-bold font-mono",
                statusColors[systemStatus as keyof typeof statusColors],
              )}
            >
              {isInitializing ? (
                <GlitchText intensity="medium">{systemStatus}</GlitchText>
              ) : (
                systemStatus
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-300">TIME</span>
            </div>
            <div className="text-sm font-mono text-white">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Индикаторы мощности */}
        <div className="space-y-3 mb-4">
          <PowerIndicator level={powerLevel} label="ARC REACTOR" />
          <PowerIndicator level={92} label="NEURAL NET" />
          <PowerIndicator level={78} label="VOICE PROC" />
        </div>

        {/* Голосовое управление */}
        <div className="border-t border-cyan-400/20 pt-4">
          <div className="flex items-center space-x-2 mb-3">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-300">
              VOICE CONTROL
            </span>
          </div>


        </div>

        {/* Системные сообщения */}
        <div className="mt-4 p-3 bg-cyan-400/5 border border-cyan-400/20 rounded">
          <div className="text-xs font-mono text-cyan-300 mb-1">SYSTEM LOG</div>
          <div className="text-xs text-gray-300 space-y-1">
            <div className="flex justify-between">
              <span>Arc Reactor:</span>
              <span className="text-cyan-400">Stable</span>
            </div>

            <div className="flex justify-between">
              <span>Neural Interface:</span>
              <span className="text-cyan-400">Online</span>
            </div>
          </div>
        </div>

        {/* Сканирующие линии */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </StarkHUD>
    </div>
  );
}
