import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";

interface VoiceMicrophoneProps {
  onCommand?: (command: string) => void;
  onTranscript?: (text: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  floating?: boolean;
}

export default function VoiceMicrophone({
  onCommand,
  onTranscript,
  className,
  size = "md",
  floating = true,
}: VoiceMicrophoneProps) {
  const { isListening, transcript, isSupported, toggleListening } = useVoiceRecognition({
    onTranscript: (text) => {
      console.log("📝 Получен транскрипт:", text);
      onTranscript?.(text);
    },
    onCommand: (command) => {
      console.log("🎯 Получена команда:", command);
      onCommand?.(command);
    },
  });

  const handleCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Простые команды для демонстрации
    if (lowerCommand.includes("привет") || lowerCommand.includes("здравствуй")) {
      console.log("👋 Команда приветствия получена");
    } else if (lowerCommand.includes("спасибо") || lowerCommand.includes("благодарю")) {
      console.log("🙏 Команда благодарности получена");
    } else if (lowerCommand.includes("помощь") || lowerCommand.includes("help")) {
      console.log("❓ Запрос помощи получен");
    }
    
    // Передаем команду выше
    onCommand?.(command);
  };

  if (!isSupported) {
    return (
      <div className={cn("text-sm text-gray-500", className)}>
        Распознавание речи не поддерживается в этом браузере
      </div>
    );
  }

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7"
  };

  if (floating) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <div className="flex flex-col items-center gap-3">
          {/* Транскрипт */}
          {transcript && (
            <div className="bg-slate-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm max-w-xs border border-slate-700/50 shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Volume2 className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-400 font-medium">Распознано:</span>
              </div>
              <div className="text-white/90">{transcript}</div>
            </div>
          )}
          
          {/* Кнопка микрофона */}
          <Button
            onClick={toggleListening}
            size="lg"
            className={cn(
              sizeClasses[size],
              "rounded-full shadow-lg transition-all duration-200 border-2",
              isListening
                ? "bg-red-500 hover:bg-red-600 text-white border-red-400 animate-pulse shadow-red-500/30"
                : "bg-blue-600 hover:bg-blue-700 text-white border-blue-400 shadow-blue-500/30"
            )}
          >
            {isListening ? (
              <MicOff className={iconSizes[size]} />
            ) : (
              <Mic className={iconSizes[size]} />
            )}
          </Button>
          
          {/* Статус */}
          <div className="text-xs text-center">
            {isListening ? (
              <div className="flex items-center gap-1 text-red-400">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span>Слушаю...</span>
              </div>
            ) : (
              <div className="text-slate-400">Нажмите для записи</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Встроенный режим
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Транскрипт (встроенный) */}
      {transcript && (
        <div className="flex-1 bg-slate-800/50 border border-slate-600/30 rounded-lg px-3 py-2 text-sm text-white/90 max-w-xs">
          {transcript}
        </div>
      )}
      
      {/* Кнопка микрофона (встроенная) */}
      <Button
        onClick={toggleListening}
        variant="outline"
        size="sm"
        className={cn(
          sizeClasses[size],
          "rounded-xl transition-all duration-200",
          isListening
            ? "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
            : "border-blue-400/30 bg-slate-800/50 text-blue-400 hover:bg-blue-500/20"
        )}
      >
        {isListening ? (
          <MicOff className={iconSizes[size]} />
        ) : (
          <Mic className={iconSizes[size]} />
        )}
      </Button>
    </div>
  );
}
