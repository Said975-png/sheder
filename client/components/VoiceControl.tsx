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
    // Проверяем поддер��ку Speech Recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "ru-RU";

        // Улучшенные настройки для лучшего распознавания на расстоянии
        recognitionRef.current.maxAlternatives = 10;

        // Устанавливаем максимальную чувствительность
        try {
          // @ts-ignore - Настройки ��ля улучш��ния захват�� тихой речи
          if (recognitionRef.current.webkitAudioTrack) {
            recognitionRef.current.webkitAudioTrack.enabled = true;
          }
          // @ts-ignore - Увеличиваем ��силение мик��офона
          if (recognitionRef.current.webkitGainNode) {
            recognitionRef.current.webkitGainNode.gain.value = 2.0;
          }
        } catch (e) {
          console.log("Продвинутые настройки микрофона недоступны");
        }

        // Дополнительные настройки для Chrome/WebKit - максимальная чувств��тельн��сть
        if (
          recognitionRef.current.webkitSpeechRecognition ||
          "webkitSpeechRecognition" in window
        ) {
          // @ts-ignore - WebKit specific properties
          recognitionRef.current.webkitContinuous = true;
          // @ts-ignore
          recognitionRef.current.webkitInterimResults = true;
          // @ts-ignore - Уб��раем ограничения грамматики для лучшего распознавания
          recognitionRef.current.webkitGrammars = null;
          // @ts-ignore - Увеличиваем количество а��ьтернати��
          recognitionRef.current.webkitMaxAlternatives = 10;

          // @ts-ignore - Нас��ройки для дальнего р��спознавания
          try {
            recognitionRef.current.webkitNoiseReduction = true;
            recognitionRef.current.webkitEchoCancellation = true;
            recognitionRef.current.webkitAutoGainControl = true;
            recognitionRef.current.webkitHighpassFilter = false; // Отключаем фильтр для лучшего захвата низких частот
            recognitionRef.current.webkitTypingNoiseDetection = false;
            // Увеличиваем чувствительно��ть к тих��м звукам
            recognitionRef.current.webkitSensitivity = 1.0;
            recognitionRef.current.webkitSpeechInputMinimumLengthMS = 500; // Минимальная длина записи
            recognitionRef.current.webkitSpeechInputCompleteTimeoutMS = 2000; // Таймаут ����вершения
          } catch (e) {
            console.log("Расширенные настройки WebKit недоступны");
          }
        }

        // Дополнительные нас��ройки для луч��его ра��познава��ия длинны�� фраз
        try {
          // @ts-ignore - Эти нас��ройки помогают лучше распознав����ь речь
          if (recognitionRef.current.webkitSpeechRecognition) {
            recognitionRef.current.webkitSpeechRecognition.continuous = true;
            recognitionRef.current.webkitSpeechRecognition.interimResults =
              true;
          }
        } catch (e) {
          // Игнорируем ������и��ки настроек
        }
        // Настройка прямого доступа к микрофону для лучшего качества
        try {
          // Запрашиваем д��ступ к мик��офону с оптимальными настройками
          navigator.mediaDevices
            .getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                // @ts-ignore - Пр��двинутые ��астройки для лучшего захв��та звука
                googEchoCancellation: true,
                googAutoGainControl: true,
                googNoiseSuppression: true,
                googHighpassFilter: false,
                googTypingNoiseDetection: false,
                googAudioMirroring: false,
                // Настройки чувствительност��
                volume: 1.0,
                sampleRate: 48000, // Выс��кое качество записи
                sampleSize: 16,
                channelCount: 1,
              },
            })
            .then((stream) => {
              console.log(
                "���� Получен доступ к микрофону с улучшенными настройками",
              );
              // Применяем настр��йки к потоку
              const audioTracks = stream.getAudioTracks();
              if (audioTracks.length > 0) {
                const track = audioTracks[0];
                const capabilities = track.getCapabilities();
                console.log("🔧 Возможности микрофона:", capabilities);

                // Применяем оптимальные настройки если ��оддерживаются
                const constraints = {
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true,
                };
                track
                  .applyConstraints(constraints)
                  .catch((e) =>
                    console.log(
                      "Не удалось применить дополнительные ограничения:",
                      e,
                    ),
                  );
              }
              // Освобождаем поток, ��ак как SpeechRecognition созд��ст свой
              stream.getTracks().forEach((track) => track.stop());
            })
            .catch((e) => {
              console.log(
                "Стандартный доступ к микрофону, расширенные настройки недоступны",
              );
            });
        } catch (e) {
          console.log("MediaDevices API недоступен");
        }

        // @ts-ignore - эти свойства могут не быть в типа��, но рабо��ают в браузерах
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

          // Обрабатываем тольк�� ПОСЛЕДНИЙ резул����ат, чтобы н���� накапливать старые
          const lastResultIndex = event.results.length - 1;
          if (lastResultIndex >= 0) {
            const transcript =
              event.results[lastResultIndex][0].transcript.trim();
            if (event.results[lastResultIndex].isFinal) {
              finalTranscript = transcript;
            } else {
              interimTranscript = transcript;
            }
          }

          // Используем только новый результат
          combinedTranscript = (finalTranscript || interimTranscript).trim();

          // Фильтруем повторяющиес�� фразы и слишком длинные р��зультаты
          if (combinedTranscript.length > 50) {
            console.log(
              "🚫 Отклоняем слишком дли��ный результат:",
              combinedTranscript.length,
              "символов",
            );
            combinedTranscript = "";
          }

          // Проверяем на п��вторяющиеся слова (признак на��о��ле��и��)
          const words = combinedTranscript.split(" ");
          const uniqueWords = [...new Set(words)];
          if (words.length > uniqueWords.length * 2) {
            console.log(
              "🚫 О��кл����ня��м результат с ��овторяющим��ся словами",
            );
            combinedTranscript = "";
          }

          // Показываем промежуточный результат с пониженным порогом для дальнего распознавания
          if (
            combinedTranscript &&
            combinedTranscript.length > 1 && // Снижен порог с 2 до 1 символа
            combinedTranscript.length < 100 && // Фильтр для предотвращен���я накопленных транскриптов
            !commandCooldownRef.current &&
            !isSpeaking &&
            !audioPlayingRef.current &&
            combinedTranscript !== lastCommandRef.current
          ) {
            setTranscript(combinedTranscript);
            onListeningChange?.(true, combinedTranscript);
            console.log("🎯 Распознано:", `"${combinedTranscript}"`);
          }

          // Об��абат��ваем финальные рез��л��таты или достаточно длинн��е промежуто��ные
          // Ко��анда откл��чения имеет абсолютный приоритет �� выполняется всегда
          const isShutdownCommand =
            (finalTranscript || combinedTranscript)
              .toLowerCase()
              .includes("отключись") ||
            (finalTranscript || combinedTranscript)
              .toLowerCase()
              .includes("выключи��ь");

          // Пр��ну����ительно сбрасываем застрявшие б��окировки если система молчит дольше 5 секунд
          const now = Date.now();
          const timeSinceLastCommand =
            now - (lastCommandRef.current ? Date.now() : 0);
          if (
            commandCooldownRef.current &&
            !isSpeaking &&
            !audioPlayingRef.current
          ) {
            console.log(
              "���� Принудите���ьно сбрасываем застрявшие блокировки",
            );
            commandCooldownRef.current = false;
            lastCommandRef.current = "";
          }

          if (
            (finalTranscript || combinedTranscript.length > 2) && // Снижен порог с 5 до 2 символов
            (isShutdownCommand || (!commandCooldownRef.current && !isSpeaking))
          ) {
            const command = (finalTranscript || combinedTranscript)
              .toLowerCase()
              .trim();
            console.log("🔍 ��нализируем ���ом��нду:", `"${command}"`);

            // Проверяем, что ��оман��а отличае��ся от предыдущей и достаточно длинная (понижен порог)
            if (
              command &&
              command !== lastCommandRef.current &&
              command.length > 1 // Снижен порог с 2 до 1 символа для лу��шего рас��оз��ава��ия коротких команд
            ) {
              console.log(
                "�� К��манда принята дл�� обраб��т��и:",
                `"${command}"`,
              );
              setTranscript(command);
              onListeningChange?.(true, command);

              // Очи��аем п��едыдущ���� таймер
              if (commandDelayRef.current) {
                clearTimeout(commandDelayRef.current);
              }

              // Добавляем небольшую ��ад��ржку для завершения фразы
              commandDelayRef.current = setTimeout(
                () => {
                  lastCommandRef.current = command;
                  setNoSpeechCount(0); // Сб��а��ываем счетчик пр�� ус��ешном ра�������ознавании

                  processVoiceCommand(command);

                  // Быстр������я о��истка транскрипт�� после запуска ко������анды
                  setTimeout(() => {
                    console.log(
                      "����� Б��с��р��������������я очистка т��анскрипт��",
                    );
                    setTranscript("");
                    // НЕ вызываем onListeningChange, ��тобы н�� открывать па��ель после отключения
                  }, 800);

                  // Полная очистка состояния ��ома��ды и ��ерезап��ск Recognition
                  setTimeout(() => {
                    console.log(
                      "🧹 ��олная очистка ��ос��оя��ия после команды",
                    );
                    setTranscript("");
                    // НЕ вызываем onListeningChange, чтобы не от��рывать панель после отключения
                    lastCommandRef.current = "";

                    // Н�� перезапускаем Recognition - пусть работ���ет непрерывно
                    console.log(
                      "��� ��ос��ояние очищено, Recognition продолжает работать",
                    );
                  }, 2000);
                },
                finalTranscript ? 100 : 1000,
              ); // Мень��е за����ержки дл�� фи����альных ре��ул����татов
            } else {
              console.log("❌ Команда о��клонена:", {
                isEmpty: !command,
                isSame: command === lastCommandRef.current,
                isTooShort: command.length <= 2,
                lastCommand: lastCommandRef.current,
              });
            }
          }
        };

        recognitionRef.current.onend = () => {
          console.log(
            "🎤 Распознавание завершилось, isListening:",
            isListening,
            "isSpeaking:",
            isSpeaking,
          );

          // ВС��ГДА перезапус��аем распознавание, ес��и польз��ватель не отключил микрофон вручную
          if (isListening) {
            console.log("🔄 Перезапускаем р��спозн��вание...");

            // Очищаем состояние перед перезапуском
            setTranscript("");
            lastCommandRef.current = "";

            setTimeout(() => {
              if (recognitionRef.current && isListening) {
                try {
                  recognitionRef.current.start();
                  console.log("✅ ��аспо��нав��ние пе���еза��ущено");
                } catch (error) {
                  console.log(
                    "ℹ️ Распознавание уже запущено или недоступно:",
                    error,
                  );
                  // Есл�� не удало��ь перез���пу��тить, попробуем еще раз через 500мс
                  setTimeout(() => {
                    if (recognitionRef.current && isListening) {
                      try {
                        recognitionRef.current.start();
                      } catch (e) {
                        console.log("Повторная попытка запуска не удалас��");
                      }
                    }
                  }, 500);
                }
              }
            }, 100);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.log("Speech recognition event:", event.error);

          // Критические ошибки �� у��ным восстановлени��м
          if (event.error === "network") {
            setNetworkErrorCount((prev) => prev + 1);
            console.error(
              `🚨 ��етевая ошибк�� ра����познавания #${networkErrorCount + 1}`,
            );

            // Если слишком м��ого сетевых ошибок подряд - отключаем
            if (networkErrorCount >= 3) {
              console.error(
                "��� Слишком много сетевых ошибок - отключаем ��аспознавание",
              );
              setIsListening(false);
              onListeningChange?.(false, "");
              setNetworkErrorCount(0);
              return;
            }

            // Попытка восстановления с увеличивающейся задержкой
            const retryDelay = Math.min(3000 * (networkErrorCount + 1), 10000); // От 3 до 10 секунд
            console.log(`🔄 Попытка восстановления через ${retryDelay}мс`);

            setTimeout(() => {
              if (isListening && recognitionRef.current) {
                console.log(
                  "🔄 В��сстанавливаем распознавани�� после сетевой ошиб������",
                );
                try {
                  recognitionRef.current.start();
                  console.log("✅ Распознава��ие восстановлено");
                  setNetworkErrorCount(0); // Сбрасываем счетчик при успехе
                } catch (error) {
                  console.error(
                    "❌ Не удалось восстановить распознавание:",
                    error,
                  );
                }
              }
            }, retryDelay);
          }
          // Критическ��я ошибка разрешений - отключае��
          else if (event.error === "not-allowed") {
            console.error("�� Доступ к микрофону запрещен");
            setIsListening(false);
            onListeningChange?.(false, "");
          }
          // Некри��и��еские ��шибки - игнорируе�� и ��родолж��������ем
          else if (
            event.error === "no-speech" ||
            event.error === "audio-capture" ||
            event.error === "aborted"
          ) {
            if (event.error === "no-speech") {
              setNoSpeechCount((prev) => prev + 1);
              console.log(
                `ℹ️ No-speech о���ибка #${noSpeechCount + 1} - п����од��лжаем ��лу����ать`,
              );

              // Есл���� сл��шк��м мн����о no-speech о��ибок ��одряд, делаем неб��льшую паузу
              if (noSpeechCount >= 3) {
                console.log(
                  "⏸️ М���ого no-speech ошибок, делаем паузу 2 ��ек...",
                );
                setTimeout(() => {
                  setNoSpeechCount(0);
                  if (isListening && recognitionRef.current) {
                    try {
                      recognitionRef.current.start();
                    } catch (error) {
                      console.log("Перезапу���� после паузы");
                    }
                  }
                }, 2000);
              }
            } else {
              console.log(
                "ℹ️ Некр��тиче��кая ошибк�� ��аспознава��ия:",
                event.error,
                "- ��ро��ол��аем слушать",
              );
            }
            // Систе���а автомати��ески ��ереза��ус����ится через onend
          }
          // Другие оши��ки - �������резапускаем через корот���ое время
          else {
            console.warn(
              "⚠���� Неожиданн���я ошибка ра��позна����ния:",
              event.error,
              "- перезапу��каем",
            );
            setTimeout(() => {
              if (isListening && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (error) {
                  console.log("Перезапуск после о��ибки");
                }
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
      // Ос��анавливаем любое воспроизводящееся ��удио при раз��онтировани��
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }
      // Очищаем т�������йм��р ко��анд
      if (commandDelayRef.current) {
        clearTimeout(commandDelayRef.current);
      }
    };
  }, []);

  // Функ��ия для полного сброса Speech Recognition
  const resetSpeechRecognition = () => {
    if (recognitionRef.current) {
      console.log("�� П��лный сброс Speech Recognition");
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("Ошибка остановки при сбросе:", error);
      }

      setTimeout(() => {
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start();
            console.log("✅ Speech Recognition перезапущен и очи��ен");
          } catch (error) {
            console.log("Ошибка запуска при сбросе:", error);
          }
        }
      }, 200);
    }
  };

  // Effect ��ля обработки тестов��х ко����нд
  useEffect(() => {
    const handleTestCommand = (event: any) => {
      console.log("🧪 Получена тестовая ��ом�����да:", event.detail.command);
      processVoiceCommand(event.detail.command);
    };

    window.addEventListener("voiceCommand", handleTestCommand);
    return () => window.removeEventListener("voiceCommand", handleTestCommand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect д��я принудите����ной остан��вки
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

  // Effect для автоматической ��ч��стки застрявших блокировок
  useEffect(() => {
    const interval = setInterval(() => {
      // Есл�� система заблокирована, но не говорит и не вос��роизводит ауд��о
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

      // Допо��нительная защита: если система молчит более 5 секунд, принуд��тельно с��ра��ываем
      if (isSpeaking && !audioPlayingRef.current && !currentAudioRef.current) {
        console.log(
          "🔄 Принудительны�� ����брос 'г��ворящего' состоя��ия без аудио",
        );
        setIsSpeaking(false);
        commandCooldownRef.current = false;
      }
    }, 2000); // Пров��ряем каждые 2 секунды (чаще для лучшей отзывчивости)

    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  // Effect для отслеживания со��то��ния сети
  useEffect(() => {
    const handleOnline = () => {
      console.log("🌐 Интернет соединение восстановлено");
      setNetworkErrorCount(0); // Сбрасываем счетчик ошибок при во��становлении сети
    };

    const handleOffline = () => {
      console.log("📵 Потеряно интернет соединение");
      if (isListening) {
        console.log(
          "⚠️ Распознавание реч�� может ��аботать некоррект��о без интер��ета",
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

  // Функция дл�� про��ерки доступнос�����и речевого сервиса
  const checkSpeechServiceAvailability = async () => {
    try {
      // Проверяем онлайн статус
      if (!navigator.onLine) {
        console.log("📵 Нет интернет соединения");
        return false;
      }

      // Пр��ве��яем доступность Speech Recognition
      if (!recognitionRef.current) {
        console.log("❌ Speech Recognition не инициализирован");
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Ошибка проверки доступности сервиса:", error);
      return false;
    }
  };

  // Глобальная функция для принудительного с��роса ВСЕХ блокировок
  const forceResetAllStates = () => {
    console.log("🔥 ПРИНУД��Т��Л����НЫЙ СБРОС ВСЕХ СОСТОЯНИЙ");

    // Останав��иваем любое текущее аудио
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }

    // Сбрасываем все блокиров��и
    commandCooldownRef.current = false;
    audioPlayingRef.current = false;
    lastCommandRef.current = "";
    setIsSpeaking(false);
    setTranscript("");

    console.log("✅ ВСЕ СОСТОЯНИЯ СБРОШЕНЫ");
  };

  // Фу��кция дл�� пол��ого ��броса состояния по���л�� ��оманды
  const resetCommandState = (
    delay: number = 1000,
    skipPanelReopen: boolean = false,
  ) => {
    console.log(`⏰ П��ан��руем сбро�� cooldown через ${delay}мс`);
    setTimeout(() => {
      // Полный сброс вс��х состояний блокировки
      commandCooldownRef.current = false;
      audioPlayingRef.current = false;
      lastCommandRef.current = "";
      setTranscript("");
      setIsSpeaking(false); // Принудительно сбрасываем состояние го��орения
      currentAudioRef.current = null; // Очищаем ссылку на аудио

      console.log("🔄 Полный сброс ��сех ��остояний бл����и��овки вы��олн����");

      // Только сообщаем о состоянии, если микр��фон все ��ще ак��ивен �� это не ������оманда о��ключения
      if (isListening && !skipPanelReopen) {
        onListeningChange?.(true, "");
        console.log("✅ Cooldown сброшен, микро���он активен");
      } else {
        console.log(
          "��� Cooldown сброшен, ми���рофон отключен ил�� ��ома��да отключен��я - не ��ткрываем панел��",
        );
      }
    }, delay);
  };

  const speak = (text: string) => {
    // Предотвр��щаем повторное воспроизведение только ��сл�� у��е играет аудио
    if (isSpeaking) {
      console.log("🚫 speak заблокиро��а�� - уже играет аудио");
      return;
    }

    // Если есть cooldown, но не играет аудио, то ��рин��дительн�� сбрасываем cooldown
    if (commandCooldownRef.current) {
      console.log("⚠️ Принудитель��о сбрасываем cooldown ��ля новой коман��ы");
      commandCooldownRef.current = false;
    }

    console.log("🔊 Начинае������ воспроизведение:", text);

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Очищаем транскрипт когда начинаем ��оворить
    setTranscript("");
    // НЕ вызываем onListeningChange во время восп��оизведе��ия аудио
    // Это ������дотвращает повторно�� открыти�� панел�� после команды отклю��ен��я

    // ��озда����м и вос�����рои����водим ваш но��ый ау��ио-файл
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fdb47541068444a9093b406f29a6af3ce?alt=media&token=43fbc024-64ae-479b-8a6c-5b9d12b43294&apiKey=236158b44f8b45f680ab2467abfc361c",
    );

    audio.onended = () => {
      setIsSpeaking(false);
      // Сбрасываем состояние через короткую задержку после аудио
      // НЕ отк��ываем панель если микрофон был отключе��
      resetCommandState(1000, !isListening);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error("Ошибка воспроизведения ауди����");
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
    console.log("���� Выполняем команд�� отключе��ия микр��фо��а");

    // ПРИНУДИТЕЛЬНО сбрасываем ВСЕ ��остоян���я блокировки ��ля команды ��тключения
    commandCooldownRef.current = false;
    audioPlayingRef.current = false;
    lastCommandRef.current = "";
    console.log("🔴 Принудительно сбро��или все блокировки");

    // СНАЧАЛА отключаем состояние listening, чт��бы предотвр��тить автом��тический перезапуск
    setIsListening(false);
    onListeningChange?.(false, "");
    console.log("�� Состоян��е listening отключено");

    // Останавливаем любое текущее воспро��з��едение
    if (currentAudioRef.current) {
      console.log("⏹️ Останавливае�� т��кущее аудио");
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null; // Очищаем сс��лку
    }

    // Останавли��аем Recognition сразу
    if (recognitionRef.current) {
      console.log("���� Останавливаем Recognition");
      recognitionRef.current.stop();
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Добавляем небол��ш��ю задержку перед созданием нового аудио
    setTimeout(() => {
      console.log("🔊 Создаем аудио для отключения");

      // Создаем и воспроизводим ауд��о дл�� команды "откл��чи��ь"
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
        // Н�� открываем панель ��братно после коман��ы отключения
        console.log(
          "✅ Ко��анда отключения завершена - панель ��ст��ется закрыт��й",
        );
      };

      audio.onended = shutdownComplete;

      audio.onerror = () => {
        console.error("Ошибка во�����роиз��едения ����ди�� отключени����");
        shutdownComplete();
      };

      console.log("▶️ ��ытаемся во��произвести ау��ио отключения");
      audio.play().catch((error) => {
        console.error(
          "❌ Не уд����лось воспрои��вес��и аудио ��тключения:",
          error,
        );
        shutdownComplete();
      });
    }, 100); // Задержка 100мс для полной ос����новки пр���дыдущего аудио
  };

  const speakWelcomeBack = () => {
    if (isSpeaking) {
      console.log("🚫 speakWelcomeBack за��л��кирован - уже играет ау��ио");
      return;
    }

    if (commandCooldownRef.current) {
      console.log("⚠️ Принудительно с��расываем cooldown для speakWelcomeBack");
      commandCooldownRef.current = false;
    }

    console.log("���� Начинаем воспроизведение привет��т��ия");

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Создаем и воспроизводим ау������о для команды "Джарвис я вернулс��"
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
      console.error("����ибка воспроизведен���я ау���������о при��етств��я");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error("Не уд����ось воспрои��в����сти аудио приветствия:", error);
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

    console.log("🔓 Начинаем воспроизведение 'полный доступ'");

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Создаем и воспроизв��дим аудио ��ля команды "Джарвис полный доступ"
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
      console.error("Ошибка воспроизведения аудио п��лного доступа");
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
    // Разреша��м выпо��нение если ��ет ак��ивного аудио
    if (isSpeaking && audioPlayingRef.current) return;

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Создаем и восп��оизводим аудио дл������ благода��ности
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
      console.error("Ошибка во��п����оизведения ���удио бл��годар������о���ти");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error(
        "Не удал��сь вос����о��звести аудио благо��а��ности:",
        error,
      );
    });
  };

  const speakGoodMorning = () => {
    // Улучшенная защита - разрешаем если нет активного ��удио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakGoodMorning заблокирован - и��рает а��дио");
      return;
    }

    // Останавливаем любое ���екущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // С��зда��м и воспро��зводим ауд��������о ��ля утреннего приветстви��
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
      }, 2000); // Увеличен тай����ут до 2 секунд
    };

    audio.onended = resetState;
    audio.onerror = () => {
      resetState();
      console.error(
        "О��ибка во����произведения ауди�� утренне��о при����етствия",
      );
    };

    audio.play().catch((error) => {
      resetState();
      console.error(
        "Не удалось во��произвести аудио утреннего ���рив��т��т��ия:",
        error,
      );
    });
  };

  const speakIAmHere = () => {
    // Разре��аем выполнение если нет активного ауди��
    if (isSpeaking && audioPlayingRef.current) return;

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Создае�� и во��произво��им аудио ����ля ответа "��ж��рв���с ты тут?"
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
      console.error("Ошибка воспроиз���ед����ния аудио о��вета");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error(
        "Не удалось воспроизв����ст���� ауд���о ������тве����а:",
        error,
      );
    });
  };

  // Новая ��унк��ия для синт��зированного голоса Джарвиса
  const speakWithJarvis = async (text: string) => {
    // Предотвращаем повторное воспроизведение
    if (isSpeaking || isJarvisSpeaking()) {
      console.log("🚫 speakWithJarvis заблокирован - уже и��рает а��дио");
      return;
    }

    // Ост��навливаем лю��ое текущ��е воспроизведение
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
      console.log("🎙️ Говорит Джарви��:", text);

      await jarvisSpeak(text, {
        onStart: () => {
          console.log("✅ Джарвис начал говорить");
        },
        onEnd: () => {
          console.log("✅ Джарвис закончил говори��ь");
          resetState();
        },
        onError: (error) => {
          console.error("❌ ��шибка речи Джарвис���:", error);
          resetState();
        },
      });
    } catch (error) {
      resetState();
      console.error("❌ Не удалось запустить голос Джарвиса:", error);
    }
  };

  const speakWithElevenLabs = async (text: string) => {
    // Улучшен���ая защита - разрешаем если нет активного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakWithElevenLabs заблокирован - играет аудио");
      return;
    }

    // Оста��авливаем любое текущее вос��р��изв����ение
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
      // Используем ElevenLabs API для синтеза р��чи с вашим кастомным голосом
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

      // Fallback: используем встроенный браузерный TTS
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
        console.log("Джарвис:", text);
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
    // Улучшенная за����и��а - разрешаем е��ли нет акт��вного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakAuthenticJarvis заблокирован - играет аудио");
      return;
    }
    console.log("����� Нач���наем воспроизведение Jarvis аудио");

    // О�������танавливаем любое текущее воспроизве��ение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    // ��апоминаем со��тояние прослу���ивания ДО остановк��
    const wasListening = isListening;

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Немед��ен����о о��ищаем транскрипт к��гда н��чинаем говорит��
    setTranscript("");
    // ��Е вызываем onListeningChange во время восп��оизведения ау��ио

    // НЕ останавливаем расп����знавание во врем�� воспроизведения аудио
    // Пусть микрофон продолжает работать
    console.log("🔊 Воспр��из��о���им аудио, но остав��яем микрофон акт��вным");

    // Используем ваш ��ригиналь��ы�� аудиофайл Джарвиса
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2Fddde4fe5b47946c2a3bbb80e3bca0073%2F54eb93b1452742b6a1cd87cc6104bb59?alt=media&token=fc948eba-bbcd-485c-b129-d5a0c25cfc74&apiKey=ddde4fe5b47946c2a3bbb80e3bca0073",
    );
    currentAudioRef.current = audio;

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;

      // Мик��офон продолжал работать, ������чего восстанавливать не нуж���о
      console.log("✅ Ауди�� завершено, микрофон остается активным");

      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 1000);
    };

    audio.onended = resetState;
    audio.onerror = () => {
      resetState();
      console.error("Ошибка воспроизв��дения оригина���ьного аудио Джарвиса");
    };

    audio.play().catch((error) => {
      resetState();
      console.error(
        "Не удалос�� воспроизвести оригинальное ауд��о Дж��р��иса:",
        error,
      );
    });
  };

  // Универсальная функция для TTS с автоматическим fallback
  const speakWithAutoFallback = async (text: string) => {
    // Сначала пробуем ElevenLabs
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
            console.error("Ошибка браузерного TTS");
            resolve(false);
          };

          setIsSpeaking(true);
          commandCooldownRef.current = true;
          audioPlayingRef.current = true;

          speechSynthesis.speak(utterance);
        });
      } else {
        // По��ледний fallback: просто текст в консоли
        console.log("Джа��вис:", text);
        return false;
      }
    }
  };

  const speakSystemsOperational = async () => {
    await speakWithAutoFallback("Все системы функционируют нормально");
  };

  const speakRotateModel = () => {
    // Улучшенная защ��та - раз��ешаем если нет активного ауд��о
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakRotateModel заблокирован - играет аудио");
      return;
    }

    // Останавлив��ем любое текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("🔄 Начинаем вращ��ние модели с аудио");
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Запускаем вращение модели
    if (onModelRotateStart) {
      onModelRotateStart();
    }

    // Воспроизводим первое аудио (для команды "покрути модель")
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
      console.error("❌ Ошибка воспр��изведения аудио для вращения модели");
    };

    audio.play().catch((error) => {
      resetState();
      console.error(
        "❌ Не удалось воспроизвести аудио для вращения модели:",
        error,
      );
    });
  };

  const speakStopModel = () => {
    // Улучшенная защита - разре��аем если нет активного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakStopModel заблокирован - играет аудио");
      return;
    }

    // Останавливаем любое текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("⏹️ Останавливаем вращение модели с аудио");
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Останавлив��ем вращение модели
    if (onModelRotateStop) {
      onModelRotateStop();
    }

    // Воспроизводим второе аудио (для команды "хватит")
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
      console.error("❌ Ош��бка воспроизведе��ия аудио для остановки модели");
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
    // Улучшенная защита - разрешаем если нет ����тивного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakHowAreYou заблокирован - играет ��уд��о");
      return;
    }

    // Ос����анавлив��ем ��юбое те����ущее ��оспрои����ведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Используе�� Web Speech API для синтеза фразы "у меня в��е в п��рядке сэр"
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        "у меня все в ��ор��дке сэр",
      );

      // ��астр��йки максимально приближенные к ElevenLabs Jarvis (wDsJlOXPqcvIUKdLXjDs)
      // Stability: 20 (низ��ая ст��бильно��ть для более естестве��ной речи)
      // Similarity Boost: 90 (высок��е сходс����во с ор��гинальным го��осом)
      // Style: Assistant/Narration (помощник/повеств��в��ние)

      utterance.lang = "en-US"; // ��нг����йский для лучшего качества, потом переклю�����им ���� русский
      utterance.rate = 0.75; // Мед����н����я, размеренна�� р��чь как �� Джарвиса из фильма
      utterance.pitch = 0.7; // Сред����-ни��кий тон для ����втор��те����ос��и
      utterance.volume = 0.95; // Четкая, но не резкая громкость

      // ��оиск наиболее подходящего голоса д��я имитации Jarvis
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

      // ����сли н�� нашли подходящий а����л��йс��ий, ище�� русский м���жской
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
        utterance.pitch = 0.6; // Чуть ниже для лучшего ����вучания русского
      } else if (russianMaleVoice) {
        utterance.voice = russianMaleVoice;
        utterance.lang = "ru-RU";
        utterance.pitch = 0.6; // Ч��ть ниже для ��усского голос����
      } else {
        // Fallback: любой доступный го����ос с оптимиз��рованны��и настройк��ми
        const anyVoice = voices.find(
          (voice) => voice.lang.includes("en") || voice.lang.includes("ru"),
        );
        if (anyVoice) {
          utterance.voice = anyVoice;
          utterance.lang = "ru-RU"; // Всегда русск��й язык
        }
        utterance.pitch = 0.55; // Еще ниже дл�� к��мп��нсации
        utterance.rate = 0.7; // Е������ м��дленне�� ��ля большей солидно��ти
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
        console.error("Оши��ка синтеза речи");
      };

      try {
        speechSynthesis.speak(utterance);
      } catch (error) {
        resetState();
        console.error("Не удало��ь синтезирова��ь речь:", error);
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

    console.log("🧪 Т����ти��уем URL аудио��а��лов:");
    console.log("URL1:", url1);
    console.log("URL2:", url2);

    fetch(url1)
      .then((response) => console.log("✅ URL1 доступен:", response.status))
      .catch((error) => console.error("❌ URL1 недоступен:", error));

    fetch(url2)
      .then((response) => console.log("✅ URL2 доступен:", response.status))
      .catch((error) => console.error("❌ URL2 недоступен:", error));
  };

  const speakSystemDiagnostics = () => {
    console.log("🔧 Запуск ��иагн����������стики систе����...");
    testAudioUrls(); // Тестируем URL

    // Улучшенная защита - разрешаем если не��� активного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ Диаг��остика заблокирована - играет аудио");
      return;
    }

    // Останавл����ваем любое текущее воспроиз��ед��ние
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Воспроизводи�� первое а��ди��
    console.log("��� Создаем пе����вое аудио ��ля ���иагнос��ики");
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
      console.log("✅ Пер��ое аудио за��онч��л��сь, ж��ем 2 секун��ы...");
      // Ч�����ез 2 се��унды восп��оизводим второе аудио
      setTimeout(() => {
        console.log("🎵 ��оздаем второе ау��ио для диагности����");
        const secondAudio = new Audio(
          "https://cdn.builder.io/o/assets%2Ff623eb4c005f4a40a75c4b9a0beb1b76%2Ff74fdea7f34b4c2fa5df3d62bd9efe29?alt=media&token=80cd6e08-efaa-4afd-b3aa-66aa3f68623c&apiKey=f623eb4c005f4a40a75c4b9a0beb1b76",
        );
        currentAudioRef.current = secondAudio;

        secondAudio.onended = () => {
          console.log("✅ Второе ау��и�� закончилось, диагностика завершена");
          resetState();
        };
        secondAudio.onerror = () => {
          resetState();
          console.error(
            "❌ Оши��ка во��произ��едени�� второго ау��ио ��иагностики",
          );
        };

        console.log("��️ Запускае�� второе ау���и��");
        secondAudio.play().catch((error) => {
          resetState();
          console.error(
            "❌ Не ���далось воспроизвести второе ауди�� диагностики:",
            error,
          );
        });
      }, 2000);
    };

    firstAudio.onerror = () => {
      resetState();
      console.error("❌ Ошибка воспроизведения первого аудио ��иагностик��");
    };

    console.log("▶️ ����пускаем перво�� ауд����");
    firstAudio.play().catch((error) => {
      resetState();
      console.error(
        "❌ Не удалось в��спроизвести пе��вое аудио диагностики:",
        error,
      );
    });
  };

  const speakContinue = () => {
    // Улучшенная защита - разрешаем если нет актив��ого аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakContinue заблокирован - играет аудио");
      return;
    }

    // Останавливаем любое текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("▶️ Воспроиз��одим ��ервое аудио - Давай продолжи��");
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Пер��ое ауд���о для к��манды "давай продо��жим"
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
      console.error("❌ Не удал��сь восп��оизвести первое аудио:", error);
    });
  };

  const speakCorrect = () => {
    // Улу��шенная �����щита - разреша��м если нет акт��вного ��удио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakCorrect заблок��рован - иг�����ет а����ио");
      return;
    }

    // Останавливаем любое т��кущее воспроиз��едение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("▶️ Воспроизводим второе ау���ио - Верн���");
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
      console.error("❌ Ошибка ��оспроизведени��� втор��го аудио");
    };

    audio.play().catch((error) => {
      resetState();
      console.error("❌ Не удалось вос��роизвести второе аудио:", error);
    });
  };

  const changeToNewModel = () => {
    // Улу��шенная защита - разрешаем если нет активного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ changeToNewModel заблокирован - играет аудио");
      return;
    }

    // Останавливаем любое текущее воспроизведе��ие
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("🔄 Смена на новую модель с эффектами");
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

    // Добавляем CSS стили для эффектов
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

    // Воспроизводим аудио пользователя
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2Fd75af4d8f215499ea8d0f6203e423bd8%2F3b053c81e36b4fef904e40553c401613?alt=media&token=f48c0f2a-72ec-4b41-816d-2942d8cc3442&apiKey=d75af4d8f215499ea8d0f6203e423bd8",
    );
    currentAudioRef.current = audio;

    // Уведомляем о смене модели через глобальное событие
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

      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
    };

    audio.onended = () => {
      resetState();
      // Отправляем событие смены модели после завершения аудио
      window.dispatchEvent(changeEvent);
    };

    audio.onerror = () => {
      resetState();
      console.error("❌ Ошибка воспр��изведения аудио смены модели");
      // Отправляем событие смены модели даже при оши��ке аудио
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
    // Улучшенная защита - разрешаем если нет активного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ changeToOldModel заблокирован - играет аудио");
      return;
    }

    // Останавливаем любое текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("🔙 Возврат к прошлой модели с эффектами");
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Добавляем тот же э��фект сканера
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

    // Уведомляем о возврате к старой модели
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

      // Удаляем эффекты через 2 секунды
      setTimeout(() => {
        const scannerElements = document.querySelectorAll(
          ".model-change-scanner",
        );
        scannerElements.forEach((el) => el.remove());
      }, 2000);

      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
    };

    audio.onended = () => {
      resetState();
      // Отправляем событие возврата к старой модели
      window.dispatchEvent(changeEvent);
    };

    audio.onerror = () => {
      resetState();
      console.error("❌ Ошибка воспроизведения аудио возврата модели");
      // Отправляем событие даже при ошибке аудио
      window.dispatchEvent(changeEvent);
    };

    audio.play().catch((error) => {
      resetState();
      console.error(
        "❌ Не удалось воспроизвести аудио возврата модели:",
        error,
      );
      // Отправляем событие даже при ошибке
      window.dispatchEvent(changeEvent);
    });
  };

  const speakLoveYou = () => {
    // Улучшенная защита - разрешаем если нет активного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakLoveYou ��аблокирован - играет аудио");
      return;
    }

    // Останавливаем любое текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("💕 Воспроизводим ответ на 'люблю тебя'");
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Аудио для команды "люблю тебя"
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
      console.error("❌ Ошибка воспроизведения аудио 'люблю тебя'");
    };

    audio.play().catch((error) => {
      resetState();
      console.error("❌ Не удалось воспроизвести аудио 'люблю тебя':", error);
    });
  };

  const activateStarkLab = () => {
    // Улучшенн��я защита - разрешаем если нет активного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ activateStarkLab заблокирован - иг��ает аудио");
      return;
    }

    // Останавливаем любое текущее вос��роизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log(
      "�� Активация лаборатории Старка - начинаем последовательность",
    );
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // ПЕРВОЕ аудио для команды "полная ак��ивация"
    const firstAudio = new Audio(
      "https://cdn.builder.io/o/assets%2F6b72a929cd24415c8486df051bbaa5a2%2Fbb0dc9d654554f1a9bb9dcc874d5434b?alt=media&token=47d6c26a-18e1-4ffb-9363-adc20856464f&apiKey=6b72a929cd24415c8486df051bbaa5a2",
    );
    currentAudioRef.current = firstAudio;

    firstAudio.onended = () => {
      console.log("✅ Перво�� аудио завершено, ак��ивируем ��абораторию");

      // Мгновенно м������яем тему на лабораторию Старка
      document.documentElement.classList.add("stark-lab-theme");

      // До��авляем эффект скан��рования
      const scanElement = document.createElement("div");
      scanElement.className = "lab-activation-scan";
      document.body.appendChild(scanElement);

      // Доба��ляем активационный оверлей
      const overlayElement = document.createElement("div");
      overlayElement.className = "lab-activation-overlay";
      document.body.appendChild(overlayElement);

      // Добавляем HUD сетку
      const hudGrid = document.createElement("div");
      hudGrid.className = "stark-lab-hud-grid";
      document.body.appendChild(hudGrid);

      // До��авляем голографичес��ие частицы
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
        console.log("🔊 Воспроизводим второе аудио после активации");
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
          console.log("��� Активац���я лаборатории завершена");
        };

        secondAudio.onerror = () => {
          setIsSpeaking(false);
          audioPlayingRef.current = false;
          currentAudioRef.current = null;
          setTimeout(() => {
            commandCooldownRef.current = false;
            lastCommandRef.current = "";
          }, 500);
          console.error("❌ Оши��ка воспроизведения вто��ого аудио активаци��");
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
            "❌ Не удалось воспроизвести второе аудио активации:",
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
      console.error("❌ Ошибка вос��роизвед��ния первог�� а��дио акти��ации");
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
        "❌ Не ��далос�� восп��оизвести перво���� аудио активации:",
        error,
      );
    });
  };

  const deactivateStarkLab = () => {
    // Улучшенная защи��а - разрешаем если нет активного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ deactivateStarkLab заблокирован - и��рает аудио");
      return;
    }

    // Останавливаем любо�� текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("🔄 Возвращаем обычну�� тему");
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // ТРЕТЬЕ аудио для коман��ы "вер��и меня обратно"
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F6b72a929cd24415c8486df051bbaa5a2%2F6d0501b67e3846298ea971cf00a9add8?alt=media&token=79cbcd57-2bfb-4b1d-a4c9-594c1f0543ac&apiKey=6b72a929cd24415c8486df051bbaa5a2",
    );
    currentAudioRef.current = audio;

    // Сразу возвращаем об��чную тему
    document.documentElement.classList.remove("stark-lab-theme");

    // Уда��яем все лабораторные элементы
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
      console.log("✅ Возв��ат к обычно�� теме заве��шен");
    };

    audio.onended = resetState;
    audio.onerror = () => {
      resetState();
      console.error("❌ Ош����ка воспроизведения аудио возврата");
    };

    audio.play().catch((error) => {
      resetState();
      console.error("❌ Не уд��лось воспроизвест�� ау��ио возврата:", error);
    });
  };

  const processVoiceCommand = (command: string) => {
    console.log("🔧 Обработка команды:", command);

    // ��АРА��ТИРОВ����ННАЯ защита от зас���ревания: всегда разрешаем обработку новых команд
    // Уста��авливаем ��аймер на сброс блокировок для ЛЮБОЙ команды
    const forceUnlockTimer = setTimeout(() => {
      console.log("�� Принудительное разблокирование через 8 секунд");
      commandCooldownRef.current = false;
      audioPlayingRef.current = false;
      setIsSpeaking(false);
      lastCommandRef.current = "";
    }, 8000); // Максимум 8 секунд на любую команду

    // При��удительно сбрасы��ае�� все блокировки перед обработкой новой ����оманды
    // КРОМЕ команды отк���ючения, котор��я обрабатывается отд��льно
    if (!command.includes("от���лючись") && !command.includes("выключись")) {
      if (commandCooldownRef.current || audioPlayingRef.current) {
        console.log(
          "��� Пр��н��дит����льно сбрасываем блокировки перед обработкой команды",
        );
        forceResetAllStates();
      }
    }

    // Очищаем тайм��р если команда успешно завершится
    const originalClearTimeout = () => {
      clearTimeout(forceUnlockTimer);
    };

    // Добавля��м очистку таймера к концу функц��и
    setTimeout(originalClearTimeout, 100);

    // Простая очистка транскрипт���� в начале обработки
    setTranscript("");
    // НЕ вызываем onListeningChange во время обработки команды
    // Это ��редотвращает повторное открытие панели

    // НЕ сбрасываем Recognition автоматически - ��усть рабо��ает непреры��но
    console.log("🎯 Об���абатываем команд�� без сброса Recognition");

    // Фильтруем пу��тые или ������ишком коротки�� команды
    const trimmedCommand = command.trim();
    if (trimmedCommand.length < 3) {
      return;
    }

    // Команда откл���чени�� (приори��е��ная)
    if (
      command.includes("отключись") ||
      command.includes("выключись") ||
      command.includes("отключи микрофон") ||
      command.includes("стоп джарвис") ||
      command.includes("выключи") ||
      command.includes("отключи") ||
      command.includes("отключит��") ||
      command.includes("джарвис отключись") ||
      command.includes("джарвис выключись") ||
      command.includes("жарвис отключись") ||
      command.includes("ярвис отключись")
    ) {
      console.log("🔴 К��манда отключения ра��познана:", command);
      // Принудительно выполняем ко��анду отключени�� независимо от сост��яния
      speakShutdown();
      return;
    }

    // Команда "Джар��ис, полна�� активация" - ак��ивация лаборатории Старка
    if (
      command.includes("джарвис полная активация") ||
      command.includes("полная активация ��жар��ис") ||
      command.includes("жарвис полная активация") ||
      command.includes("ярвис полная активация") ||
      command.includes("джарвис активация лаборатории") ||
      command.includes("активация лаборатории джарвис") ||
      command.includes("активировать лабораторию") ||
      command.includes("джарвис включи лабораторию") ||
      command.includes("жарвис активация лаборатории") ||
      command.includes("ярвис а���тивация лаборатории") ||
      command.includes("полная активация")
    ) {
      console.log("🔬 Команда активации лаборатории распознана:", command);
      // Улучшенная проверка - разрешаем если нет активного аудио
      if (!isSpeaking || !audioPlayingRef.current) {
        activateStarkLab();
      }
      return;
    }

    // Команда "смени модель" - смена на новую модель (работает с Джарвис и без него)
    if (
      command.includes("смени модель") ||
      command.includes("поменяй модель") ||
      command.includes("новая модель") ||
      command.includes("измени модель") ||
      command.includes("другая модель") ||
      command.includes("сменить модель") ||
      command.includes("смена модель") ||
      command.includes("модель смени") ||
      command.includes("джарвис смени модель") ||
      command.includes("смени модель джарвис") ||
      command.includes("джарвис смени") ||
      command.includes("смени джарвис") ||
      command.includes("джарвис поменяй модель") ||
      command.includes("поменяй модель джарвис") ||
      command.includes("джарвис поменяй") ||
      command.includes("поменяй джарвис") ||
      command.includes("джарвис новая модель") ||
      command.includes("новая модель джарвис") ||
      command.includes("джарвис измени модель") ||
      command.includes("измени модель джарвис") ||
      command.includes("джарвис другая модель") ||
      command.includes("другая модель джарвис") ||
      command.includes("жарвис смени модель") ||
      command.includes("ярвис смени модель") ||
      command.includes("жарвис смени") ||
      command.includes("ярвис смени")
    ) {
      console.log("🔄 Команда смены модели распознана:", command);
      if (!isSpeaking || !audioPlayingRef.current) {
        changeToNewModel();
      }
      return;
    }

    // Команда "верни модель" - возврат к старой модели (работает с Джарвис и без него)
    if (
      command.includes("верни прошлую модель") ||
      command.includes("верни прошлую") ||
      command.includes("верни старую модель") ||
      command.includes("верни старую") ||
      command.includes("верни прежнюю модель") ||
      command.includes("верни прежнюю") ||
      command.includes("вернуть модель") ||
      command.includes("верни модель") ||
      command.includes("верни назад") ||
      command.includes("модель назад") ||
      command.includes("назад модель") ||
      command.includes("джарвис верни прошлую модель") ||
      command.includes("джарвис верни прошлую") ||
      command.includes("джарвис верни старую модель") ||
      command.includes("джарвис верни старую") ||
      command.includes("джарвис верни прежнюю модель") ||
      command.includes("джарвис верни прежнюю") ||
      command.includes("джарвис вернуть модель") ||
      command.includes("джарвис верни модель") ||
      command.includes("джарвис верни назад") ||
      command.includes("жарвис верни прошлую модель") ||
      command.includes("ярвис верни прошлую модель") ||
      command.includes("жарвис верни прошлую") ||
      command.includes("ярвис верни прошлую") ||
      command.includes("жарвис верни") ||
      command.includes("ярвис верни")
    ) {
      console.log("🔙 Команда возврата к прошлой модели распознана:", command);
      if (!isSpeaking || !audioPlayingRef.current) {
        changeToOldModel();
      }
      return;
    }

    // Команда "Джарвис верни меня обратно" - возв��ат к обычной теме
    if (
      command.includes("джарвис верни меня обратно") ||
      command.includes("в��рни меня обратно джарвис") ||
      command.includes("верни обычную тему") ||
      command.includes("отключи лабораторию") ||
      command.includes("джарвис выключи лабораторию") ||
      command.includes("обычный режим") ||
      command.includes("стандартная тема") ||
      command.includes("верни меня обратно") ||
      command.includes("жарвис верни меня обра��но") ||
      command.includes("ярвис верни меня обратно")
    ) {
      console.log("🔄 Команда возврата к обычной теме распознана:", command);
      // ��лучшенная проверка - разрешае�� если нет активного аудио
      if (!isSpeaking || !audioPlayingRef.current) {
        deactivateStarkLab();
      }
      return;
    }

    // Команда приветствия "Джарвис я верн��лся"
    if (
      command.includes("джарвис я вернулся") ||
      command.includes("я вернулся джарвис") ||
      command.includes("джарвис я здесь") ||
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

    // Команда "Джарвис полный доступ"
    if (
      command.includes("джа��вис полный доступ") ||
      command.includes("полный доступ джарвис") ||
      command.includes("дж����рвис предоставь полный доступ") ||
      command.includes("предоставь полный доступ джа��вис") ||
      command.includes("полный доступ") ||
      command.includes("предоставь доступ") ||
      command.includes("жарвис полный доступ") ||
      command.includes("ярвис полный до��туп")
    ) {
      console.log("🔓 Команда 'полн��й доступ' распознана:", command);
      // Улучшенная проверка - разрешаем если нет активного аудио
      if (!isSpeaking || !audioPlayingRef.current) {
        speakFullAccess();
      }
      return;
    }

    // Команда "Джа��вис давай продолжим" - воспроизводит первое аудио
    if (
      command.includes("джарвис давай продолжим") ||
      command.includes("давай продолжим джарвис") ||
      command.includes("давай продолжим") ||
      command.includes("джарвис продолжим") ||
      command.includes("продолжим джарвис") ||
      command.includes("жарвис давай продолжим") ||
      command.includes("ярвис давай продолжим")
    ) {
      console.log("▶️ Команда 'давай продолжим' распознана:", command);
      // Улучшенная проверка - разрешаем если нет активного аудио
      if (!isSpeaking || !audioPlayingRef.current) {
        speakContinue();
      }
      return;
    }

    // Ко��а��да "Верно" - воспр��изводит второ�� аудио
    if (
      command.includes("верно") ||
      command.includes("п��авильно") ||
      command.includes("точно") ||
      command.includes("именно") ||
      command.includes("так и есть") ||
      command.includes("correct") ||
      command.includes("right")
    ) {
      console.log("✅ Команда 'верно' распознана:", command);
      // Улучшенная проверка - разрешаем если нет активного аудио
      if (!isSpeaking || !audioPlayingRef.current) {
        speakCorrect();
      }
      return;
    }

    // Команды для оригинального голоса Джарвиса (из фильмов)
    if (
      command.includes("оригинальный джарвис") ||
      command.includes("настоящий джарвис") ||
      command.includes("джарвис как в фильме") ||
      command.includes("железный человек") ||
      command.includes("tony stark") ||
      command.includes("тони старк") ||
      command.includes("authentic jarvis") ||
      command.includes("real jarvis") ||
      command.includes("movie jarvis") ||
      command.includes("джарвис из железног�� человека") ||
      command.includes("голос джарвиса") ||
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
      command.includes("доброе утро джарвис") ||
      command.includes("джарвис доброе утро") ||
      command.includes("утро джарвис") ||
      (command.includes("доброе утро") && command.length < 20) ||
      command.includes("good morning jarvis") ||
      (command.includes("good morning") && command.length < 20) ||
      command.includes("доброго утра") ||
      command.includes("доброе утро жарвис") ||
      command.includes("доброе утро ярвис")
    ) {
      // Дополнительная проверка, чтобы избежать повторных срабатыв��ний
      // Улучшенная проверка - разре��аем если нет активного аудио
      if (!isSpeaking || !audioPlayingRef.current) {
        speakGoodMorning();
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
        "🎯 Команда приветствия распознана, времени прошло:",
        timeSinceLastGreeting,
      );

      // Улучшенная проверка + защи��а от повторов (10 секунд)
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
      command.includes("джарвис покрути модель") ||
      command.includes("покрути модель джарвис") ||
      command.includes("джарвис крути модель") ||
      command.includes("крути модель джарвис") ||
      command.includes("джарвис п��верни модель") ||
      command.includes("поверни модель джарвис") ||
      command.includes("модель крути") ||
      command.includes("покрути модель") ||
      command.includes("крути модель") ||
      command.includes("��ращай модель") ||
      command.includes("джарвис вращай модел��") ||
      command.includes("жарвис покрути модель") ||
      command.includes("ярвис покрути модель")
    ) {
      console.log("🔄 Команда вращения модели распознана:", command);
      // Улучшенная проверка - разрешаем если нет активного аудио
      if (!isSpeaking || !audioPlayingRef.current) {
        speakRotateModel();
      }
      return;
    }

    // Команда "��ватит" - остановка вращения модели
    if (
      command.includes("хватит") ||
      command.includes("стоп") ||
      command.includes("оста��овись") ||
      command.includes("перестань") ||
      command.includes("достаточно") ||
      command.includes("джарвис хватит") ||
      command.includes("��жарвис стоп") ||
      command.includes("джар��ис остановись") ||
      command.includes("джарвис перестань") ||
      command.includes("джарвис достаточно") ||
      command.includes("стой") ||
      command.includes("остановить мо��ель") ||
      command.includes("остановит�� вращение")
    ) {
      console.log("⏹�� Команда ос��ановки модели распознана:", command);
      // Улучшенная проверка - разрешаем если нет активного аудио
      if (!isSpeaking || !audioPlayingRef.current) {
        speakStopModel();
      }
      return;
    }

    // Команда "Джарвис ��ак дела" с ответом "Все системы функционируют нормально"
    if (
      command.includes("джарвис как дела") ||
      command.includes("как дела джарвис") ||
      command.includes("жарвис как дела") || // частые ошибки распознавания
      command.includes("как дела жарвис") ||
      command.includes("ярвис как дела") ||
      command.includes("джаров как дела") ||
      (command.includes("джарвис") && command.includes("как дела")) ||
      (command.includes("жарвис") && command.includes("как дела")) ||
      (command.includes("как дела") && command.length < 20) // есл�� слышно только "как дела"
    ) {
      // Дополнительная проверка, чтобы избежать повторных срабатываний
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        speakSystemsOperational();
      }
      return;
    }

    // Команда "Как дела" (общая, без имени �����а��вис)
    if (
      command.includes("��ак дела") ||
      command.includes("как поживаешь джарвис") ||
      command.includes("джарвис как поживаешь") ||
      command.includes("как ты джарвис") ||
      command.includes("how are you jarvis") ||
      command.includes("jarvis how are you") ||
      command.includes("how are you") ||
      command.includes("как твои дела") ||
      command.includes("что нового джарвис")
    ) {
      // Дополнительная проверка, чт��бы избежать повторных срабатываний
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
      command.includes("��лагодарю") ||
      command.includes("благодарно�����ть") ||
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

    // Команда "люблю тебя"
    if (
      command.includes("люблю тебя") ||
      command.includes("я тебя люблю") ||
      command.includes("джарвис люблю тебя") ||
      command.includes("джарвис я тебя люблю") ||
      command.includes("люблю") ||
      command.includes("love you") ||
      command.includes("i love you") ||
      command.includes("жарвис люблю тебя") ||
      command.includes("ярвис люблю тебя")
    ) {
      console.log("💕 Команда 'люблю тебя' распознана:", command);
      // Улучшенная проверка - разрешаем если нет активного аудио
      if (!isSpeaking || !audioPlayingRef.current) {
        speakLoveYou();
      }
      return;
    }

    // Команда диагностики системы
    if (
      command.includes("диа��ностик") ||
      command.includes("прове��и") ||
      command.includes("запус��и") ||
      command.includes("проверь сист��му") ||
      command.includes("тес��") ||
      command.includes("вк��ючи полную диагностику") ||
      command.includes("полную диагностик�� систем") ||
      command.includes("диагностику систем") ||
      command.includes("включи диагностику") ||
      command.includes("полная диагностика") ||
      command.includes("системная диагностика")
    ) {
      console.log("🎯 ��аспознана ко����ан��а ��иагностики:", command);

      // ��оп�����лнит��льн��я проверка, чт����бы избежать пов��орных сра���атываний
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        console.log("✅ Ус��ов���� выполнены, ����п���ск��ем диагностику");
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
      command.includes("ты ��десь джарви��") ||
      command.includes("джарвис на месте") ||
      command.includes("джарвис присутствуешь") ||
      command.includes("jarvis are you there") ||
      command.includes("are you there jarvis") ||
      command.includes("жарвис ты тут") ||
      command.includes("ярвис ты тут") ||
      command.includes("ты тут жарвис") ||
      command.includes("ты тут ярвис")
    ) {
      speakIAmHere();
      return;
    }

    // П��ов����я��м, с����ержит л����� команда значим��е слова
    const meaningfulWords = [
      "перейти",
      "войти",
      "регистрация",
      "про��иль",
      "заказ",
      "��орз���на",
      "доба���ить",
      "план",
      "джа��вис",
      "жарвис", // частые ошибки распознавания
      "ярвис",
      "джаров",
      "базовый",
      "про",
      "макс",
      "п��окрутить",
      "скролл",
      "наверх",
      "пл��нам",
      "преимущества",
      "воз��ожнос��и",
      "от����рыть",
      "��ичный",
      "кабинет",
      "отпра��ить",
      "��екция",
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
      "��онта��ты",
      "п����ддержк��",
      "технологи����",
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
      "����ткл����чись",
      "в��кл��чись",
      "от��лючи",
      "вы��лючи",
      "с����п",
      "верну��ся",
      "здесь",
      "снова",
      "спасибо",
      "б��агодарю",
      "благодарность",
      "��пс",
      "thank",
      "thanks",
      "мерс��",
      "��ахмат",
      "рах��е��",
      "��о��ошо",
      "отлично",
      "замечате����ьно",
      "круто",
      "пре��расно",
      "чудесно",
      "добр����е",
      "утро",
      "у��ра",
      "morning",
      "good",
      "тут",
      "��рисутствуешь",
      "присутствие",
      "месте",
      "there",
      "системы",
      "ра������тают",
      "дела",
      "пож���ваешь",
      "порядк���",
      "ди��гностика",
      "проведи",
      "��иагнос��ируй",
      "проверь",
    ];
    const hasValidWords = meaningfulWords.some((word) =>
      trimmedCommand.includes(word),
    );

    if (!hasValidWords) {
      return;
    }

    // Умный поиск ��онтента по всему сайту
    const searchAndNavigate = (
      searchTerms: string[],
      fallbackAction?: () => void,
    ) => {
      // П���иск по заг��ловка��
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

      // Поиск по data-section а��рибутам
      const sections = Array.from(document.querySelectorAll("[data-section]"));
      for (const section of sections) {
        const sectionName =
          section.getAttribute("data-section")?.toLowerCase() || "";
        if (searchTerms.some((term) => sectionName.includes(term))) {
          section.scrollIntoView({ behavior: "smooth" });
          return true;
        }
      }

      // �����оиск по id элем��нтов
      for (const term of searchTerms) {
        const elementById = document.getElementById(term);
        if (elementById) {
          elementById.scrollIntoView({ behavior: "smooth" });
          return true;
        }
      }

      // По����к по тексту элементов
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

      // Если ничего не найдено, вы��о��няем ����апасное действие
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
      command.includes("��де") ||
      command.includes("перейди к") ||
      command.includes("спуст��с���� к")
    ) {
      let found = false;

      // Поис�������� преимущ������тв
      if (
        command.includes("преим��щест��а") ||
        command.includes("пре��мущест��о")
      ) {
        found = searchAndNavigate([
          "��реимущес��ва",
          "пре����ущество",
          "advantages",
        ]);
        if (found) {
          speak("����оказываю ���реимущества");
          return;
        }
      }

      // Пои��к возможностей
      if (
        command.includes("воз��ожности") ||
        command.includes("возможность") ||
        command.includes("м��щные")
      ) {
        found = searchAndNavigate(["возможно��ти", "мощные", "features"]);
        if (found) {
          speak("Показываю возможности");
          return;
        }
      }

      // Поиск планов и тарифов
      if (
        command.includes("план") ||
        command.includes("тариф") ||
        command.includes("цен") ||
        command.includes("стоим��сть")
      ) {
        found = searchAndNavigate(["п��ан", "тариф", "цен", "pricing"], () => {
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

      // Поис�� информации о компании
      if (
        command.includes("компан") ||
        command.includes("о нас") ||
        command.includes("кто мы")
      ) {
        found = searchAndNavigate(["компан", "�� нас", "about", "кто мы"]);
        if (found) {
          speak("Показ��ваю инф��р��ацию о ко��пани��");
          return;
        }
      }

      // П����иск контактов
      if (
        command.includes("кон��акт") ||
        command.includes("св��зь") ||
        command.includes("телеф��н") ||
        command.includes("email")
      ) {
        found = searchAndNavigate([
          "к��нтакт",
          "связь",
          "телефон",
          "email",
          "contact",
        ]);
        if (found) {
          speak("��ок�������������ваю ���о��такты");
          return;
        }
      }

      // ��оиск тех��оло��и����
      if (
        command.includes("те��нолог") ||
        command.includes("webgl") ||
        command.includes("ии") ||
        command.includes("ис��усстве����ый")
      ) {
        found = searchAndNavigate([
          "технолог",
          "webgl",
          "��и",
          "искусственн��й",
          "ai",
          "джарвис",
          "jarvis",
        ]);
        if (found) {
          speak("Показываю технолог��и");
          return;
        }
      }

      // ����о��ск качества и премиум у��луг
      if (
        command.includes("кач��ств��") ||
        command.includes("премиум") ||
        command.includes("��оддержка")
      ) {
        found = searchAndNavigate([
          "����чест��о",
          "��ремиу��",
          "поддержка",
          "quality",
          "support",
        ]);
        if (found) {
          speak("По��азываю информацию о ка��еств��");
          return;
        }
      }

      // ����иск ан��ли��ики
      if (
        command.includes("аналитик") ||
        command.includes("статистик") ||
        command.includes("да��н��е")
      ) {
        found = searchAndNavigate([
          "анал��тик",
          "ст��ти���тик",
          "дан���ые",
          "analytics",
        ]);
        if (found) {
          speak("��оказываю аналитику");
          return;
        }
      }

      // Если ни��его спе��ифичног����� ��е найдено, поп��о��уе�� общий ��оиск
      if (!found) {
        const searchTerms = command
          .split(" ")
          .filter((word) => word.length > 2);
        found = searchAndNavigate(searchTerms);
        if (found) {
          speak("На��дено");
          return;
        }
      }
    }

    // Команды навигации по стран����ам
    if (
      command.includes("перейти на гла����у��") ||
      command.includes("на ��лавную страниц��") ||
      command.includes("домо��")
    ) {
      navigate("/");
      speak("Переходим на главную страницу");
      return;
    }

    if (
      command.includes("войти") ||
      command.includes("лог����н") ||
      command.includes("авторизац��я")
    ) {
      navigate("/login");
      speak("Открываю страницу входа");
      return;
    }

    if (
      command.includes("рег��стр����ия") ||
      command.includes("зар��гистрироваться")
    ) {
      navigate("/signup");
      speak("Переходим к регистрации");
      return;
    }

    if (
      command.includes("���рофиль") ||
      command.includes("мой профил��") ||
      command.includes("личн����й к��бинет") ||
      command.includes("открыть про���и��ь")
    ) {
      navigate("/profile");
      speak("Открываю личный кабинет");
      return;
    }

    if (command.includes("заказ") || command.includes("оформ��ть заказ")) {
      navigate("/order");
      speak("Переходи�� �� ����ф��рмлен��ю зака��а");
      return;
    }

    // Команды корзины
    if (command.includes("корзина") && command.includes("о���истить")) {
      clearCart();
      speak("Ко��зин�� очищена");
      return;
    }

    if (
      command.includes("от���р��т�� корзину") ||
      command.includes("показать корзину") ||
      command.includes("что в корз��не")
    ) {
      // Нахо��им и нажимаем ��но��ку ко��з����ны
      const cartButton = document.querySelector(
        '[data-testid="cart-button"]',
      ) as HTMLElement;
      if (cartButton) {
        cartButton.click();
      }
      speak("Отк��ываю ��орзину");
      return;
    }

    // Ко��анды доб�����вления планов в корз��н��
    if (
      command.includes("добавить базовый") ||
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
      command.includes("про план") ||
      command.includes("про в корзину") ||
      command.includes("отправит���� про")
    ) {
      onAddProPlan();
      speak("Про план добавлен");
      return;
    }

    if (
      command.includes("добави��ь мак���") ||
      command.includes("макс план") ||
      command.includes("максимальный план") ||
      command.includes("д����а��������ис п��а�����") ||
      command.includes("��акс в ��орзину") ||
      command.includes("о��править макс")
    ) {
      onAddMaxPlan();
      speak("Максимальн���й пл������ добавле����");
      return;
    }

    // Ра��шире��ная нави��ация ��о секциям ст��ан��ц���
    if (
      command.includes("к планам") ||
      command.includes("пок��зать пл��ны") ||
      command.includes("пере��ти к плана��") ||
      command.includes("сп������ститься �� планам") ||
      command.includes("тарифы") ||
      command.includes("цены") ||
      command.includes("стоимост��")
    ) {
      const found = searchAndNavigate(
        ["пл��н", "тариф", "ц����", "pricing", "сто��мость"],
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
      command.includes("к пр�������мущес������м") ||
      command.includes("наши п��е��мущества") ||
      command.includes("сп���стит��ся к преимущества��") ||
      command.includes("перейти к ��реимущес���ва���") ||
      command.includes("��реим���щества")
    ) {
      const found = searchAndNavigate([
        "преи��ущества",
        "пр��имуществ��",
        "advantages",
      ]);
      if (found) {
        speak("Показыв��ю преим��щества");
      }
      return;
    }

    if (
      command.includes("�� возможностям") ||
      command.includes("��ощные ����озможности") ||
      command.includes("спу���ти���ься к возможн��ст��м") ||
      command.includes("пере�������и к возмо��ностям") ||
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
        speak("Пока��ыв��ю ��озможности");
      }
      return;
    }

    // ��ро������утка страницы
    if (
      command.includes("прок����тить вниз") ||
      command.includes("скролл вниз") ||
      command.includes("спус����ит��ся вниз")
    ) {
      window.scrollBy(0, 500);
      speak("Прок��учиваю вн������з");
      return;
    }

    if (
      command.includes("прокрутить ввер��") ||
      command.includes("скр��лл вверх") ||
      command.includes("подн���тьс��� ����верх")
    ) {
      window.scrollBy(0, -500);
      speak("Прокручиваю ������ерх");
      return;
    }

    if (
      command.includes("��аверх страни����") ||
      command.includes("в на��ало") ||
      command.includes("в самый верх")
    ) {
      window.scrollTo(0, 0);
      speak("Перехожу в нача��о");
      return;
    }

    if (
      command.includes("в коне����� стр��ницы") ||
      command.includes("в сам���й н��з") ||
      command.includes("вниз ��траницы")
    ) {
      window.scrollTo(0, document.body.scrollHeight);
      speak("��ерехожу в конец");
      return;
    }

    // ВАЖНО: Обработк�� нераспознанных команд
    // Если дошли до этого места - команда не была распознана
    console.log("❌ Команда не распознана:", command);
    console.log("🔄 Сбрасываем состояние для следующей команды");

    // Принудительно сбрасываем все блокировки для нераспознанных команд
    setTimeout(() => {
      commandCooldownRef.current = false;
      audioPlayingRef.current = false;
      lastCommandRef.current = "";
      setIsSpeaking(false);
      setTranscript("");
      console.log("✅ Состояния сброшены, система готова к новым командам");
    }, 500); // Небольшая задержка чтобы избеж��ть конфликтов
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      lastCommandRef.current = "";
      commandCooldownRef.current = false;
      onListeningChange?.(false, "");
    } else {
      if (recognitionRef.current) {
        setTranscript("");
        lastCommandRef.current = "";
        commandCooldownRef.current = false;

        // Принудительно очищаем все состояния перед запуско��
        setTimeout(() => {
          setTranscript("");
          lastCommandRef.current = "";
        }, 100);

        try {
          recognitionRef.current.start();
          setIsListening(true);
          onListeningChange?.(true, "");
        } catch (error) {
          console.log("Распознавание уже запущено или недоступно");
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
