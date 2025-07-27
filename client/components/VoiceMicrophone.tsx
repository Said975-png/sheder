import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";

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

interface VoiceMicrophoneProps {
  onCommand?: (command: string) => void;
  onTranscript?: (text: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  floating?: boolean;
}

export default function VoiceMicrophone({
  onCommand,
  onTranscript,
  className,
  size = "md",
  floating = true,
}: VoiceMicrophoneProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Определяем мобильное устройство при монтировании
  useEffect(() => {
    const mobile = isMobile();
    setIsMobileDevice(mobile);
    console.log("📱 Тип устройства:", mobile ? "Мобильное" : "Десктоп");
    console.log("🎤 Поддержка распознавания речи:", isSupported);
  }, [isSupported]);

  // Функция умного возобновления микрофона с учетом мобильных устройств
  const resumeMicrophone = (wasListening: boolean, context: string) => {
    if (!wasListening) return;

    const delay = isMobileDevice ? 500 : 100;
    setTimeout(() => {
      toggleListening();
      console.log(`🎤 Микрофон возобновлен ${context} (задержка: ${delay}ms)`);
    }, delay);
  };

  // Функция для обработки нажатия на кнопку микрофона с улучшениями для мобильных
  const handleMicrophoneClick = async () => {
    if (!isSupported) {
      console.warn("Распознавание речи не поддерживается");
      return;
    }

    // На мобильных устройствах явно запрашиваем разрешения
    if (isMobileDevice && !isListening) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("🎤 Разрешение на использование микрофона получено");
      } catch (error) {
        console.error("❌ Не удалось получить разрешение на микрофон:", error);
        alert("Для работы голосовых команд нужно разрешить доступ к микрофону");
        return;
      }
    }

    toggleListening();
  };

  // И��тория моделей для коман��ы "верни модель"
  const modelHistoryRef = useRef<string[]>([
    "https://cdn.builder.io/o/assets%2F4349887fbc264ef3847731359e547c4f%2F14cdeb74660b46e6b8c349fa5339f8ae?alt=media&token=fa99e259-7582-4df0-9a1e-b9bf6cb20289&apiKey=4349887fbc264ef3847731359e547c4f",
  ]); // Изначальная модель

  const { isListening, transcript, isSupported, toggleListening } =
    useVoiceRecognition({
      onTranscript: (text) => {
        console.log("📝 Получен транскрипт:", text);
        onTranscript?.(text);
      },
      onCommand: (command) => {
        console.log("🎯 Получена команда для обработки:", command);
        console.log("🎯 Длина команды:", command.length, "символов");
        handleCommand(command);
        onCommand?.(command);
      },
    });

  // Функция смены модели через CustomEvent
  const changeModel = (newModelUrl: string) => {
    console.log("🔄 Отправляем со��ытие смены модели:", newModelUrl);

    // Добавляем новую модель в историю
    modelHistoryRef.current.push(newModelUrl);
    console.log("📝 История моделей обно��лена:", modelHistoryRef.current);

    const event = new CustomEvent("changeModel", {
      detail: { newModelUrl },
    });
    window.dispatchEvent(event);
  };

  // Ф��н��ция возврата к предыдущей модели
  const revertToPreviousModel = () => {
    if (modelHistoryRef.current.length <= 1) {
      console.log("⚠️ Нет предыдущих моделей для возврата");
      return;
    }

    // Удаляем текущую модель и возвращаемся к предыдущей
    modelHistoryRef.current.pop();
    const previousModelUrl =
      modelHistoryRef.current[modelHistoryRef.current.length - 1];

    console.log("↩️ Возвраща��мся к предыдущей модели:", previousModelUrl);
    console.log("📝 История моделей после возврат��:", modelHistoryRef.current);

    const event = new CustomEvent("changeModel", {
      detail: { newModelUrl: previousModelUrl },
    });
    window.dispatchEvent(event);
  };

  // Функция воспрои��ведения а��дио с колбэ��ом
  const playAudioWithCallback = (audioUrl: string, callback?: () => void) => {
    if (isPlayingAudio) {
      console.log("⏸️ Аудио уже воспроизводится");
      return;
    }

    // Останавливаем предыдущее аудио если ест��
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Останавливаем прослушивание на время воспроизведения аудио
    const wasListening = isListening;
    if (isListening) {
      toggleListening(); // Останавливаем микрофон
    }

    setIsPlayingAudio(true);
    console.log(
      "🔊 Начинаем восп��оизведение аудио с колбэком, микр��фон остановлен",
    );

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      setIsPlayingAudio(false);
      audioRef.current = null;
      console.log("✅ Воспроизведе��ие завершено, выполняем колбэк");

      // Выполняем колбэк если есть
      if (callback) {
        callback();
      }

      // Возобновляем прослушивание если оно было активно
      resumeMicrophone(wasListening, "после аудио");
    };

    audio.onerror = () => {
      setIsPlayingAudio(false);
      audioRef.current = null;
      console.error("❌ Ошибка воспроизведения аудио");

      // Возобновляем прослушивание если была ошибка
      resumeMicrophone(wasListening, "после ошибки аудио");
    };

    audio.play().catch((error) => {
      setIsPlayingAudio(false);
      audioRef.current = null;
      console.error("❌ Не удалось воспроизвести аудио:", error);

      // Проверяем, является ли ошибка связанной с авт��воспроизведение��
      if (
        error.name === "NotAllowedError" ||
        error.message.includes("user didn't interact")
      ) {
        console.log(
          "⚠️ Автовоспроизведение заблокировано - требуется взаимодействие пользователя",
        );
      }

      // Возобновляем прослушивание если не удалось воспроизвести
      resumeMicrophone(wasListening, "после неудачного воспроизведения");
    });
  };

  // Функция воспрои��ведения аудио (простая версия)
  const playAudio = (audioUrl: string) => {
    if (isPlayingAudio) {
      console.log("⏸️ Аудио уже воспроизводится");
      return;
    }

    // Останавлив��ем предыдущее аудио если есть
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Останавливаем прослушив��ние на время во��произведения аудио
    const wasListening = isListening;
    if (isListening) {
      toggleListening(); // Останавливаем микро����он
    }

    setIsPlayingAudio(true);
    console.log("🔊 Начинаем ��оспроизведение аудио, м��крофон остановлен");

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      setIsPlayingAudio(false);
      audioRef.current = null;
      console.log("✅ Воспроизведение завершено");

      // Возобновляем прослушивание если оно было активно
      resumeMicrophone(wasListening, "после аудио");
    };

    audio.onerror = () => {
      setIsPlayingAudio(false);
      audioRef.current = null;
      console.error("❌ Ошибка воспроизведения аудио");

      // Возобновляем прослушивание если ��ыла ошибка
      resumeMicrophone(wasListening, "после ошибки аудио");
    };

    audio.play().catch((error) => {
      setIsPlayingAudio(false);
      audioRef.current = null;
      console.error("❌ Не удалось воспроизвести аудио:", error);

      // Проверяем, является ли ошибка связанной с автовоспроизведением
      if (
        error.name === "NotAllowedError" ||
        error.message.includes("user didn't interact")
      ) {
        console.log(
          "⚠️ Автовоспроизведение заблокировано - требуется взаимодействие пользователя",
        );
      }

      // Возобновляем прослушивание если не удалось воспроизвести
      resumeMicrophone(wasListening, "после неудачного воспроизведения");
    });
  };

  const handleCommand = (command: string) => {
    const lowerCommand = command.toLowerCase().trim();
    console.log("🔍 Анализируем команду:", `"${lowerCommand}"`);
    console.log("📱 Мобильное устройство:", isMobileDevice);

    // Фильтруем слишком ко��откие команды (вероятно ложные срабатывания)
    if (lowerCommand.length < 3) {
      console.log("⚠️ Команда слишком короткая, игнорируем");
      return;
    }

    // Команда "Джарвис ты тут" - воспроизводим аудио ответ
    if (
      lowerCommand.includes("джарвис ты тут") ||
      lowerCommand.includes("jarvis ты тут") ||
      (lowerCommand.includes("джарвис") && lowerCommand.includes("тут"))
    ) {
      console.log(
        "🎯 Команда 'Джарвис ты тут' получена - воспроизводим аудио ответ",
      );
      playAudio(
        "https://cdn.builder.io/o/assets%2Fe61c233aecf6402a8a9db34e2dc8f046%2F88f169fa15c74679b0cef82d12ee5f8d?alt=media&token=287c51bf-45be-420b-bd4f-8bdcb60d393c&apiKey=e61c233aecf6402a8a9db34e2dc8f046",
      );
      return;
    }

    // Коман��а "Джарвис смени модель" - воспроизводим а��дио и меняем модель
    if (
      lowerCommand.includes("джарвис смени модель") ||
      lowerCommand.includes("jarvis смени модель") ||
      (lowerCommand.includes("джарвис") &&
        (lowerCommand.includes("смени модель") ||
          lowerCommand.includes("сми модель")))
    ) {
      console.log(
        "🎯 Команда 'Джа��вис смени м��дель' получена - восп��оизводим аудио и меняем модель",
      );

      // Сначала воспроизводим аудио ответ
      playAudioWithCallback(
        "https://cdn.builder.io/o/assets%2Fe61c233aecf6402a8a9db34e2dc8f046%2F91df3aea397c4fbba9b49e597b4e2cb6?alt=media&token=522412d9-5f3a-454f-851c-dd4228a39931&apiKey=e61c233aecf6402a8a9db34e2dc8f046",
        () => {
          // После окончания аудио меняем модель
          console.log("🔄 Смена модели после аудио ответа");
          changeModel(
            "https://cdn.builder.io/o/assets%2Fe61c233aecf6402a8a9db34e2dc8f046%2F1357ace3fa8347cfa6f565692cad1fb7?alt=media&token=ebe4c351-faec-46fe-9b11-d9c4e4881670&apiKey=e61c233aecf6402a8a9db34e2dc8f046",
          );
        },
      );
      return;
    }

    // Команда "верни модел��" - воспроизводим аудио и возвращаем предыдущую модель
    if (
      lowerCommand.includes("верни м��дель") ||
      lowerCommand.includes("верни модел") ||
      lowerCommand.includes("верни м") ||
      (lowerCommand.includes("верни") && lowerCommand.includes("модель"))
    ) {
      console.log(
        "🎯 Команда 'верни моде��ь' получена - воспроизводим аудио и возвращаем предыдущую модель",
      );

      // Сначала воспроизвод��м аудио ответ
      playAudioWithCallback(
        "https://cdn.builder.io/o/assets%2Fe61c233aecf6402a8a9db34e2dc8f046%2F2562e9998e1d4afc90ded9608258444e?alt=media&token=1786dd2e-6e68-4c76-93fe-77066a4a2ecf&apiKey=e61c233aecf6402a8a9db34e2dc8f046",
        () => {
          // После окончания аудио возвращаем предыдущую модель
          console.log("↩️ Возврат к предыдущей модели после аудио ответа");
          revertToPreviousModel();
        },
      );
      return;
    }

    // Команда "спасибо" - воспроизводим аудио отве��
    if (lowerCommand.includes("спасибо")) {
      console.log("🎯 Команда 'спасибо' получена - воспр��изводим аудио ответ");
      playAudioWithCallback(
        "https://cdn.builder.io/o/assets%2Fe61c233aecf6402a8a9db34e2dc8f046%2Fec5bfbae691b41d9b374b39e75694179?alt=media&token=75301093-1e6e-469a-a492-3105aee95cc9&apiKey=e61c233aecf6402a8a9db34e2dc8f046",
        () => {
          console.log("✅ Аудио ответ 'спасибо' завершен");
        },
      );
      return;
    }

    // Команда "покажи пр��йс лист" - вос��роизводим аудио и скроллим к прайсам
    if (
      lowerCommand.includes("покажи прайс лист") ||
      lowerCommand.includes("п��айс лис��") ||
      lowerCommand.includes("прайс") ||
      lowerCommand.includes("цены")
    ) {
      console.log(
        "🎯 Команда 'покажи прайс лист' получена - воспроизводим аудио и скроллим",
      );
      playAudioWithCallback(
        "https://cdn.builder.io/o/assets%2F3eff37bfce48420f81bfea727d0802d9%2Fea0c68e7425848fa87af48c5fcfd79e0?alt=media&token=88b16ebf-8330-4065-b454-15f196538359&apiKey=3eff37bfce48420f81bfea727d0802d9",
        () => {
          console.log("✅ Аудио ответ завершен, скроллим к прайс листу");
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
            const pricingElement = Array.from(
              document.querySelectorAll("h2"),
            ).find(
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

    // Кома��да "покажи наши преимущества" - воспроизводим аудио и скроллим к преимуществам
    if (
      lowerCommand.includes("покажи наши преимущества") ||
      lowerCommand.includes("наши преимущества") ||
      lowerCommand.includes("преимущества")
    ) {
      console.log(
        "🎯 Команда 'покажи ��аши преимущ��ства' полу��ена - воспроизводим аудио и скроллим",
      );
      playAudioWithCallback(
        "https://cdn.builder.io/o/assets%2F3eff37bfce48420f81bfea727d0802d9%2F6fb621bfa5f6417391fbb189af735e4c?alt=media&token=2271b582-0acf-4930-9fe6-41004818b406&apiKey=3eff37bfce48420f81bfea727d0802d9",
        () => {
          console.log("✅ Аудио ответ завершен, скроллим к секции преимуществ");
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

    // Команда "открой чат" - воспроизводим аудио и переходим в чат с Пятницей
    if (
      lowerCommand.includes("о��крой чат") ||
      lowerCommand.includes("открыть чат") ||
      lowerCommand.includes("чат")
    ) {
      console.log(
        "🎯 Команда 'открой чат' получена - воспроизводим аудио и переходим в чат",
      );
      playAudioWithCallback(
        "https://cdn.builder.io/o/assets%2F3eff37bfce48420f81bfea727d0802d9%2F8cdc875575354683ba86969db638b81f?alt=media&token=3b17dba6-0ef5-4b41-a462-54d46af09a3d&apiKey=3eff37bfce48420f81bfea727d0802d9",
        () => {
          console.log("✅ Аудио ответ завершен, переходим в чат с Пятницей");
          // Переходим на страницу чата с Пятницей после аудио
          window.location.href = "/chat";
        },
      );
      return;
    }

    // Ком��нда "джарвис полный доступ" - воспроизводим аудио и активируем режим Старка
    if (
      lowerCommand.includes("джарвис полн��й доступ") ||
      lowerCommand.includes("jarvis пол��ый доступ") ||
      lowerCommand.includes("полный доступ")
    ) {
      console.log(
        "🎯 Команда 'джарвис полный доступ' получена - активируем режим Старка",
      );
      playAudioWithCallback(
        "https://cdn.builder.io/o/assets%2F3eff37bfce48420f81bfea727d0802d9%2F1652227bcb764a7ea61d8bdafa9654e6?alt=media&token=f2716b6b-58ef-47af-8250-b114c2e04e5e&apiKey=3eff37bfce48420f81bfea727d0802d9",
        () => {
          console.log("✅ Аудио ответ завершен, активируем режим Старка");
          // Активируем режим Старка после аудио
          const event = new CustomEvent("activateStarkMode");
          window.dispatchEvent(event);
        },
      );
      return;
    }

    // Команда "отмени" - воспроизводим аудио и отключаем режим Старка
    if (
      lowerCommand.includes("отмени") ||
      lowerCommand.includes("отменить") ||
      lowerCommand.includes("выключи")
    ) {
      console.log("🎯 Команда 'отмени' получена - отключаем режим Старка");
      playAudioWithCallback(
        "https://cdn.builder.io/o/assets%2F3eff37bfce48420f81bfea727d0802d9%2F0af399f58c304f4086753a87ff8ce4d9?alt=media&token=27c73bcd-59ba-4644-a9fa-7dbe681dac1b&apiKey=3eff37bfce48420f81bfea727d0802d9",
        () => {
          console.log("✅ Аудио ответ завершен, отключаем режим Старка");
          // Отключаем режим Старка после аудио
          const event = new CustomEvent("deactivateStarkMode");
          window.dispatchEvent(event);
        },
      );
      return;
    }

    // Простые команды для демонстрации
    if (
      lowerCommand.includes("привет") ||
      lowerCommand.includes("здравствуй")
    ) {
      console.log("👋 Команда приветствия получена");
    } else if (lowerCommand.includes("благодарю")) {
      console.log("🙏 Команда благодарности получена");
    } else if (
      lowerCommand.includes("помощь") ||
      lowerCommand.includes("help")
    ) {
      console.log("❓ Запрос помощи пол��чен");
    }
  };

  if (!isSupported) {
    return (
      <div className={cn("text-sm text-gray-500", className)}>
        Распознавание речи не под��ерживается в этом браузере
      </div>
    );
  }

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  if (floating) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <div className="flex flex-col items-center gap-3">
          {/* Транскрипт */}
          {transcript && (
            <div className="bg-slate-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm max-w-xs border border-slate-700/50 shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Volume2 className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-400 font-medium">
                  Распознано:
                </span>
              </div>
              <div className="text-white/90">{transcript}</div>
            </div>
          )}

          {/* Кнопка микрофона */}
          <Button
            onClick={handleMicrophoneClick}
            size="lg"
            className={cn(
              sizeClasses[size],
              "rounded-full shadow-lg transition-all duration-200 border-2",
              isListening
                ? "bg-red-500 hover:bg-red-600 text-white border-red-400 animate-pulse shadow-red-500/30"
                : "bg-blue-600 hover:bg-blue-700 text-white border-blue-400 shadow-blue-500/30",
            )}
          >
            {isListening ? (
              <MicOff className={iconSizes[size]} />
            ) : (
              <Mic className={iconSizes[size]} />
            )}
          </Button>

          {/* Статус */}
          <div className="text-xs text-center">
            {!isSupported ? (
              <div className="flex items-center gap-1 text-red-400">
                <VolumeX className="w-3 h-3" />
                <span>Не поддерживается</span>
              </div>
            ) : isPlayingAudio ? (
              <div className="flex items-center gap-1 text-green-400">
                <Volume2 className="w-3 h-3 animate-pulse" />
                <span>Говорю...</span>
              </div>
            ) : isListening ? (
              <div className="flex items-center gap-1 text-red-400">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span>
                  {isMobileDevice ? "Слушаю (мобильный)..." : "Слушаю..."}
                </span>
              </div>
            ) : (
              <div className="text-slate-400">
                {isMobileDevice ? "Тап для записи" : "Нажмите для записи"}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Встроенный режим
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* ��ранскрипт (встроенный) */}
      {transcript && (
        <div className="flex-1 bg-slate-800/50 border border-slate-600/30 rounded-lg px-3 py-2 text-sm text-white/90 max-w-xs">
          {transcript}
        </div>
      )}

      {/* Статус аудио (встроенный) */}
      {isPlayingAudio && (
        <div className="flex items-center gap-1 text-green-400 text-xs">
          <Volume2 className="w-3 h-3 animate-pulse" />
          <span>Говорю...</span>
        </div>
      )}

      {/* Кнопка микрофона (встро��н��ая) */}
      <Button
        onClick={handleMicrophoneClick}
        variant="outline"
        size="sm"
        disabled={isPlayingAudio}
        className={cn(
          sizeClasses[size],
          "rounded-xl transition-all duration-200",
          isPlayingAudio
            ? "bg-green-500/20 border-green-500/50 text-green-400"
            : isListening
              ? "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
              : "border-blue-400/30 bg-slate-800/50 text-blue-400 hover:bg-blue-500/20",
        )}
      >
        {isPlayingAudio ? (
          <Volume2 className={iconSizes[size]} />
        ) : isListening ? (
          <MicOff className={iconSizes[size]} />
        ) : (
          <Mic className={iconSizes[size]} />
        )}
      </Button>
    </div>
  );
}
