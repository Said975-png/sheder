import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [recognitionState, setRecognitionState] = useState<'idle' | 'starting' | 'listening' | 'stopping'>('idle');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastCommandRef = useRef<string>("");
  const isProcessingRef = useRef<boolean>(false);
  const shouldRestartRef = useRef<boolean>(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stateUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const navigate = useNavigate();
  const { getTotalItems, clearCart } = useCart();

  // Безопасная функция для обновления состояния прослушивания
  const updateListeningState = useCallback((listening: boolean, transcriptText: string = "") => {
    console.log("📱 Updating state:", { listening, transcriptText: transcriptText.slice(0, 50) });

    if (stateUpdateTimeoutRef.current) {
      clearTimeout(stateUpdateTimeoutRef.current);
    }

    stateUpdateTimeoutRef.current = setTimeout(() => {
      setTranscript(transcriptText);
      onListeningChange?.(listening, transcriptText);
    }, 100);
  }, [onListeningChange]);

  // Эффект для отслеживания состояния говорения
  useEffect(() => {
    // Сообщаем родительскому компоненту о состоянии говорения
    onListeningChange?.(isListening, transcript);
  }, [isSpeaking]); // Срабатывает при изменении состояния говорения

  // Инициализация Speech Recognition
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.error("Speech Recognition not supported");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    if (recognitionRef.current) {
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "ru-RU";
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        console.log("🎤 Recognition STARTED");
        setRecognitionState('listening');
      };

      recognitionRef.current.onresult = (event) => {
        if (isProcessingRef.current) {
          console.log("⏭️ Skipping result - processing command");
          return;
        }

        let finalTranscript = "";
        let interimTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript.trim();
          
          if (result.isFinal) {
            finalTranscript = text;
          } else {
            interimTranscript = text;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        
        if (currentText && currentText.length > 2 && currentText.length < 100) {
          updateListeningState(true, currentText);
          
          // Обрабатываем только финальные результаты
          if (finalTranscript && finalTranscript !== lastCommandRef.current) {
            console.log("🎯 Processing final command:", finalTranscript);
            lastCommandRef.current = finalTranscript;
            isProcessingRef.current = true;
            
            // Небольшая задержка для завершения фразы
            setTimeout(() => {
              processVoiceCommand(finalTranscript);
            }, 500);
          }
        }
      };

      recognitionRef.current.onend = () => {
        console.log("🎤 Recognition ENDED, shouldRestart:", shouldRestartRef.current, "isListening:", isListening);
        setRecognitionState('idle');
        
        // Автоматический перезапуск только если нужно
        if (shouldRestartRef.current && isListening && !isSpeaking) {
          console.log("🔄 Auto-restarting recognition");
          startRecognition();
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.log("❌ Recognition error:", event.error);
        setRecognitionState('idle');
        
        // Игнорируем некритические ошибки
        if (event.error === "no-speech" || event.error === "audio-capture") {
          return;
        }
        
        // Для серьезных ошибок - перезапускаем через 2 секунды
        if (shouldRestartRef.current && isListening) {
          setTimeout(() => {
            if (shouldRestartRef.current && isListening && !isSpeaking) {
              startRecognition();
            }
          }, 2000);
        }
      };
    }

    return () => {
      cleanup();
    };
  }, []);

  // Функция для запуска распознавания
  const startRecognition = useCallback(() => {
    if (!recognitionRef.current || recognitionState === 'starting' || recognitionState === 'listening') {
      console.log("❌ Cannot start recognition:", { hasRecognition: !!recognitionRef.current, state: recognitionState });
      return;
    }

    if (isSpeaking) {
      console.log("🔊 Cannot start - currently speaking");
      return;
    }

    try {
      console.log("🎤 Starting recognition...");
      setRecognitionState('starting');
      shouldRestartRef.current = true;
      recognitionRef.current.start();
    } catch (error) {
      console.log("⚠️ Recognition start failed:", error);
      setRecognitionState('idle');
      
      // Попробуем еще раз через секунду
      setTimeout(() => {
        if (shouldRestartRef.current && isListening && !isSpeaking) {
          startRecognition();
        }
      }, 1000);
    }
  }, [recognitionState, isSpeaking, isListening]);

  // Функция для остановки распознавания
  const stopRecognition = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      console.log("🛑 Stopping recognition...");
      shouldRestartRef.current = false;
      setRecognitionState('stopping');
      recognitionRef.current.stop();
    } catch (error) {
      console.log("Error stopping recognition:", error);
      setRecognitionState('idle');
    }
  }, []);

  // Полная очистка
  const cleanup = useCallback(() => {
    console.log("🧹 Full cleanup");
    shouldRestartRef.current = false;
    isProcessingRef.current = false;
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    if (stateUpdateTimeoutRef.current) {
      clearTimeout(stateUpdateTimeoutRef.current);
      stateUpdateTimeoutRef.current = null;
    }
    
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    
    stopRecognition();
  }, [stopRecognition]);

  // Эффект для принудительной остановки
  useEffect(() => {
    if (forceStop && isListening) {
      console.log("🛑 Force stop triggered");
      toggleListening();
    }
  }, [forceStop]);

  // Функция сброса состояния после команды
  const resetCommandState = useCallback(() => {
    console.log("🔄 Resetting command state");
    isProcessingRef.current = false;
    lastCommandRef.current = "";
    updateListeningState(isListening, "");
    
    // Если должны слушать - перезапускаем через секунду
    if (shouldRestartRef.current && isListening && !isSpeaking) {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      
      restartTimeoutRef.current = setTimeout(() => {
        if (shouldRestartRef.current && isListening && !isSpeaking && recognitionState === 'idle') {
          console.log("🔄 Delayed restart after command");
          startRecognition();
        }
      }, 1500);
    }
  }, [isListening, isSpeaking, recognitionState, startRecognition, updateListeningState]);

  // Функция воспроизведения аудио
  const playAudio = useCallback((url: string, onComplete?: () => void) => {
    if (isSpeaking) {
      console.log("🔊 Already speaking, ignoring audio request");
      return;
    }

    console.log("🔊 Starting audio playback");
    setIsSpeaking(true);
    stopRecognition();

    // Останавливаем предыдущее аудио
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    const audio = new Audio(url);
    currentAudioRef.current = audio;

    const audioCleanup = () => {
      console.log("🔊 Audio finished");
      setIsSpeaking(false);
      currentAudioRef.current = null;
      
      setTimeout(() => {
        resetCommandState();
        onComplete?.();
      }, 1000);
    };

    audio.onended = audioCleanup;
    audio.onerror = () => {
      console.error("🔊 Audio error");
      audioCleanup();
    };

    audio.play().catch((error) => {
      console.error("🔊 Failed to play audio:", error);
      audioCleanup();
    });
  }, [isSpeaking, stopRecognition, resetCommandState]);

  // Аудио функции
  const speakWelcomeBack = useCallback(() => {
    playAudio("https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fd8b2e931609e45c3ad40a718329bc1c4?alt=media&token=78714408-6862-47cc-a4ac-8f778b958265&apiKey=236158b44f8b45f680ab2467abfc361c");
  }, [playAudio]);

  const speakThankYou = useCallback(() => {
    playAudio("https://cdn.builder.io/o/assets%2F4b8ea25f0ef042cbac23e1ab53938a6b%2Fafb1b8a7fc8645a7ab1e8513e8c1faa7?alt=media&token=be057092-6988-45dd-94dc-90427146589d&apiKey=4b8ea25f0ef042cbac23e1ab53938a6b");
  }, [playAudio]);

  const speakAuthenticJarvis = useCallback(() => {
    playAudio("https://cdn.builder.io/o/assets%2Fddde4fe5b47946c2a3bbb80e3bca0073%2F54eb93b1452742b6a1cd87cc6104bb59?alt=media&token=fc948eba-bbcd-485c-b129-d5a0c25cfc74&apiKey=ddde4fe5b47946c2a3bbb80e3bca0073");
  }, [playAudio]);

  const speakShutdown = useCallback(() => {
    playAudio("https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fa7471f308f3b4a36a50440bf01707cdc?alt=media&token=9a246f92-9460-41f2-8125-eb0a7e936b47&apiKey=236158b44f8b45f680ab2467abfc361c", () => {
      // После команды отк��ючения - полностью останавливаем
      if (isListening) {
        toggleListening();
      }
    });
  }, [playAudio, isListening]);

  const speakSystemsOperational = useCallback(async () => {
    try {
      const response = await fetch("/api/elevenlabs-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Все системы функционируют нормально",
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
  }, [playAudio, resetCommandState]);

  // Обработка команд
  const processVoiceCommand = useCallback((command: string) => {
    console.log("🔧 Processing command:", command);
    const cmd = command.toLowerCase().trim();

    // Очищаем транскрипт через секунду
    setTimeout(() => {
      updateListeningState(isListening, "");
    }, 1000);

    // Команды отключения (высший приоритет)
    if (cmd.includes("отключись") || cmd.includes("выключись") || cmd.includes("стоп джарвис")) {
      speakShutdown();
      return;
    }

    // Команда "я вернулся"
    if (cmd.includes("я вернулся") || cmd.includes("джарвис я здесь") || cmd.includes("джарвис я вернулся")) {
      speakWelcomeBack();
      return;
    }

    // Команды "как дела"
    if (cmd.includes("как дела") || cmd.includes("how are you") || cmd.includes("джарвис как дела")) {
      speakSystemsOperational();
      return;
    }

    // Команды приветствия (только специфичные)
    if ((cmd.includes("привет") && (cmd.includes("джарвис") || cmd.length <= 15)) || 
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

    // Команды планов
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

    // Неизвестная команда
    console.log("❓ Unknown command:", cmd);
    resetCommandState();
  }, [isListening, updateListeningState, speakShutdown, speakWelcomeBack, speakSystemsOperational, speakAuthenticJarvis, speakThankYou, navigate, resetCommandState, onAddBasicPlan, onAddProPlan, onAddMaxPlan]);

  // Переключение прослушивания
  const toggleListening = useCallback(() => {
    if (isListening) {
      console.log("🛑 Stopping listening");
      setIsListening(false);
      cleanup();
      updateListeningState(false, "");
    } else {
      console.log("🎤 Starting listening");
      setIsListening(true);
      lastCommandRef.current = "";
      isProcessingRef.current = false;
      updateListeningState(true, "");
      startRecognition();
    }
  }, [isListening, cleanup, updateListeningState, startRecognition]);

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
