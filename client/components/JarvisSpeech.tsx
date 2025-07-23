import { useCallback, useEffect, useRef } from "react";

interface JarvisSpeechOptions {
  text: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface JarvisVoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  voiceName?: string;
  lang: string;
}

export class JarvisSpeechEngine {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isInitialized = false;

  constructor() {
    this.synth = window.speechSynthesis;
    this.initializeVoices();
  }

  private async initializeVoices(): Promise<void> {
    return new Promise((resolve) => {
      const loadVoices = () => {
        this.voices = this.synth.getVoices();
        this.isInitialized = true;
        console.log('Available voices:', this.voices.map(v => `${v.name} (${v.lang})`));
        resolve();
      };

      if (this.synth.getVoices().length > 0) {
        loadVoices();
      } else {
        this.synth.addEventListener('voiceschanged', loadVoices, { once: true });
      }
    });
  }

  private getBestJarvisVoice(lang: string = 'ru-RU'): SpeechSynthesisVoice | null {
    if (!this.isInitialized) return null;

    // Приоритет голосов для русского Джарвиса
    const russianPriority = [
      'Microsoft Pavel - Russian (Russia)',
      'Google русский',
      'Yandex Russian Male',
      'Milena',
      'Pavel',
      'Microsoft Irina Desktop - Russian',
      'Alex (Enhanced)', // Fallback to English if no Russian
      'Daniel (Enhanced)',
      'Microsoft David Desktop - English (United States)',
      'Google UK English Male',
    ];

    // Для английского Джарвиса
    const englishPriority = [
      'Alex (Enhanced)',
      'Daniel (Enhanced)', 
      'Microsoft David Desktop - English (United States)',
      'Google UK English Male',
      'Microsoft Mark - English (United States)',
      'Microsoft Guy24kHz',
    ];

    const priority = lang.startsWith('ru') ? russianPriority : englishPriority;
    
    // Ищем точное совпадение по приоритету
    for (const preferredName of priority) {
      const voice = this.voices.find(v => v.name.includes(preferredName));
      if (voice) {
        console.log(`Selected voice: ${voice.name} (${voice.lang})`);
        return voice;
      }
    }

    // Ищем любой мужской голос для нужного языка
    const maleVoices = this.voices.filter(voice => {
      const name = voice.name.toLowerCase();
      const isTargetLang = voice.lang.startsWith(lang.split('-')[0]);
      const isMale = name.includes('male') || 
                    name.includes('david') || 
                    name.includes('alex') || 
                    name.includes('daniel') ||
                    name.includes('pavel') ||
                    name.includes('guy') ||
                    name.includes('mark') ||
                    !name.includes('female') && !name.includes('woman');
      return isTargetLang && isMale;
    });

    if (maleVoices.length > 0) {
      console.log(`Selected male voice: ${maleVoices[0].name}`);
      return maleVoices[0];
    }

    // Последний fallback - любой голос для языка
    const anyVoiceForLang = this.voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (anyVoiceForLang) {
      console.log(`Fallback voice: ${anyVoiceForLang.name}`);
      return anyVoiceForLang;
    }

    return null;
  }

  private createJarvisUtterance(text: string, settings: JarvisVoiceSettings): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Настройки голоса для Джарвиса
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    utterance.lang = settings.lang;

    // Выбираем лучший голос
    const bestVoice = this.getBestJarvisVoice(settings.lang);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    return utterance;
  }

  async speak(options: JarvisSpeechOptions): Promise<void> {
    // Останавливаем текущую речь
    this.stop();

    // Ждем инициализации голосов
    if (!this.isInitialized) {
      await this.initializeVoices();
    }

    return new Promise((resolve, reject) => {
      // Настройки голоса Джарвиса
      const jarvisSettings: JarvisVoiceSettings = {
        rate: 0.85,    // Немного медленнее для авторитетности
        pitch: 0.7,    // Низкий тон для мужественности
        volume: 0.9,   // Четкая громкость
        lang: 'ru-RU', // Русский язык
      };

      const utterance = this.createJarvisUtterance(options.text, jarvisSettings);
      this.currentUtterance = utterance;

      utterance.onstart = () => {
        console.log('Jarvis started speaking:', options.text);
        options.onStart?.();
      };

      utterance.onend = () => {
        console.log('Jarvis finished speaking');
        this.currentUtterance = null;
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Jarvis speech error:', event.error);
        this.currentUtterance = null;
        const errorMessage = `Speech synthesis error: ${event.error}`;
        options.onError?.(errorMessage);
        reject(new Error(errorMessage));
      };

      try {
        this.synth.speak(utterance);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown speech error';
        options.onError?.(errorMessage);
        reject(error);
      }
    });
  }

  stop(): void {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  // Специальные методы для разных типов сообщений Джарвиса
  async speakCommand(text: string): Promise<void> {
    return this.speak({
      text: text,
      onStart: () => console.log('Jarvis command:', text),
    });
  }

  async speakResponse(text: string): Promise<void> {
    return this.speak({
      text: text,
      onStart: () => console.log('Jarvis response:', text),
    });
  }

  async speakAlert(text: string): Promise<void> {
    // Для предупреждений используем немного более высокий тон и быструю речь
    const originalUtterance = new SpeechSynthesisUtterance(text);
    originalUtterance.rate = 1.0;
    originalUtterance.pitch = 0.8;
    originalUtterance.volume = 1.0;
    originalUtterance.lang = 'ru-RU';

    const bestVoice = this.getBestJarvisVoice('ru-RU');
    if (bestVoice) {
      originalUtterance.voice = bestVoice;
    }

    return new Promise((resolve, reject) => {
      originalUtterance.onend = () => resolve();
      originalUtterance.onerror = (event) => reject(new Error(event.error));
      
      this.stop();
      this.synth.speak(originalUtterance);
    });
  }
}

// Hook для использования Джарвиса в компонентах
export function useJarvisSpeech() {
  const engineRef = useRef<JarvisSpeechEngine | null>(null);

  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new JarvisSpeechEngine();
    }

    return () => {
      engineRef.current?.stop();
    };
  }, []);

  const speak = useCallback(async (text: string, options?: Partial<JarvisSpeechOptions>) => {
    if (!engineRef.current) return;
    
    return engineRef.current.speak({
      text,
      ...options,
    });
  }, []);

  const speakCommand = useCallback(async (text: string) => {
    if (!engineRef.current) return;
    return engineRef.current.speakCommand(text);
  }, []);

  const speakResponse = useCallback(async (text: string) => {
    if (!engineRef.current) return;
    return engineRef.current.speakResponse(text);
  }, []);

  const speakAlert = useCallback(async (text: string) => {
    if (!engineRef.current) return;
    return engineRef.current.speakAlert(text);
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  const isSpeaking = useCallback(() => {
    return engineRef.current?.isSpeaking() ?? false;
  }, []);

  return {
    speak,
    speakCommand,
    speakResponse,
    speakAlert,
    stop,
    isSpeaking,
  };
}

export default JarvisSpeechEngine;
