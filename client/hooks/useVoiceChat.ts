import { useState, useRef, useCallback } from "react";

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
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);

  // Инициализируем фоновое аудио
  useState(() => {
    const backgroundAudio = new Audio("https://cdn.builder.io/o/assets%2F2d95e924fbec44478e615e081a2f9789%2F47f7db47644d45e0a3e02699130db740?alt=media&token=e9d17591-2686-44d6-a7c5-7ca30d951531&apiKey=2d95e924fbec44478e615e081a2f9789");
    backgroundAudio.loop = true;
    backgroundAudio.volume = 0.15; // Низкая громкость, чтобы не мешать голосу
    backgroundAudioRef.current = backgroundAudio;
  });

  const startListening = useCallback(() => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("Распознавание речи не поддерживается в этом браузере");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false; // Изменено на false для предотвращения накопления
    recognition.interimResults = false;
    recognition.lang = "ru-RU";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      // Берем только последний финальный результат
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const transcript = result[0].transcript.trim();
          if (transcript) {
            // Сразу останавливаем распознавание и отправляем текст
            setIsListening(false);
            recognition.stop();
            onTranscriptReceived(transcript);
            return;
          }
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        alert(
          "Доступ к микрофону запрещен. Разрешите доступ к микрофону для использования голосового ввода.",
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Убираем автоматический перезапуск - пользователь должен нажать кнопку снова
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [onTranscriptReceived]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort(); // Используем abort вместо stop для полной остановки
      } catch (e) {
        // Игнорируем ошибки если recognition уже остановлено
      }
      recognitionRef.current = null;
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const speakText = useCallback(
    async (text: string) => {
      // Останавливаем текущее воспроизведение
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      // Очищаем текст от эмодзи, звездочек и специальных символов
      const cleanText = text
        .replace(/[\*_~`]/g, "") // убираем markdown символы
        .replace(
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
          "",
        ) // убираем эмодзи
        .replace(/[^\w\s.,!?;:\-а-яё]/gi, "") // убираем другие специальные символы, сохраняя русские буквы
        .trim();

      if (!cleanText) return;

      setIsSpeaking(true);

      // Запускаем фоновое аудио
      if (backgroundAudioRef.current) {
        try {
          backgroundAudioRef.current.currentTime = 0;
          backgroundAudioRef.current.play().catch(console.warn);
        } catch (e) {
          console.warn("Background audio failed to start:", e);
        }
      }

      try {
        // Пробуем ElevenLabs API
        let useElevenLabs = true;
        let response: Response | undefined;

        try {
          response = await fetch("/api/elevenlabs-tts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: cleanText,
              voice_id: "UgBBYS2sOqTuMpoF3BR0", // Кастомный голос пользователя
            }),
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
        } catch (elevenLabsError) {
          console.warn(
            "ElevenLabs API failed, using browser TTS temporarily:",
            elevenLabsError,
          );
          useElevenLabs = false;
        }

        if (!useElevenLabs || !response?.ok) {
          // Кастомная настройка голоса QwIajjI6ArHb10VNwWmz имитация
          if (!("speechSynthesis" in window)) {
            throw new Error("Speech synthesis not supported");
          }

          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = "ru-RU";
          utterance.rate = 0.8; // Медленнее для имитации кастомного голоса
          utterance.pitch = 0.7; // Ниже для мужского голоса
          utterance.volume = 1;

          // Ищем лучший мужской голос
          const voices = speechSynthesis.getVoices();

          // Приоритет голосов для имитации кастомного QwIajjI6ArHb10VNwWmz
          const preferredVoices = [
            voices.find((voice) => voice.name.includes("Microsoft Pavel")), // Мужской русский
            voices.find((voice) => voice.name.includes("Google русский")),
            voices.find(
              (voice) =>
                voice.name.includes("Male") && voice.lang.includes("ru"),
            ),
            voices.find((voice) => voice.name.includes("мужской")),
            voices.find(
              (voice) =>
                !voice.name.toLowerCase().includes("female") &&
                !voice.name.toLowerCase().includes("женский") &&
                voice.lang.includes("ru"),
            ),
            voices.find((voice) => voice.lang.includes("ru")),
          ];

          const selectedVoice = preferredVoices.find((voice) => voice);
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }

          utterance.onend = () => {
            setIsSpeaking(false);
            // Останавливаем фоновое аудио
            if (backgroundAudioRef.current) {
              backgroundAudioRef.current.pause();
            }
          };

          utterance.onerror = () => {
            setIsSpeaking(false);
            // Останавливаем фоновое аудио
            if (backgroundAudioRef.current) {
              backgroundAudioRef.current.pause();
            }
          };

          speechSynthesis.speak(utterance);
          onTextToSpeech(cleanText);
          return;
        }

        // Используем только ElevenLabs �� кастомным голосом
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        currentAudioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
          // Останавливаем фоновое аудио
          if (backgroundAudioRef.current) {
            backgroundAudioRef.current.pause();
          }
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
          // Останавливаем фоновое аудио
          if (backgroundAudioRef.current) {
            backgroundAudioRef.current.pause();
          }
        };

        await audio.play();

        onTextToSpeech(cleanText);
      } catch (error) {
        console.error("TTS error:", error);
        setIsSpeaking(false);
        // Останавливаем фоновое аудио при ошибке
        if (backgroundAudioRef.current) {
          backgroundAudioRef.current.pause();
        }
      }
    },
    [onTextToSpeech],
  );

  const stopSpeaking = useCallback(() => {
    // Останавливаем ElevenLabs аудио
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    // Останавливаем браузерное TTS если оно активно
    if ("speechSynthesis" in window && speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    // Останавливаем фоновое аудио
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.pause();
    }

    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    toggleListening,
    speakText,
    stopSpeaking,
  };
};
