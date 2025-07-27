import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { isListening, transcript, isSupported, toggleListening } = useVoiceRecognition({
    onTranscript: (text) => {
      console.log("📝 Получен транскрипт:", text);
      onTranscript?.(text);
    },
    onCommand: (command) => {
      console.log("🎯 Получена команда:", command);
      handleCommand(command);
      onCommand?.(command);
    },
  });

  // Функция воспроизведения аудио
  const playAudio = (audioUrl: string) => {
    if (isPlayingAudio) {
      console.log("⏸️ Аудио уже воспроизводится");
      return;
    }

    // Останавливаем предыдущее аудио если есть
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Останавливаем прослушивание на время воспроизведения аудио
    const wasListening = isListening;
    if (isListening) {
      toggleListening(); // Останавливаем микрофон
    }

    setIsPlayingAudio(true);
    console.log("🔊 Начинаем воспроизведение аудио, микрофон остановлен");

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      setIsPlayingAudio(false);
      audioRef.current = null;
      console.log("✅ Воспроизведение завершено");

      // Возобновляем прослушивание если оно было активно
      if (wasListening) {
        setTimeout(() => {
          toggleListening(); // Включаем микрофон обратно
          console.log("🎤 Микрофон возобновлен после аудио");
        }, 500);
      }
    };

    audio.onerror = () => {
      setIsPlayingAudio(false);
      audioRef.current = null;
      console.error("❌ Ошибка воспроизведения аудио");

      // Возобно��ляем прослушивание если была ошибка
      if (wasListening) {
        setTimeout(() => {
          toggleListening(); // Включаем микрофон обратно
          console.log("🎤 Микрофон возобновлен после ошибки аудио");
        }, 500);
      }
    };

    audio.play().catch((error) => {
      setIsPlayingAudio(false);
      audioRef.current = null;
      console.error("❌ Не удалось воспроизвести аудио:", error);

      // Возобновляем прослушивание если не удалось воспроизвести
      if (wasListening) {
        setTimeout(() => {
          toggleListening(); // Включаем микрофон обратно
          console.log("🎤 Микрофон возобновлен после неудачного воспроизведения");
        }, 500);
      }
    });
  };

  const handleCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();

    // Команда "Джарвис ты тут" - воспроизводим аудио ответ
    if (lowerCommand.includes("джарвис ты тут") || lowerCommand.includes("jarvis ты тут")) {
      console.log("🎯 Команд�� 'Джарвис ты тут' получена - воспроизводим аудио ответ");
      playAudio("https://cdn.builder.io/o/assets%2Fe61c233aecf6402a8a9db34e2dc8f046%2F88f169fa15c74679b0cef82d12ee5f8d?alt=media&token=287c51bf-45be-420b-bd4f-8bdcb60d393c&apiKey=e61c233aecf6402a8a9db34e2dc8f046");
      return;
    }

    // Простые команды для демонстрации
    if (lowerCommand.includes("привет") || lowerCommand.includes("здравствуй")) {
      console.log("👋 Команда приветствия получена");
    } else if (lowerCommand.includes("спасибо") || lowerCommand.includes("благодарю")) {
      console.log("🙏 Команда благодарности получена");
    } else if (lowerCommand.includes("помощь") || lowerCommand.includes("help")) {
      console.log("❓ Запрос помощи получен");
    }
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
            {isPlayingAudio ? (
              <div className="flex items-center gap-1 text-green-400">
                <Volume2 className="w-3 h-3 animate-pulse" />
                <span>Говорю...</span>
              </div>
            ) : isListening ? (
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

      {/* Статус аудио (встроенный) */}
      {isPlayingAudio && (
        <div className="flex items-center gap-1 text-green-400 text-xs">
          <Volume2 className="w-3 h-3 animate-pulse" />
          <span>Говорю...</span>
        </div>
      )}

      {/* Кнопка микрофона (встроенная) */}
      <Button
        onClick={toggleListening}
        variant="outline"
        size="sm"
        disabled={isPlayingAudio}
        className={cn(
          sizeClasses[size],
          "rounded-xl transition-all duration-200",
          isPlayingAudio
            ? "bg-green-500/20 border-green-500/50 text-green-400"
            : isListening
            ? "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
            : "border-blue-400/30 bg-slate-800/50 text-blue-400 hover:bg-blue-500/20"
        )}
      >
        {isPlayingAudio ? (
          <Volume2 className={iconSizes[size]} />
        ) : isListening ? (
          <MicOff className={iconSizes[size]} />
        ) : (
          <Mic className={iconSizes[size]} />
        )}
      </Button>
    </div>
  );
}
