import React, { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceControlProps {
  onCommand?: (command: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  floating?: boolean;
}

export default function VoiceControl({
  onCommand,
  className,
  size = "lg",
  floating = true,
}: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isProcessingRef = useRef(false);

  // Проверка поддержки браузером
  useEffect(() => {
    const supported =
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    setIsSupported(supported);
  }, []);

  // Запуск прослушивания
  const startListening = useCallback(() => {
    // Дополнительные проверки для предотвращения дублирования
    if (
      !isSupported ||
      isListening ||
      isPlayingAudio ||
      isProcessingRef.current
    ) {
      console.log("🚫 Не могу запустить микрофон:", {
        isSupported,
        isListening,
        isPlayingAudio,
        isProcessing: isProcessingRef.current,
      });
      return;
    }

    try {
      // Если recognition уже существует и активен, не создаваем новый
      if (recognitionRef.current) {
        // Проверяем состояние recognition
        try {
          recognitionRef.current.start();
          console.log("🎤 Перезапуск существующего recognition");
          return;
        } catch (error) {
          // Если ошибка - очищаем и создаем новый
          console.log("🔄 Очищаем старый recognition из-за ошибки");
          recognitionRef.current = null;
        }
      }

      // Создаем новый recognition только если нужно
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true; // Изменено на true для лучшего распознавания
      recognition.interimResults = true;
      recognition.lang = "ru-RU";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log("🎤 Микрофон включен - жду команду");
        setIsListening(true);
        isProcessingRef.current = false;
      };

      recognition.onresult = (event) => {
        if (isProcessingRef.current) return;

        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentTranscript = (finalTranscript + interimTranscript).trim();
        setTranscript(currentTranscript);

        // Обрабатываем финальную команду
        if (finalTranscript.trim() && !isProcessingRef.current) {
          isProcessingRef.current = true;
          const command = finalTranscript.trim();

          console.log("✅ Ко��анда получена:", command);
          setTranscript("");

          // Останавливаем микрофон сразу после получения команды
          stopListening();

          // Обрабатываем команду
          handleVoiceCommand(command);
          onCommand?.(command);
        }
      };

      recognition.onerror = (event) => {
        console.log("❌ Ошибка распознавания:", event.error);
        setIsListening(false);
        isProcessingRef.current = false;
        recognitionRef.current = null; // Очищаем при ошибке

        // НЕ перезапускаем автоматически при ошибках
        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          console.log("🚫 Доступ к микрофону запрещен");
        } else {
          console.log("⏹️ Ошибка микрофона, нажмите кнопку для включения");
        }
      };

      recognition.onend = () => {
        console.log("🔄 Распознавание завершено");
        setIsListening(false);
        recognitionRef.current = null; // Очищаем при завершении

        // НЕ перезапускаем автоматически - пусть пользователь сам включает
        console.log("⏹️ Микрофон остановлен, нажмите кнопку для включения");
      };

      recognitionRef.current = recognition;
      isProcessingRef.current = false;
      setTranscript("");

      // Запускаем с дополнительной проверкой
      recognition.start();
      console.log("🎤 Новый микрофон запущен успешн��");
    } catch (error) {
      console.error("❌ Не удалось запустить распознавание:", error);
      setIsListening(false);
      recognitionRef.current = null;
      isProcessingRef.current = false;
      console.log("⏹️ Ошибка запуска, нажмите кнопку еще раз");
    }
  }, [isSupported, isListening, isPlayingAudio]);

  // Остановка прослушивания
  const stopListening = useCallback(() => {
    console.log("🛑 Останавливаем прослушивание");
    setIsListening(false);
    setTranscript("");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log("✅ Recognition остановлен");
      } catch (error) {
        console.log("ℹ️ Ошибка остановки recognition:", error);
      }
      // Не очищаем ref здесь, это сделает onend
    }
  }, []);

  // Функция в��спроизв���дения аудио БЕЗ автоматического возобновления микрофона
  const playAudioResponse = useCallback(
    (audioUrl: string, callback?: () => void) => {
      console.log("🔊 Начинае�� воспроизведение аудио ответа");

      // Останавливаем микрофон
      if (isListening) {
        stopListening();
      }

      // Останавливаем предыдущее аудио если есть
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      setIsPlayingAudio(true);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        console.log("✅ Аудио завершено");
        setIsPlayingAudio(false);
        audioRef.current = null;

        // Выполняем callback если есть
        if (callback) {
          try {
            callback();
            console.log("🔄 Callback выполнен");
          } catch (error) {
            console.error("❌ Ошибка в callback:", error);
          }
        }

        // Сбрасываем флаг обработки
        isProcessingRef.current = false;
        console.log("✅ Аудио завершено, автоматически вк��ючаем микрофон");

        // Автоматически включаем микрофон после завершения аудио
        setTimeout(() => {
          if (!isListening && !isPlayingAudio && !isProcessingRef.current) {
            startListening();
            console.log("🎤 Микрофон автоматически включен после ответа");
          }
        }, 1000); // 1 секунда задержка для стабильности
      };

      audio.onerror = () => {
        console.error("❌ Ошибка воспроизведения аудио");
        setIsPlayingAudio(false);
        audioRef.current = null;
        isProcessingRef.current = false;

        console.log("⏹️ Ошибка аудио, нажмите кнопку для включения микрофона");
      };

      audio.play().catch((error) => {
        console.error("❌ Не удалось воспроизвести аудио:", error);
        setIsPlayingAudio(false);
        audioRef.current = null;
        isProcessingRef.current = false;

        // Проверяем, является ли ошибка связанной с автовоспроизведением
        if (
          error.name === "NotAllowedError" ||
          error.message.includes("user didn't interact")
        ) {
          console.log(
            "⚠️ Автовоспроизведение заблокировано - требуется взаимодействие пользователя",
          );
        } else {
          console.log(
            "⏹️ Неудача воспроизведения, нажмите кнопку для включения микрофона",
          );
        }
      });
    },
    [isListening, isPlayingAudio, startListening, stopListening],
  );

  // Обработка голосовых команд
  const handleVoiceCommand = useCallback(
    (command: string) => {
      const lowerCommand = command.toLowerCase().trim();
      console.log("🔍 Обрабатываем команду:", lowerCommand);

      // Команда "Джарвис ты тут"
      if (
        lowerCommand.includes("джарвис ты тут") ||
        lowerCommand.includes("jarvis ты тут")
      ) {
        playAudioResponse(
          "https://cdn.builder.io/o/assets%2Fe61c233aecf6402a8a9db34e2dc8f046%2F88f169fa15c74679b0cef82d12ee5f8d?alt=media&token=287c51bf-45be-420b-bd4f-8bdcb60d393c&apiKey=e61c233aecf6402a8a9db34e2dc8f046",
        );
        return;
      }

      // Команда "Джарвис смени модель"
      if (
        lowerCommand.includes("джарвис смени модель") ||
        lowerCommand.includes("jarvis смени модель")
      ) {
        playAudioResponse(
          "https://cdn.builder.io/o/assets%2Fe61c233aecf6402a8a9db34e2dc8f046%2F91df3aea397c4fbba9b49e597b4e2cb6?alt=media&token=522412d9-5f3a-454f-851c-dd4228a39931&apiKey=e61c233aecf6402a8a9db34e2dc8f046",
          () => {
            // Смена модели после аудио
            const event = new CustomEvent("changeModel", {
              detail: {
                newModelUrl:
                  "https://cdn.builder.io/o/assets%2Fe61c233aecf6402a8a9db34e2dc8f046%2F1357ace3fa8347cfa6f565692cad1fb7?alt=media&token=ebe4c351-faec-46fe-9b11-d9c4e4881670&apiKey=e61c233aecf6402a8a9db34e2dc8f046",
              },
            });
            window.dispatchEvent(event);
          },
        );
        return;
      }

      // Команда "верни модель"
      if (lowerCommand.includes("верни модель")) {
        playAudioResponse(
          "https://cdn.builder.io/o/assets%2Fe61c233aecf6402a8a9db34e2dc8f046%2F2562e9998e1d4afc90ded9608258444e?alt=media&token=1786dd2e-6e68-4c76-93fe-77066a4a2ecf&apiKey=e61c233aecf6402a8a9db34e2dc8f046",
          () => {
            // Возв��ат к оригинальной модели
            const event = new CustomEvent("changeModel", {
              detail: {
                newModelUrl:
                  "https://cdn.builder.io/o/assets%2F4349887fbc264ef3847731359e547c4f%2F14cdeb74660b46e6b8c349fa5339f8ae?alt=media&token=fa99e259-7582-4df0-9a1e-b9bf6cb20289&apiKey=4349887fbc264ef3847731359e547c4f",
              },
            });
            window.dispatchEvent(event);
          },
        );
        return;
      }

      // Команда "спасибо"
      if (lowerCommand.includes("спасибо")) {
        playAudioResponse(
          "https://cdn.builder.io/o/assets%2Fe61c233aecf6402a8a9db34e2dc8f046%2Fec5bfbae691b41d9b374b39e75694179?alt=media&token=75301093-1e6e-469a-a492-3105aee95cc9&apiKey=e61c233aecf6402a8a9db34e2dc8f046",
        );
        return;
      }

      // Команда "покажи пр��йс лист"
      if (
        lowerCommand.includes("покажи прайс лист") ||
        lowerCommand.includes("прайс лист") ||
        lowerCommand.includes("прайс") ||
        lowerCommand.includes("цены")
      ) {
        playAudioResponse(
          "https://cdn.builder.io/o/assets%2F3eff37bfce48420f81bfea727d0802d9%2Fea0c68e7425848fa87af48c5fcfd79e0?alt=media&token=88b16ebf-8330-4065-b454-15f196538359&apiKey=3eff37bfce48420f81bfea727d0802d9",
          () => {
            // Прокручиваем к прайс листу после аудио
            const pricingSection = document.querySelector(
              '[data-section="pricing"]',
            );
            if (pricingSection) {
              pricingSection.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            } else {
              // Если нет data-атрибута, ищем по классу или тексту
              const pricingElement =
                document.querySelector('h2:contains("НАШИ ЦЕНЫ")') ||
                Array.from(document.querySelectorAll("h2")).find(
                  (el) =>
                    el.textContent?.includes("НАШИ ЦЕНЫ") ||
                    el.textContent?.includes("цены") ||
                    el.textContent?.includes("ЦЕНЫ"),
                );
              if (pricingElement) {
                pricingElement.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }
            }
          },
        );
        return;
      }

      // Команда "покажи наши преимущества"
      if (
        lowerCommand.includes("покажи наши преимущества") ||
        lowerCommand.includes("наши преимущества") ||
        lowerCommand.includes("преимущества")
      ) {
        playAudioResponse(
          "https://cdn.builder.io/o/assets%2F3eff37bfce48420f81bfea727d0802d9%2F6fb621bfa5f6417391fbb189af735e4c?alt=media&token=2271b582-0acf-4930-9fe6-41004818b406&apiKey=3eff37bfce48420f81bfea727d0802d9",
          () => {
            // Прокручиваем к секции преимуществ после аудио
            const advantagesSection = document.querySelector(
              '[data-section="advantages"]',
            );
            if (advantagesSection) {
              advantagesSection.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            } else {
              // Если нет data-атрибута, ищем по тексту
              const advantagesElement = Array.from(
                document.querySelectorAll("h2"),
              ).find(
                (el) =>
                  el.textContent?.includes("НАШИ ПРЕИМУЩЕСТВА") ||
                  el.textContent?.includes("ПРЕИМУЩЕСТВА") ||
                  el.textContent?.includes("преимущества"),
              );
              if (advantagesElement) {
                advantagesElement.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }
            }
          },
        );
        return;
      }

      // Команда "открой чат"
      if (
        lowerCommand.includes("открой чат") ||
        lowerCommand.includes("открыть чат") ||
        lowerCommand.includes("чат")
      ) {
        playAudioResponse(
          "https://cdn.builder.io/o/assets%2F3eff37bfce48420f81bfea727d0802d9%2F8cdc875575354683ba86969db638b81f?alt=media&token=3b17dba6-0ef5-4b41-a462-54d46af09a3d&apiKey=3eff37bfce48420f81bfea727d0802d9",
          () => {
            // Переходим на страницу чата с Пятницей после аудио
            window.location.href = "/chat";
          },
        );
        return;
      }

      // Команда "джарвис полный доступ"
      if (
        lowerCommand.includes("джарвис полный доступ") ||
        lowerCommand.includes("jarvis полный доступ") ||
        lowerCommand.includes("полный доступ")
      ) {
        playAudioResponse(
          "https://cdn.builder.io/o/assets%2F3eff37bfce48420f81bfea727d0802d9%2F1652227bcb764a7ea61d8bdafa9654e6?alt=media&token=f2716b6b-58ef-47af-8250-b114c2e04e5e&apiKey=3eff37bfce48420f81bfea727d0802d9",
          () => {
            // Активируем режим Старка после аудио
            const event = new CustomEvent("activateStarkMode");
            window.dispatchEvent(event);
          },
        );
        return;
      }

      // Команда "отмени"
      if (
        lowerCommand.includes("отмени") ||
        lowerCommand.includes("отменить") ||
        lowerCommand.includes("выключи")
      ) {
        playAudioResponse(
          "https://cdn.builder.io/o/assets%2F3eff37bfce48420f81bfea727d0802d9%2F0af399f58c304f4086753a87ff8ce4d9?alt=media&token=27c73bcd-59ba-4644-a9fa-7dbe681dac1b&apiKey=3eff37bfce48420f81bfea727d0802d9",
          () => {
            // Отключаем режим Старка после аудио
            const event = new CustomEvent("deactivateStarkMode");
            window.dispatchEvent(event);
          },
        );
        return;
      }

      // Отправк�� в чат для обработки ИИ
      if (lowerCommand.includes("пятница")) {
        // Здесь можно отправить команду в чат с Пятницей
        console.log("💬 Отправляем команду в чат:", command);

        // Простой ау��ио ответ
        playAudioResponse(
          "https://cdn.builder.io/o/assets%2Fe61c233aecf6402a8a9db34e2dc8f046%2F88f169fa15c74679b0cef82d12ee5f8d?alt=media&token=287c51bf-45be-420b-bd4f-8bdcb60d393c&apiKey=e61c233aecf6402a8a9db34e2dc8f046",
        );
        return;
      }

      // Для других команд НЕ включаем микрофон автоматически
      console.log("ℹ️ Неизвестная команда, микрофон остается выключенным");
      isProcessingRef.current = false;
      console.log("🎤 Нажмите кнопку для включения микрофона");
    },
    [playAudioResponse],
  );

  // Отключен автоматический запуск для предотвращения ��шибок autoplay
  // Пользователь должен сам включить микрофон первым кликом
  // useEffect(() => {
  //   if (isSupported) {
  //     const timer = setTimeout(() => {
  //       if (!isListening && !isPlayingAudio && !isProcessingRef.current) {
  //         startListening();
  //       }
  //     }, 3000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [isSupported]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      console.log("🧹 Очистка компонента VoiceControl");

      // Останавливаем recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        } catch (error) {
          console.log("ℹ️ Ошибка очистки recognition:", error);
        }
      }

      // Останавливаем аудио
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Сбрасываем флаги
      isProcessingRef.current = false;
    };
  }, []);

  if (!isSupported) {
    return (
      <div className={cn("text-sm text-gray-500", className)}>
        Рас��ознавание речи не поддерживается
      </div>
    );
  }

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  if (floating) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <div className="flex flex-col items-center gap-4">
          {/* Транскрипт */}
          {transcript && (
            <div className="bg-black/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm max-w-xs border border-white/20 shadow-lg">
              <div className="text-white/90">{transcript}</div>
            </div>
          )}

          {/* Главная кнопка */}
          <Button
            onClick={() => {
              if (isListening) {
                stopListening();
              } else if (!isPlayingAudio) {
                startListening();
              }
            }}
            className={cn(
              sizeClasses[size],
              "rounded-full shadow-2xl transition-all duration-300 border-2 relative overflow-hidden",
              isPlayingAudio
                ? "bg-green-500 hover:bg-green-600 text-white border-green-400 shadow-green-500/50"
                : isListening
                  ? "bg-red-500 hover:bg-red-600 text-white border-red-400 animate-pulse shadow-red-500/50"
                  : "bg-blue-600 hover:bg-blue-700 text-white border-blue-400 shadow-blue-500/50",
            )}
          >
            {/* Анимированный фон */}
            {isListening && (
              <div className="absolute inset-0 bg-red-400/20 animate-ping rounded-full" />
            )}

            {isPlayingAudio ? (
              <Volume2 className={iconSizes[size]} />
            ) : isListening ? (
              <MicOff className={iconSizes[size]} />
            ) : (
              <Mic className={iconSizes[size]} />
            )}
          </Button>

          {/* Статус */}
          <div className="text-xs text-center font-medium">
            {isPlayingAudio ? (
              <div className="flex items-center gap-2 text-green-400">
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span>Джарвис отвечает...</span>
              </div>
            ) : isListening ? (
              <div className="flex items-center gap-2 text-red-400">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span>Слушаю команду...</span>
              </div>
            ) : (
              <div className="text-white/60">Нажмите для записи</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Встроенная версия
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Button
        onClick={() => {
          if (isListening) {
            stopListening();
          } else if (!isPlayingAudio) {
            startListening();
          }
        }}
        variant="outline"
        className={cn(
          "w-12 h-12 rounded-full transition-all duration-200",
          isPlayingAudio
            ? "bg-green-500/20 border-green-500/50 text-green-400"
            : isListening
              ? "bg-red-500/20 border-red-500/50 text-red-400 animate-pulse"
              : "bg-blue-500/20 border-blue-500/50 text-blue-400",
        )}
      >
        {isPlayingAudio ? (
          <Volume2 className="w-5 h-5" />
        ) : isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </Button>

      {transcript && (
        <div className="bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-white max-w-xs">
          {transcript}
        </div>
      )}
    </div>
  );
}
