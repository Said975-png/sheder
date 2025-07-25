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
            // Сначала устанавливаем флаг, затем останавливаем
            setIsListening(false);
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (e) {
                // Игнорируем ошибки
              }
              recognitionRef.current = null;
            }
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
    if (recognitionRef.current) {
      try {
        // Используем stop вместо abort для предотвращения ошибки "aborted"
        recognitionRef.current.stop();
      } catch (e) {
        // Игнорируем ошибки если recognition уже остановлено
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
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
      // Голосовое воспроизведение отключено
      console.log("Voice output disabled");
      onTextToSpeech(text);
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
