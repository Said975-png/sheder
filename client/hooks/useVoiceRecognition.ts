import { useState, useRef, useCallback, useEffect } from "react";

interface UseVoiceRecognitionProps {
  onTranscript?: (text: string) => void;
  onCommand?: (command: string) => void;
  lang?: string;
}

export const useVoiceRecognition = ({
  onTranscript,
  onCommand,
  lang = "ru-RU"
}: UseVoiceRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isProcessingRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Проверка поддержки браузером
  useEffect(() => {
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsSupported(supported);
    
    if (!supported) {
      console.warn("Распознавание речи не поддерживается в этом браузере");
    }
  }, []);

  // Инициализация распознавания речи
  const initializeRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("🎤 Распознавание речи запущено");
      setIsListening(true);
      isProcessingRef.current = false;
    };

    recognition.onresult = (event) => {
      if (isProcessingRef.current) {
        console.log("⏸️ Пропускаем результат - команда уже обрабатывается");
        return;
      }

      let finalTranscript = "";
      let interimTranscript = "";

      // Обрабатываем результаты
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = (finalTranscript + interimTranscript).trim();
      
      if (currentTranscript) {
        setTranscript(currentTranscript);
        onTranscript?.(currentTranscript);
      }

      // Обрабатываем финальные результаты быстро
      if (finalTranscript.trim() && !isProcessingRef.current) {
        isProcessingRef.current = true;
        const command = finalTranscript.trim();
        
        console.log("✅ Обрабатываем команду:", command);
        
        // Сразу очищаем транскрипт для готовности к следующей команде
        setTranscript("");
        
        // Асинхронная обработка команды для минимальной задержки
        requestAnimationFrame(() => {
          onCommand?.(command);
          isProcessingRef.current = false;
          console.log("🔄 Готов к следующей команде");
        });
      }
    };

    recognition.onerror = (event) => {
      console.log("❌ Ошибка распознавания:", event.error);
      
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        console.error("🚫 Доступ к микрофону запрещен");
        setIsListening(false);
        isProcessingRef.current = false;
        return;
      }
      
      // Для других ошибок продолжаем работу
      isProcessingRef.current = false;
    };

    recognition.onend = () => {
      console.log("🔄 Распознавание завершилось");
      
      // Быстрый автоматический перезапуск если должны слушать
      if (isListening && !isProcessingRef.current) {
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        
        // Минимальная задержка для стабильности - используем requestAnimationFrame для оптимальной производительности
        requestAnimationFrame(() => {
          if (isListening && recognitionRef.current) {
            try {
              recognitionRef.current.start();
              console.log("🔄 Б��стрый перезапуск распознавания");
            } catch (error) {
              console.log("ℹ️ Ошибка перезапуска:", error);
            }
          }
        });
      }
    };

    return recognition;
  }, [isSupported, lang, onTranscript, onCommand, isListening]);

  // Запуск прослушивания
  const startListening = useCallback(() => {
    if (!isSupported) {
      console.warn("Распознавание речи не поддерживается");
      return;
    }

    if (isListening) {
      console.log("🎤 Уже слушаем");
      return;
    }

    try {
      if (!recognitionRef.current) {
        recognitionRef.current = initializeRecognition();
      }

      if (recognitionRef.current) {
        isProcessingRef.current = false;
        setTranscript("");
        recognitionRef.current.start();
        console.log("🎤 Начинаем слушать");
      }
    } catch (error) {
      console.error("❌ Не удалось запустить распознавание:", error);
      setIsListening(false);
    }
  }, [isSupported, initializeRecognition, isListening]);

  // Остановка прослушивания
  const stopListening = useCallback(() => {
    console.log("🛑 Останавливаем прослушивание");
    
    setIsListening(false);
    setTranscript("");
    isProcessingRef.current = false;
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("ℹ️ Ошибка остановки:", error);
      }
      recognitionRef.current = null;
    }
  }, []);

  // Переключение состояния
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

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
      
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
};
