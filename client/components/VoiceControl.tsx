import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useJarvisSpeech } from "@/components/JarvisSpeech";

interface VoiceControlProps {
  onAddBasicPlan: () => void;
  onAddProPlan: () => void;
  onAddMaxPlan: () => void;
  inNavbar?: boolean;
  onListeningChange?: (isListening: boolean, transcript?: string) => void;
  forceStop?: boolean;
  onModelRotateStart?: () => void;
  onModelRotateStop?: () => void;
}

export default function VoiceControl({
  onAddBasicPlan,
  onAddProPlan,
  onAddMaxPlan,
  inNavbar = false,
  onListeningChange,
  forceStop = false,
  onModelRotateStart,
  onModelRotateStop,
}: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [noSpeechCount, setNoSpeechCount] = useState(0);
  const [networkErrorCount, setNetworkErrorCount] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const commandDelayRef = useRef<NodeJS.Timeout | null>(null);
  const lastGreetingTimeRef = useRef<number>(0);
  const lastCommandRef = useRef<string>("");
  const commandCooldownRef = useRef<boolean>(false);
  const audioPlayingRef = useRef<boolean>(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const { getTotalItems, clearCart } = useCart();
  const {
    speak: jarvisSpeak,
    speakCommand,
    speakResponse,
    speakAlert,
    stop: stopJarvis,
    isSpeaking: isJarvisSpeaking,
  } = useJarvisSpeech();

  useEffect(() => {
    // Прове��яем поддер��ку Speech Recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "ru-RU";

        // МАКСИМАЛЬНЫЕ настройки для лучшего распознавания на расстоянии
        recognitionRef.current.maxAlternatives = 50; // Увеличиваем с 10 до 50 для лучшего распознавания

        // Уста��авливаем максимальну�� чувствительность
        try {
          // @ts-ignore - Настройки ��ля улучш��ния захват��� тихо�� речи
          if (recognitionRef.current.webkitAudioTrack) {
            recognitionRef.current.webkitAudioTrack.enabled = true;
          }
          // @ts-ignore - МАКСИМАЛЬНОЕ усиление мик��офона
          if (recognitionRef.current.webkitGainNode) {
            recognitionRef.current.webkitGainNode.gain.value = 5.0; // Увеличиваем с 2.0 до 5.0
          }
        } catch (e) {
          console.log("Продвинутые настройки микрофон�� недост��пны");
        }

        // Допо��нительные настройки для Chrome/WebKit - максимальная чувств��тельн��сть
        if (
          recognitionRef.current.webkitSpeechRecognition ||
          "webkitSpeechRecognition" in window
        ) {
          // @ts-ignore - WebKit specific properties
          recognitionRef.current.webkitContinuous = true;
          // @ts-ignore
          recognitionRef.current.webkitInterimResults = true;
          // @ts-ignore - Уб��раем ограничен��я грамматики д��я луч��его распознавания
          recognitionRef.current.webkitGrammars = null;
          // @ts-ignore - МАКСИМАЛЬНОЕ количество аль��ернатив
          recognitionRef.current.webkitMaxAlternatives = 50; // Увеличиваем с 10 до 50

          // @ts-ignore - Нас��ройки для дальнего р��спознавания
          try {
            // МАКСИМАЛЬНЫЕ настройки для дальнего распознавания
            recognitionRef.current.webkitNoiseReduction = false; // ОТКЛЮЧАЕМ для лучшего захвата тихих звуков
            recognitionRef.current.webkitEchoCancellation = false; // ОТКЛЮЧАЕ�� для максимальной чувствительности
            recognitionRef.current.webkitAutoGainControl = true; // Оставляем для автоматическо��о усиления
            recognitionRef.current.webkitHighpassFilter = false; // Отключаем фильтр для лучшег�� захвата низких частот
            recognitionRef.current.webkitTypingNoiseDetection = false; // Отключаем фильтрацию шума клавиатуры
            // МАКСИМАЛЬНАЯ чувствительно��ть к тих��м звукам
            recognitionRef.current.webkitSensitivity = 0.0; // МИНИМАЛЬНЫЙ порог для макси��альной чувствительности
            recognitionRef.current.webkitSpeechInputMinimumLengthMS = 200; // УМЕНЬШАЕМ минимальную длину с 500 до 200
            recognitionRef.current.webkitSpeechInputCompleteTimeoutMS = 3000; // УВЕЛИЧИВАЕМ таймаут с 2000 до 3000

            // Дополнительные настройки для максимальной чувствительности
            recognitionRef.current.webkitAudioGain = 3.0; // Дополнительное усиление аудио
            recognitionRef.current.webkitBackgroundNoiseReduction = false; // Отключаем подавление фонового шума
            recognitionRef.current.webkitVoiceActivityDetection = false; // Отключаем детекцию активности голоса для постоянного слушания
          } catch (e) {
            console.log("Расширенны�� настройки WebKit недоступны");
          }
        }

        // Дополнительные нас��ройки для луч��его ра��познава��ия длинны�� фраз
        try {
          // @ts-ignore - Эти ��ас���ройки помогают лучше распознав�����ь речь
          if (recognitionRef.current.webkitSpeechRecognition) {
            recognitionRef.current.webkitSpeechRecognition.continuous = true;
            recognitionRef.current.webkitSpeechRecognition.interimResults =
              true;
          }
        } catch (e) {
          // Игн��рируем ������и��ки настроек
        }
        // Настройка пря��ого досту��а к микрофону для лучшего качества
        try {
          // Запрашиваем д��ст��п к мик��о��ону с оптимальными настройками
          navigator.mediaDevices
            .getUserMedia({
              audio: {
                // МАКСИМАЛЬНАЯ чувствительность - отключаем все фильтры
                echoCancellation: false, // ОТКЛЮЧАЕМ для максимальной чувствительности
                noiseSuppression: false, // ОТКЛЮЧАЕМ для захвата даже тихих звуков
                autoGainControl: true, // Оставляем для автоматического усиления тихих звуков
                // @ts-ignore - Продвинут��е настройки для максимального захвата звука
                googEchoCancellation: false, // ОТКЛЮЧАЕМ Google фильтр эха
                googAutoGainControl: true, // ВКЛЮЧАЕМ автоматическое усиление Google
                googNoiseSuppression: false, // ОТКЛЮЧАЕМ подавление шума Google
                googHighpassFilter: false, // Отключаем высокочастотный фильтр
                googTypingNoiseDetection: false, // Отключаем детекцию шума клавиатуры
                googAudioMirroring: false,
                googExperimentalNoiseSuppression: false, // Отключаем экспериментальное подавление шума
                googExperimentalAutoGainControl: true, // Включаем экспериментальное усиление
                googDAEchoCancellation: false, // Отключаем продвинутое эхо
                // Настройки максимальной чувствительности
                latency: 0.01, // Минимальная задержка для быстрого отклика
                volume: 1.0, // Максимальная громкость
                sampleRate: 48000, // Максималь��ое к��чество записи
                sampleSize: 24, // Увеличиваем разрядность с 16 до 24 для лучшего качества
                channelCount: 2, // Стерео для лучшего захвата
              },
            })
            .then((stream) => {
              console.log(
                "���� Получен до��туп к микрофону с улучшенными настройками",
              );
              // Примен��ем настр��йки к потоку
              const audioTracks = stream.getAudioTracks();
              if (audioTracks.length > 0) {
                const track = audioTracks[0];
                const capabilities = track.getCapabilities();
                console.log("🔧 Возможности микрофона:", capabilities);

                // Применяем максимальные настройки чувствительности если поддерживаются
                const constraints = {
                  echoCancellation: false, // ОТ��ЛЮЧАЕМ для максимальной чувствительности
                  noiseSuppression: false, // ОТКЛЮЧАЕМ для захвата тихих звуков
                  autoGainControl: true, // Оставляем для автоматического усиления
                  // Дополнительные настройки для максимального качества
                  latency: { ideal: 0.01 }, // Минимальная задержка
                  sampleRate: { ideal: 48000 }, // Максимальная часто��а дискретизации
                  channelCount: { ideal: 2 }, // Стерео для лучшего качес��ва
                  volume: { ideal: 1.0 }, // Максимальная громкость
                };
                track
                  .applyConstraints(constraints)
                  .catch((e) =>
                    console.log(
                      "Не удалось применить дополните��ьные огра��ичения:",
                      e,
                    ),
                  );
              }
              // Освобождаем поток, ��ак как SpeechRecognition созд��ст свой
              stream.getTracks().forEach((track) => track.stop());
            })
            .catch((e) => {
              console.log(
                "Стандартный доступ к микрофону, ра���ширенные настройки недоступны",
              );
            });
        } catch (e) {
          console.log("MediaDevices API недоступен");
        }

        // @ts-ignore - эти свойства мо��ут не быть в т��па��, но р��бо����ют в браузерах
        if ("webkitSpeechRecognition" in window) {
          recognitionRef.current.serviceURI =
            "wss://www.google.com/speech-api/full-duplex/v1/up";
        }

        recognitionRef.current.onstart = () => {
          console.log("🎤 Ра��познава��и���� речи запущено");
        };

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = "";
          let interimTranscript = "";
          let combinedTranscript = "";

          // ПРАВИЛЬНО обрабатываем ВСЕ результаты для получения полной фразы
          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          // Объединяем финальные и промежуточные результаты для полной фразы
          combinedTranscript = (finalTranscript + interimTranscript).trim();

          // ��ильтруем пов��оряющиес�� фразы и слишком длинные р��зу��ьтаты
          if (combinedTranscript.length > 50) {
            console.log(
              "🚫 Отклоняем слиш��ом дли��ный результат:",
              combinedTranscript.length,
              "символов",
            );
            combinedTranscript = "";
          }

          // Проверяем на п���вт��ряющиеся слова (п��изнак на��о��ле��и��)
          const words = combinedTranscript.split(" ");
          const uniqueWords = [...new Set(words)];
          if (words.length > uniqueWords.length * 2) {
            console.log(
              "🚫 О��кл����ня��м результат с ���овторя��щим��ся словами",
            );
            combinedTranscript = "";
          }

          // Показываем только СТАБИЛЬНЫЕ результаты - финальные или достаточно длинные промежуточные
          if (
            combinedTranscript &&
            combinedTranscript.length >= 3 && // Минимум 3 символа для отображения
            combinedTranscript.length < 150 && // Лимит для длинных команд
            !commandCooldownRef.current &&
            !isSpeaking &&
            !audioPlayingRef.current &&
            combinedTranscript !== lastCommandRef.current &&
            (finalTranscript || interimTranscript.length >= 5) // Показываем финальные ИЛИ промежуточные от 5+ символов
          ) {
            setTranscript(combinedTranscript);
            onListeningChange?.(true, combinedTranscript);
            console.log("🎯 Стабильный результат:", `"${combinedTranscript}"`);
          }

          // Об���абат��ваем финальные рез��л��таты или ��остаточно длинн��е промежуто��ны��
          // Ко��анда откл��чения имеет абсолютный приоритет �� выполняется всегда
          const isShutdownCommand =
            (finalTranscript || combinedTranscript)
              .toLowerCase()
              .includes("отключись") ||
            (finalTranscript || combinedTranscript)
              .toLowerCase()
              .includes("выключи��ь");

          // Пр��ну����ительно сбрасываем застрявшие б��о��иров��и если система молчит дольше 5 секунд
          const now = Date.now();
          const timeSinceLastCommand =
            now - (lastCommandRef.current ? Date.now() : 0);
          if (
            commandCooldownRef.current &&
            !isSpeaking &&
            !audioPlayingRef.current
          ) {
            console.log(
              "����� Принудите���ь���о сбрасываем застрявши�� блокиро��ки",
            );
            commandCooldownRef.current = false;
            lastCommandRef.current = "";
          }

          // Обрабатываем команды ТОЛЬКО для финальных результатов или очень уверенных промежуточных
          if (
            (finalTranscript ||
              (interimTranscript.length > 8 &&
                combinedTranscript.length > 8)) && // Финальные ИЛИ длинные промежуточные (8+ символов)
            (isShutdownCommand || (!commandCooldownRef.current && !isSpeaking))
          ) {
            const command = (finalTranscript || combinedTranscript)
              .toLowerCase()
              .trim();
            console.log("🔍 ��нализируем ���ом��нду:", `"${command}"`);

            // Проверя��м, что ��оман��а отличается от предыдущей и достаточно длинная для стабильного выполнения
            if (
              command &&
              command !== lastCommandRef.current &&
              command.length >= 3 && // Минимум 3 символа д��я выполнения команды
              (finalTranscript || command.length >= 8) // Финальные результаты ИЛИ длинные промежуточные (8+ символов)
            ) {
              console.log(
                "�� К��манда принята дл�� обраб��т��и:",
                `"${command}"`,
              );
              setTranscript(command);
              onListeningChange?.(true, command);

              // Оч����аем п����едыдущ����� т��ймер
              if (commandDelayRef.current) {
                clearTimeout(commandDelayRef.current);
              }

              // Добавляем небол��шую ��ад����жку для завершения фра��ы
              commandDelayRef.current = setTimeout(
                () => {
                  lastCommandRef.current = command;
                  setNoSpeechCount(0); // Сб��а��ываем счетчик пр�� ус��ешном ра���������ознавании

                  processVoiceCommand(command);

                  // Быстр������я о��истка транскрипт�� после запуска ко������а��ды
                  setTimeout(() => {
                    console.log(
                      "����� Б��с��р��������������я очистка т�����нскрипт��",
                    );
                    setTranscript("");
                    // НЕ вызываем onListeningChange, �����обы н�� откр��вать па��ель после отключения
                  }, 400); // Уменьшаем с 800 до 400мс для быстрого отклика

                  // Полная очист��а состояния ��ома��ды и ��ерезап��ск Recognition
                  setTimeout(() => {
                    console.log(
                      "🧹 ��олная очистка ��ос���оя��ия пос��е команды",
                    );
                    setTranscript("");
                    // НЕ вы��ываем onListeningChange, чтобы не от��рывать панель после отключен��я
                    lastCommandRef.current = "";

                    // Н�� перезапускаем Recognition - пусть работ���ет непрерывно
                    console.log(
                      "��� ��ос��ояние очищено, Recognition продолжает работать",
                    );
                  }, 1000); // Уменьшаем с 2000 до 1000мс
                },
                finalTranscript ? 100 : 800, // Быстро для финальных, больше времени для промежуточных
              ); // Разные задержки для финальных и промежуточных результатов
            } else {
              console.log("❌ Команда о��кл��нена:", {
                isEmpty: !command,
                isSame: command === lastCommandRef.current,
                isTooShort: command.length < 3,
                isInterim: !finalTranscript && command.length < 8,
                lastCommand: lastCommandRef.current,
                currentCommand: command,
              });

              // Принудительно очищаем с��стояние для отклоненных команд
              setTimeout(() => {
                if (!isSpeaking && !audioPlayingRef.current) {
                  console.log("🧹 Очистка состояния после отклоненной команды");
                  commandCooldownRef.current = false;
                  lastCommandRef.current = "";
                  // Очищаем транскрипт только для коротких промежуточных результатов
                  if (!finalTranscript && command.length < 8) {
                    setTranscript("");
                    console.log("🧹 Очищен промежуточный транскрипт");
                  }
                }
              }, 1000);
            }
          }
        };

        recognitionRef.current.onend = () => {
          console.log(
            "�� Распознавание завер��илось, isListening:",
            isListening,
            "isSpeaking:",
            isSpeaking,
          );

          // ВС��ГДА перезапус����аем распознавание, ес��и польз��ватель не отключил микрофон вручную
          if (isListening) {
            console.log("🔄 Перез��пус��аем р��спо��н��вание...");

            // Очищаем состояние ��еред перезапуском
            setTranscript("");
            lastCommandRef.current = "";

            setTimeout(() => {
              if (isListening) {
                const started = safeStartRecognition();
                if (!started) {
                  console.log(
                    "ℹ️ Первая попытка запуска не удалась, пробуем через 500мс",
                  );
                  // Есл�� не удало��ь ��ерез���пу��тить, попробуем еще раз через 500мс
                  setTimeout(() => {
                    if (isListening) {
                      safeStartRecognition();
                    }
                  }, 500);
                }
              }
            }, 100);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.log("Speech recognition event:", event.error);

          // ��ритические ошибки �� у��ным восстановлени��м
          if (event.error === "network") {
            setNetworkErrorCount((prev) => prev + 1);
            console.error(
              `🚨 ��етевая ошибк���� ра����познавания #${networkErrorCount + 1}`,
            );

            // Если слишком м��ого сетевых ошибо�� подряд - отключаем
            if (networkErrorCount >= 3) {
              console.error(
                "��� Слишком много сетевых ошибок - отключаем ��аспознавание",
              );
              setIsListening(false);
              onListeningChange?.(false, "");
              setNetworkErrorCount(0);
              return;
            }

            // Попытка восстановления с увеличивающейся заде��жкой
            const retryDelay = Math.min(3000 * (networkErrorCount + 1), 10000); // От 3 до 10 секунд
            console.log(`🔄 Попытка восста��ов���ения че��ез ${retryDelay}мс`);

            setTimeout(() => {
              if (isListening) {
                console.log(
                  "���� В��сстанавливаем распознавани�� после сетевой ошиб������",
                );
                const started = safeStartRecognition();
                if (started) {
                  console.log("✅ Распознава��ие восстановлено");
                  setNetworkErrorCount(0); // Сбрасываем счетчик при успехе
                } else {
                  console.error("❌ Не удалось восстановить распознавание");
                }
              }
            }, retryDelay);
          }
          // Критическ��я ошиб��а разрешений - отключае����
          else if (event.error === "not-allowed") {
            console.error("�� Доступ �� микрофону ��апрещен");
            setIsListening(false);
            onListeningChange?.(false, "");
          }
          // Некри��и��ески�� ��шибки - игнорир��е���� и ���родолж��������ем
          else if (
            event.error === "no-speech" ||
            event.error === "audio-capture" ||
            event.error === "aborted"
          ) {
            if (event.error === "no-speech") {
              setNoSpeechCount((prev) => prev + 1);
              console.log(
                `ℹ️ No-speech о���ибка #${noSpeechCount + 1} - п�����од��лжаем ��лу����ать`,
              );

              // Есл���� сл��шк��м мн����о no-speech о��ибок ��одряд, делаем неб��льшую паузу
              if (noSpeechCount >= 3) {
                console.log(
                  "⏸️ �����ого no-speech ошибок, делаем паузу 2 ��ек...",
                );
                setTimeout(() => {
                  setNoSpeechCount(0);
                  if (isListening) {
                    safeStartRecognition();
                  }
                }, 2000);
              }
            } else {
              console.log(
                "ℹ️ Некр��ти��е��кая ошибк�� ���аспознава��ия:",
                event.error,
                "- ����р����ол��аем сл��шать",
              );
            }
            // Сис��е������ автомати��ески ��ереза����ус����ится через onend
          }
          // Другие оши��ки - �������ре��апускаем через корот���ое время
          else {
            console.warn(
              "⚠���� Неожиданн���я ошибка ра��позна����ния:",
              event.error,
              "- перезапу��каем",
            );
            setTimeout(() => {
              if (isListening) {
                safeStartRecognition();
              }
            }, 1000);
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      // Ос��анавливаем любое воспроизводящееся ����удио при раз��онтировани��
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }
      // Очищаем т���������йм��р ко��анд
      if (commandDelayRef.current) {
        clearTimeout(commandDelayRef.current);
      }
    };
  }, []);

  // Безопасная функция запуска SpeechRecognition
  const safeStartRecognition = () => {
    if (!recognitionRef.current) {
      console.log("❌ recognitionRef.current не инициализирован");
      return false;
    }

    // Проверяем текущее состояние SpeechRecognition
    try {
      // Если уже запущен, не пытаемся запустить снова
      if (recognitionRef.current.continuous === undefined) {
        console.log("⚠️ SpeechRecognition не готов к запуску");
        return false;
      }

      recognitionRef.current.start();
      console.log("✅ SpeechRecognition безопасно запущен");
      return true;
    } catch (error: any) {
      if (error.name === "InvalidStateError") {
        console.log("ℹ️ SpeechRecognition уже запущен, пропускаем");
        return true; // Считаем это успехом, так как цель достигнута
      } else {
        console.error("❌ Ошибка зап��ска SpeechRecognition:", error);
        return false;
      }
    }
  };

  // Безопасная функция остановки SpeechRecognition
  const safeStopRecognition = () => {
    if (!recognitionRef.current) {
      return;
    }

    try {
      recognitionRef.current.stop();
      console.log("✅ SpeechRecognition безопасно остановлен");
    } catch (error) {
      console.log(
        "ℹ️ Ошибка остановки SpeechRecognition (возможно уже остановлен):",
        error,
      );
    }
  };

  // Функ��ия для полног�� сброса Speech Recognition
  const resetSpeechRecognition = () => {
    if (recognitionRef.current) {
      console.log("�� П����лный сброс Speech Recognition");
      safeStopRecognition();

      setTimeout(() => {
        if (isListening) {
          const started = safeStartRecognition();
          if (started) {
            console.log("✅ Speech Recognition перезапущен и очи����ен");
          } else {
            console.log("⚠️ Не удалось перезапустить Speech Recognition");
          }
        }
      }, 200);
    }
  };

  // Effect ��ля о��работки тестов��х ко������нд
  useEffect(() => {
    const handleTestCommand = (event: any) => {
      console.log("🧪 Получена тестовая ��ом�����да:", event.detail.command);
      processVoiceCommand(event.detail.command);
    };

    window.addEventListener("voiceCommand", handleTestCommand);
    return () => window.removeEventListener("voiceCommand", handleTestCommand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect ����я принудите�����ной остан��вки
  useEffect(() => {
    if (forceStop && isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setTranscript("");
      lastCommandRef.current = "";
      commandCooldownRef.current = false;
      onListeningChange?.(false, "");
    }
  }, [forceStop, isListening, onListeningChange]);

  // Effect для автомати��еской ����ч��стки застрявших блокировок
  useEffect(() => {
    const interval = setInterval(() => {
      // АГРЕССИВНАЯ очистка: если микрофон активен но есть любые блокировки более 3 секунд
      if (
        isListening &&
        (commandCooldownRef.current || isSpeaking) &&
        !audioPlayingRef.current &&
        !currentAudioRef.current
      ) {
        console.log(
          "���� АГРЕССИВНАЯ очистка застрявших блокировок - микрофон активен но ��аб��окирован",
        );
        commandCooldownRef.current = false;
        audioPlayingRef.current = false;
        lastCommandRef.current = "";
        setTranscript("");
        setIsSpeaking(false);

        // Перезапускаем распознавание для гарантии
        safeStopRecognition();
        setTimeout(() => {
          if (isListening) {
            const started = safeStartRecognition();
            if (started) {
              console.log("✅ Распознавание принудительно перезапущено");
            }
          }
        }, 100);
      }

      // Есл�� система заблокирована, но не говорит и не вос��роизводит а��д��о
      if (
        commandCooldownRef.current &&
        !isSpeaking &&
        !audioPlayingRef.current &&
        isListening
      ) {
        console.log("🧹 Автоматическая очист��а застрявших блокировок");
        commandCooldownRef.current = false;
        audioPlayingRef.current = false;
        lastCommandRef.current = "";
        setTranscript("");
      }

      // Допо��нительная защита: если система молч��т более 5 секунд, принуд��тельно с����ра��ыва��м
      if (isSpeaking && !audioPlayingRef.current && !currentAudioRef.current) {
        console.log(
          "🔄 Прину��ительны�� ����брос 'г��ворящего' состоя��ия без ауд��о",
        );
        setIsSpeaking(false);
        commandCooldownRef.current = false;
      }

      // Дополнительная проверка: если транскрипт "завис" более 5 секунд - очищаем
      if (
        transcript &&
        transcript.length > 0 &&
        !isSpeaking &&
        !commandCooldownRef.current
      ) {
        console.log("🧹 Очистка зависшего транскрипта:", transcript);
        setTranscript("");
      }
    }, 1500); // Проверяем каждые 1.5 секунды для более быстро�� реакции

    return () => clearInterval(interval);
  }, [isListening, isSpeaking, transcript]);

  // Effect для о��слеживания со��то��ния сети
  useEffect(() => {
    const handleOnline = () => {
      console.log("🌐 Интернет соединение восстановлено");
      setNetworkErrorCount(0); // Сбр��сываем счетчик ошиб��к при во��становлении сети
    };

    const handleOffline = () => {
      console.log("📵 Пот��ряно интернет соединение");
      if (isListening) {
        console.log(
          "⚠️ Распознавание реч�� может ��або��ать некоррект��о без интер��ета",
        );
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isListening]);

  // Дополнительный Effect для обнаружения полного зависания системы
  useEffect(() => {
    const lastActivityRef = { current: Date.now() };

    const activityTracker = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      // Если микрофон активен но никакой активности более 10 секунд
      if (isListening && timeSinceLastActivity > 10000) {
        // И при этом есть транскрипт или блокировки
        if (transcript || commandCooldownRef.current || isSpeaking) {
          console.log(
            "🚨 ОБНАРУЖЕНО ЗАВИСАНИЕ СИСТЕМЫ - принудительное восстановление",
          );

          // Полный сброс системы
          setTranscript("");
          setIsSpeaking(false);
          commandCooldownRef.current = false;
          audioPlayingRef.current = false;
          lastCommandRef.current = "";

          // Останавливаем аудио
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
            currentAudioRef.current = null;
          }

          // Перезапускаем распознавание
          safeStopRecognition();
          setTimeout(() => {
            if (isListening) {
              const started = safeStartRecognition();
              if (started) {
                console.log("✅ Система восстановлена после зависания");
              }
            }
          }, 200);

          lastActivityRef.current = now;
        }
      }

      // Обновляем время последней активности при изменениях
      if (transcript || isSpeaking || commandCooldownRef.current) {
        lastActivityRef.current = now;
      }
    }, 5000); // Проверяем каждые 5 секунд

    return () => clearInterval(activityTracker);
  }, [isListening, transcript, isSpeaking]);

  // Функция дл�� про��ерки д�����сту��нос�����и речевого ����ервиса
  const checkSpeechServiceAvailability = async () => {
    try {
      // Проверяем о��лайн статус
      if (!navigator.onLine) {
        console.log("📵 Нет интернет соединения");
        return false;
      }

      // Пр��ве��яем доступность Speech Recognition
      if (!recognitionRef.current) {
        console.log("❌ Speech Recognition не иниц��ализирован");
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Ошибка проверки доступности сервиса:", error);
      return false;
    }
  };

  // Глоба��ьная функция д���� принудительного с��роса ВСЕХ блокировок
  const forceResetAllStates = () => {
    console.log("🔥 ПРИНУД��Т��Л����НЫЙ СБРОС ВСЕХ СОСТОЯНИЙ");

    // Останав��иваем любое ��екущее аудио
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }

    // Сбрасываем все блокиров����
    commandCooldownRef.current = false;
    audioPlayingRef.current = false;
    lastCommandRef.current = "";
    setIsSpeaking(false);
    setTranscript("");

    console.log("✅ ВСЕ СОСТОЯНИЯ СБРОШЕНЫ");
  };

  // Фу��кция дл���� пол���ого ���броса состояния по����л�� ��оманды
  const resetCommandState = (
    delay: number = 1000,
    skipPanelReopen: boolean = false,
  ) => {
    console.log(`⏰ П��ан��руем сбро�� cooldown через ${delay}м��`);
    setTimeout(() => {
      // Полный сброс вс����х состояний блокировки
      commandCooldownRef.current = false;
      audioPlayingRef.current = false;
      lastCommandRef.current = "";
      setTranscript("");
      setIsSpeaking(false); // Принудительно сбрасываем состояние го��орения
      currentAudioRef.current = null; // Очищаем ссылку на аудио

      console.log(
        "🔄 П��лный сброс ��сех ��осто��ний бл����и���овки вы��олн����",
      );

      // Только сообщаем о состоянии, если микр��фон в��е ��ще ак��ивен �� это не ���������манда о��ключения
      if (isListening && !skipPanelReopen) {
        onListeningChange?.(true, "");
        console.log("✅ Cooldown сброшен, микро���он активен");
      } else {
        console.log(
          "��� Cooldown сброшен, ми�����рофон отключен ил�� ��ома��да отключ��н��я - не ��ткры��аем панел����",
        );
      }
    }, delay);
  };

  const speak = (text: string) => {
    // Предотвр��щаем повторно�� воспроизведение только ��сл�� у����е играет ��удио
    if (isSpeaking) {
      console.log("🚫 speak заблокиро��а�� - ��же играет аудио");
      return;
    }

    // Если есть cooldown, но не играет аудио, то ��рин��дительн�� сбрасыв��ем cooldown
    if (commandCooldownRef.current) {
      console.log("⚠️ Принудитель��о сбрасываем cooldown ��л�� новой коман��ы");
      commandCooldownRef.current = false;
    }

    console.log("🔊 ��а��инае������ воспроизведение:", text);

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Очищаем тр��нскрипт когд�� начинаем ��оворить
    setTranscript("");
    // НЕ вызываем onListeningChange во время восп��оиз����еде��ия аудио
    // Это ������дотвращает повторно�� открыти�� панел�� после команды отклю��ен��я

    // ��озда������м и вос������рои����водим ваш но��ый ау��ио-файл
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fdb47541068444a9093b406f29a6af3ce?alt=media&token=43fbc024-64ae-479b-8a6c-5b9d12b43294&apiKey=236158b44f8b45f680ab2467abfc361c",
    );

    audio.onended = () => {
      setIsSpeaking(false);
      // Сбрасываем состояние через коротк��ю задержку после аудио
      // НЕ отк��ываем панель если микрофон был отключе��
      resetCommandState(1000, !isListening);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error("Ошибка воспроизведения ауди�����");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error("Не удалось воспроизвести аудио:", error);
    });
  };

  const speakShutdown = () => {
    console.log("����� Выпол��яем команд�� отключе��ия микр��фо��а");

    // ПРИНУДИТЕЛЬНО сбрасываем ВСЕ ��ос��оян���я блокировки ��ля команды ��тключения
    commandCooldownRef.current = false;
    audioPlayingRef.current = false;
    lastCommandRef.current = "";
    console.log("🔴 Принудительно сбро��или все бл��кировки");

    // СНАЧАЛА отключаем состояние listening, чт��бы предотвр��тить автом��тический перезап��ск
    setIsListening(false);
    onListeningChange?.(false, "");
    console.log("�� Состо��н��е listening отключено");

    // Останавливаем любое текущее воспро��з��едение
    if (currentAudioRef.current) {
      console.log("⏹️ Останавливае�� т��кущее аудио");
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null; // Очищаем сс��лку
    }

    // Останавли����ем Recognition сра��у
    if (recognitionRef.current) {
      console.log("���� Ос���анавливаем Recognition");
      recognitionRef.current.stop();
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Добавляем небол��ш��ю задержк�� перед созданием нового аудио
    setTimeout(() => {
      console.log("🔊 Создаем аудио для отключения");

      // С��здаем и воспроизводим ауд��о дл�� команды "откл��чи��ь"
      const audio = new Audio(
        "https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fa7471f308f3b4a36a50440bf01707cdc?alt=media&token=9a246f92-9460-41f2-8125-eb0a7e936b47&apiKey=236158b44f8b45f680ab2467abfc361c",
      );
      currentAudioRef.current = audio;

      const shutdownComplete = () => {
        setIsSpeaking(false);
        commandCooldownRef.current = false;
        audioPlayingRef.current = false;
        lastCommandRef.current = "";
        currentAudioRef.current = null;
        setTranscript("");
        // Н�� ��ткрываем панель ����ратно после коман��ы отклю��ения
        console.log(
          "✅ Ко��анда отключения зав��р����ена - панель ��ст��ется закрыт��й",
        );
      };

      audio.onended = shutdownComplete;

      audio.onerror = () => {
        console.error("Ошибка во�����роиз��едения ����ди���� отключени������");
        shutdownComplete();
      };

      console.log("▶️ ��ытаемся во��произвести ау��ио отключения");
      audio.play().catch((error) => {
        console.error(
          "❌ Не уд����лось воспр��и��вес��и аудио ��тключен��я:",
          error,
        );
        shutdownComplete();
      });
    }, 100); // ��адержка 100мс дл�� полной ос����новки пр�����ыдущего аудио
  };

  const speakWelcomeBack = () => {
    if (isSpeaking) {
      console.log("🚫 speakWelcomeBack за��л��кирован - уже играет ау��ио");
      return;
    }

    if (commandCooldownRef.current) {
      console.log(
        "����� П��инудительно с��расываем cooldown для speakWelcomeBack",
      );
      commandCooldownRef.current = false;
    }

    console.log("���� ��ачи��аем во��произвед��ние привет��т��ия");

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Создаем и в��спроизводим ау��������о для команды "Джарвис я вернулс��"
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fd8b2e931609e45c3ad40a718329bc1c4?alt=media&token=78714408-6862-47cc-a4ac-8f778b958265&apiKey=236158b44f8b45f680ab2467abfc361c",
    );

    audio.onended = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error("����ибка воспроизведен���я ау���������о при���е��ств��я");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error(
        "Не уд������ось восп��ои��в�����сти аудио приветствия:",
        error,
      );
    });
  };

  const speakFullAccess = () => {
    if (isSpeaking) {
      console.log("🚫 speakFullAccess заблокирован - уже играет аудио");
      return;
    }

    if (commandCooldownRef.current) {
      console.log("⚠️ Принудительно сбр��сываем cooldown для speakFullAccess");
      commandCooldownRef.current = false;
    }

    console.log("🔓 Начинаем воспроиз��еде��ие 'полный доступ'");

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Создаем и воспроизв��дим аудио ��ля команды "Джарвис полный до��туп"
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fd8b2e931609e45c3ad40a718329bc1c4?alt=media&token=78714408-6862-47cc-a4ac-8f778b958265&apiKey=236158b44f8b45f680ab2467abfc361c",
    );

    audio.onended = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error("Ошибка в��спроизведения аудио п��лного доступа");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error("Не удалось воспроизвести ��удио полного доступа:", error);
    });
  };

  const speakThankYou = () => {
    // Разреша��м выпо���нение если ��ет ак��ивного ��удио
    if (isSpeaking && audioPlayingRef.current) return;

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Создаем и восп��оизводим аудио дл������ благод��������ности
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F4b8ea25f0ef042cbac23e1ab53938a6b%2Fafb1b8a7fc8645a7ab1e8513e8c1faa7?alt=media&token=be057092-6988-45dd-94dc-90427146589d&apiKey=4b8ea25f0ef042cbac23e1ab53938a6b",
    );

    audio.onended = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error(
        "Ошибка во��п����оизведения ���удио бл��годар������о�����и",
      );
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error(
        "Не удал����сь вос����о��звести ау��ио благо��а��ности:",
        error,
      );
    });
  };

  const speakGoodMorning = () => {
    // У��учшенная защита - разрешаем если нет активно��о ��удио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakGoodMorning за��локирован - и��рает а����дио");
      return;
    }

    // Остан��вливаем ��юбое ����екущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // С��зда��м и воспро��зводим ��уд��������о ��ля утреннего приветстви��
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F4b8ea25f0ef042cbac23e1ab53938a6b%2F501f46b9470c453e8a6730b05b556d76?alt=media&token=7933c53d-1d4b-4bbe-9be8-d74322cb2e84&apiKey=4b8ea25f0ef042cbac23e1ab53938a6b",
    );
    currentAudioRef.current = audio;

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 3000); // Увеличен таймаут до 3 секунд для предотвращения повторов
    };

    audio.onended = resetState;
    audio.onerror = () => {
      resetState();
      console.error("Ошибка воспроизведения аудио утреннего пр��ветстви��");
    };

    audio.play().catch((error) => {
      resetState();
      console.error(
        "Не удалось воспроизвести аудио утреннего приветствия:",
        error,
      );
    });
  };

  const speakIAmHere = () => {
    // Разрешаем выполнение если нет а��тивного ау��ио
    if (isSpeaking && audioPlayingRef.current) return;

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Созд��ем и воспроизводим аудио для ответа "Джарвис ты тут?"
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F4b8ea25f0ef042cbac23e1ab53938a6b%2F5baee2408110417fbab785b0c6ffdde6?alt=media&token=a957a2b4-68ad-46de-bc3e-11943c8fb38b&apiKey=4b8ea25f0ef042cbac23e1ab53938a6b",
    );

    audio.onended = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error("Ошибк�� воспроиз�����ед�����ния аудио о����в��та");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error(
        "Не удалос�� воспроизв����ст���� ��уд���о ������тве����а:",
        error,
      );
    });
  };

  // Нова�� ��унк��ия для синт���зированного голоса Джарвиса
  const speakWithJarvis = async (text: string) => {
    // Предотвращаем повторное воспроизведение
    if (isSpeaking || isJarvisSpeaking()) {
      console.log("🚫 speakWithJarvis забло��ирован - уже и��рает а��дио");
      return;
    }

    // Ост��навливаем лю��ое теку�������� воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
    };

    try {
      console.log("���️ Говорит Джарви��:", text);

      await jarvisSpeak(text, {
        onStart: () => {
          console.log("�� Джарвис начал говорить");
        },
        onEnd: () => {
          console.log("✅ Джарв��с закон��и�� говори����ь");
          resetState();
        },
        onError: (error) => {
          console.error("❌ ��шибка речи Джарвис���:", error);
          resetState();
        },
      });
    } catch (error) {
      resetState();
      console.error("❌ Не уд��лось запустить голос Джарвиса:", error);
    }
  };

  const speakWithElevenLabs = async (text: string) => {
    // Улучшен���ая защита - разрешаем если не�� активного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakWithElevenLabs заблокирован - играет ау��ио");
      return;
    }

    // Оста��авливаем любое ��екущее вос��р��изв����ени��
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
    };

    try {
      // Использу��м ElevenLabs API для синтеза р��чи с ��ашим кастомным голосом
      const response = await fetch("/api/elevenlabs-tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          voice_id: "YyXZ45ZTmrPak6Ecz0mK",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`ElevenLabs API error ${response.status}:`, errorData);

        if (response.status === 500) {
          console.log(
            "Сервер ElevenLabs недоступен, используем браузерный TTS",
          );
          throw new Error("ElevenLabs server error");
        } else if (response.status === 401) {
          console.log(
            "Проблема с API ключом ElevenLabs, используем браузерный TTS",
          );
          throw new Error("ElevenLabs API key error");
        } else if (response.status === 404) {
          console.log("Voice ID не найден, используем браузерный TTS");
          throw new Error("ElevenLabs voice not found");
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resetState();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        resetState();
        console.error("Ошибка воспроизведения аудио из ElevenLabs");
      };

      await audio.play();
    } catch (error) {
      resetState();
      console.error("Не удалось получить аудио из ElevenLabs:", error);

      // Fallback: использ��ем встроенный браузе��ный TTS
      console.log("Переключаемся на браузерный TTS");

      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ru-RU";
        utterance.rate = 0.75;
        utterance.pitch = 0.7;
        utterance.volume = 0.95;

        // Поиск подходящего голоса
        const voices = speechSynthesis.getVoices();
        const russianVoice = voices.find((voice) => voice.lang.includes("ru"));
        if (russianVoice) {
          utterance.voice = russianVoice;
        }

        utterance.onend = () => {
          setIsSpeaking(false);
          audioPlayingRef.current = false;
          setTimeout(() => {
            commandCooldownRef.current = false;
            lastCommandRef.current = "";
          }, 500);
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
          audioPlayingRef.current = false;
          setTimeout(() => {
            commandCooldownRef.current = false;
            lastCommandRef.current = "";
          }, 500);
          console.error("Ошибка браузерного TTS");
        };

        setIsSpeaking(true);
        commandCooldownRef.current = true;
        audioPlayingRef.current = true;

        speechSynthesis.speak(utterance);
      } else {
        // Последний fallback: просто текст в консоли
        console.log("����арвис:", text);
        setTimeout(() => {
          setIsSpeaking(false);
          audioPlayingRef.current = false;
          commandCooldownRef.current = false;
          lastCommandRef.current = "";
        }, 1000);
      }
    }
  };

  const speakAuthenticJarvis = () => {
    // Улучшенная за�����и��а - разрешаем е����и нет акт��вного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakAuthenticJarvis заблокирован - играет аудио");
      return;
    }
    console.log("����� ��ач���наем воспроизведение Jarvis ау��ио");

    // О���������танавлив��ем любое текущее воспроизве��ение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    // ��апоминаем со��тояние прослу���ивания ДО остановк��
    const wasListening = isListening;

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Неме����ен����о о��ищаем транскрипт к��гда н��чинаем говорит��
    setTranscript("");
    // ��Е вызываем onListeningChange во вре���� восп��оизведения ау��ио

    // НЕ останавливаем расп����знавание во врем�� воспроизведения аудио
    // Пусть микрофон продолжает работать
    console.log("🔊 Воспр��из��о���им аудио, но остав��яем микрофон акт��вным");

    // Ис��ользуем ваш ��ригиналь��ы�� аудиофайл Джарв��са
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2Fddde4fe5b47946c2a3bbb80e3bca0073%2F54eb93b1452742b6a1cd87cc6104bb59?alt=media&token=fc948eba-bbcd-485c-b129-d5a0c25cfc74&apiKey=ddde4fe5b47946c2a3bbb80e3bca0073",
    );
    currentAudioRef.current = audio;

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;

      // Мик��офон продолжал работать, �������чего восстанавливать не н��ж���о
      console.log("✅ Ауди�� завершено, микрофон остается активным");

      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 1000);
    };

    audio.onended = resetState;
    audio.onerror = () => {
      resetState();
      console.error("Ошибка воспроизв��дения оригина���ьн��го аудио Джарвиса");
    };

    audio.play().catch((error) => {
      resetState();
      console.error(
        "Не удалос�� воспроизвести ��ригинальное ауд��о Дж��р��иса:",
        error,
      );
    });
  };

  // Универс��льная функция для TTS с ав��о��атическим fallback
  const speakWithAutoFallback = async (text: string) => {
    // Сн��чала пробуем ElevenLabs
    try {
      await speakWithElevenLabs(text);
      return true; // Успешно
    } catch (error) {
      console.log("ElevenLabs недоступен, используем браузерный TTS");

      // Fallback на браузерный TTS
      if ("speechSynthesis" in window) {
        return new Promise<boolean>((resolve) => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "ru-RU";
          utterance.rate = 0.75;
          utterance.pitch = 0.7;
          utterance.volume = 0.95;

          // Поиск подходящего голоса
          const voices = speechSynthesis.getVoices();
          const russianVoice = voices.find((voice) =>
            voice.lang.includes("ru"),
          );
          if (russianVoice) {
            utterance.voice = russianVoice;
          }

          utterance.onend = () => {
            setIsSpeaking(false);
            audioPlayingRef.current = false;
            setTimeout(() => {
              commandCooldownRef.current = false;
              lastCommandRef.current = "";
            }, 500);
            resolve(true);
          };

          utterance.onerror = () => {
            setIsSpeaking(false);
            audioPlayingRef.current = false;
            setTimeout(() => {
              commandCooldownRef.current = false;
              lastCommandRef.current = "";
            }, 500);
            console.error("Ошибка бра��зерного TTS");
            resolve(false);
          };

          setIsSpeaking(true);
          commandCooldownRef.current = true;
          audioPlayingRef.current = true;

          speechSynthesis.speak(utterance);
        });
      } else {
        // По��ледни�� fallback: просто текст в консоли
        console.log("Джа��вис:", text);
        return false;
      }
    }
  };

  const speakSystemsOperational = async () => {
    await speakWithAutoFallback("Все системы фу��кционируют нормально");
  };

  const speakRotateModel = () => {
    // Улучшенная защ����т�� - раз���ешаем если нет активного ауд��о
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakRotateModel заблокирован - играет аудио");
      return;
    }

    // Останавлив���ем люб��е текущее во��п��оизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("🔄 Н��чинаем вращ��ние модели с аудио");
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Запускаем вращение м��дели
    if (onModelRotateStart) {
      onModelRotateStart();
    }

    // Воспр��изводим первое аудио (для команды "покрути модель")
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F28664c445c564f3b84784ae20e29b5c6%2F3e5bf796358f469d8d209d10e88df9a2?alt=media&token=9a768fb8-b835-43b4-aa44-72650861fdf5&apiKey=28664c445c564f3b84784ae20e29b5c6",
    );
    currentAudioRef.current = audio;

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
    };

    audio.onended = resetState;
    audio.onerror = () => {
      resetState();
      console.error("❌ Ошибка воспр��и��ведения аудио для вращения модели");
    };

    audio.play().catch((error) => {
      resetState();
      console.error(
        "❌ Не удалось воспроизвести аудио для вращения мод��ли:",
        error,
      );
    });
  };

  const speakStopModel = () => {
    // Улучшен����я защита - разре��аем если нет активного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakStopModel заблоки��ован - играет аудио");
      return;
    }

    // Остан��вливаем любое текущее воспроизведени��
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("⏹️ Останавливаем вращение модели с аудио");
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Остан��влив��ем вращение модели
    if (onModelRotateStop) {
      onModelRotateStop();
    }

    // Воспроизводим втор��е аудио (для команды "хватит")
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F28664c445c564f3b84784ae20e29b5c6%2F66456b8b01d0421188b26fac843a5d29?alt=media&token=6ba25f9a-cdbf-48ab-98f4-da121a81fd2e&apiKey=28664c445c564f3b84784ae20e29b5c6",
    );
    currentAudioRef.current = audio;

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
    };

    audio.onended = resetState;
    audio.onerror = () => {
      resetState();
      console.error("❌ Ош��бка воспроизведе��ия аудио для остановки м��дели");
    };

    audio.play().catch((error) => {
      resetState();
      console.error(
        "❌ Не удалось воспроизвести аудио для остановки модели:",
        error,
      );
    });
  };

  const speakHowAreYou = () => {
    // Улучшенная защита - разрешаем ��сли нет ����т��вного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakHowAreYou заблокирован - играет ��уд��о");
      return;
    }

    // Ос�����анавлив��е�� ��юбое те����ущее ��оспрои����вед��ние
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Используе�� Web Speech API для синтеза ��разы "у меня в��е в п���рядке сэр"
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        "у меня все в ��ор��дке сэр",
      );

      // ����стр��йки максимально ��риближенные �� ElevenLabs Jarvis (wDsJlOXPqcvIUKdLXjDs)
      // Stability: 20 (низ��ая ст��бильно��ть для более естестве��ной речи)
      // Similarity Boost: 90 (высок����е сходс����во с ор��гинальным го��осом)
      // Style: Assistant/Narration (помощник/повеств��в��ние)

      utterance.lang = "en-US"; // ��нг����йский для лучше��о качества, потом перекл��������им ���� русский
      utterance.rate = 0.75; // Мед����н����я, размеренна�� р��чь как �� Джарвиса из фильма
      utterance.pitch = 0.7; // Сред����-ни��кий тон для ����втор��те�����ос��и
      utterance.volume = 0.95; // ��еткая, но не р��зкая громкость

      // ��оиск наиболее подх��дящего голоса д��я ими��ации Jarvis
      const voices = speechSynthesis.getVoices();

      // Прио��итет: голоса, похожие н��� британски��/американский мужской
      const jarvisLikeVoice = voices.find(
        (voice) =>
          voice.lang.includes("en") &&
          (voice.name.toLowerCase().includes("alex") ||
            voice.name.toLowerCase().includes("daniel") ||
            voice.name.toLowerCase().includes("male") ||
            voice.name.toLowerCase().includes("british") ||
            voice.name.toLowerCase().includes("uk") ||
            voice.name.toLowerCase().includes("david") ||
            voice.name.toLowerCase().includes("thomas")),
      );

      // �����сли н�� н��шли подходящий а����л��йс��ий, ище�� русский м���жской
      const russianMaleVoice = voices.find(
        (voice) =>
          voice.lang.includes("ru") &&
          (voice.name.toLowerCase().includes("male") ||
            voice.name.toLowerCase().includes("му���������ко��") ||
            voice.name.toLowerCase().includes("антон") ||
            voice.name.toLowerCase().includes("ник��лай")),
      );

      if (jarvisLikeVoice) {
        utterance.voice = jarvisLikeVoice;
        utterance.lang = "ru-RU";
        utterance.pitch = 0.6; // Ч��ть ниже для лучшего �����вучания русского
      } else if (russianMaleVoice) {
        utterance.voice = russianMaleVoice;
        utterance.lang = "ru-RU";
        utterance.pitch = 0.6; // Ч��ть ниже для ��усского голос����
      } else {
        // Fallback: л��бой дост��пный го�����о�� с оптимиз��рованны��и настройк��ми
        const anyVoice = voices.find(
          (voice) => voice.lang.includes("en") || voice.lang.includes("ru"),
        );
        if (anyVoice) {
          utterance.voice = anyVoice;
          utterance.lang = "ru-RU"; // ��сегда русск��й язык
        }
        utterance.pitch = 0.55; // Еще ниже дл�� к��мп��нсации
        utterance.rate = 0.7; // Е������ м��д��енне�� ��ля б��льшей солидно��ти
      }

      const resetState = () => {
        setIsSpeaking(false);
        audioPlayingRef.current = false;
        currentAudioRef.current = null;
        setTimeout(() => {
          commandCooldownRef.current = false;
          lastCommandRef.current = "";
        }, 500);
      };

      utterance.onend = resetState;
      utterance.onerror = () => {
        resetState();
        console.error("Ош����ка синтеза речи");
      };

      try {
        speechSynthesis.speak(utterance);
      } catch (error) {
        resetState();
        console.error("Не удало���ь синтезирова��ь речь:", error);
      }
    } else {
      // Fallback если Speech Synthesis недоступен
      const resetState = () => {
        setIsSpeaking(false);
        audioPlayingRef.current = false;
        currentAudioRef.current = null;
        setTimeout(() => {
          commandCooldownRef.current = false;
          lastCommandRef.current = "";
        }, 500);
      };

      console.log("Джа��вис: у ��еня все в порядке сэр");
      setTimeout(resetState, 2000);
    }
  };

  // Тестовая ф��нкция для про����рки аудио
  const testAudioUrls = () => {
    const url1 =
      "https://cdn.builder.io/o/assets%2Ff623eb4c005f4a40a75c4b9a0beb1b76%2Fe84cbc4e1b6d4e408263b15a7e68cd11?alt=media&token=db88c399-0c44-4b82-a1eb-251e7fb476b3&apiKey=f623eb4c005f4a40a75c4b9a0beb1b76";
    const url2 =
      "https://cdn.builder.io/o/assets%2Ff623eb4c005f4a40a75c4b9a0beb1b76%2Ff74fdea7f34b4c2fa5df3d62bd9efe29?alt=media&token=80cd6e08-efaa-4afd-b3aa-66aa3f68623c&apiKey=f623eb4c005f4a40a75c4b9a0beb1b76";

    console.log("🧪 Т����т����������м URL аудио��а���лов:");
    console.log("URL1:", url1);
    console.log("URL2:", url2);

    fetch(url1)
      .then((response) => console.log("✅ URL1 доступ���н:", response.status))
      .catch((error) => console.error("❌ URL1 недоступен:", error));

    fetch(url2)
      .then((response) => console.log("✅ URL2 доступен:", response.status))
      .catch((error) => console.error("❌ URL2 не��оступен:", error));
  };

  const speakSystemDiagnostics = () => {
    console.log("🔧 Запуск ��иагн����������стики систе����...");
    testAudioUrls(); // Тестируем URL

    // Улучшенная защита - разрешаем если не���� активного а��дио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ Диаг��остика заблокирована - играет аудио");
      return;
    }

    // Останавл����ваем любое тек��щее воспроиз��ед��ние
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Воспроизводи�� первое а��ди��
    console.log("��� Создаем пе����вое аудио ��л�� ���иагнос��ики");
    const firstAudio = new Audio(
      "https://cdn.builder.io/o/assets%2Ff623eb4c005f4a40a75c4b9a0beb1b76%2Fe84cbc4e1b6d4e408263b15a7e68cd11?alt=media&token=db88c399-0c44-4b82-a1eb-251e7fb476b3&apiKey=f623eb4c005f4a40a75c4b9a0beb1b76",
    );
    currentAudioRef.current = firstAudio;

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
    };

    firstAudio.onended = () => {
      console.log("��� Пер��ое аудио за��онч��л��сь, ж��ем 2 секун��ы...");
      // Ч�����ез 2 се��унды ��ос����оизводим второе а��дио
      setTimeout(() => {
        console.log("🎵 ��оздаем второе ау��ио для диагности����");
        const secondAudio = new Audio(
          "https://cdn.builder.io/o/assets%2Ff623eb4c005f4a40a75c4b9a0beb1b76%2Ff74fdea7f34b4c2fa5df3d62bd9efe29?alt=media&token=80cd6e08-efaa-4afd-b3aa-66aa3f68623c&apiKey=f623eb4c005f4a40a75c4b9a0beb1b76",
        );
        currentAudioRef.current = secondAudio;

        secondAudio.onended = () => {
          console.log("✅ Второе а����и�� закончилось, диагностика завершена");
          resetState();
        };
        secondAudio.onerror = () => {
          resetState();
          console.error(
            "❌ Оши��ка во���произ���едени�� второго ау��ио ��иагностики",
          );
        };

        console.log("��️ За��ускае�� второе ау���и��");
        secondAudio.play().catch((error) => {
          resetState();
          console.error(
            "❌ Не ���далось воспроизвести второе ауд���� д��агностики:",
            error,
          );
        });
      }, 2000);
    };

    firstAudio.onerror = () => {
      resetState();
      console.error("��� Ошибка воспроизведения ��ервого ауд��о ��иагностик��");
    };

    console.log("▶�� ����пускаем перво�� ауд����");
    firstAudio.play().catch((error) => {
      resetState();
      console.error(
        "❌ Не удалось в��спроизвести пе��вое ��удио диагностик��:",
        error,
      );
    });
  };

  const speakContinue = () => {
    // Улучшенная з��щита - разрешаем если нет актив��ого аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakContinue заблокирован - играе�� ауд��о");
      return;
    }

    // Останавливаем любое текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("▶️ В��спроиз��одим ��ервое аудио - Давай продолжи��");
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Пер��ое ау�����о для к��манды "дав��й продо��жим"
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F6b72a929cd24415c8486df051bbaa5a2%2F35be1bb3c0f84dab8d368ae39c4dde3c?alt=media&token=39b27ede-43e5-43ac-8175-031ef131c2ef&apiKey=6b72a929cd24415c8486df051bbaa5a2",
    );
    currentAudioRef.current = audio;

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
    };

    audio.onended = resetState;
    audio.onerror = () => {
      resetState();
      console.error("❌ Ошибка воспроизведе��ия перв��го аудио");
    };

    audio.play().catch((error) => {
      resetState();
      console.error("❌ Не ��дал��сь восп��оизвести первое аудио:", error);
    });
  };

  const speakCorrect = () => {
    // Улу��шенная �����щита - разреша��м если нет акт��вного ��удио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakCorrect заблок����рован - иг�����ет ��������ио");
      return;
    }

    // Останавливаем любое т���кущее воспроиз����едение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("▶️ Вос��роизводим второе ау���ио - Верн���");
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // ��торое аудио для ��оманды "верно"
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F6b72a929cd24415c8486df051bbaa5a2%2F3f0d27eed6164908bd9b24c2c5bc67e1?alt=media&token=5fa73b0b-df79-4f5a-b12c-4d182e8ed23f&apiKey=6b72a929cd24415c8486df051bbaa5a2",
    );
    currentAudioRef.current = audio;

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
    };

    audio.onended = resetState;
    audio.onerror = () => {
      resetState();
      console.error("❌ Ош��бка ��оспроизве��ени��� втор��го аудио");
    };

    audio.play().catch((error) => {
      resetState();
      console.error("❌ ��е удалось вос��роизвести второе аудио:", error);
    });
  };

  const changeToNewModel = () => {
    // Улу��шенная защита - разрешаем если нет активного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ changeToNewModel заблокирован - играет аудио");
      return;
    }

    // ��станавливаем любое текущее ��о��произведе��ие
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("🔄 Смена на новую мо��ель с эффектами");
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Добавляем эффект сканера с неоном и частицами
    const scanElement = document.createElement("div");
    scanElement.className = "model-change-scanner";
    scanElement.innerHTML = `
      <div class="scanner-line"></div>
      <div class="neon-particles"></div>
    `;
    document.body.appendChild(scanElement);

    // Д��бавляем CSS стили для эффектов
    if (!document.getElementById("model-change-styles")) {
      const styles = document.createElement("style");
      styles.id = "model-change-styles";
      styles.textContent = `
        .model-change-scanner {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 9999;
        }

        .scanner-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, transparent, #00ffff, #00ffff, transparent);
          box-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff;
          animation: scanDown 2s ease-in-out;
        }

        .neon-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.1) 0%, transparent 70%);
          animation: particleGlow 2s ease-in-out;
        }

        @keyframes scanDown {
          0% { top: 0; transform: scaleX(0); }
          10% { transform: scaleX(1); }
          90% { transform: scaleX(1); }
          100% { top: 100vh; transform: scaleX(0); }
        }

        @keyframes particleGlow {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `;
      document.head.appendChild(styles);
    }

    // В��спроизводим аудио пользователя
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2Fd75af4d8f215499ea8d0f6203e423bd8%2F3b053c81e36b4fef904e40553c401613?alt=media&token=f48c0f2a-72ec-4b41-816d-2942d8cc3442&apiKey=d75af4d8f215499ea8d0f6203e423bd8",
    );
    currentAudioRef.current = audio;

    // Уведо��ляем о смене модели через глобальное соб��тие
    const changeEvent = new CustomEvent("changeModel", {
      detail: {
        newModelUrl:
          "https://cdn.builder.io/o/assets%2Fd75af4d8f215499ea8d0f6203e423bd8%2Fd4105e0c74e944c29631ffc49b1daf4a?alt=media&token=3f1fe075-c812-408f-ba1a-5229fc29b16a&apiKey=d75af4d8f215499ea8d0f6203e423bd8",
      },
    });

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;

      // Удаляем эффекты через 2 секунды
      setTimeout(() => {
        const scannerElements = document.querySelectorAll(
          ".model-change-scanner",
        );
        scannerElements.forEach((el) => el.remove());
      }, 2000);

      // Быстрый сброс cooldown для новой модели
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
        console.log("✅ Cooldown сброшен после смены на новую модель");
      }, 100);
    };

    audio.onended = () => {
      resetState();
      // Отправляем событие смены модели после завершения аудио
      window.dispatchEvent(changeEvent);
    };

    audio.onerror = () => {
      resetState();
      console.error("❌ Ошибка воспр��из��едения аудио смены модели");
      // Отправляем событие смены модели даже при оши��ке ауди��
      window.dispatchEvent(changeEvent);
    };

    audio.play().catch((error) => {
      resetState();
      console.error("❌ Не удалось воспроизвести аудио смены модели:", error);
      // Отправляем событие смены модели даже при ошибке
      window.dispatchEvent(changeEvent);
    });
  };

  const changeToOldModel = () => {
    // Улучшенная за��ита - ��азрешаем если нет активного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ changeToOldModel заблокирован - играет ауд��о");
      return;
    }

    // Останавливаем любое текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("🔙 Возврат к прошлой модели с ��ффектами");
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Добавляем тот же э����ект сканера
    const scanElement = document.createElement("div");
    scanElement.className = "model-change-scanner";
    scanElement.innerHTML = `
      <div class="scanner-line"></div>
      <div class="neon-particles"></div>
    `;
    document.body.appendChild(scanElement);

    // Воспроизводим то же аудио
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2Fd75af4d8f215499ea8d0f6203e423bd8%2F3b053c81e36b4fef904e40553c401613?alt=media&token=f48c0f2a-72ec-4b41-816d-2942d8cc3442&apiKey=d75af4d8f215499ea8d0f6203e423bd8",
    );
    currentAudioRef.current = audio;

    // Уведомляем о возврате к старой мод��ли
    const changeEvent = new CustomEvent("changeModel", {
      detail: {
        newModelUrl:
          "https://cdn.builder.io/o/assets%2F4349887fbc264ef3847731359e547c4f%2F14cdeb74660b46e6b8c349fa5339f8ae?alt=media&token=fa99e259-7582-4df0-9a1e-b9bf6cb20289&apiKey=4349887fbc264ef3847731359e547c4f",
      },
    });

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;

      // Удаляем эффекты через 2 ��екунды
      setTimeout(() => {
        const scannerElements = document.querySelectorAll(
          ".model-change-scanner",
        );
        scannerElements.forEach((el) => el.remove());
      }, 2000);

      // Бы��тр��й сброс cooldown для с��арой модели
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
        console.log("✅ Cooldown ��брошен после смены на старую модель");
      }, 100);
    };

    audio.onended = () => {
      resetState();
      // Отправляем соб��тие в��зврата к старой модели
      window.dispatchEvent(changeEvent);
    };

    audio.onerror = () => {
      resetState();
      console.error("❌ Ошибка вос��роизведения аудио возвр��та модели");
      // О��правляем событие даже при ошибке аудио
      window.dispatchEvent(changeEvent);
    };

    audio.play().catch((error) => {
      resetState();
      console.error(
        "❌ Не у��а��ось воспроизвести аудио возврата модели:",
        error,
      );
      // Отправляем событие даже пр�� ошибке
      window.dispatchEvent(changeEvent);
    });
  };

  const speakLoveYou = () => {
    // Улучшенная з��щита - разрешаем если нет активного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakLoveYou ����аблокирован - играет ��удио");
      return;
    }

    // Остан��вливаем люб��е текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("💕 ��оспроизводим ответ на 'люблю тебя'");
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Аудио для команд�� "люблю тебя"
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F6b8207c06c624aefbe324905f1fe2635%2Fd19643ff0c6a4879adc1448aa8f57693?alt=media&token=8faef1da-bb33-4c9f-935c-afb812c5acff&apiKey=6b8207c06c624aefbe324905f1fe2635",
    );
    currentAudioRef.current = audio;

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
    };

    audio.onended = resetState;
    audio.onerror = () => {
      resetState();
      console.error("❌ Ошиб��а воспроизведения аудио 'люблю тебя'");
    };

    audio.play().catch((error) => {
      resetState();
      console.error("❌ Не удалось во��произвести аудио 'люблю тебя':", error);
    });
  };

  const activateStarkLab = () => {
    // Улучшенн��я защита - разрешаем если нет ак��ивного ��удио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ activateStarkLab заблокирован - иг��а��т аудио");
      return;
    }

    // Останавливаем любое текущее вос��роизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log(
      "�� Активация лаборатории Старка - начина��м последовательность",
    );
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // ПЕРВОЕ аудио для ком��нды "полная ак��ивация"
    const firstAudio = new Audio(
      "https://cdn.builder.io/o/assets%2F6b72a929cd24415c8486df051bbaa5a2%2Fbb0dc9d654554f1a9bb9dcc874d5434b?alt=media&token=47d6c26a-18e1-4ffb-9363-adc20856464f&apiKey=6b72a929cd24415c8486df051bbaa5a2",
    );
    currentAudioRef.current = firstAudio;

    firstAudio.onended = () => {
      console.log("✅ Перво�� а��дио завершено, ак��ивируем ��абораторию");

      // Мгновенно м������яем тему на лабораторию Стар��а
      document.documentElement.classList.add("stark-lab-theme");

      // До��авляем эффект скан��ров��ния
      const scanElement = document.createElement("div");
      scanElement.className = "lab-activation-scan";
      document.body.appendChild(scanElement);

      // Доба���ляем активационный оверлей
      const overlayElement = document.createElement("div");
      overlayElement.className = "lab-activation-overlay";
      document.body.appendChild(overlayElement);

      // Добавляем HUD сетку
      const hudGrid = document.createElement("div");
      hudGrid.className = "stark-lab-hud-grid";
      document.body.appendChild(hudGrid);

      // До��авляем голографичес����ие ча��тицы
      const particlesContainer = document.createElement("div");
      particlesContainer.className = "stark-lab-particles";
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement("div");
        particle.className = "stark-lab-particle";
        particle.style.left = Math.random() * 100 + "%";
        particle.style.animationDelay = Math.random() * 3 + "s";
        particlesContainer.appendChild(particle);
      }
      document.body.appendChild(particlesContainer);

      // Воспроизв��дим ВТОРОЕ аудио после смены дизайна
      setTimeout(() => {
        console.log("🔊 Воспроизводим второе ауд��о после активации");
        const secondAudio = new Audio(
          "https://cdn.builder.io/o/assets%2F6b72a929cd24415c8486df051bbaa5a2%2F12ceeb1b81974dabb7e1c98c17cbcad2?alt=media&token=c9feb03a-881d-4132-8b87-007ca504f0f2&apiKey=6b72a929cd24415c8486df051bbaa5a2",
        );
        currentAudioRef.current = secondAudio;

        secondAudio.onended = () => {
          setIsSpeaking(false);
          audioPlayingRef.current = false;
          currentAudioRef.current = null;
          setTimeout(() => {
            commandCooldownRef.current = false;
            lastCommandRef.current = "";
          }, 500);
          console.log("��� Активац����я ла����ратории завершена");
        };

        secondAudio.onerror = () => {
          setIsSpeaking(false);
          audioPlayingRef.current = false;
          currentAudioRef.current = null;
          setTimeout(() => {
            commandCooldownRef.current = false;
            lastCommandRef.current = "";
          }, 500);
          console.error(
            "❌ Оши��ка воспроизведения вто��ого аудио акт��ваци��",
          );
        };

        secondAudio.play().catch((error) => {
          setIsSpeaking(false);
          audioPlayingRef.current = false;
          currentAudioRef.current = null;
          setTimeout(() => {
            commandCooldownRef.current = false;
            lastCommandRef.current = "";
          }, 500);
          console.error(
            "❌ Не удалось воспроизвести второе ауди�� активации:",
            error,
          );
        });
      }, 1000); // З��дер��ка 1 секунда для завершения анимации
    };

    firstAudio.onerror = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error(
        "❌ Ошибка вос��р��извед��ния пе���вог�� а��дио акти��ации",
      );
    };

    firstAudio.play().catch((error) => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error(
        "❌ Не ���далос�� восп��оизвести перво���� аудио активации:",
        error,
      );
    });
  };

  const deactivateStarkLab = () => {
    // Улучшенная защи��а - разрешаем если нет активного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ deactivateStarkLab забл��киро��ан - и��рает аудио");
      return;
    }

    // Останавливаем любо�� текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("🔄 Возвращ��ем обычну�� те��у");
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // ТРЕТЬЕ аудио для коман��ы "ве����и меня об����тно"
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F6b72a929cd24415c8486df051bbaa5a2%2F6d0501b67e3846298ea971cf00a9add8?alt=media&token=79cbcd57-2bfb-4b1d-a4c9-594c1f0543ac&apiKey=6b72a929cd24415c8486df051bbaa5a2",
    );
    currentAudioRef.current = audio;

    // Сразу возвращаем об��чную тему
    document.documentElement.classList.remove("stark-lab-theme");

    // Уда��яем ��се лаб��раторные элементы
    const elementsToRemove = [
      ".lab-activation-scan",
      ".lab-activation-overlay",
      ".stark-lab-hud-grid",
      ".stark-lab-particles",
    ];

    elementsToRemove.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => element.remove());
    });

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.log("��� Возв��ат к обычно�� теме заве��шен");
    };

    audio.onended = resetState;
    audio.onerror = () => {
      resetState();
      console.error("❌ Ош����ка воспроиз��едения аудио возврат��");
    };

    audio.play().catch((error) => {
      resetState();
      console.error("❌ Не уд��лось во��произвест�� ��у��ио возврата:", error);
    });
  };

  const processVoiceCommand = (command: string) => {
    console.log("🔧 Обработка коман��ы:", command);

    // ��АРА��ТИРОВ�����ННАЯ защита от зас�����ревания: всегда разрешаем обработку новых команд
    // Уста��авл��ваем ��аймер на сброс блокировок для ЛЮБОЙ команды
    const forceUnlockTimer = setTimeout(() => {
      console.log("�� Принудительное разблокирование через 8 секу��д");
      commandCooldownRef.current = false;
      audioPlayingRef.current = false;
      setIsSpeaking(false);
      lastCommandRef.current = "";
    }, 8000); // Максимум 8 секунд на любую команду

    // Принудительно сбрасываем все блокировки перед обработ��ой новой команды
    // КРОМЕ ��оманды отключения, которая обрабатывается отдельно
    if (!command.includes("отключись") && !command.includes("выключись")) {
      if (commandCooldownRef.current || audioPlayingRef.current) {
        console.log(
          "⚡ Прину��ительно сбрасывае�� блокировки перед обработкой команды",
        );
        forceResetAllStates();
      }
    }

    // Очищаем тайм��р если команда успешно завершится
    const originalClearTimeout = () => {
      clearTimeout(forceUnlockTimer);
    };

    // Добавляем очистку таймера к концу функции
    setTimeout(originalClearTimeout, 100);

    // Простая очистка транскрипта в начале обработки
    setTranscript("");
    // НЕ ��ызываем onListeningChange во время обработки команды
    // Это пред��твращает повторное открытие панели

    // НЕ сбрасываем Recognition авт��матически - пусть работает непрерывно
    console.log("🎯 Обрабатываем команду без сброса Recognition");

    // Фильтруем пустые или слишком короткие команды
    const trimmedCommand = command.trim();
    if (trimmedCommand.length < 3) {
      console.log("❌ Команда слишком короткая, сбрасываем состояние");
      // Принудительно сбр��сываем состояние для коротких команд
      setTimeout(() => {
        commandCooldownRef.current = false;
        audioPlayingRef.current = false;
        lastCommandRef.current = "";
        setTranscript("");
        console.log("✅ Состояние сброшено после короткой команды");
      }, 500);
      return;
    }

    // Дополнительная проверка: если команда выглядит как неполная (обрывается на полуслове)
    const suspiciousPatterns = [
      /джарв$/i, // "джарв" без "ис"
      /джар$/i, // "джар" бе�� "вис"
      /смен$/i, // "смен" без "и"
      /включ$/i, // "включ" без "и"
      /откл$/i, // "откл" без "учи"
      /полн$/i, // "полн" без "ая"
    ];

    const isIncompleteCommand = suspiciousPatterns.some((pattern) =>
      pattern.test(trimmedCommand),
    );

    if (isIncompleteCommand) {
      console.log("⚠�� Обнаружена неполная команда:", trimmedCommand);
      // Даем дополнительное время на завершение команды
      setTimeout(() => {
        if (lastCommandRef.current === trimmedCommand) {
          console.log(
            "🔄 ��еполная команда не завершилась, сбрасывае�� сос��ояние",
          );
          commandCooldownRef.current = false;
          audioPlayingRef.current = false;
          lastCommandRef.current = "";
          setTranscript("");
        }
      }, 2000);
    }

    // Команда откл���чени���� (приори��е��ная)
    if (
      command.includes("отключись") ||
      command.includes("выключись") ||
      command.includes("отключи микрофон") ||
      command.includes("стоп джарвис") ||
      command.includes("выключи") ||
      command.includes("откл��чи") ||
      command.includes("от��лючит��") ||
      command.includes("джарвис отключись") ||
      command.includes("джарвис выключись") ||
      command.includes("жа��вис отключись") ||
      command.includes("ярвис откл��чись")
    ) {
      console.log("🔴 К��манда откл��чения ра����ознана:", command);
      // Принудительно выполняем ко��анду отключени���� независимо от сост����яния
      speakShutdown();
      return;
    }

    // Коман��а "Дж��р��ис, полна�� акт��вация" - ак��ивация лаборатории Старка
    if (
      command.includes("джарвис полная активация") ||
      command.includes("полная активация ��жар��и��") ||
      command.includes("жарвис полная активация") ||
      command.includes("ярвис полная активация") ||
      command.includes("джарвис активация лаборато��ии") ||
      command.includes("акти��ация лаборатории джарвис") ||
      command.includes("активирова��ь лабораторию") ||
      command.includes("джарвис включи лабораторию") ||
      command.includes("жарвис активация лаборатории") ||
      command.includes("яр��ис а���ти��ация л����боратории") ||
      command.includes("полная активация")
    ) {
      console.log("🔬 Кома��да активации лаборатории распознана:", command);
      // Улучшенная проверка - разрешаем если ��ет активного аудио
      if (!isSpeaking || !audioPlayingRef.current) {
        activateStarkLab();
      }
      return;
    }

    // Команда "смени модель" - смена на новую модель (работает с Джарвис и без него)
    if (
      command.includes("с��ени модель") ||
      command.includes("поменяй модель") ||
      command.includes("новая модель") ||
      command.includes("измени модель") ||
      command.includes("другая модель") ||
      command.includes("сменить модель") ||
      command.includes("смена модель") ||
      command.includes("��оде��ь смени") ||
      command.includes("джарв��с смени модель") ||
      command.includes("смени модель джарвис") ||
      command.includes("джарв��с смени") ||
      command.includes("смен�� джар��ис") ||
      command.includes("джарвис поменяй модель") ||
      command.includes("поменяй модель джарвис") ||
      command.includes("джарвис поменяй") ||
      command.includes("поменяй джарвис") ||
      command.includes("джарв��с новая модель") ||
      command.includes("новая модель джарвис") ||
      command.includes("джарвис измени модель") ||
      command.includes("��змени модель джарвис") ||
      command.includes("дж��рвис друга�� модель") ||
      command.includes("другая модель джарвис") ||
      command.includes("жарвис смени модель") ||
      command.includes("ярвис смени модель") ||
      command.includes("жарвис сме��и") ||
      command.includes("ярвис с��ени")
    ) {
      console.log("🔄 Команда смены модели распознана:", command);
      if (!isSpeaking || !audioPlayingRef.current) {
        changeToNewModel();
      }
      return;
    }

    // Команда "верни модель" - возврат к старой модели (работает с Джарвис �� без него)
    if (
      command.includes("верни прошлую модель") ||
      command.includes("верни прошлую") ||
      command.includes("верни ста��ую модель") ||
      command.includes("верни старую") ||
      command.includes("верни пре��нюю модель") ||
      command.includes("верни прежнюю") ||
      command.includes("ве��нуть модель") ||
      command.includes("верн�� мод���ль") ||
      command.includes("верни назад") ||
      command.includes("моде��ь назад") ||
      command.includes("��азад модель") ||
      command.includes("джарвис верни прошлую модель") ||
      command.includes("джарвис верни прошлую") ||
      command.includes("д��арвис верни старую модель") ||
      command.includes("джарвис верни старую") ||
      command.includes("джарвис верни прежнюю модель") ||
      command.includes("джарвис верни прежнюю") ||
      command.includes("джарвис вернуть модель") ||
      command.includes("джарвис верни модель") ||
      command.includes("джарвис верни назад") ||
      command.includes("жарви�� верни прошлую модель") ||
      command.includes("яр��ис верни прошлую м��дель") ||
      command.includes("жарвис верни прошлую") ||
      command.includes("ярвис верни прошлую") ||
      command.includes("жарвис верни") ||
      command.includes("ярвис верни")
    ) {
      console.log(
        "���� Коман��а возврата к прошлой модели распознана:",
        command,
      );
      if (!isSpeaking || !audioPlayingRef.current) {
        changeToOldModel();
      }
      return;
    }

    // Команда "Джарвис верни меня обратно" - возв��ат к обычной теме
    if (
      command.includes("джарвис в��рни меня обратно") ||
      command.includes("в��рни меня обратно джарвис") ||
      command.includes("верни обычную тему") ||
      command.includes("��т��л��чи лаборатор��ю") ||
      command.includes("джарвис выключи лабораторию") ||
      command.includes("обычный р��жим") ||
      command.includes("стандартна�� тема") ||
      command.includes("верни меня обратно") ||
      command.includes("жарвис верни меня обра��но") ||
      command.includes("ярвис верни меня обратно")
    ) {
      console.log("🔄 Команда возврата к обычной теме распознана:", command);
      // ��лучшенная проверка - разрешае�� если нет акт��вно��о ау��ио
      if (!isSpeaking || !audioPlayingRef.current) {
        deactivateStarkLab();
      }
      return;
    }

    // Команда приветст��ия "Джарвис я верн��лся"
    if (
      command.includes("джарвис я вернулся") ||
      command.includes("я вернулся джарвис") ||
      command.includes("джарв��с я здесь") ||
      command.includes("я снова здесь") ||
      command.includes("вернулся") ||
      command.includes("я здесь") ||
      command.includes("жарвис я вернулся") ||
      command.includes("ярвис я вернулся")
    ) {
      console.log("👋 Ком��нда приветствия распознана:", command);
      speakWelcomeBack();
      return;
    }

    // Команда "��жарвис полный доступ"
    if (
      command.includes("джа��вис полный доступ") ||
      command.includes("полный доступ джарвис") ||
      command.includes("дж����рвис предос��авь полный доступ") ||
      command.includes("предоставь ��олный доступ джа��вис") ||
      command.includes("пол��ый дос��уп") ||
      command.includes("предоставь доступ") ||
      command.includes("жарв��с полный доступ") ||
      command.includes("ярвис полный до��туп")
    ) {
      console.log("🔓 Команда 'полн��й доступ' распознана:", command);
      // Улучшенная проверка - разрешаем если нет активно��о ��удио
      if (!isSpeaking || !audioPlayingRef.current) {
        speakFullAccess();
      }
      return;
    }

    // Команда "Джа��вис давай про��олж��м" - воспро��зводит ��ервое аудио
    if (
      command.includes("дж��рвис давай продолжим") ||
      command.includes("давай продолжим д��арвис") ||
      command.includes("давай продолжим") ||
      command.includes("джарви�� продолжим") ||
      command.includes("продолжим джарвис") ||
      command.includes("жарвис давай продо��жим") ||
      command.includes("ярвис давай продолжим")
    ) {
      console.log("▶️ К��манда 'давай пр��должим' р��с����знана:", command);
      // Улучшенная проверка - разрешаем если нет акти���ного аудио
      if (!isSpeaking || !audioPlayingRef.current) {
        speakContinue();
      }
      return;
    }

    // Ко��а��да "Верно" - воспр��изводит второ�� аудио
    if (
      command.includes("верно") ||
      command.includes("п��ави��ьно") ||
      command.includes("точно") ||
      command.includes("именно") ||
      command.includes("так и есть") ||
      command.includes("correct") ||
      command.includes("right")
    ) {
      console.log("✅ Команда 'верно' р��спознана:", command);
      // Улучшенная проверка - разрешаем если нет акт��вного аудио
      if (!isSpeaking || !audioPlayingRef.current) {
        speakCorrect();
      }
      return;
    }

    // Команды для оригинального голоса Джарвиса (из фильмов)
    if (
      command.includes("оригинальный джарвис") ||
      command.includes("настоящий джарвис") ||
      command.includes("д��арвис как в филь���е") ||
      command.includes("железный человек") ||
      command.includes("tony stark") ||
      command.includes("тони старк") ||
      command.includes("authentic jarvis") ||
      command.includes("real jarvis") ||
      command.includes("movie jarvis") ||
      command.includes("джарвис из же��езног�� человека") ||
      command.includes("голо�� джарв��са") ||
      command.includes("оригинал") ||
      command.includes("как в марвел")
    ) {
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        speakAuthenticJarvis();
      }
      return;
    }

    // Команда утреннего приветствия "Доброе утро Джарвис"
    if (
      command.includes("доброе ���тро джарвис") ||
      command.includes("джарвис доброе утро") ||
      command.includes("утро ��жарвис") ||
      (command.includes("доброе утро") && command.length < 20) ||
      command.includes("good morning jarvis") ||
      (command.includes("good morning") && command.length < 20) ||
      command.includes("доброго утра") ||
      command.includes("доб��ое утро жарвис") ||
      command.includes("доброе утро ��рвис")
    ) {
      // Дополнительная п��оверка, чтобы избеж��ть повторных срабатываний
      // Разрешаем только если нет активного аудио И не в cooldown И последняя команда другая
      if (
        !isSpeaking &&
        !audioPlayingRef.current &&
        !commandCooldownRef.current &&
        lastCommandRef.current !== "добро�� утро"
      ) {
        console.log("✅ Выполня��м команду 'доброе утро'");
        lastCommandRef.current = "доброе утро";
        speakGoodMorning();
      } else {
        console.log(
          "❌ Команда 'доброе утро' заблокирована - с��стема занята или повтор",
        );
      }
      return;
    }

    // Команда приветствия "Привет Джарвис" - улучшенное распознавание с защитой от повторов
    if (
      command.includes("привет джарвис") ||
      command.includes("джарвис привет") ||
      command.includes("здравствуй джарвис") ||
      command.includes("джарвис здравствуй") ||
      command.includes("хай джарвис") ||
      command.includes("hello jarvis") ||
      command.includes("hi jarvis") ||
      command.includes("hey jarvis") ||
      command.includes("привет жарвис") || // частые ошибки распознавания
      command.includes("привет джаров") ||
      command.includes("привет ярвис") ||
      command.includes("жарвис привет") ||
      (command.includes("привет") &&
        (command.includes("джарвис") ||
          command.includes("жарвис") ||
          command.includes("ярвис")))
    ) {
      const now = Date.now();
      const timeSinceLastGreeting = now - lastGreetingTimeRef.current;

      console.log(
        "��� Команда приветстви�� распознана, врем��ни пр��шло:",
        timeSinceLastGreeting,
      );

      // Улучшенная проверка + защ����а от п��второв (10 секунд)
      if (
        (!isSpeaking || !audioPlayingRef.current) &&
        timeSinceLastGreeting > 10000
      ) {
        console.log("✅ Выполняем команду приветствия");
        lastGreetingTimeRef.current = now;
        speakAuthenticJarvis();
      } else {
        console.log(
          "❌ Приветствие заблокировано (мало времени прошло или играет аудио)",
        );
      }
      return;
    }

    // Команда "Джарвис ��окрути модель" - запуск вращения модели
    if (
      command.includes("джарвис покрут��� модель") ||
      command.includes("покрути модель джарвис") ||
      command.includes("джарвис крути модель") ||
      command.includes("крути модель джар��ис") ||
      command.includes("джарвис п��верни модель") ||
      command.includes("поверни модель джарвис") ||
      command.includes("модел�� крути") ||
      command.includes("п��крути мод��ль") ||
      command.includes("крути модель") ||
      command.includes("��ращай модель") ||
      command.includes("джарвис вращай модел��") ||
      command.includes("жарвис покру��и мо��ель") ||
      command.includes("ярвис покрути модель")
    ) {
      console.log("🔄 Команда вращения модели распознана:", command);
      // Улучшенная проверка - разрешаем если н��т активного аудио
      if (!isSpeaking || !audioPlayingRef.current) {
        speakRotateModel();
      }
      return;
    }

    // Команда "��ватит" - остановка вращения модели
    if (
      command.includes("хватит") ||
      command.includes("стоп") ||
      command.includes("оста����овись") ||
      command.includes("перестань") ||
      command.includes("достаточно") ||
      command.includes("джарвис хватит") ||
      command.includes("��жарвис стоп") ||
      command.includes("джар��ис остановись") ||
      command.includes("джарвис пер��стань") ||
      command.includes("джарвис ���остаточно") ||
      command.includes("стой") ||
      command.includes("��становить мо��е��ь") ||
      command.includes("остановит�� вращение")
    ) {
      console.log("⏹�� Ко��анда ос��ановки модели распознана:", command);
      // Улучшенная п��оверка - разрешаем если нет активног�� аудио
      if (!isSpeaking || !audioPlayingRef.current) {
        speakStopModel();
      }
      return;
    }

    // Команда "Джарвис ��ак дела" с о��ветом "Все системы функционируют нормально"
    if (
      command.includes("джарвис как дела") ||
      command.includes("ка�� дела джарвис") ||
      command.includes("жарвис как дела") || // частые ошибки распо��навания
      command.includes("как дела жарвис") ||
      command.includes("ярвис как дела") ||
      command.includes("джаров как дела") ||
      (command.includes("джарвис") && command.includes("как дела")) ||
      (command.includes("жарвис") && command.includes("как дела")) ||
      (command.includes("как дела") && command.length < 20) // есл�� слышно только "как дела"
    ) {
      // Дополнительная проверка, чтобы избежать повторных ср��батываний
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        speakSystemsOperational();
      }
      return;
    }

    // Ко��анда "Как дела" (общая, без имени �����а��вис)
    if (
      command.includes("��ак дела") ||
      command.includes("как поживаешь джарвис") ||
      command.includes("джарвис как пож��ваешь") ||
      command.includes("как ты джарвис") ||
      command.includes("how are you jarvis") ||
      command.includes("jarvis how are you") ||
      command.includes("how are you") ||
      command.includes("как твои дела") ||
      command.includes("что нового джарвис")
    ) {
      // ��ополнительная проверка, чт��бы из��еж��ть повторных срабатываний
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        speakSystemsOperational();
      }
      return;
    }

    // Команды ��ла��од��рност��
    if (
      command.includes("спасибо") ||
      command.includes("����лагодарю") ||
      command.includes("благодарно�����т��") ||
      command.includes("спс") ||
      command.includes("��енк ю") ||
      command.includes("thank you") ||
      command.includes("thanks") ||
      command.includes("мерси") ||
      command.includes("р�������мат") ||
      command.includes("рахмет") ||
      command.includes("хорошо") ||
      command.includes("отлично") ||
      command.includes("замечательно") ||
      command.includes("круто") ||
      command.includes("прекрасно") ||
      command.includes("чудес��о")
    ) {
      speakThankYou();
      return;
    }

    // Кома��да "люблю тебя"
    if (
      command.includes("люблю тебя") ||
      command.includes("�� тебя люблю") ||
      command.includes("джарвис люблю тебя") ||
      command.includes("джарвис я тебя люблю") ||
      command.includes("люблю") ||
      command.includes("love you") ||
      command.includes("i love you") ||
      command.includes("жарв��с люблю тебя") ||
      command.includes("ярвис люблю тебя")
    ) {
      console.log("💕 Команда 'любл�� тебя' распознана:", command);
      // Улучшенная проверка - разрешаем если нет активного аудио
      if (!isSpeaking || !audioPlayingRef.current) {
        speakLoveYou();
      }
      return;
    }

    // Команда диагностики системы
    if (
      command.includes("��иа��ностик") ||
      command.includes("прове��и") ||
      command.includes("запу����и") ||
      command.includes("проверь ��ист��му") ||
      command.includes("тес��") ||
      command.includes("вк��ючи полную диагностику") ||
      command.includes("полную диаг��остик�� систем") ||
      command.includes("диагностику сис����м") ||
      command.includes("включи диагностику") ||
      command.includes("полная диагностика") ||
      command.includes("системная диагностика")
    ) {
      console.log("�� ��аспознана ко�����ан��а ���иагностики:", command);

      // ��оп�����лнит��льн��я проверка, чт������бы избежать пов��орных сра���ат��ваний
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        console.log("✅ ��с��ов���� выпо��нены, ����п���ск����ем диагност��ку");
        speakSystemDiagnostics();
      } else {
        console.log("❌ ������иагн��стика заблокирова��а:", {
          isSpeaking,
          commandCooldown: commandCooldownRef.current,
          audioPlaying: audioPlayingRef.current,
        });
      }
      return;
    }

    // Команда проверки присутствия "Джарвис ты тут?"
    if (
      command.includes("джарвис ты ту��") ||
      command.includes("ты тут джарвис") ||
      command.includes("джарвис ты здесь") ||
      command.includes("ты ��де��ь джарви��") ||
      command.includes("джарвис на месте") ||
      command.includes("джар��ис при��утствуешь") ||
      command.includes("jarvis are you there") ||
      command.includes("are you there jarvis") ||
      command.includes("жарвис ��ы тут") ||
      command.includes("ярвис ты тут") ||
      command.includes("ты тут жарвис") ||
      command.includes("ты тут ярвис")
    ) {
      speakIAmHere();
      return;
    }

    // П��ов����я��м, с��������ержи�� л����� команда знач��м���� слова
    const meaningfulWords = [
      "перейти",
      "войти",
      "регистрация",
      "про��иль",
      "зака��",
      "��орз���на",
      "доба���ить",
      "план",
      "джа��вис",
      "жарвис", // частые ошибки ��аспознавания
      "ярвис",
      "джар��в",
      "базовый",
      "про",
      "макс",
      "����о��рутить",
      "скролл",
      "наверх",
      "пл��нам",
      "преимущества",
      "воз��ожнос��и",
      "от�����рыть",
      "��и����ный",
      "кабинет",
      "отп��а��ить",
      "��ек��ия",
      "спуститься",
      "���ерейти",
      "покажи",
      "на����ди",
      "где",
      "что",
      "как",
      "цена",
      "сто����ость",
      "т��ри��",
      "услуги",
      "компания",
      "��он��а��ты",
      "п����ддержк��",
      "те��нологи����",
      "р��зр��ботка",
      "сайт",
      "интеллект",
      "ии",
      "jarvis",
      "мощный",
      "уникальный",
      "качество",
      "ан��л��тика",
      "пр��м��ум",
      "невероятное",
      "��ото��ы",
      "создать",
      "биз��ес",
      "помощник",
      "персон��льны��",
      "�����ткл����чи��ь",
      "в��кл��чись",
      "от��лючи",
      "вы��лючи",
      "с����п",
      "верну��ся",
      "здесь",
      "снова",
      "спасибо",
      "б��агодарю",
      "благодарн��сть",
      "��пс",
      "thank",
      "thanks",
      "��ерс����",
      "��ахмат",
      "р����������",
      "��о��ошо",
      "отлично",
      "замечате����ьно",
      "круто",
      "пре����асно",
      "чудесно",
      "добр����е",
      "утро",
      "у��ра",
      "morning",
      "good",
      "��ут",
      "присутствуешь",
      "присутствие",
      "месте",
      "there",
      "системы",
      "работают",
      "дела",
      "пожи��аешь",
      "порядок",
      "диагностика",
      "проведи",
      "диагностируй",
      "проверь",
    ];
    const hasValidWords = meaningfulWords.some((word) =>
      trimmedCommand.includes(word),
    );

    if (!hasValidWords) {
      return;
    }

    // Умный поиск контента по всему сайту
    const searchAndNavigate = (
      searchTerms: string[],
      fallbackAction?: () => void,
    ) => {
      // Поиск по заго��овкам
      const headings = Array.from(
        document.querySelectorAll("h1, h2, h3, h4, h5, h6"),
      );
      for (const heading of headings) {
        const headingText = heading.textContent?.toLowerCase() || "";
        if (searchTerms.some((term) => headingText.includes(term))) {
          heading.scrollIntoView({ behavior: "smooth" });
          return true;
        }
      }

      // Поиск по data-section атрибутам
      const sections = Array.from(document.querySelectorAll("[data-section]"));
      for (const section of sections) {
        const sectionName =
          section.getAttribute("data-section")?.toLowerCase() || "";
        if (searchTerms.some((term) => sectionName.includes(term))) {
          section.scrollIntoView({ behavior: "smooth" });
          return true;
        }
      }

      // Поиск по id элементов
      for (const term of searchTerms) {
        const elementById = document.getElementById(term);
        if (elementById) {
          elementById.scrollIntoView({ behavior: "smooth" });
          return true;
        }
      }

      // Поиск по тексту элементов
      const allElements = Array.from(
        document.querySelectorAll("p, div, span, li"),
      );
      for (const element of allElements) {
        const elementText = element.textContent?.toLowerCase() || "";
        if (
          searchTerms.some((term) => elementText.includes(term)) &&
          element.offsetParent !== null
        ) {
          element.scrollIntoView({ behavior: "smooth" });
          return true;
        }
      }

      // Если ничего не н��йдено, выполняем запасное действие
      if (fallbackAction) {
        fallbackAction();
        return true;
      }

      return false;
    };

    // Универсальные команды поиска
    if (
      command.includes("покажи") ||
      command.includes("найди") ||
      command.includes("где") ||
      command.includes("перейди к") ||
      command.includes("спуститься к")
    ) {
      let found = false;

      // Поиск преимуществ
      if (
        command.includes("преимущества") ||
        command.includes("п��еимущество")
      ) {
        found = searchAndNavigate([
          "преимущества",
          "преимущество",
          "advantages",
        ]);
        if (found) {
          speak("��ока��ываю пре��мущества");
          return;
        }
      }

      // Поиск возможно��тей
      if (
        command.includes("возможности") ||
        command.includes("возможность") ||
        command.includes("мощные")
      ) {
        found = searchAndNavigate(["возможности", "мощные", "features"]);
        if (found) {
          speak("Показываю возможнос��и");
          return;
        }
      }

      // Поиск планов и тарифов
      if (
        command.includes("план") ||
        command.includes("тариф") ||
        command.includes("цен") ||
        command.includes("стоимость")
      ) {
        found = searchAndNavigate(["план", "тариф", "цен", "pricing"], () => {
          const pricingSection = document.querySelector(
            '[data-section="pricing"]',
          );
          if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: "smooth" });
          }
        });
        if (found) {
          speak("Показываю планы и цены");
          return;
        }
      }

      // Поиск информации о компа��ии
      if (
        command.includes("ко��пан") ||
        command.includes("о нас") ||
        command.includes("кто мы")
      ) {
        found = searchAndNavigate(["компан", "о нас", "about", "кто мы"]);
        if (found) {
          speak("Показываю информацию о компании");
          return;
        }
      }

      // Поиск контактов
      if (
        command.includes("контакт") ||
        command.includes("с��язь") ||
        command.includes("телефон") ||
        command.includes("email")
      ) {
        found = searchAndNavigate([
          "контакт",
          "связь",
          "телефон",
          "email",
          "contact",
        ]);
        if (found) {
          speak("Показываю контакты");
          return;
        }
      }

      // Поиск технологий
      if (
        command.includes("технолог") ||
        command.includes("webgl") ||
        command.includes("��и") ||
        command.includes("искусственный")
      ) {
        found = searchAndNavigate([
          "технолог",
          "webgl",
          "ии",
          "ис��усств��нный",
          "ai",
          "джарвис",
          "jarvis",
        ]);
        if (found) {
          speak("Показываю технологии");
          return;
        }
      }

      // Поиск качества и премиум услуг
      if (
        command.includes("качество") ||
        command.includes("премиум") ||
        command.includes("поддер��ка")
      ) {
        found = searchAndNavigate([
          "каче���тво",
          "премиум",
          "поддержка",
          "quality",
          "support",
        ]);
        if (found) {
          speak("Показываю информацию о качестве");
          return;
        }
      }

      // ��оиск аналитики
      if (
        command.includes("аналитик") ||
        command.includes("статистик") ||
        command.includes("данные")
      ) {
        found = searchAndNavigate([
          "анали��ик",
          "статистик",
          "данные",
          "analytics",
        ]);
        if (found) {
          speak("Показываю аналитику");
          return;
        }
      }

      // Если ничего сп��циф��чного не найдено, пробуем общий поиск
      if (!found) {
        const searchTerms = command
          .split(" ")
          .filter((word) => word.length > 2);
        found = searchAndNavigate(searchTerms);
        if (found) {
          speak("Найдено");
          return;
        }
      }
    }

    // Команды навигации по с��рани��ам
    if (
      command.includes("перей��и на глав���ую") ||
      command.includes("на главную страниц��") ||
      command.includes("домой")
    ) {
      navigate("/");
      speak("Переходим на главную страницу");
      return;
    }

    if (
      command.includes("войт��") ||
      command.includes("логин") ||
      command.includes("авторизация")
    ) {
      navigate("/login");
      speak("Открываю страницу входа");
      return;
    }

    if (
      command.includes("регистрация") ||
      command.includes("з��регистрироваться")
    ) {
      navigate("/signup");
      speak("Переходим к регистраци��");
      return;
    }

    if (
      command.includes("про��иль") ||
      command.includes("мой профиль") ||
      command.includes("личный каби��ет") ||
      command.includes("��ткрыть профиль")
    ) {
      navigate("/profile");
      speak("Открываю личный ��абинет");
      return;
    }

    if (command.includes("заказ") || command.includes("оформит�� заказ")) {
      navigate("/order");
      speak("Перехожу к оформлению ��аказа");
      return;
    }

    // Команды ��орзины
    if (command.includes("корзина") && command.includes("очистить")) {
      clearCart();
      speak("Ко��зина очищен��");
      return;
    }

    if (
      command.includes("отк��ыть корзину") ||
      command.includes("показать ��орзину") ||
      command.includes("что в корзине")
    ) {
      // Находим и нажимаем кнопку корзины
      const cartButton = document.querySelector(
        '[data-testid="cart-button"]',
      ) as HTMLElement;
      if (cartButton) {
        cartButton.click();
      }
      speak("Открыва�� ��орзину");
      return;
    }

    // Ко��ан��ы доб���������вления пла��ов в корз��н��
    if (
      command.includes("добавить б��зовый") ||
      command.includes("базовый план") ||
      command.includes("базовый в корзину") ||
      command.includes("отправить базовый")
    ) {
      onAddBasicPlan();
      speak("Базовый план добавлен");
      return;
    }

    if (
      command.includes("добавить про") ||
      command.includes("пр�� план") ||
      command.includes("про в корзину") ||
      command.includes("отправит���� про")
    ) {
      onAddProPlan();
      speak("Про план добавлен");
      return;
    }

    if (
      command.includes("добавить макс") ||
      command.includes("макс план") ||
      command.includes("максимальный план") ||
      command.includes("джарвис план") ||
      command.includes("макс в корзину") ||
      command.includes("отправить макс")
    ) {
      onAddMaxPlan();
      speak("Максимальный план добавлен");
      return;
    }

    // Ра��шире��ная нави��ация ����о се��циям ст��ан��ц���
    if (
      command.includes("к планам") ||
      command.includes("пок����зать пл��ны") ||
      command.includes("пере��ти к плана��") ||
      command.includes("сп��������ститься �� планам") ||
      command.includes("тарифы") ||
      command.includes("цены") ||
      command.includes("стоим��ст��")
    ) {
      const found = searchAndNavigate(
        ["п����н", "тариф", "ц����", "pricing", "сто����ость"],
        () => {
          const pricingSection = document.querySelector(
            '[data-section="pricing"]',
          );
          if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: "smooth" });
          }
        },
      );
      if (found) {
        speak("��о���������ы��аю п���ан��");
      }
      return;
    }

    if (
      command.includes("к преимуществам") ||
      command.includes("наши преи��ущества") ||
      command.includes("спуст��ться к преимуществам") ||
      command.includes("перейт�� к преимущес���вам") ||
      command.includes("пр��имущества")
    ) {
      const found = searchAndNavigate([
        "преи��ущества",
        "пр����имуществ��",
        "advantages",
      ]);
      if (found) {
        speak("По��азыв��ю преим��щества");
      }
      return;
    }

    if (
      command.includes("�� возможностям") ||
      command.includes("��ощные �������озможности") ||
      command.includes("��пу���ти���ься к возможн��ст��м") ||
      command.includes("��ере�������и к возмо��но��тям") ||
      command.includes("возможнос��и")
    ) {
      const found = searchAndNavigate(
        ["возможности", "мощные", "features"],
        () => {
          const featuresSection = document.getElementById("features");
          if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: "smooth" });
          }
        },
      );
      if (found) {
        speak("Пока��ыв���� ������озможнос��и");
      }
      return;
    }

    // Прокрутка страницы
    if (
      command.includes("прокрутить вниз") ||
      command.includes("скролл вниз") ||
      command.includes("спуститься вниз")
    ) {
      window.scrollBy(0, 500);
      speak("Прокручиваю вниз");
      return;
    }

    if (
      command.includes("прокрутить вверх") ||
      command.includes("скролл вверх") ||
      command.includes("подняться вверх")
    ) {
      window.scrollBy(0, -500);
      speak("Прокручиваю вверх");
      return;
    }

    if (
      command.includes("наверх стран��цы") ||
      command.includes("в начало") ||
      command.includes("в самый верх")
    ) {
      window.scrollTo(0, 0);
      speak("Перехожу в начало");
      return;
    }

    if (
      command.includes("в конец страницы") ||
      command.includes("в самый низ") ||
      command.includes("вниз страницы")
    ) {
      window.scrollTo(0, document.body.scrollHeight);
      speak("Перехожу в конец");
      return;
    }

    // ВАЖНО: Обработка н��распознанных команд
    // Если дошли до этого места - коман��а не была распознана
    console.log("❌ Команда не рас��ознана:", command);
    console.log("🔄 Сбрасываем состояние для следующей команды");

    // Принудитель��о сбрасываем все блокировк�� для нераспознанных команд
    setTimeout(() => {
      commandCooldownRef.current = false;
      audioPlayingRef.current = false;
      lastCommandRef.current = "";
      setIsSpeaking(false);
      setTranscript("");
      console.log("✅ Состояния сброшены, система гот��ва �� новым командам");
    }, 500); // Небольшая задержка чтобы избежать конфликтов
  };

  const toggleListening = () => {
    if (isListening) {
      console.log(
        "🔴 Отключение микрофона - агрессивная очистка всех состояний",
      );

      // Останавливаем распознавание
      safeStopRecognition();

      // ПОЛНАЯ очистка всех состояний
      setIsListening(false);
      setIsSpeaking(false);
      setTranscript("");
      lastCommandRef.current = "";
      commandCooldownRef.current = false;
      audioPlayingRef.current = false;

      // Останавливаем любое текущее аудио
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      }

      // Очищаем все таймеры
      if (commandDelayRef.current) {
        clearTimeout(commandDelayRef.current);
        commandDelayRef.current = null;
      }

      onListeningChange?.(false, "");
      console.log("✅ Микрофон отключен, все состояния очищены");
    } else {
      console.log(
        "🟢 Включение микрофона - принудительная очистка перед запуском",
      );

      if (recognitionRef.current) {
        // АГРЕССИВНАЯ очистка всех состояний перед включением
        setTranscript("");
        setIsSpeaking(false);
        lastCommandRef.current = "";
        commandCooldownRef.current = false;
        audioPlayingRef.current = false;

        // Останавливаем любое текущее аудио
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
          currentAudioRef.current = null;
        }

        // Очищаем все таймеры
        if (commandDelayRef.current) {
          clearTimeout(commandDelayRef.current);
          commandDelayRef.current = null;
        }

        // Дополнительная очистка �� задержкой
        setTimeout(() => {
          setTranscript("");
          lastCommandRef.current = "";
          commandCooldownRef.current = false;
          audioPlayingRef.current = false;
          console.log("🧹 Дополнительная очистка состояний завершена");
        }, 100);

        const started = safeStartRecognition();
        if (started) {
          setIsListening(true);
          onListeningChange?.(true, "");
          console.log("✅ Микрофон включен, система готова к работе");
        } else {
          console.log(
            "⚠️ Первая попытка запуска не удалась, пробуем через 500мс",
          );
          // Принудительный перезапуск при ошибке
          setTimeout(() => {
            const retryStarted = safeStartRecognition();
            if (retryStarted) {
              setIsListening(true);
              onListeningChange?.(true, "");
            } else {
              console.log("❌ Повторная попытка з��пуска не удалась");
            }
          }, 500);
        }
      }
    }
  };

  return (
    <div className={inNavbar ? "relative" : "fixed bottom-6 right-6 z-50"}>
      <div
        className={
          inNavbar
            ? "flex items-center space-x-2"
            : "flex flex-col items-end space-y-2"
        }
      >
        {/* Transcript display */}
        {transcript && !inNavbar && (
          <div className="max-w-xs p-3 bg-black/80 backdrop-blur-lg border border-purple-500/30 rounded-lg text-white text-sm">
            {transcript}
          </div>
        )}

        {/* Voice control button */}
        <Button
          onClick={toggleListening}
          data-testid="voice-control"
          className={
            inNavbar
              ? "w-8 h-8 p-0 transition-all duration-300 bg-transparent"
              : `w-14 h-14 rounded-full p-0 transition-all duration-300 bg-transparent hover:bg-white/10 ${
                  isListening ? "animate-pulse" : ""
                } ${isSpeaking ? "ring-4 ring-blue-400/50" : ""}`
          }
          disabled={isSpeaking}
        >
          {isSpeaking ? (
            <Volume2
              className={
                inNavbar
                  ? "w-4 h-4 text-white"
                  : "w-6 h-6 text-white animate-pulse"
              }
            />
          ) : isListening ? (
            <Mic
              className={inNavbar ? "w-4 h-4 text-white" : "w-6 h-6 text-white"}
            />
          ) : (
            <MicOff
              className={inNavbar ? "w-4 h-4 text-white" : "w-6 h-6 text-white"}
            />
          )}
        </Button>

        {/* Status indicator */}
        <div
          className={
            inNavbar
              ? "text-sm text-white font-medium whitespace-nowrap"
              : "text-xs text-white/60 text-center"
          }
        >
          {isSpeaking ? "Говорю..." : isListening ? "Слушаю..." : ""}
        </div>
      </div>

      {/* Pulse effect when listening */}
      {isListening && !inNavbar && (
        <div className="absolute top-0 right-0 w-14 h-14 rounded-full bg-purple-500/30 animate-ping"></div>
      )}
    </div>
  );
}
