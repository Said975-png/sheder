import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

interface VoiceControlProps {
  onAddBasicPlan: () => void;
  onAddProPlan: () => void;
  onAddMaxPlan: () => void;
  inNavbar?: boolean;
  onListeningChange?: (isListening: boolean, transcript?: string) => void;
  forceStop?: boolean;
}

export default function VoiceControl({
  onAddBasicPlan,
  onAddProPlan,
  onAddMaxPlan,
  inNavbar = false,
  onListeningChange,
  forceStop = false,
}: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastCommandRef = useRef<string>("");
  const processingCommandRef = useRef<boolean>(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const navigate = useNavigate();
  const { getTotalItems, clearCart } = useCart();

  // Инициализация Speech Recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "ru-RU";
        recognitionRef.current.maxAlternatives = 3;

        recognitionRef.current.onstart = () => {
          console.log("🎤 Recognition started");
        };

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = "";
          
          // Берем только последний результат
          const lastResult = event.results[event.results.length - 1];
          if (lastResult) {
            const text = lastResult[0].transcript.trim();
            
            if (lastResult.isFinal) {
              finalTranscript = text;
              console.log("🎯 Final transcript:", finalTranscript);
              
              // Обрабатываем команду только если она новая и мы не в процессе обработки
              if (finalTranscript && 
                  finalTranscript !== lastCommandRef.current && 
                  !processingCommandRef.current &&
                  !isSpeaking) {
                
                lastCommandRef.current = finalTranscript;
                processingCommandRef.current = true;
                setTranscript(finalTranscript);
                onListeningChange?.(true, finalTranscript);
                
                // Обрабатываем команду с небольшой задержкой
                setTimeout(() => {
                  processVoiceCommand(finalTranscript);
                }, 300);
              }
            } else {
              // Показываем промежуточный результат только если система свободна
              if (!processingCommandRef.current && !isSpeaking && text.length > 2) {
                setTranscript(text);
                onListeningChange?.(true, text);
              }
            }
          }
        };

        recognitionRef.current.onend = () => {
          console.log("🎤 Recognition ended, isListening:", isListening);
          
          // Перезапускаем только если должны слушать и не говорим
          if (isListening && !isSpeaking && !processingCommandRef.current) {
            console.log("🔄 Auto-restarting recognition");
            startRecognition();
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.log("❌ Recognition error:", event.error);
          
          // Игнорируем некритические ошибки
          if (event.error === "no-speech" || event.error === "audio-capture") {
            return;
          }
          
          // Для других ошибок - перезапускаем через секунду
          if (isListening && !isSpeaking) {
            setTimeout(() => {
              if (isListening && !isSpeaking) {
                startRecognition();
              }
            }, 1000);
          }
        };
      }
    }

    return () => {
      stopRecognition();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, []);

  // Принудительная остановка
  useEffect(() => {
    if (forceStop && isListening) {
      stopListening();
    }
  }, [forceStop]);

  // Функция для безопасного запуска распознавания
  const startRecognition = () => {
    if (recognitionRef.current && !isSpeaking) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.log("Recognition already running or unavailable");
      }
    }
  };

  // Функция для остановки распознавания
  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("Error stopping recognition");
      }
    }
  };

  // Функция для сброса состояния команды
  const resetCommandState = () => {
    processingCommandRef.current = false;
    lastCommandRef.current = "";
    setTranscript("");
    // Сообщаем родительскому компоненту о текущем состоянии
    if (onListeningChange) {
      onListeningChange(isListening, "");
    }
    
    // Пере��апускаем прослушивание если нужно
    if (isListening && !isSpeaking) {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      
      restartTimeoutRef.current = setTimeout(() => {
        if (isListening && !isSpeaking && !processingCommandRef.current) {
          console.log("🔄 Restarting recognition after command");
          startRecognition();
        }
      }, 1000);
    }
  };

  // Функция воспроизведения аудио
  const playAudio = (url: string, onComplete?: () => void) => {
    if (isSpeaking) return;

    setIsSpeaking(true);
    stopRecognition(); // Останавливаем распознавание на время аудио

    // Останавливаем предыдущее аудио
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    const audio = new Audio(url);
    currentAudioRef.current = audio;

    const cleanup = () => {
      setIsSpeaking(false);
      currentAudioRef.current = null;
      
      // Сбрасываем состояние команды
      setTimeout(() => {
        resetCommandState();
        onComplete?.();
      }, 500);
    };

    audio.onended = cleanup;
    audio.onerror = () => {
      console.error("Audio playback error");
      cleanup();
    };

    audio.play().catch((error) => {
      console.error("Failed to play audio:", error);
      cleanup();
    });
  };

  // Основные голосовые функции
  const speakWelcomeBack = () => {
    playAudio("https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fd8b2e931609e45c3ad40a718329bc1c4?alt=media&token=78714408-6862-47cc-a4ac-8f778b958265&apiKey=236158b44f8b45f680ab2467abfc361c");
  };

  const speakThankYou = () => {
    playAudio("https://cdn.builder.io/o/assets%2F4b8ea25f0ef042cbac23e1ab53938a6b%2Fafb1b8a7fc8645a7ab1e8513e8c1faa7?alt=media&token=be057092-6988-45dd-94dc-90427146589d&apiKey=4b8ea25f0ef042cbac23e1ab53938a6b");
  };

  const speakAuthenticJarvis = () => {
    playAudio("https://cdn.builder.io/o/assets%2Fddde4fe5b47946c2a3bbb80e3bca0073%2F54eb93b1452742b6a1cd87cc6104bb59?alt=media&token=fc948eba-bbcd-485c-b129-d5a0c25cfc74&apiKey=ddde4fe5b47946c2a3bbb80e3bca0073");
  };

  const speakShutdown = () => {
    playAudio("https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fa7471f308f3b4a36a50440bf01707cdc?alt=media&token=9a246f92-9460-41f2-8125-eb0a7e936b47&apiKey=236158b44f8b45f680ab2467abfc361c", () => {
      // После команды откл��чения - полностью останавливаем
      stopListening();
    });
  };

  const speakSystemsOperational = async () => {
    try {
      const response = await fetch("/api/elevenlabs-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Все систем�� функционируют нормально",
          voice_id: "YyXZ45ZTmrPak6Ecz0mK",
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        playAudio(audioUrl, () => {
          URL.revokeObjectURL(audioUrl);
        });
      } else {
        console.log("Джарвис: Все системы функционируют нормально");
        resetCommandState();
      }
    } catch (error) {
      console.error("ElevenLabs TTS error:", error);
      console.log("Джарвис: Все системы функционируют нормально");
      resetCommandState();
    }
  };

  // Обработка голосовых команд
  const processVoiceCommand = (command: string) => {
    console.log("🔧 Processing command:", command);
    const cmd = command.toLowerCase().trim();

    // Очищаем отображение транскрипта, но не сбрасываем состояние панели
    setTimeout(() => {
      setTranscript("");
      if (onListeningChange) {
        onListeningChange(isListening, ""); // Передаем текущее состояние без изменений
      }
    }, 1000);

    // Команды отключения (высший приоритет)
    if (cmd.includes("отключись") || cmd.includes("выключись") || cmd.includes("стоп джарвис")) {
      speakShutdown();
      return;
    }

    // Команда "я вернулся" (проверяем перед приветствием)
    if (cmd.includes("я вернулся") || cmd.includes("джарвис я здесь") || cmd.includes("джарвис я вернулся")) {
      speakWelcomeBack();
      return;
    }

    // Команды "как дела" (проверяем перед приветствием)
    if (cmd.includes("как дела") || cmd.includes("how are you") || cmd.includes("джарвис как дела")) {
      speakSystemsOperational();
      return;
    }

    // Команды приветствия (только специфичные)
    if ((cmd.includes("пр��вет") && (cmd.includes("джарвис") || cmd.length <= 15)) ||
        (cmd.includes("hello") && (cmd.includes("jarvis") || cmd.length <= 15)) ||
        (cmd.includes("здравствуй") && (cmd.includes("джарвис") || cmd.length <= 20))) {
      speakAuthenticJarvis();
      return;
    }

    // Команды благодарности
    if (cmd.includes("спасибо") || cmd.includes("благодарю") || cmd.includes("thank you") || cmd.includes("thanks")) {
      speakThankYou();
      return;
    }

    // Навигационные команды
    if (cmd.includes("домой") || cmd.includes("главная") || cmd.includes("на главную")) {
      navigate("/");
      resetCommandState();
      return;
    }

    if (cmd.includes("войти") || cmd.includes("логин") || cmd.includes("вход")) {
      navigate("/login");
      resetCommandState();
      return;
    }

    if (cmd.includes("регистрация") || cmd.includes("зарегистрироваться")) {
      navigate("/signup");
      resetCommandState();
      return;
    }

    if (cmd.includes("профиль") || cmd.includes("личный кабинет")) {
      navigate("/profile");
      resetCommandState();
      return;
    }

    // Команды планов (более специфичные)
    if (cmd.includes("базовый план") || (cmd.includes("добавить") && cmd.includes("базовый"))) {
      onAddBasicPlan();
      resetCommandState();
      return;
    }

    if (cmd.includes("про план") || (cmd.includes("добавить") && cmd.includes("про"))) {
      onAddProPlan();
      resetCommandState();
      return;
    }

    if (cmd.includes("макс план") || cmd.includes("максимальный план") ||
        (cmd.includes("добавить") && cmd.includes("макс"))) {
      onAddMaxPlan();
      resetCommandState();
      return;
    }

    // Команды прокрутки
    if (cmd.includes("прокрутить вниз") || cmd.includes("скролл вниз") || cmd.includes("вниз")) {
      window.scrollBy(0, 500);
      resetCommandState();
      return;
    }

    if (cmd.includes("прокрутить вверх") || cmd.includes("скролл вверх") || cmd.includes("вверх")) {
      window.scrollBy(0, -500);
      resetCommandState();
      return;
    }

    if (cmd.includes("наверх") || cmd.includes("в начало") || cmd.includes("в самый верх")) {
      window.scrollTo(0, 0);
      resetCommandState();
      return;
    }

    // Если команда не распознана - просто сбрасываем состояние без действий
    console.log("❓ Unknown command, resetting state:", cmd);
    resetCommandState();
  };

  // Переключение прослушиван��я
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (!isListening && !isSpeaking) {
      setIsListening(true);
      setTranscript("");
      lastCommandRef.current = "";
      processingCommandRef.current = false;
      onListeningChange?.(true, "");
      startRecognition();
    }
  };

  const stopListening = () => {
    if (isListening) {
      setIsListening(false);
      setTranscript("");
      lastCommandRef.current = "";
      processingCommandRef.current = false;
      onListeningChange?.(false, "");
      stopRecognition();
      
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
    }
  };

  return (
    <div className={inNavbar ? "relative" : "fixed bottom-6 right-6 z-50"}>
      <div className={inNavbar ? "flex items-center space-x-2" : "flex flex-col items-end space-y-2"}>
        
        {/* Transcript display */}
        {transcript && !inNavbar && (
          <div className="max-w-xs p-3 bg-black/80 backdrop-blur-lg border border-purple-500/30 rounded-lg text-white text-sm">
            {transcript}
          </div>
        )}

        {/* Voice control button */}
        <Button
          onClick={toggleListening}
          className={`w-14 h-14 rounded-full p-0 transition-all duration-300 bg-transparent hover:bg-white/10 ${
            isListening ? "animate-pulse" : ""
          } ${isSpeaking ? "ring-4 ring-blue-400/50" : ""}`}
          disabled={isSpeaking}
        >
          {isSpeaking ? (
            <Volume2 className="w-6 h-6 text-white animate-pulse" />
          ) : isListening ? (
            <Mic className="w-6 h-6 text-white" />
          ) : (
            <MicOff className="w-6 h-6 text-white" />
          )}
        </Button>

        {/* Status indicator */}
        <div className="text-xs text-white/60 text-center">
          {isSpeaking ? "Говорю..." : isListening ? "Слушаю..." : "ДЖАРВИС"}
        </div>
      </div>

      {/* Pulse effect when listening */}
      {isListening && (
        <div className="absolute top-0 right-0 w-14 h-14 rounded-full bg-purple-500/30 animate-ping"></div>
      )}
    </div>
  );
}
