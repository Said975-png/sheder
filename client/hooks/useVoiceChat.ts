import { useState, useRef, useCallback, useEffect } from "react";

interface UseVoiceChatProps {
  onTranscriptReceived: (text: string) => void;
  onTextToSpeech: (text: string) => void;
}

export const useVoiceChat = ({
  onTranscriptReceived,
  onTextToSpeech,
}: UseVoiceChatProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isProcessingRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Инициализация распознавания речи
  const initializeRecognition = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.error("Распознавание речи не поддерживается в этом браузере");
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true; // Непрерывное распознавание
    recognition.interimResults = true; // Промежуточные результаты
    recognition.lang = "ru-RU";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("🎤 Распознавание речи запущено");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      if (isProcessingRef.current || isSpeaking) {
        console.log("⏸️ Пропускаем результат - обрабатываем команду или говорим");
        return;
      }

      let finalTranscript = "";
      let interimTranscript = "";

      // Обрабатываем все результаты
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const combinedTranscript = (finalTranscript + interimTranscript).trim();

      // Обрабатываем только финальные результаты или достаточно длинные промежуточные
      if (combinedTranscript.length >= 3) {
        console.log("🎯 Получен текст:", combinedTranscript);
        
        // Если это финальный результат, обрабатываем команду
        if (finalTranscript && !isProcessingRef.current) {
          isProcessingRef.current = true;
          console.log("✅ Обрабатываем финальную команду:", finalTranscript);
          
          onTranscriptReceived(finalTranscript.trim());
          
          // Сбрасываем флаг обработки через небольшую задержку
          setTimeout(() => {
            isProcessingRef.current = false;
            console.log("🔄 Готов к следующей команде");
          }, 1000);
        }
      }
    };

    recognition.onerror = (event) => {
      console.log("❌ Ошибка распознавания:", event.error);
      
      // Критические ошибки - останавливаем
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        console.error("🚫 Доступ к микрофону запрещен");
        setIsListening(false);
        return;
      }
      
      // Для других ошибок просто продолжаем
      console.log("ℹ️ Игнорируем ошибку, п��одолжаем слушать");
    };

    recognition.onend = () => {
      console.log("🔄 Распознавание завершилось");
      
      // Автоматически перезапускаем, если должны слушать
      if (isListening && !isProcessingRef.current) {
        console.log("🔄 Перезапускаем распознавание");
        
        // Небольшая задержка перед перезапуском
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        
        restartTimeoutRef.current = setTimeout(() => {
          if (isListening && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.log("ℹ️ Не удалось перезапустить, попробуем позже");
            }
          }
        }, 100);
      }
    };

    return recognition;
  }, [isListening, isSpeaking, onTranscriptReceived]);

  // Запуск прослушивания
  const startListening = useCallback(() => {
    if (isSpeaking) {
      console.log("⏸️ Не можем начать слушать - сейчас говорим");
      return;
    }

    try {
      if (!recognitionRef.current) {
        recognitionRef.current = initializeRecognition();
      }

      if (recognitionRef.current) {
        recognitionRef.current.start();
        isProcessingRef.current = false;
        console.log("🎤 Начинаем слушать");
      }
    } catch (error) {
      console.error("❌ Не удалось запустить распознавание:", error);
    }
  }, [isSpeaking, initializeRecognition]);

  // Остановка прослушивания
  const stopListening = useCallback(() => {
    console.log("🛑 Останавливаем прослушивание");
    
    setIsListening(false);
    isProcessingRef.current = false;
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("ℹ️ Ошибка остановки распознавания:", error);
      }
      recognitionRef.current = null;
    }
  }, []);

  // Переключение состояния прослушивания
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Воспроизведение речи через ElevenLabs с fallback на браузерный TTS
  const speakText = useCallback(async (text: string) => {
    if (isSpeaking) {
      console.log("⏸️ Уже говорим, пропускаем");
      return;
    }

    console.log("🔊 Начинаем говорить:", text);

    // Безопасно очищаем предыдущее аудио
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      } catch (error) {
        console.log("ℹ️ Ошибка очистки предыдущего аудио:", error);
      }
    }

    setIsSpeaking(true);
    isProcessingRef.current = true;

    // Останавливаем прослушивание пока говорим
    const wasListening = isListening;
    if (wasListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("ℹ️ Ошибка остановки распознавания при речи:", error);
      }
    }

    try {
      // Пробуем ElevenLabs API
      const response = await fetch("/api/elevenlabs-tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          voice_id: "xybB2n1F05JZpVVx92Tu", // Кастомный голос Пятницы
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
        isProcessingRef.current = false;
        currentAudioRef.current = null;
        
        // Возобновляем прослушивание если было активно
        if (wasListening) {
          console.log("🔄 Возобновляем прослушивание после речи");
          setTimeout(() => {
            if (!isListening) {
              startListening();
            }
          }, 500);
        }
        
        onTextToSpeech(text);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
        isProcessingRef.current = false;
        currentAudioRef.current = null;
        console.error("❌ Ошибка воспроизведения аудио ElevenLabs");
        
        if (wasListening) {
          startListening();
        }
      };

      await audio.play();
    } catch (error) {
      console.error("❌ ElevenLabs недоступен, используем браузерный TTS:", error);
      
      // Fallback на браузерный TTS
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ru-RU";
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        utterance.volume = 0.9;

        // Ищем женский русский голос
        const voices = speechSynthesis.getVoices();
        const femaleRussianVoice = voices.find(
          (voice) =>
            voice.lang.includes("ru") &&
            (voice.name.toLowerCase().includes("женский") ||
              voice.name.toLowerCase().includes("female") ||
              voice.name.toLowerCase().includes("anna") ||
              voice.name.toLowerCase().includes("екатерина"))
        );

        if (femaleRussianVoice) {
          utterance.voice = femaleRussianVoice;
        }

        utterance.onend = () => {
          setIsSpeaking(false);
          isProcessingRef.current = false;
          
          if (wasListening) {
            console.log("🔄 Возобновляем прослушивание после браузерного TTS");
            setTimeout(() => {
              if (!isListening) {
                startListening();
              }
            }, 500);
          }
          
          onTextToSpeech(text);
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
          isProcessingRef.current = false;
          console.error("❌ Ошибка браузерного TTS");
          
          if (wasListening) {
            startListening();
          }
        };

        speechSynthesis.speak(utterance);
      } else {
        console.log("❌ TTS недоступен");
        setIsSpeaking(false);
        isProcessingRef.current = false;
        
        if (wasListening) {
          startListening();
        }
        
        onTextToSpeech(text);
      }
    }
  }, [isSpeaking, isListening, startListening, onTextToSpeech]);

  // Остановка речи
  const stopSpeaking = useCallback(() => {
    console.log("🛑 Останавливаем речь");

    // Безопасно останавливаем ElevenLabs аудио
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      } catch (error) {
        console.log("ℹ️ Ошибка остановки аудио:", error);
        currentAudioRef.current = null;
      }
    }

    // Останавливаем браузерное TTS
    if ("speechSynthesis" in window && speechSynthesis.speaking) {
      try {
        speechSynthesis.cancel();
      } catch (error) {
        console.log("ℹ️ Ошибка остановки TTS:", error);
      }
    }

    setIsSpeaking(false);
    isProcessingRef.current = false;
  }, []);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log("ℹ️ Ошибка очистки распознавания:", error);
        }
      }
      
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      
      if ("speechSynthesis" in window && speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Автоматическая очистка зависших состояний
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // Если говорим, но нет активного аудио - сбрасываем
      if (isSpeaking && !currentAudioRef.current && !speechSynthesis.speaking) {
        console.log("🧹 Очистка зависшего состояния речи");
        setIsSpeaking(false);
        isProcessingRef.current = false;
      }
      
      // Если слушаем, но нет активного распознавания - перезапускаем
      if (isListening && !recognitionRef.current && !isProcessingRef.current) {
        console.log("🧹 Перезапуск зависшего распознавания");
        startListening();
      }
    }, 3000); // Проверяем каждые 3 секунды

    return () => clearInterval(cleanupInterval);
  }, [isListening, isSpeaking, startListening]);

  return {
    isListening,
    isSpeaking,
    toggleListening,
    speakText,
    stopSpeaking,
  };
};
