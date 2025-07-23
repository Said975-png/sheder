import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StarkHUD, HologramText } from "@/components/StarkHUD";
import {
  ArcReactor,
  PowerIndicator,
  GlitchText,
} from "@/components/StarkEffects";

import { Mic, MicOff, Volume2, Activity, Cpu, Eye, Zap, X } from "lucide-react";

interface VoicePanelProps {
  onAddBasicPlan: () => void;
  onAddProPlan: () => void;
  onAddMaxPlan: () => void;
  onClose: () => void;
  onStopListening: () => void;
  isListening: boolean;
  transcript?: string;
}

export default function VoicePanel({
  onAddBasicPlan,
  onAddProPlan,
  onAddMaxPlan,
  onClose,
  onStopListening,
  isListening,
  transcript,
}: VoicePanelProps) {
  const lastTranscriptRef = useRef("");
  const transcriptTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Эффект для автоматической очистки застрявшего транскрипта
  useEffect(() => {
    if (transcript && transcript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = transcript;

      // Очищаем предыдущий таймер
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current);
      }

      // Устанавливаем новый таймер для очистки через 3 секунды
      transcriptTimeoutRef.current = setTimeout(() => {
        if (lastTranscriptRef.current === transcript) {
          lastTranscriptRef.current = "";
          // Здесь мы можем вызвать callback для очистки, но в данном случае
          // полагаемся на логику в родительском компоненте
        }
      }, 3000);
    }

    return () => {
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current);
      }
    };
  }, [transcript]);
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <StarkHUD
        className="bg-black/95 backdrop-blur-lg border border-cyan-400/50 rounded-lg p-6 stark-glow"
        showCorners={true}
        showScanlines={true}
        animated={true}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <ArcReactor size="medium" pulsing={isListening} />
            <div>
              <HologramText className="text-2xl font-bold" glitch>
                J.A.R.V.I.S
              </HologramText>
              <div className="text-sm text-cyan-300 font-mono">
                Voice Interface Active
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={() => {
                onStopListening();
                onClose();
              }}
              className="w-10 h-10 rounded-full p-0 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 transition-all duration-300"
              title="Отключить микрофон"
            >
              <MicOff className="w-5 h-5 text-red-400" />
            </Button>
            <Button
              onClick={() => {
                onClose();
              }}
              className="w-10 h-10 rounded-full p-0 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 transition-all duration-300"
              title="Скрыть панель"
            >
              <X className="w-5 h-5 text-cyan-400" />
            </Button>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-300">STATUS</span>
            </div>
            <div
              className={cn(
                "text-sm font-bold font-mono",
                isListening
                  ? "text-green-400 animate-pulse"
                  : "text-yellow-400",
              )}
            >
              {isListening ? (
                <GlitchText intensity="low">LISTENING</GlitchText>
              ) : (
                "STANDBY"
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-300">AUDIO</span>
            </div>
            <div className="text-sm font-mono text-white">
              {isListening ? "ACTIVE" : "INACTIVE"}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-300">NEURAL</span>
            </div>
            <div className="text-sm font-mono text-cyan-400">ONLINE</div>
          </div>
        </div>

        {/* Power Indicators */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <PowerIndicator level={95} label="ARC REACTOR" />
          <PowerIndicator level={88} label="VOICE PROC" />
          <PowerIndicator level={92} label="NEURAL NET" />
        </div>

        {/* Voice Control Area */}
        <div className="border-t border-cyan-400/20 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Mic className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-mono text-cyan-300">
                VOICE COMMAND INTERFACE
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {isListening && (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                  <div
                    className="w-2 h-2 bg-green-400 rounded-full animate-ping"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-green-400 rounded-full animate-ping"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {/* Voice Control Info */}
          <div className="flex justify-center mb-6">
            <div className="text-center">
              <div className="text-lg font-mono text-cyan-400 mb-2">
                <GlitchText>Микрофон активен</GlitchText>
              </div>
              <div className="text-sm text-white/60 font-mono">
                Говорите команды для управления системой
              </div>
            </div>
          </div>

          {/* Transcript Display */}
          {transcript && transcript.trim() !== "" && (
            <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono text-cyan-300">
                  TRANSCRIPT
                </span>
                {!isListening && (
                  <span className="text-xs text-yellow-400">(PROCESSED)</span>
                )}
              </div>
              <div className="text-white font-mono text-sm">
                <GlitchText intensity="low">{transcript}</GlitchText>
              </div>
            </div>
          )}

          {/* Command Help */}
          <div className="mt-4 p-4 bg-gray-900/50 border border-gray-600/30 rounded-lg">
            <div className="text-xs font-mono text-gray-400 mb-2">
              AVAILABLE COMMANDS:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-300">
              <div>"Добавить базовый план"</div>
              <div>"Добавить про план"</div>
              <div>"Добавить макс план"</div>
              <div>"Проведи диагностику системы"</div>
              <div>"Джарвис полная активация"</div>
              <div>"Джарвис верни меня обратно"</div>
              <div>"Джарвис давай продолжим"</div>
              <div>"Верно"</div>
              <div>"Отключись" / "Выключись"</div>
              <div>"Привет Джарвис"</div>
              <div>"Как дела?"</div>
              <div>"Спасибо"</div>
            </div>
          </div>
        </div>

        {/* Animated scan lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Glowing corners */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-400/60"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-cyan-400/60"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyan-400/60"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-400/60"></div>
      </StarkHUD>
    </div>
  );
}
