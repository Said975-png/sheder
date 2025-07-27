import { useState, useRef, useCallback, useEffect } from "react";

interface UseVoiceRecognitionProps {
  onTranscript?: (text: string) => void;
  onCommand?: (command: string) => void;
  lang?: string;
}

// Определяем мобильное устройство
const isMobile = () => {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ) ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0
  );
};

export const useVoiceRecognition = ({
  onTranscript,
  onCommand,
  lang = "ru-RU",
}: UseVoiceRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isProcessingRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const restartAttemptsRef = useRef(0);
  const lastStartTimeRef = useRef(0);

  // Проверка поддержки браузером
  useEffect(() => {
    const supported =
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    setIsSupported(supported);

    if (!supported) {
      console.warn("Распознавание речи не поддерживается в этом браузере");
    }
  }, []);

  // Инициализация распознавания речи
  const initializeRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Настройки для мобильных устройств
    const mobile = isMobile();

    recognition.continuous = true;
    recognition.interimResults = !mobile; // На мобильных отключаем промежуточные результаты
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    // Дополнительные настройки для мобильных
    if (mobile) {
      recognition.lang = lang;
      // Для мобильных устройств используем более консервативные настройки
      if ("grammars" in recognition) {
        recognition.grammars = new (window as any).SpeechGrammarList();
      }
    }

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
        const confidence = event.results[i][0].confidence || 1;

        // Для мобильных устройств требуем более высокую уверенность
        const mobile = isMobile();
        const minConfidence = mobile ? 0.6 : 0.3;

        if (confidence >= minConfidence) {
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else if (!mobile) {
            // Показываем промежуточные результаты только на десктопе
            interimTranscript += transcript;
          }
        }
      }

      const currentTranscript = (finalTranscript + interimTranscript).trim();

      if (currentTranscript) {
        setTranscript(currentTranscript);
        onTranscript?.(currentTranscript);
      }

      // Обрабатываем финальные результаты
      if (finalTranscript.trim() && !isProcessingRef.current) {
        isProcessingRef.current = true;
        const command = finalTranscript.trim();

        // Фильтруем слишком короткие команды (вероятно ложные срабатывания)
        if (command.length < 2) {
          isProcessingRef.current = false;
          return;
        }

        console.log("✅ Обрабатываем команду:", command);

        // Сразу очищаем транскрипт для готовности к следующей команде
        setTranscript("");

        // На мобильных используем больший timeout для стабильности
        const delay = isMobile() ? 100 : 0;

        setTimeout(() => {
          onCommand?.(command);
          isProcessingRef.current = false;
          console.log("🔄 Готов к следующей команде");
        }, delay);
      }
    };

    recognition.onerror = (event) => {
      console.log("❌ Ошибка распознавания:", event.error);

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        console.error("🚫 Доступ к микрофону запрещен");
        setIsListening(false);
        isProcessingRef.current = false;
        restartAttemptsRef.current = 0;
        return;
      }

      // Обработка ��етевых ошибок (частые на мобильных)
      if (event.error === "network" || event.error === "service-not-allowed") {
        console.log("🌐 Сетевая ошибка, попробуем перезапустить");
        restartAttemptsRef.current++;

        // Ограничиваем количество попыток перезапуска
        if (restartAttemptsRef.current > 3) {
          console.log("🛑 Слишком много попыток перезапуска, останавливаем");
          setIsListening(false);
          isProcessingRef.current = false;
          restartAttemptsRef.current = 0;
          return;
        }
      }

      // Для других ошибок продолжаем работу
      isProcessingRef.current = false;
    };

    recognition.onend = () => {
      console.log("🔄 Распознавание завершилось");

      // Автоматический перезапуск если должны слушать
      if (isListening && !isProcessingRef.current) {
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }

        // Для мобильных устройств используем больший интервал
        const mobile = isMobile();
        const restartDelay = mobile ? 300 : 100;

        // Проверяем, что прошло достаточно времени с последнего старта
        const now = Date.now();
        const timeSinceLastStart = now - lastStartTimeRef.current;
        const minInterval = mobile ? 500 : 200;

        const actualDelay = Math.max(
          restartDelay,
          minInterval - timeSinceLastStart,
        );

        restartTimeoutRef.current = setTimeout(() => {
          if (isListening && recognitionRef.current) {
            try {
              lastStartTimeRef.current = Date.now();
              recognitionRef.current.start();
              console.log(
                `🔄 Перезапуск распознавания (задержка: ${actualDelay}ms)`,
              );
              // Сбрасываем счетчик попыток при успешном перезапуске
              restartAttemptsRef.current = 0;
            } catch (error) {
              console.log("ℹ️ Ошибка перезапуска:", error);
              restartAttemptsRef.current++;

              // Если слишком много ошибок, останавливаем
              if (restartAttemptsRef.current > 5) {
                console.log(
                  "🛑 Слишком много ошибо�� перезапуска, останавливаем",
                );
                setIsListening(false);
                isProcessingRef.current = false;
                restartAttemptsRef.current = 0;
              }
            }
          }
        }, actualDelay);
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

    // Проверяем интервал между запусками для мобильных
    const now = Date.now();
    const timeSinceLastStart = now - lastStartTimeRef.current;
    const mobile = isMobile();
    const minInterval = mobile ? 500 : 100;

    if (timeSinceLastStart < minInterval) {
      console.log(
        `⏱️ Слишком ранний запуск, ждем ${minInterval - timeSinceLastStart}ms`,
      );
      setTimeout(() => startListening(), minInterval - timeSinceLastStart);
      return;
    }

    try {
      // Пересоздаем recognition для мобильных устро��ств
      if (mobile || !recognitionRef.current) {
        recognitionRef.current = initializeRecognition();
      }

      if (recognitionRef.current) {
        isProcessingRef.current = false;
        restartAttemptsRef.current = 0;
        setTranscript("");
        lastStartTimeRef.current = now;
        recognitionRef.current.start();
        console.log("🎤 Начинаем слушать");
      }
    } catch (error) {
      console.error("❌ Не удалось запустить распознавание:", error);
      setIsListening(false);

      // На мобильных устройствах попробуем еще раз через больший интервал
      if (mobile && restartAttemptsRef.current < 3) {
        restartAttemptsRef.current++;
        setTimeout(() => {
          if (!isListening) {
            startListening();
          }
        }, 1000);
      }
    }
  }, [isSupported, initializeRecognition, isListening]);

  // Остановка прослушивания
  const stopListening = useCallback(() => {
    console.log("🛑 Останавливаем прослушивание");

    setIsListening(false);
    setTranscript("");
    isProcessingRef.current = false;
    restartAttemptsRef.current = 0;

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
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
