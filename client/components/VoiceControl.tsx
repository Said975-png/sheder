import React, { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceControlProps {
  onCommand?: (command: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  floating?: boolean;
}

export default function VoiceControl({
  onCommand,
  className,
  size = "lg",
  floating = true,
}: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isProcessingRef = useRef(false);

  // Проверка поддержки браузером
  useEffect(() => {
    const supported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    setIsSupported(supported);
    
    if (supported) {
      // Автоматический запуск при загрузке
      startListening();
    }
  }, []);

  // Функция воспроизведения аудио с автоматическим возобновлением микрофона
  const playAudioResponse = useCallback((audioUrl: string, callback?: () => void) => {
    console.log("🔊 Начинаем воспроизведение аудио ответа");

    // Останавливаем микрофон
    if (isListening) {
      stopListening();
    }

    // Останавливаем предыдущее аудио если есть
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsPlayingAudio(true);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      console.log("✅ Аудио завершено");
      setIsPlayingAudio(false);
      audioRef.current = null;

      // Выполняем callback если есть
      if (callback) {
        try {
          callback();
          console.log("🔄 Callback выполнен");
        } catch (error) {
          console.error("❌ Ошибка в callback:", error);
        }
      }

      // Принудительно включаем микрофон снова
      isProcessingRef.current = false;
      console.log("🎤 Принудительно включаем микрофон...");

      setTimeout(() => {
        if (!isListening && !isPlayingAudio) {
          startListening();
          console.log("✅ Микрофон автоматически включен после ответа");
        }
      }, 300);
    };

    audio.onerror = () => {
      console.error("❌ Ошибка воспроизведения аудио");
      setIsPlayingAudio(false);
      audioRef.current = null;
      isProcessingRef.current = false;

      // Включаем микрофон даже при ошибке
      setTimeout(() => {
        if (!isListening && !isPlayingAudio) {
          startListening();
          console.log("✅ Микрофон включен после ошибки аудио");
        }
      }, 300);
    };

    audio.play().catch((error) => {
      console.error("❌ Не удалось воспроизвести аудио:", error);
      setIsPlayingAudio(false);
      audioRef.current = null;
      isProcessingRef.current = false;

      // Включаем микрофон при неудаче
      setTimeout(() => {
        if (!isListening && !isPlayingAudio) {
          startListening();
          console.log("✅ Микрофон включен после неудачи воспроизведения");
        }
      }, 300);
    });
  }, [isListening, isPlayingAudio, startListening, stopListening]);

  // Инициализация распознавания речи
  const initializeRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false; // Одна команда за раз
    recognition.interimResults = true;
    recognition.lang = "ru-RU";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("🎤 Микрофон включен - жду команду");
      setIsListening(true);
      isProcessingRef.current = false;
    };

    recognition.onresult = (event) => {
      if (isProcessingRef.current) return;

      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = (finalTranscript + interimTranscript).trim();
      setTranscript(currentTranscript);

      // Обрабатываем финальную команду
      if (finalTranscript.trim() && !isProcessingRef.current) {
        isProcessingRef.current = true;
        const command = finalTranscript.trim();
        
        console.log("✅ Команда получена:", command);
        setTranscript("");
        
        // Останавливаем микрофон сразу после получения команды
        stopListening();
        
        // Обрабатываем команду
        handleVoiceCommand(command);
        onCommand?.(command);
      }
    };

    recognition.onerror = (event) => {
      console.log("❌ Ошибка распознавания:", event.error);
      setIsListening(false);
      isProcessingRef.current = false;
      
      // Перезапускаем при ошибке (кроме отказа в доступе)
      if (event.error !== "not-allowed" && event.error !== "service-not-allowed") {
        setTimeout(() => {
          startListening();
        }, 1000);
      }
    };

    recognition.onend = () => {
      console.log("🔄 Распознавание завершено");
      setIsListening(false);
      
      // Если не обрабатываем команду и не играет аудио, перезапускаем микрофон
      if (!isProcessingRef.current && !isPlayingAudio) {
        setTimeout(() => {
          startListening();
        }, 500);
      }
    };

    return recognition;
  }, [isSupported, isPlayingAudio]);

  // Запуск прослушивания
  const startListening = useCallback(() => {
    if (!isSupported || isListening || isPlayingAudio) return;

    try {
      if (!recognitionRef.current) {
        recognitionRef.current = initializeRecognition();
      }

      if (recognitionRef.current) {
        isProcessingRef.current = false;
        setTranscript("");
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error("❌ Не удалось запу��тить распознавание:", error);
      setIsListening(false);
    }
  }, [isSupported, isListening, isPlayingAudio, initializeRecognition]);

  // Остановка прослушивания
  const stopListening = useCallback(() => {
    setIsListening(false);
    setTranscript("");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("ℹ️ Ошибка остановки:", error);
      }
    }
  }, []);

  // Обработка голосовых команд
  const handleVoiceCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase().trim();
    console.log("🔍 Обрабатываем команду:", lowerCommand);

    // Команда "Джарвис ты тут"
    if (lowerCommand.includes("джарвис ты тут") || lowerCommand.includes("jarvis ты тут")) {
      playAudioResponse(
        "https://cdn.builder.io/o/assets%2Fe61c233aecf6402a8a9db34e2dc8f046%2F88f169fa15c74679b0cef82d12ee5f8d?alt=media&token=287c51bf-45be-420b-bd4f-8bdcb60d393c&apiKey=e61c233aecf6402a8a9db34e2dc8f046"
      );
      return;
    }

    // Команда "Джарвис смени модель"
    if (lowerCommand.includes("джарвис ��мени модель") || lowerCommand.includes("jarvis смени модель")) {
      playAudioResponse(
        "https://cdn.builder.io/o/assets%2Fe61c233aecf6402a8a9db34e2dc8f046%2F91df3aea397c4fbba9b49e597b4e2cb6?alt=media&token=522412d9-5f3a-454f-851c-dd4228a39931&apiKey=e61c233aecf6402a8a9db34e2dc8f046",
        () => {
          // Смена модели после аудио
          const event = new CustomEvent("changeModel", {
            detail: { 
              newModelUrl: "https://cdn.builder.io/o/assets%2Fe61c233aecf6402a8a9db34e2dc8f046%2F1357ace3fa8347cfa6f565692cad1fb7?alt=media&token=ebe4c351-faec-46fe-9b11-d9c4e4881670&apiKey=e61c233aecf6402a8a9db34e2dc8f046"
            },
          });
          window.dispatchEvent(event);
        }
      );
      return;
    }

    // Команда "верни модель"
    if (lowerCommand.includes("верни модель")) {
      playAudioResponse(
        "https://cdn.builder.io/o/assets%2Fe61c233aecf6402a8a9db34e2dc8f046%2F2562e9998e1d4afc90ded9608258444e?alt=media&token=1786dd2e-6e68-4c76-93fe-77066a4a2ecf&apiKey=e61c233aecf6402a8a9db34e2dc8f046",
        () => {
          // Возврат к оригинальной модели
          const event = new CustomEvent("changeModel", {
            detail: { 
              newModelUrl: "https://cdn.builder.io/o/assets%2F4349887fbc264ef3847731359e547c4f%2F14cdeb74660b46e6b8c349fa5339f8ae?alt=media&token=fa99e259-7582-4df0-9a1e-b9bf6cb20289&apiKey=4349887fbc264ef3847731359e547c4f"
            },
          });
          window.dispatchEvent(event);
        }
      );
      return;
    }

    // Команда "спасибо"
    if (lowerCommand.includes("спасибо")) {
      playAudioResponse(
        "https://cdn.builder.io/o/assets%2Fe61c233aecf6402a8a9db34e2dc8f046%2Fec5bfbae691b41d9b374b39e75694179?alt=media&token=75301093-1e6e-469a-a492-3105aee95cc9&apiKey=e61c233aecf6402a8a9db34e2dc8f046"
      );
      return;
    }

    // Отправка в чат для обработки ИИ
    if (lowerCommand.includes("пятница")) {
      // Здесь можно отправить команду в чат с Пятницей
      console.log("💬 Отправляем команду в чат:", command);
      
      // Простой аудио ответ
      playAudioResponse(
        "https://cdn.builder.io/o/assets%2Fe61c233aecf6402a8a9db34e2dc8f046%2F88f169fa15c74679b0cef82d12ee5f8d?alt=media&token=287c51bf-45be-420b-bd4f-8bdcb60d393c&apiKey=e61c233aecf6402a8a9db34e2dc8f046"
      );
      return;
    }

    // Для других команд просто включаем микрофон обратно
    console.log("ℹ️ Неизвестная команда, перезапускаем микрофон");
    setTimeout(() => {
      startListening();
    }, 500);
  }, [playAudioResponse, startListening]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log("ℹ️ Ошибка очистки:", error);
        }
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <div className={cn("text-sm text-gray-500", className)}>
        Распознавание речи не поддерживается
      </div>
    );
  }

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16", 
    lg: "w-20 h-20",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  if (floating) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <div className="flex flex-col items-center gap-4">
          {/* Транскрипт */}
          {transcript && (
            <div className="bg-black/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm max-w-xs border border-white/20 shadow-lg">
              <div className="text-white/90">{transcript}</div>
            </div>
          )}

          {/* Главная кнопка */}
          <Button
            onClick={() => {
              if (isListening) {
                stopListening();
              } else if (!isPlayingAudio) {
                startListening();
              }
            }}
            className={cn(
              sizeClasses[size],
              "rounded-full shadow-2xl transition-all duration-300 border-2 relative overflow-hidden",
              isPlayingAudio
                ? "bg-green-500 hover:bg-green-600 text-white border-green-400 shadow-green-500/50"
                : isListening
                  ? "bg-red-500 hover:bg-red-600 text-white border-red-400 animate-pulse shadow-red-500/50"
                  : "bg-blue-600 hover:bg-blue-700 text-white border-blue-400 shadow-blue-500/50",
            )}
          >
            {/* Анимированный фон */}
            {isListening && (
              <div className="absolute inset-0 bg-red-400/20 animate-ping rounded-full" />
            )}
            
            {isPlayingAudio ? (
              <Volume2 className={iconSizes[size]} />
            ) : isListening ? (
              <MicOff className={iconSizes[size]} />
            ) : (
              <Mic className={iconSizes[size]} />
            )}
          </Button>

          {/* Статус */}
          <div className="text-xs text-center font-medium">
            {isPlayingAudio ? (
              <div className="flex items-center gap-2 text-green-400">
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span>Джарвис отвечает...</span>
              </div>
            ) : isListening ? (
              <div className="flex items-center gap-2 text-red-400">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span>Слушаю команду...</span>
              </div>
            ) : (
              <div className="text-white/60">Готов к команде</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Встроенная версия
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Button
        onClick={() => {
          if (isListening) {
            stopListening();
          } else if (!isPlayingAudio) {
            startListening();
          }
        }}
        variant="outline"
        className={cn(
          "w-12 h-12 rounded-full transition-all duration-200",
          isPlayingAudio
            ? "bg-green-500/20 border-green-500/50 text-green-400"
            : isListening
              ? "bg-red-500/20 border-red-500/50 text-red-400 animate-pulse"
              : "bg-blue-500/20 border-blue-500/50 text-blue-400"
        )}
      >
        {isPlayingAudio ? (
          <Volume2 className="w-5 h-5" />
        ) : isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </Button>
      
      {transcript && (
        <div className="bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-white max-w-xs">
          {transcript}
        </div>
      )}
    </div>
  );
}
