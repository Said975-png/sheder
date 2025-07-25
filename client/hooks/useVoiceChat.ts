import { useState, useRef, useCallback } from 'react';

interface UseVoiceChatProps {
  onTranscriptReceived: (text: string) => void;
  onTextToSpeech: (text: string) => void;
}

export const useVoiceChat = ({ onTranscriptReceived, onTextToSpeech }: UseVoiceChatProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Распознавание речи не поддерживается в этом браузере');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'ru-RU';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.trim();
        if (transcript) {
          onTranscriptReceived(transcript);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Доступ к микрофону запрещен. Разрешите доступ к микрофону для использования голосового ввода.');
      }
    };

    recognition.onend = () => {
      if (isListening) {
        // Автоматически перезапускаем распознавание, если оно было активно
        recognition.start();
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [isListening, onTranscriptReceived]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
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

  const speakText = useCallback(async (text: string) => {
    // Останавливаем текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    // Очищаем текст от эмодзи, звездочек и специальных символов
    const cleanText = text
      .replace(/[\*_~`]/g, '') // убираем markdown символы
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '') // убираем эмодзи
      .replace(/[^\w\s.,!?;:\-а-яё]/gi, '') // убираем другие специальные символы, сохраняя русские буквы
      .trim();

    if (!cleanText) return;

    setIsSpeaking(true);

    try {
      // Сначала пробуем кастомный голос
      let response = await fetch('/api/elevenlabs-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          voice_id: '7Ipoekf0dq4j3k1xPG37' // Кастомный голос пользователя
        }),
      });

      // Если кастомный голос не работает, пробуем дефолтный голос
      if (!response.ok && response.status === 404) {
        console.warn('Custom voice not found, trying default voice...');
        response = await fetch('/api/elevenlabs-tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: cleanText,
            voice_id: 'pNInz6obpgDQGcFmaJgB' // Дефолтный голос Adam
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      currentAudioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };

      await audio.play();
      onTextToSpeech(cleanText);
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  }, [onTextToSpeech]);

  const stopSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    toggleListening,
    speakText,
    stopSpeaking
  };
};
