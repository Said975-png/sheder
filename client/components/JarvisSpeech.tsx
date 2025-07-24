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
        console.log(
          "Available voices:",
          this.voices.map((v) => `${v.name} (${v.lang})`),
        );
        resolve();
      };

      if (this.synth.getVoices().length > 0) {
        loadVoices();
      } else {
        this.synth.addEventListener("voiceschanged", loadVoices, {
          once: true,
        });
      }
    });
  }

  private getBestJarvisVoice(
    lang: string = "ru-RU",
  ): SpeechSynthesisVoice | null {
    if (!this.isInitialized) return null;

    // Приорит��т голосов для русского Джарвиса (мужской 40-45 лет, средне-низкий тембр)
    const russianPriority = [
      "Microsoft Pavel - Russian (Russia)", // Лучший мужской русский
      "Pavel", // Краткое имя Pavel
      "Google русский мужской", // Google мужской русский
      "Yandex Russian Male", // Яндекс мужской
      "Microsoft Irina Desktop - Russian", // Fallback русский
      "Google русский", // Общий Google русский
      "Alex (Enhanced)", // Английский fallback с хорошим качеством
      "Daniel (Enhanced)", // Английский мужской enhanced
      "Microsoft David Desktop - English (United States)", // Качественный английский
      "Google UK English Male", // Британский английский
    ];

    // Для английского Джарвиса
    const englishPriority = [
      "Alex (Enhanced)",
      "Daniel (Enhanced)",
      "Microsoft David Desktop - English (United States)",
      "Google UK English Male",
      "Microsoft Mark - English (United States)",
      "Microsoft Guy24kHz",
    ];

    const priority = lang.startsWith("ru") ? russianPriority : englishPriority;

    // Ищем точное совпадение по приоритету
    for (const preferredName of priority) {
      const voice = this.voices.find((v) => v.name.includes(preferredName));
      if (voice) {
        console.log(`Selected voice: ${voice.name} (${voice.lang})`);
        return voice;
      }
    }

    // Ищем любой мужской голос для нужного языка (средне-низкий тембр предпочтительно)
    const maleVoices = this.voices.filter((voice) => {
      const name = voice.name.toLowerCase();
      const isTargetLang = voice.lang.startsWith(lang.split("-")[0]);
      const isMale =
        name.includes("male") ||
        name.includes("мужской") ||
        name.includes("david") ||
        name.includes("alex") ||
        name.includes("daniel") ||
        name.includes("pavel") ||
        name.includes("павел") ||
        name.includes("guy") ||
        name.includes("mark") ||
        name.includes("антон") ||
        name.includes("николай") ||
        name.includes("андрей") ||
        (!name.includes("female") &&
          !name.includes("woman") &&
          !name.includes("женский"));
      return isTargetLang && isMale;
    });

    // Сортируем по качеству: Enhanced > Desktop > обычные
    const sortedMaleVoices = maleVoices.sort((a, b) => {
      const aQuality = a.name.toLowerCase().includes("enhanced")
        ? 3
        : a.name.toLowerCase().includes("desktop")
          ? 2
          : 1;
      const bQuality = b.name.toLowerCase().includes("enhanced")
        ? 3
        : b.name.toLowerCase().includes("desktop")
          ? 2
          : 1;
      return bQuality - aQuality;
    });

    if (sortedMaleVoices.length > 0) {
      console.log(
        `Selected male voice: ${sortedMaleVoices[0].name} (${sortedMaleVoices[0].lang})`,
      );
      return sortedMaleVoices[0];
    }

    // Последний fallback - любой голос для языка
    const anyVoiceForLang = this.voices.find((v) =>
      v.lang.startsWith(lang.split("-")[0]),
    );
    if (anyVoiceForLang) {
      console.log(`Fallback voice: ${anyVoiceForLang.name}`);
      return anyVoiceForLang;
    }

    return null;
  }

  private createJarvisUtterance(
    text: string,
    settings: JarvisVoiceSettings,
  ): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(text);

    // Настройки голоса для Джа��виса
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
    // Останавливаем текущую речь с задержкой
    this.stop();

    // Небольшая задержка для очистки предыдущих операций
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Ждем инициализации голосов
    if (!this.isInitialized) {
      await this.initializeVoices();
    }

    return new Promise((resolve, reject) => {
      // Настройки голоса Джарвиса согласно промпту (мужской 40-45 лет, средне-низкий тембр)
      const jarvisSettings: JarvisVoiceSettings = {
        rate: 0.75, // Размеренная подача, точные формулировки
        pitch: 0.6, // Средне-низкий тембр для элитного уровня
        volume: 0.95, // Кристальн�� чистая дикция
        lang: "ru-RU", // Литературный русский язык
      };

      const utterance = this.createJarvisUtterance(
        options.text,
        jarvisSettings,
      );
      this.currentUtterance = utterance;

      let hasResolved = false;
      const cleanup = () => {
        this.currentUtterance = null;
        hasResolved = true;
      };

      utterance.onstart = () => {
        console.log("Jarvis started speaking:", options.text);
        options.onStart?.();
      };

      utterance.onend = () => {
        if (!hasResolved) {
          console.log("Jarvis finished speaking");
          cleanup();
          options.onEnd?.();
          resolve();
        }
      };

      utterance.onerror = (event) => {
        if (!hasResolved) {
          console.warn("Jarvis speech interrupted or error:", event.error);
          cleanup();

          // Для ошибки "interrupted" не считаем это критической ошибкой
          if (event.error === "interrupted" || event.error === "canceled") {
            console.log("Speech was interrupted, but this is normal behavior");
            options.onEnd?.(); // Вызываем onEnd вместо onError
            resolve(); // Успешно ��авершаем
          } else {
            const errorMessage = `Speech synthesis error: ${event.error}`;
            options.onError?.(errorMessage);
            reject(new Error(errorMessage));
          }
        }
      };

      // Таймаут для предотвращения зависания
      const timeout = setTimeout(() => {
        if (!hasResolved) {
          console.warn("Speech timeout, force completing");
          cleanup();
          this.stop();
          options.onEnd?.();
          resolve();
        }
      }, 30000); // 30 секунд максимум

      utterance.onend = () => {
        clearTimeout(timeout);
        if (!hasResolved) {
          console.log("Jarvis finished speaking");
          cleanup();
          options.onEnd?.();
          resolve();
        }
      };

      try {
        // Проверяем, что синтезатор доступен
        if (this.synth.paused) {
          this.synth.resume();
        }

        this.synth.speak(utterance);

        // Дополнительная проверка через 500мс - иногда speak не срабатывает сразу
        setTimeout(() => {
          if (!this.synth.speaking && !hasResolved) {
            console.warn("Speech did not start, retrying...");
            try {
              this.synth.speak(utterance);
            } catch (retryError) {
              console.error("Retry failed:", retryError);
            }
          }
        }, 500);
      } catch (error) {
        clearTimeout(timeout);
        if (!hasResolved) {
          cleanup();
          const errorMessage =
            error instanceof Error ? error.message : "Unknown speech error";
          options.onError?.(errorMessage);
          reject(error);
        }
      }
    });
  }

  stop(): void {
    try {
      if (this.synth.speaking || this.synth.pending) {
        this.synth.cancel();
      }

      // Дополнительная очистка
      if (this.currentUtterance) {
        this.currentUtterance.onstart = null;
        this.currentUtterance.onend = null;
        this.currentUtterance.onerror = null;
      }

      this.currentUtterance = null;

      // Небольшая задержка для полной очистки
      setTimeout(() => {
        if (this.synth.speaking) {
          try {
            this.synth.cancel();
          } catch (e) {
            console.warn("Secondary cancel failed:", e);
          }
        }
      }, 50);
    } catch (error) {
      console.warn("Error stopping speech:", error);
      this.currentUtterance = null;
    }
  }

  isSpeaking(): boolean {
    return (
      this.synth.speaking ||
      this.synth.pending ||
      this.currentUtterance !== null
    );
  }

  // Проверка доступности речевого синтеза
  isAvailable(): boolean {
    return "speechSynthesis" in window && this.isInitialized;
  }

  // Принудительный сброс состояния
  forceReset(): void {
    try {
      this.synth.cancel();
      this.currentUtterance = null;
      console.log("Speech synthesis force reset completed");
    } catch (error) {
      console.warn("Force reset error:", error);
    }
  }

  // Специализированные методы речи согласно промпту Джарвиса

  // Деловой, спокойный тон для команд
  async speakCommand(text: string): Promise<void> {
    const settings: JarvisVoiceSettings = {
      rate: 0.75, // Размеренная подача
      pitch: 0.6, // Средне-низкий тембр
      volume: 0.95, // Четкая дикция
      lang: "ru-RU",
    };

    const utterance = this.createJarvisUtterance(text, settings);
    return this.speakWithCustomSettings(utterance, text, "command");
  }

  // Элегантно-вежливый тон для ответов
  async speakResponse(text: string): Promise<void> {
    const settings: JarvisVoiceSettings = {
      rate: 0.8, // Чуть быстрее для дружелюбности
      pitch: 0.65, // Слегка выше для теплоты
      volume: 0.95, // Кристально чистая дикция
      lang: "ru-RU",
    };

    const utterance = this.createJarvisUtterance(text, settings);
    return this.speakWithCustomSettings(utterance, text, "response");
  }

  // Уверенный тон для предупреждений (без эмоциональных всплесков)
  async speakAlert(text: string): Promise<void> {
    const settings: JarvisVoiceSettings = {
      rate: 0.85, // Немного быстрее для важности
      pitch: 0.55, // Ниже для серьезности
      volume: 1.0, // Полная громкость
      lang: "ru-RU",
    };

    const utterance = this.createJarvisUtterance(text, settings);
    return this.speakWithCustomSettings(utterance, text, "alert");
  }

  // Формальный стиль для системных сообщений
  async speakSystemMessage(text: string): Promise<void> {
    const settings: JarvisVoiceSettings = {
      rate: 0.7, // Очень размеренно для точности
      pitch: 0.6, // Стандартный средне-низкий
      volume: 0.9, // Слегка тише для формальности
      lang: "ru-RU",
    };

    const utterance = this.createJarvisUtterance(text, settings);
    return this.speakWithCustomSettings(utterance, text, "system");
  }

  private async speakWithCustomSettings(
    utterance: SpeechSynthesisUtterance,
    text: string,
    type: string,
  ): Promise<void> {
    this.stop();
    await new Promise((resolve) => setTimeout(resolve, 100));

    return new Promise((resolve, reject) => {
      let hasResolved = false;
      const cleanup = () => {
        this.currentUtterance = null;
        hasResolved = true;
      };

      utterance.onstart = () => {
        console.log(`Jarvis ${type}:`, text);
      };

      utterance.onend = () => {
        if (!hasResolved) {
          cleanup();
          resolve();
        }
      };

      utterance.onerror = (event) => {
        if (!hasResolved) {
          cleanup();
          if (event.error === "interrupted" || event.error === "canceled") {
            resolve();
          } else {
            reject(new Error(event.error));
          }
        }
      };

      try {
        this.currentUtterance = utterance;
        this.synth.speak(utterance);
      } catch (error) {
        cleanup();
        reject(error);
      }
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

    // Обработчик потери фокуса страницы
    const handleVisibilityChange = () => {
      if (document.hidden && engineRef.current) {
        console.log("Page hidden, stopping speech");
        engineRef.current.stop();
      }
    };

    // Обработчик потери фокуса окна
    const handleBlur = () => {
      if (engineRef.current?.isSpeaking()) {
        console.log("Window lost focus, stopping speech");
        engineRef.current.stop();
      }
    };

    // Обработчик ошибок на уровне страницы
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes("speech") && engineRef.current) {
        console.log("Page error related to speech, resetting");
        engineRef.current.forceReset();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("error", handleError);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("error", handleError);
      engineRef.current?.stop();
    };
  }, []);

  const speak = useCallback(
    async (text: string, options?: Partial<JarvisSpeechOptions>) => {
      if (!engineRef.current) return;

      try {
        return await engineRef.current.speak({
          text,
          onError: (error) => {
            console.warn("Jarvis speech error handled:", error);
            // Не показываем ошибку пользователю для interrupted
            if (!error.includes("interrupted") && !error.includes("canceled")) {
              options?.onError?.(error);
            }
          },
          ...options,
        });
      } catch (error) {
        console.warn("Speak method failed:", error);
        // Принудительно сбрасываем состояние при критических ошибках
        engineRef.current.forceReset();
      }
    },
    [],
  );

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

  const speakSystemMessage = useCallback(async (text: string) => {
    if (!engineRef.current) return;
    return engineRef.current.speakSystemMessage(text);
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
    speakSystemMessage,
    stop,
    isSpeaking,
  };
}

export default JarvisSpeechEngine;
