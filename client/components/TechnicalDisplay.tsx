import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { StarkHUD, HologramText } from "@/components/StarkHUD";
import { PowerIndicator, GlitchText } from "@/components/StarkEffects";
import {
  Cpu,
  Activity,
  Zap,
  Shield,
  Eye,
  Target,
  Wifi,
  Database,
  Lock,
} from "lucide-react";

interface TechnicalDisplayProps {
  className?: string;
  compact?: boolean;
}

export default function TechnicalDisplay({
  className,
  compact = false,
}: TechnicalDisplayProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemLoad, setSystemLoad] = useState(75);
  const [networkStatus, setNetworkStatus] = useState("OPTIMAL");
  const [securityLevel, setSecurityLevel] = useState(99.9);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Симуляция изменения системных метрик
      setSystemLoad((prev) =>
        Math.max(60, Math.min(90, prev + (Math.random() - 0.5) * 5)),
      );
      setSecurityLevel((prev) =>
        Math.max(95, Math.min(100, prev + (Math.random() - 0.5) * 0.1)),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "optimal":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "critical":
        return "text-red-400";
      default:
        return "text-cyan-400";
    }
  };

  if (compact) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Компактный режим для навбара */}
        <div className="flex items-center space-x-4">
          <div className="text-xs font-mono">
            <span className="text-cyan-400">TIME:</span>
            <span className="text-white ml-2">{formatTime(currentTime)}</span>
          </div>
          <div className="text-xs font-mono">
            <span className="text-green-400">SYS:</span>
            <span className="text-white ml-2">{systemLoad.toFixed(0)}%</span>
          </div>
          <div className="text-xs font-mono">
            <span className="text-blue-400">SEC:</span>
            <span className="text-white ml-2">{securityLevel.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StarkHUD
      className={cn(
        "bg-black/90 backdrop-blur-lg border border-cyan-400/30 p-6 space-y-6",
        className,
      )}
      showCorners={true}
      showScanlines={true}
      animated={true}
    >
      {/* Заголовок */}
      <div className="text-center">
        <HologramText className="text-lg font-bold font-mono">
          TECHNICAL READOUT
        </HologramText>
        <div className="text-xs text-cyan-400 font-mono mt-1">
          Real-time System Analytics
        </div>
      </div>

      {/* Системное время и статус */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-300">SYSTEM TIME</span>
          </div>
          <div className="text-lg font-mono text-white font-bold">
            <GlitchText intensity="low">{formatTime(currentTime)}</GlitchText>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-xs font-mono text-cyan-300">NETWORK</span>
          </div>
          <div
            className={cn(
              "text-lg font-mono font-bold",
              getStatusColor(networkStatus),
            )}
          >
            {networkStatus}
          </div>
        </div>
      </div>

      {/* Метрики производительности */}
      <div className="space-y-3">
        <div className="text-xs font-mono text-cyan-300 uppercase tracking-wider">
          Performance Metrics
        </div>

        <PowerIndicator level={systemLoad} label="CPU LOAD" className="mb-2" />

        <PowerIndicator level={89} label="MEMORY" className="mb-2" />

        <PowerIndicator
          level={securityLevel}
          label="SECURITY"
          className="mb-2"
        />
      </div>

      {/* Статус системы */}
      <div className="border-t border-cyan-400/20 pt-4">
        <div className="text-xs font-mono text-cyan-300 mb-3 uppercase tracking-wider">
          System Status
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="flex justify-between">
            <span className="flex items-center">
              <Cpu className="w-3 h-3 mr-1 text-cyan-400" />
              Processor:
            </span>
            <span className="text-green-400">Online</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center">
              <Database className="w-3 h-3 mr-1 text-blue-400" />
              Database:
            </span>
            <span className="text-green-400">Active</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center">
              <Shield className="w-3 h-3 mr-1 text-cyan-400" />
              Firewall:
            </span>
            <span className="text-green-400">Enabled</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center">
              <Lock className="w-3 h-3 mr-1 text-yellow-400" />
              Encryption:
            </span>
            <span className="text-green-400">AES-256</span>
          </div>
        </div>
      </div>

      {/* Индикатор угроз */}
      <div className="border-t border-cyan-400/20 pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-red-400" />
            <span className="text-xs font-mono text-cyan-300">
              THREAT ANALYSIS
            </span>
          </div>
          <div className="text-xs font-mono text-green-400">SECURE</div>
        </div>

        <div className="bg-green-400/10 border border-green-400/30 rounded px-3 py-2">
          <div className="text-xs font-mono text-green-400">
            No active threats detected
          </div>
          <div className="text-xs text-green-300/60 mt-1">
            Last scan: {formatTime(currentTime)}
          </div>
        </div>
      </div>

      {/* Системные уведомления */}
      <div className="border-t border-cyan-400/20 pt-4">
        <div className="text-xs font-mono text-cyan-300 mb-2 uppercase tracking-wider">
          System Log
        </div>

        <div className="space-y-1 text-xs font-mono max-h-20 overflow-y-auto">
          <div className="text-cyan-400">
            [{formatTime(currentTime)}] System operational
          </div>
          <div className="text-green-400">
            [{formatTime(new Date(Date.now() - 5000))}] Security scan complete
          </div>
          <div className="text-blue-400">
            [{formatTime(new Date(Date.now() - 12000))}] Network connection
            stable
          </div>
        </div>
      </div>

      {/* Пульсирующий индикатор активности */}
      <div className="absolute bottom-2 right-2">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
      </div>
    </StarkHUD>
  );
}
