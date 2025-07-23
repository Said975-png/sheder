import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

interface VoiceControlProps {
  onAddBasicPlan: () => void;
  onAddProPlan: () => void;
  onAddMaxPlan: () => void;
  inNavbar?: boolean;
  onListeningChange?: (isListening: boolean, transcript?: string) => void;
  forceStop?: boolean;
}

export default function VoiceControl({
  onAddBasicPlan,
  onAddProPlan,
  onAddMaxPlan,
  inNavbar = false,
  onListeningChange,
  forceStop = false,
}: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [noSpeechCount, setNoSpeechCount] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const commandDelayRef = useRef<NodeJS.Timeout | null>(null);
  const lastGreetingTimeRef = useRef<number>(0);
  const lastCommandRef = useRef<string>("");
  const commandCooldownRef = useRef<boolean>(false);
  const audioPlayingRef = useRef<boolean>(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const { getTotalItems, clearCart } = useCart();

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

        // Улучшенные настройк�� для лучшего распознавания
        recognitionRef.current.maxAlternatives = 5;

        // Дополнительные настройки для Chrome/WebKit - улучшаем чувстви��ельн��с��ь
        if (
          recognitionRef.current.webkitSpeechRecognition ||
          "webkitSpeechRecognition" in window
        ) {
          // @ts-ignore - WebKit specific properties
          recognitionRef.current.webkitContinuous = true;
          // @ts-ignore
          recognitionRef.current.webkitInterimResults = true;
          // @ts-ignore - Увеличиваем таймаут для лучшего захвата дли��ных фраз
          recognitionRef.current.webkitGrammars = null;
          // @ts-ignore
          recognitionRef.current.webkitMaxAlternatives = 5;
        }

        // Дополнительные нас��ройки для луч��его ра��познава��ия длинных фраз
        try {
          // @ts-ignore - Эти настройки помогают лучше распознава��ь речь
          if (recognitionRef.current.webkitSpeechRecognition) {
            recognitionRef.current.webkitSpeechRecognition.continuous = true;
            recognitionRef.current.webkitSpeechRecognition.interimResults =
              true;
          }
        } catch (e) {
          // Игнорируем ������и��ки настроек
        }
        // @ts-ignore - эти с��ойства могут не быть в типах, но р��ботают �� браузерах
        if ("webkitSpeechRecognition" in window) {
          recognitionRef.current.serviceURI =
            "wss://www.google.com/speech-api/full-duplex/v1/up";
        }

        recognitionRef.current.onstart = () => {
          console.log("🎤 Ра��познава��и�� речи запущено");
        };

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = "";
          let interimTranscript = "";
          let combinedTranscript = "";

          // Обрабатываем только ПОСЛЕДНИЙ резуль��ат, чтобы н�� накапливать старые
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

          // Фильтруем повторяющиеся фразы и слишком длинные ��езультаты
          if (combinedTranscript.length > 50) {
            console.log(
              "🚫 Отклоняем слишком длинный результат:",
              combinedTranscript.length,
              "символов",
            );
            combinedTranscript = "";
          }

          // Проверяем на п��вторяющиеся слова (признак на��опления)
          const words = combinedTranscript.split(" ");
          const uniqueWords = [...new Set(words)];
          if (words.length > uniqueWords.length * 2) {
            console.log("🚫 Откл��няем результат с повторяющимися словами");
            combinedTranscript = "";
          }

          // Показывае�� про���ежуточны�� результат только если с������ема свободна и это новый короткий контент
          if (
            combinedTranscript &&
            combinedTranscript.length > 2 &&
            combinedTranscript.length < 100 && // Фильтр для предотвраще��ия ��акопленных транскриптов
            !commandCooldownRef.current &&
            !isSpeaking &&
            !audioPlayingRef.current &&
            combinedTranscript !== lastCommandRef.current
          ) {
            setTranscript(combinedTranscript);
            onListeningChange?.(true, combinedTranscript);
            console.log("🎯 Распознано:", `"${combinedTranscript}"`);
          }

          // Об��абатываем финальные рез��льтаты или достаточно длинные промежуто��ные
          // Команда отключения имеет абсолютный приоритет и выполняется всегда
          const isShutdownCommand = (finalTranscript || combinedTranscript)
            .toLowerCase()
            .includes("отключись") ||
            (finalTranscript || combinedTranscript)
            .toLowerCase()
            .includes("выключись");

          // Прину��ительно сбрасываем застрявшие блокировки если система молчит дольше 5 секунд
          const now = Date.now();
          const timeSinceLastCommand = now - (lastCommandRef.current ? Date.now() : 0);
          if (commandCooldownRef.current && !isSpeaking && !audioPlayingRef.current) {
            console.log("🔄 Принудительно сбрасываем застрявшие блокировки");
            commandCooldownRef.current = false;
            lastCommandRef.current = "";
          }

          if (
            (finalTranscript || combinedTranscript.length > 5) &&
            (isShutdownCommand || (!commandCooldownRef.current && !isSpeaking))
          ) {
            const command = (finalTranscript || combinedTranscript)
              .toLowerCase()
              .trim();
            console.log("🔍 Анализируем ��ом��нду:", `"${command}"`);

            // Проверяем, что ��о��анда отличае����ся ��т предыдущей и достаточно дли��ная
            if (
              command &&
              command !== lastCommandRef.current &&
              command.length > 2
            ) {
              console.log(
                "�� К��манда принята дл�� обраб��т��и:",
                `"${command}"`,
              );
              setTranscript(command);
              onListeningChange?.(true, command);

              // Очи��аем п��едыдущи�� таймер
              if (commandDelayRef.current) {
                clearTimeout(commandDelayRef.current);
              }

              // Добавляем небольшую зад��ржку для завершения фразы
              commandDelayRef.current = setTimeout(
                () => {
                  lastCommandRef.current = command;
                  setNoSpeechCount(0); // Сбрасываем счетчик при успешном ра��познавании

                  processVoiceCommand(command);

                  // Быстрая очистка транскрипта после запуска команды
                  setTimeout(() => {
                    console.log("���� Б��с��р����я очистка транскрипта");
                    setTranscript("");
                    // НЕ вызываем onListeningChange, ��тобы не открывать панель после отключения
                  }, 800);

                  // Полная очистка состояния ��ома��ды и ��ерезапуск Recognition
                  setTimeout(() => {
                    console.log("🧹 Полная очистка сос��оя��ия после команды");
                    setTranscript("");
                    // НЕ вызываем onListeningChange, чтобы не открывать панель после отключения
                    lastCommandRef.current = "";

                    // Н�� перезапускаем Recognition - пусть работает непрерывно
                    console.log(
                      "✅ Сос��ояние очищено, Recognition продолжает работать",
                    );
                  }, 2000);
                },
                finalTranscript ? 100 : 1000,
              ); // Мень��е за��ержки для фи��альных результатов
            } else {
              console.log("❌ Команда отклонена:", {
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

          // ВСЕГДА перезапус��аем ра��познавание, если пользователь не отключил микрофон вручную
          if (isListening) {
            console.log("🔄 Перезапускаем распознавание...");

            // Очищаем состояние перед перезапуском
            setTranscript("");
            lastCommandRef.current = "";

            setTimeout(() => {
              if (recognitionRef.current && isListening) {
                try {
                  recognitionRef.current.start();
                  console.log("✅ Распознавание перезапущено");
                } catch (error) {
                  console.log(
                    "ℹ️ Распознавание уже запущено или недоступно:",
                    error,
                  );
                  // Есл�� не удалось перез���пу��тить, попробуем еще раз через 500мс
                  setTimeout(() => {
                    if (recognitionRef.current && isListening) {
                      try {
                        recognitionRef.current.start();
                      } catch (e) {
                        console.log("Повторная попытка запу��ка не удалась");
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

          // Критические о��ибки - полностью останавливаем
          if (event.error === "network" || event.error === "not-allowed") {
            console.error("🚨 Критическая ошибка распознавания:", event.error);
            setIsListening(false);
            onListeningChange?.(false, "");
          }
          // Некри��ические ошибки - игнорируе�� и продолж������ем
          else if (
            event.error === "no-speech" ||
            event.error === "audio-capture" ||
            event.error === "aborted"
          ) {
            if (event.error === "no-speech") {
              setNoSpeechCount((prev) => prev + 1);
              console.log(
                `ℹ️ No-speech о��ибка #${noSpeechCount + 1} - п��одолжаем слу��ать`,
              );

              // Если сл��шком много no-speech о��ибок подряд, делаем небольшую паузу
              if (noSpeechCount >= 3) {
                console.log("⏸️ Много no-speech ошибок, делаем паузу 2 сек...");
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
                "ℹ️ Некритическая ошибка распознавания:",
                event.error,
                "- ��ро��ол��аем слушать",
              );
            }
            // Система автоматически переза��ус��ится через onend
          }
          // Другие оши��ки - ����резапускаем через корот��ое время
          else {
            console.warn(
              "⚠�� Неожиданн��я ошибка распозна����ния:",
              event.error,
              "- перезапу��каем",
            );
            setTimeout(() => {
              if (isListening && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (error) {
                  console.log("Перезапуск после ошибки");
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
      // Останавливаем любое воспроизводящееся ��удио при размонтировани��
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }
      // Очищаем т�������ймер ко��анд
      if (commandDelayRef.current) {
        clearTimeout(commandDelayRef.current);
      }
    };
  }, []);

  // Функция для полного сброса Speech Recognition
  const resetSpeechRecognition = () => {
    if (recognitionRef.current) {
      console.log("�� Полный сброс Speech Recognition");
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("Ошибка остановки при сбросе:", error);
      }

      setTimeout(() => {
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start();
            console.log("✅ Speech Recognition перезапущен и очищен");
          } catch (error) {
            console.log("Ошибка запуска при сбросе:", error);
          }
        }
      }, 200);
    }
  };

  // Effect ��ля обработки тестов��х команд
  useEffect(() => {
    const handleTestCommand = (event: any) => {
      console.log("🧪 Получена тестовая ��ом����да:", event.detail.command);
      processVoiceCommand(event.detail.command);
    };

    window.addEventListener("voiceCommand", handleTestCommand);
    return () => window.removeEventListener("voiceCommand", handleTestCommand);
  }, []);

  // Effect для принудите��ьной остановки
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

  // Effect для автоматической очистки застрявших блокировок
  useEffect(() => {
    const interval = setInterval(() => {
      // Если система заблокирована, но не говорит и не воспроизводит аудио
      if (commandCooldownRef.current && !isSpeaking && !audioPlayingRef.current && isListening) {
        console.log("🧹 Автоматическая очистка застрявших блокировок");
        commandCooldownRef.current = false;
        audioPlayingRef.current = false;
        lastCommandRef.current = "";
        setTranscript("");
      }

      // Дополнительная защита: если система молчит более 5 секунд, принудительно с��расываем
      if (isSpeaking && !audioPlayingRef.current && !currentAudioRef.current) {
        console.log("🔄 Принудительный сброс 'говорящего' состояния без аудио");
        setIsSpeaking(false);
        commandCooldownRef.current = false;
      }
    }, 2000); // Проверяем каждые 2 секунды (чаще для лучшей отзывчивости)

    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  // Глобальная функция для принудительного сброса ВСЕХ блокировок
  const forceResetAllStates = () => {
    console.log("🔥 ПРИНУДИТЕЛЬНЫЙ СБРОС ВСЕХ СОСТОЯНИЙ");

    // Останав��иваем любое текущее аудио
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }

    // Сбрасываем все блокировки
    commandCooldownRef.current = false;
    audioPlayingRef.current = false;
    lastCommandRef.current = "";
    setIsSpeaking(false);
    setTranscript("");

    console.log("✅ ВСЕ СОСТОЯНИЯ СБРОШЕНЫ");
  };

  // Фу��кция для пол��ого ��броса состояния по���ле ��оманды
  const resetCommandState = (delay: number = 1000, skipPanelReopen: boolean = false) => {
    console.log(`⏰ П��анируем сброс cooldown через ${delay}мс`);
    setTimeout(() => {
      // Полный сброс всех состояний блокировки
      commandCooldownRef.current = false;
      audioPlayingRef.current = false;
      lastCommandRef.current = "";
      setTranscript("");
      setIsSpeaking(false); // Принудительно сбрасываем состояние говорения
      currentAudioRef.current = null; // Очищаем ссылку на аудио

      console.log("🔄 Полный сброс ��сех состояний блокировки выполнен");

      // Только сообщаем о состоянии, если микрофон все еще активен И это не команда отключения
      if (isListening && !skipPanelReopen) {
        onListeningChange?.(true, "");
        console.log("✅ Cooldown сброшен, микрофон активен");
      } else {
        console.log(
          "✅ Cooldown сброшен, микрофон отключен ил�� команда отключен��я - не открываем панель",
        );
      }
    }, delay);
  };

  const speak = (text: string) => {
    // Предотвр��щаем повторное воспроизведение только если уже играет аудио
    if (isSpeaking) {
      console.log("🚫 speak заблокиро��ан - уже играет аудио");
      return;
    }

    // Если есть cooldown, но не играет аудио, то ��рин��дительн�� сбрасываем cooldown
    if (commandCooldownRef.current) {
      console.log("⚠️ Принудительно сбрасываем cooldown для новой коман��ы");
      commandCooldownRef.current = false;
    }

    console.log("🔊 Начинае�� воспроизведение:", text);

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Очищаем транскрипт когда начинаем говорить
    setTranscript("");
    // НЕ вызываем onListeningChange во время воспроизведения аудио
    // Это предотвращает повторно�� открытие панели после команды отключения

    // ��озда��м и вос���рои����водим ваш новый ау��ио-файл
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
      console.error("Ошибка воспроизведения ауди��");
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
    console.log("🔴 Выполняем команду отключения микр��фона");

    // ПРИНУДИТЕЛЬНО сбрасываем ВСЕ состоян��я блокировки для команды отключения
    commandCooldownRef.current = false;
    audioPlayingRef.current = false;
    lastCommandRef.current = "";
    console.log("🔴 Принудительно сбро��или все блокировки");

    // СНАЧАЛА отключаем состояние listening, чтобы предотвр��тить автом��тический перезапуск
    setIsListening(false);
    onListeningChange?.(false, "");
    console.log("🔴 Состояние listening отключено");

    // Останавливаем любое текущее воспроиз��едение
    if (currentAudioRef.current) {
      console.log("⏹️ Останавливаем т��кущее аудио");
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null; // Очищаем ссылку
    }

    // Останавливаем Recognition сразу
    if (recognitionRef.current) {
      console.log("🛑 Останавливаем Recognition");
      recognitionRef.current.stop();
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Добавляем небольш��ю задержку перед созданием нового аудио
    setTimeout(() => {
      console.log("🔊 Создаем аудио для отключения");

      // Создаем и воспроизводим ауд��о дл�� команды "отключи��ь"
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
        // НЕ открываем панель обратно после команды отключения
        console.log("✅ Команда отключения завершена - панель остается закрытой");
      };

      audio.onended = shutdownComplete;

      audio.onerror = () => {
        console.error("Ошибка вос���роиз��едения ����ди�� отключения");
        shutdownComplete();
      };

      console.log("▶️ Пытаемся воспроизвести ау��ио отключения");
      audio.play().catch((error) => {
        console.error("❌ Не удалось воспроизвести аудио ��тключения:", error);
        shutdownComplete();
      });
    }, 100); // Задержка 100мс для полной остановки пр��дыдущего аудио
  };

  const speakWelcomeBack = () => {
    if (isSpeaking) {
      console.log("🚫 speakWelcomeBack забл��кирован - уже играет аудио");
      return;
    }

    if (commandCooldownRef.current) {
      console.log("⚠️ Принудительно сбрасываем cooldown для speakWelcomeBack");
      commandCooldownRef.current = false;
    }

    console.log("👋 Начинаем воспроизведение приветствия");

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Создаем и воспроизводим ауд����о для команды "Джарвис я вернулс��"
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
      console.error("О��ибка воспроизведен���я ау��������о приветств��я");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error("Не уд��лось воспроизвести аудио приветствия:", error);
    });
  };

  const speakThankYou = () => {
    // Разрешаем выполнение если нет активного аудио
    if (isSpeaking && audioPlayingRef.current) return;

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Создаем и восп��оизводим аудио дл���� благодарности
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
      console.error("Ошибка во��п����оизведения ���удио бл��годар��о��ти");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error("Не удал��сь восп��оизвести аудио благо��арности:", error);
    });
  };

  const speakGoodMorning = () => {
    // Улучшенная защита - разрешаем если нет активного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakGoodMorning заблокирован - играет аудио");
      return;
    }

    // Останавливаем любое ��екущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Создаем и воспроизводим ауд����о для утреннего приветстви��
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
      }, 2000); // Увеличен тай��аут до 2 секунд
    };

    audio.onended = resetState;
    audio.onerror = () => {
      resetState();
      console.error("О��ибка во��произведения ауди�� утреннего при����етствия");
    };

    audio.play().catch((error) => {
      resetState();
      console.error(
        "Не удалось во��произвести аудио утреннего ��риветствия:",
        error,
      );
    });
  };

  const speakIAmHere = () => {
    // Разрешаем выполнение если нет активного аудио
    if (isSpeaking && audioPlayingRef.current) return;

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Создае�� и во��производим аудио для ответа "��ж��рв��с ты тут?"
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
      console.error("Ошибка воспроиз���ед��ния аудио о��вета");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error("Не удалось воспроизв��ст�� ауд��о ����тве��а:", error);
    });
  };

  const speakWithElevenLabs = async (text: string) => {
    // Улучшенная защита - разрешаем если нет активного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakWithElevenLabs заблокирован - играет аудио");
      return;
    }

    // Оста��авливаем любое текущее воспр��изв��дение
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
      // Используем ElevenLabs API ��ля синте��а речи с вашим ��астомным голосом
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
        console.error("Ошибка в��спроизведения аудио ��з ElevenLabs");
      };

      await audio.play();
    } catch (error) {
      resetState();
      console.error("Не удалось получить аудио из ElevenLabs:", error);

      // Fallback: простое текстовое сообщение
      console.log("Джарвис:", text);
    }
  };

  const speakAuthenticJarvis = () => {
    // Улучшенная защита - разрешаем если нет активного аудио
    if (isSpeaking && audioPlayingRef.current) {
      console.log("❌ speakAuthenticJarvis заблокирован - играет аудио");
      return;
    }
    console.log("🔊 Нач��наем воспроизведение Jarvis аудио");

    // О���танавливаем любое текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    // Запоминаем состояние прослушивания ДО остановки
    const wasListening = isListening;

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Немед��ен��о очищаем транскрипт к��гда н��чинаем говорить
    setTranscript("");
    // ��Е вызываем onListeningChange во время воспроизведения ау��ио

    // НЕ останавливаем расп��знавание во время воспроизведения аудио
    // Пусть микрофон продолжает работать
    console.log("🔊 Воспр��изво���им аудио, но остав��яем микрофон активным");

    // Используем ваш ��ригиналь��ы�� аудиофайл Джарвиса
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2Fddde4fe5b47946c2a3bbb80e3bca0073%2F54eb93b1452742b6a1cd87cc6104bb59?alt=media&token=fc948eba-bbcd-485c-b129-d5a0c25cfc74&apiKey=ddde4fe5b47946c2a3bbb80e3bca0073",
    );
    currentAudioRef.current = audio;

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;

      // Микрофон продолжал работать, н��чего восстанавливать не нужно
      console.log("✅ Аудио завершено, микрофон остается активным");

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
        "Не удалос�� воспроизвести оригинальное ауд��о Джарвиса:",
        error,
      );
    });
  };

  const speakSystemsOperational = async () => {
    await speakWithElevenLabs("Все системы функцио��ируют ��ор��ально");
  };

  const speakHowAreYou = () => {
    // ��ножественная ��ащита от повторног�� восп��ои��ве��ения
    if (isSpeaking || commandCooldownRef.current || audioPlayingRef.current) {
      return;
    }

    // Ос���анавливаем ��юбое те��ущее ��оспрои��ведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Используе�� Web Speech API для синтеза фразы "у меня все в п��рядке сэр"
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        "у меня все в ��орядке сэр",
      );

      // Настр��йки максимально приближенные к ElevenLabs Jarvis (wDsJlOXPqcvIUKdLXjDs)
      // Stability: 20 (низкая ст��бильно��ть для более естестве��ной речи)
      // Similarity Boost: 90 (высок��е сходс��во с оригинальным голосом)
      // Style: Assistant/Narration (помощник/повеств��вание)

      utterance.lang = "en-US"; // Английский для лучшего качества, потом переклю��им ���� русский
      utterance.rate = 0.75; // Мед��ен��ая, размеренная р��чь как �� Джарв��са из фильма
      utterance.pitch = 0.7; // Сред����-ни��кий тон для ��втор��те����ос��и
      utterance.volume = 0.95; // Четкая, но не резкая громкость

      // Поиск наиболе�� подходящего ��олоса для имит����ции Jarvis
      const voices = speechSynthesis.getVoices();

      // Приоритет: голоса, по��ожие на британск��й/американский мужской
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

      // ��сли н�� нашли подходящий а����л��йский, ищем русский мужской
      const russianMaleVoice = voices.find(
        (voice) =>
          voice.lang.includes("ru") &&
          (voice.name.toLowerCase().includes("male") ||
            voice.name.toLowerCase().includes("муж�����кой") ||
            voice.name.toLowerCase().includes("антон") ||
            voice.name.toLowerCase().includes("ник��лай")),
      );

      if (jarvisLikeVoice) {
        utterance.voice = jarvisLikeVoice;
        utterance.lang = "ru-RU";
        utterance.pitch = 0.6; // Чуть ниже для лучшего ��вучания русского
      } else if (russianMaleVoice) {
        utterance.voice = russianMaleVoice;
        utterance.lang = "ru-RU";
        utterance.pitch = 0.6; // Чуть ниже для русского голос��
      } else {
        // Fallback: любой доступный го��ос с оптимиз��рованными настройк��ми
        const anyVoice = voices.find(
          (voice) => voice.lang.includes("en") || voice.lang.includes("ru"),
        );
        if (anyVoice) {
          utterance.voice = anyVoice;
          utterance.lang = "ru-RU"; // Всегда русский язык
        }
        utterance.pitch = 0.55; // Еще ниже дл�� комп��нсации
        utterance.rate = 0.7; // Е����е медленнее ��ля бо��ьшей солидно��ти
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
        console.error("Не удало��ь синтезировать речь:", error);
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

      console.log("Джа��вис: у меня все в порядке сэр");
      setTimeout(resetState, 2000);
    }
  };

  // Тестовая функция для проверки аудио
  const testAudioUrls = () => {
    const url1 =
      "https://cdn.builder.io/o/assets%2Ff623eb4c005f4a40a75c4b9a0beb1b76%2Fe84cbc4e1b6d4e408263b15a7e68cd11?alt=media&token=db88c399-0c44-4b82-a1eb-251e7fb476b3&apiKey=f623eb4c005f4a40a75c4b9a0beb1b76";
    const url2 =
      "https://cdn.builder.io/o/assets%2Ff623eb4c005f4a40a75c4b9a0beb1b76%2Ff74fdea7f34b4c2fa5df3d62bd9efe29?alt=media&token=80cd6e08-efaa-4afd-b3aa-66aa3f68623c&apiKey=f623eb4c005f4a40a75c4b9a0beb1b76";

    console.log("🧪 Т��стируем URL аудиофайлов:");
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
    console.log("🔧 Запуск диагн����стики систем��...");
    testAudioUrls(); // Тестируем URL

    // Множественная защита от ��овторного воспроизведения
    if (isSpeaking || commandCooldownRef.current || audioPlayingRef.current) {
      console.log("❌ Диагно��тика з��блокирована - система занята");
      return;
    }

    // Останавл��ваем ��юбое текущее воспроиз��ед��ние
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Воспроизводим первое а��ди��
    console.log("��� Создаем пе��вое аудио для диагнос��ики");
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
      console.log("✅ Пер��ое аудио за��онч��лось, ждем 2 секун��ы...");
      // Ч��рез 2 се��унды воспроизводим второе аудио
      setTimeout(() => {
        console.log("🎵 ��оздаем второе аудио для диагности��и");
        const secondAudio = new Audio(
          "https://cdn.builder.io/o/assets%2Ff623eb4c005f4a40a75c4b9a0beb1b76%2Ff74fdea7f34b4c2fa5df3d62bd9efe29?alt=media&token=80cd6e08-efaa-4afd-b3aa-66aa3f68623c&apiKey=f623eb4c005f4a40a75c4b9a0beb1b76",
        );
        currentAudioRef.current = secondAudio;

        secondAudio.onended = () => {
          console.log("✅ Второе ауди�� закончилось, диагностика завершена");
          resetState();
        };
        secondAudio.onerror = () => {
          resetState();
          console.error(
            "❌ Оши��ка воспроизведения второго аудио ��иагностики",
          );
        };

        console.log("��️ Запускаем второе ау��ио");
        secondAudio.play().catch((error) => {
          resetState();
          console.error(
            "❌ Не ��далось воспроизвести второе аудио диагностики:",
            error,
          );
        });
      }, 2000);
    };

    firstAudio.onerror = () => {
      resetState();
      console.error("❌ Ошибка воспроизведения первого аудио диагностик��");
    };

    console.log("▶️ ��апускаем перво�� ауд����");
    firstAudio.play().catch((error) => {
      resetState();
      console.error(
        "❌ Не удалось воспроизвести первое аудио диагностики:",
        error,
      );
    });
  };

  const speakContinue = () => {
    // Множественная защита от повторног�� воспроизведения
    if (isSpeaking || commandCooldownRef.current || audioPlayingRef.current) {
      console.log("❌ speakContinue заблокирован - система занята");
      return;
    }

    // Останавливаем любое текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("▶️ Воспроизводим ��ервое аудио - Давай продолжим");
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Первое ауд���о для команды "давай продо��жим"
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
      console.error("❌ Ошибка воспроизведения первого аудио");
    };

    audio.play().catch((error) => {
      resetState();
      console.error("❌ Не удал��сь воспроизвести первое аудио:", error);
    });
  };

  const speakCorrect = () => {
    // Множестве��ная защита от повторного воспроизведения
    if (isSpeaking || commandCooldownRef.current || audioPlayingRef.current) {
      console.log("❌ speakCorrect заблокирован - система занята");
      return;
    }

    // Останавливаем любое т��кущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("▶️ Воспроизводим второе аудио - Верно");
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Второе аудио для команды "верно"
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
      console.error("❌ Ошибка воспроизведения втор��го аудио");
    };

    audio.play().catch((error) => {
      resetState();
      console.error("❌ Не удалось воспроизвести второе аудио:", error);
    });
  };

  const activateStarkLab = () => {
    // Множественная защита от повторного во��произведения
    if (isSpeaking || commandCooldownRef.current || audioPlayingRef.current) {
      console.log("❌ activateStarkLab заблокирован - система занята");
      return;
    }

    // Останавливаем любое текущее вос��роизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("🔬 Активация лаборатории Старка - начинаем последовательность");
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // ПЕРВОЕ аудио для команды "полная ак��ивация"
    const firstAudio = new Audio(
      "https://cdn.builder.io/o/assets%2F6b72a929cd24415c8486df051bbaa5a2%2Fbb0dc9d654554f1a9bb9dcc874d5434b?alt=media&token=47d6c26a-18e1-4ffb-9363-adc20856464f&apiKey=6b72a929cd24415c8486df051bbaa5a2",
    );
    currentAudioRef.current = firstAudio;

    firstAudio.onended = () => {
      console.log("✅ Первое аудио завершено, активируем лаборатор��ю");

      // Мгновенно меняем тему на лабораторию Старка
      document.documentElement.classList.add('stark-lab-theme');

      // Добавляем эффект сканирования
      const scanElement = document.createElement('div');
      scanElement.className = 'lab-activation-scan';
      document.body.appendChild(scanElement);

      // Доба��ляем активационный оверлей
      const overlayElement = document.createElement('div');
      overlayElement.className = 'lab-activation-overlay';
      document.body.appendChild(overlayElement);

      // Добавляем HUD сетку
      const hudGrid = document.createElement('div');
      hudGrid.className = 'stark-lab-hud-grid';
      document.body.appendChild(hudGrid);

      // Добавляем голографичес��ие частицы
      const particlesContainer = document.createElement('div');
      particlesContainer.className = 'stark-lab-particles';
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'stark-lab-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 3 + 's';
        particlesContainer.appendChild(particle);
      }
      document.body.appendChild(particlesContainer);

      // Воспроизводим ВТОРОЕ аудио после смены дизайна
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
          console.log("✅ Активация лаборатории завершена");
        };

        secondAudio.onerror = () => {
          setIsSpeaking(false);
          audioPlayingRef.current = false;
          currentAudioRef.current = null;
          setTimeout(() => {
            commandCooldownRef.current = false;
            lastCommandRef.current = "";
          }, 500);
          console.error("❌ Ошибка воспроизведения второго аудио активаци��");
        };

        secondAudio.play().catch((error) => {
          setIsSpeaking(false);
          audioPlayingRef.current = false;
          currentAudioRef.current = null;
          setTimeout(() => {
            commandCooldownRef.current = false;
            lastCommandRef.current = "";
          }, 500);
          console.error("❌ Не удалось воспроизвести второе аудио активации:", error);
        });
      }, 1000); // Задержка 1 секунда для завершения анимации
    };

    firstAudio.onerror = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error("❌ Ошибка воспроизведения первого аудио активации");
    };

    firstAudio.play().catch((error) => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.error("❌ Не удалось воспроизвести перво�� аудио активации:", error);
    });
  };

  const deactivateStarkLab = () => {
    // Множественная защита от повторного воспроизведения
    if (isSpeaking || commandCooldownRef.current || audioPlayingRef.current) {
      console.log("�� deactivateStarkLab заблокирован - система занята");
      return;
    }

    // Останавливаем любое текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    console.log("🔄 Возвращаем обычную тему");
    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // ТРЕТЬЕ аудио для команды "верни меня обратно"
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F6b72a929cd24415c8486df051bbaa5a2%2F6d0501b67e3846298ea971cf00a9add8?alt=media&token=79cbcd57-2bfb-4b1d-a4c9-594c1f0543ac&apiKey=6b72a929cd24415c8486df051bbaa5a2",
    );
    currentAudioRef.current = audio;

    // Сразу возвращаем обычную тему
    document.documentElement.classList.remove('stark-lab-theme');

    // Удаляем все лабораторные элементы
    const elementsToRemove = [
      '.lab-activation-scan',
      '.lab-activation-overlay',
      '.stark-lab-hud-grid',
      '.stark-lab-particles'
    ];

    elementsToRemove.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => element.remove());
    });

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 500);
      console.log("✅ Возврат к обычной теме завершен");
    };

    audio.onended = resetState;
    audio.onerror = () => {
      resetState();
      console.error("❌ Ошибка воспроизведения аудио возврата");
    };

    audio.play().catch((error) => {
      resetState();
      console.error("❌ Не удалось воспроизвести аудио возврата:", error);
    });
  };

  const processVoiceCommand = (command: string) => {
    console.log("🔧 ��бработка команды:", command);

    // ГАРАНТИРОВАННАЯ защита от застревания: всегда разрешаем обработку новых команд
    // Устанавливаем таймер на сброс блокировок для ЛЮБОЙ команды
    const forceUnlockTimer = setTimeout(() => {
      console.log("⏰ Принудительное разблокирование через 8 секунд");
      commandCooldownRef.current = false;
      audioPlayingRef.current = false;
      setIsSpeaking(false);
      lastCommandRef.current = "";
    }, 8000); // Максимум 8 секунд на любую команду

    // Принудительно сбрасываем все блокировки перед обработкой новой команды
    // КРОМЕ команды отключения, которая обрабатывается отдельно
    if (!command.includes("отключись") && !command.includes("выключись")) {
      if (commandCooldownRef.current || audioPlayingRef.current) {
        console.log("🔄 Принудит��льно сбрасываем блокировки перед обработкой команды");
        forceResetAllStates();
      }
    }

    // Очищаем таймер если команда успешно завершится
    const originalClearTimeout = () => {
      clearTimeout(forceUnlockTimer);
    };

    // Добавляем очистку таймера к концу функции
    setTimeout(originalClearTimeout, 100);

    // Простая очистка транскрипт�� в начале обработки
    setTranscript("");
    // НЕ вызываем onListeningChange во время обработки команды
    // Это ��редотвращает повторное открытие панели

    // НЕ сбрасываем Recognition автоматически - пусть рабо��ает непрерывно
    console.log("🎯 Обрабатываем команд�� без сброса Recognition");

    // Фильтруем пу��тые или ����ишком короткие команды
    const trimmedCommand = command.trim();
    if (trimmedCommand.length < 3) {
      return;
    }

    // Команда откл��чения (приоритетная)
    if (
      command.includes("отключись") ||
      command.includes("выкл��чись") ||
      command.includes("отключи микроф��н") ||
      command.includes("стоп джарви��") ||
      command.includes("выключи") ||
      command.includes("отключи") ||
      command.includes("отключить")
    ) {
      console.log("🔴 К��манда отключения распознана:", command);
      // Принудительно выполняем команду отключени�� независимо от сост��яния
      speakShutdown();
      return;
    }

    // Команда "Джарвис, полная активация" - активация лаборатории Старка
    if (
      command.includes("джарвис полная активация") ||
      command.includes("полная активация джарвис") ||
      command.includes("джарвис активация лаборатории") ||
      command.includes("активация лаборатории джарвис") ||
      command.includes("активировать лабораторию") ||
      command.includes("джарвис включи лабораторию") ||
      command.includes("полн��я ак��ивация")
    ) {
      console.log("🔬 Команда активации лаборатории распознана:", command);
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        activateStarkLab();
      }
      return;
    }

    // Команда "Джарвис верни меня обратн��" - возврат к обычной теме
    if (
      command.includes("джарвис верни меня обратно") ||
      command.includes("верни меня обратно джарвис") ||
      command.includes("верни обычную тему") ||
      command.includes("отключи лабораторию") ||
      command.includes("джарвис выключи лабораторию") ||
      command.includes("обычный режим") ||
      command.includes("стандартная тема") ||
      command.includes("верни меня обратно")
    ) {
      console.log("🔄 Команда возврата к обычной теме распо��нана:", command);
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        deactivateStarkLab();
      }
      return;
    }

    // Команда приветствия "Джарвис я верн��лся"
    if (
      command.includes("джарвис я верну��ся") ||
      command.includes("я ��ернулся джарвис") ||
      command.includes("джарвис я здесь") ||
      command.includes("я снова здесь") ||
      command.includes("вернулся") ||
      command.includes("я з��есь")
    ) {
      console.log("👋 Команда приветств��я распознана:", command);
      speakWelcomeBack();
      return;
    }

    // Команда "Джарвис давай продолжим" - воспроизводит первое аудио
    if (
      command.includes("джарвис давай продолжим") ||
      command.includes("да��ай продолжим джарвис") ||
      command.includes("давай продолжим") ||
      command.includes("джарвис продолжим") ||
      command.includes("продолжим джарвис")
    ) {
      console.log("▶�� Команда 'давай продолжим' расп��знана:", command);
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        speakContinue();
      }
      return;
    }

    // Команда "Верно" - воспроизводит второе аудио
    if (
      command.includes("верно") ||
      command.includes("правильно") ||
      command.includes("точно") ||
      command.includes("именно") ||
      command.includes("так и есть") ||
      command.includes("correct") ||
      command.includes("right")
    ) {
      console.log("✅ Команда 'верно' распознана:", command);
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        speakCorrect();
      }
      return;
    }

    // Команды ��ля о��игинально��о голоса Джарвиса (из фи��ьма)
    if (
      command.includes("оригинальный джарвис") ||
      command.includes("настоящий джарвис") ||
      command.includes("джарвис как в фильме") ||
      command.includes("железный чело����ек") ||
      command.includes("tony stark") ||
      command.includes("то��и старк") ||
      command.includes("authentic jarvis") ||
      command.includes("real jarvis") ||
      command.includes("movie jarvis") ||
      command.includes("джарв��с и�� железного ч��ловека") ||
      command.includes("голос джарвиса") ||
      command.includes("оригинал") ||
      command.includes("как в м��рвел")
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

    // Команда утреннего приветстви��� "Добро�� утр�� Джарвис"
    if (
      command.includes("доброе утро джарвис") ||
      command.includes("джарвис до��рое утро") ||
      command.includes("утро джар��ис") ||
      (command.includes("доброе утро") && command.length < 20) ||
      command.includes("good morning jarvis") ||
      (command.includes("good morning") && command.length < 20) ||
      command.includes("доброго утра")
    ) {
      // Дополнит������льная проверка, ч��обы избе����ть повторных срабатываний
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        speakGoodMorning();
      }
      return;
    }

    // Команд�� пр��ветствия "Приве�� Джарвис" - улучшенное распознавание с защитой от повторов
    if (
      command.includes("привет джарвис") ||
      command.includes("джарвис привет") ||
      command.includes("здравствуй джар���ис") ||
      command.includes("джарв��с здравствуй") ||
      command.includes("хай джарвис") ||
      command.includes("hello jarvis") ||
      command.includes("hi jarvis") ||
      command.includes("hey jarvis") ||
      command.includes("привет жарвис") || // част��е ошибки распознавания
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
        "🎯 Команда приветствия распознана, време��и прошло:",
        timeSinceLastGreeting,
      );

      // Дополнительная проверка + защита от повторов (минимум 10 секун�� м��жду приве��с��виями)
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current &&
        timeSinceLastGreeting > 10000
      ) {
        console.log("✅ Выполняем команду привет��твия");
        lastGreetingTimeRef.current = now;
        speakAuthenticJarvis();
      } else {
        console.log("❌ При��етствие заблокиров��но:", {
          isSpeaking,
          commandCooldown: commandCooldownRef.current,
          audioPlaying: audioPlayingRef.current,
          timeSinceLastGreeting,
        });
      }
      return;
    }

    // ��оманда "Джарвис как дела" с ответом "Все системы функ��ионируют нормал����о"
    if (
      command.includes("джарвис как дела") ||
      command.includes("��ак дела джарвис") ||
      command.includes("жарвис ка�� дела") || // частые ошибки рас��ознавания
      command.includes("как дела жарвис") ||
      command.includes("ярвис как дела") ||
      (command.includes("джарвис") && command.includes("как дела")) ||
      (command.includes("жарвис") && command.includes("как дела")) ||
      (command.includes("как дела") && command.length < 20) // ��сли с��ышно ��олько "как дела"
    ) {
      // �������олнительная провер���а, ��тобы избежать повторных срабат��ва���ий
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
      command.includes("как дела") ||
      command.includes("как поживаешь джарвис") ||
      command.includes("джарвис как поживаешь") ||
      command.includes("как ты дж��рви����") ||
      command.includes("how are you jarvis") ||
      command.includes("jarvis how are you") ||
      command.includes("how are you") ||
      command.includes("как тв��и дела") ||
      command.includes("что ново��о джарви��")
    ) {
      // Допо��нительная про���ерка, чтобы избежать п��вторных с��абатыв��ний
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        speakSystemsOperational();
      }
      return;
    }

    // Команды ��ла��од��рности
    if (
      command.includes("спасибо") ||
      command.includes("благодарю") ||
      command.includes("благодарно���ть") ||
      command.includes("спс") ||
      command.includes("��енк ю") ||
      command.includes("thank you") ||
      command.includes("thanks") ||
      command.includes("мерси") ||
      command.includes("ра����мат") ||
      command.includes("рахмет") ||
      command.includes("хорошо") ||
      command.includes("отлично") ||
      command.includes("замечательно") ||
      command.includes("круто") ||
      command.includes("прекрасно") ||
      command.includes("чудесно")
    ) {
      speakThankYou();
      return;
    }

    // Команда диа��ностики с��стемы
    if (
      command.includes("диа��ностик") ||
      command.includes("прове��и") ||
      command.includes("запусти") ||
      command.includes("проверь сист��му") ||
      command.includes("тест")
    ) {
      console.log("🎯 Распознана ко����ан��а диагностики:", command);

      // ��ополнит��льн��я проверка, чт��бы избежать пов��орных срабатываний
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        console.log("✅ Услови�� выполнены, ��ап���ск��ем диагностику");
        speakSystemDiagnostics();
      } else {
        console.log("❌ ������иагн��стика заблокирована:", {
          isSpeaking,
          commandCooldown: commandCooldownRef.current,
          audioPlaying: audioPlayingRef.current,
        });
      }
      return;
    }

    // Команда проверки присутствия "��жарв��с ты тут?"
    if (
      command.includes("джарвис ты тут") ||
      command.includes("ты тут джарвис") ||
      command.includes("джарвис ты ��десь") ||
      command.includes("ты здесь джарвис") ||
      command.includes("джарвис на месте") ||
      command.includes("джар��ис ��рису��ствуе��ь") ||
      command.includes("jarvis are you there") ||
      command.includes("are you there jarvis")
    ) {
      speakIAmHere();
      return;
    }

    // П��ове��я��м, с����ержит л����� команда значимые слова
    const meaningfulWords = [
      "перейти",
      "войти",
      "регистрация",
      "профиль",
      "заказ",
      "��орз��на",
      "доба���ить",
      "план",
      "джарвис",
      "жарвис", // част��е ошибки распозна������ания
      "ярвис",
      "джаров",
      "базовый",
      "про",
      "макс",
      "прокрутить",
      "скролл",
      "нав��р��",
      "планам",
      "п��еимущества",
      "возможности",
      "от��рыть",
      "личный",
      "кабинет",
      "отпра��ить",
      "секция",
      "спуститься",
      "перейти",
      "покажи",
      "на��ди",
      "где",
      "что",
      "как",
      "цена",
      "сто��мость",
      "т��риф",
      "услуги",
      "компания",
      "контакты",
      "п��ддержка",
      "технологи��",
      "р��зр��ботка",
      "сайт",
      "интеллект",
      "ии",
      "jarvis",
      "мощный",
      "уникальный",
      "качество",
      "ан��литика",
      "пр��миум",
      "невероятное",
      "��ото��ы",
      "создать",
      "биз��ес",
      "помощник",
      "персональны��",
      "��ткл��чись",
      "в��ключись",
      "от��лючи",
      "выключи",
      "с����п",
      "вернулся",
      "здесь",
      "снова",
      "спас��бо",
      "благодарю",
      "благодарность",
      "��пс",
      "thank",
      "thanks",
      "мерс��",
      "��ахмат",
      "рах��ет",
      "хо��ошо",
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
      "присутствуешь",
      "присутствие",
      "месте",
      "there",
      "системы",
      "раб��тают",
      "дела",
      "пож��ваешь",
      "порядк��",
      "ди��гностика",
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

    // Умн��й поиск контента по всему сайту
    const searchAndNavigate = (
      searchTerms: string[],
      fallbackAction?: () => void,
    ) => {
      // П���иск по заг��ловкам
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

      // Поиск по data-section атри��утам
      const sections = Array.from(document.querySelectorAll("[data-section]"));
      for (const section of sections) {
        const sectionName =
          section.getAttribute("data-section")?.toLowerCase() || "";
        if (searchTerms.some((term) => sectionName.includes(term))) {
          section.scrollIntoView({ behavior: "smooth" });
          return true;
        }
      }

      // ���оиск по id элем��нтов
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

      // Если ничего не найдено, вы��о��няем запасное действие
      if (fallbackAction) {
        fallbackAction();
        return true;
      }

      return false;
    };

    // Универсальные команды поиск��
    if (
      command.includes("покажи") ||
      command.includes("найди") ||
      command.includes("��де") ||
      command.includes("перейди к") ||
      command.includes("спуст��с�� к")
    ) {
      let found = false;

      // Поис���� преимущ������тв
      if (
        command.includes("преим��щества") ||
        command.includes("преимущество")
      ) {
        found = searchAndNavigate([
          "��реимущества",
          "преимущество",
          "advantages",
        ]);
        if (found) {
          speak("��оказываю ��реимущества");
          return;
        }
      }

      // Поиск возмож��о��тей
      if (
        command.includes("воз��ожности") ||
        command.includes("возможность") ||
        command.includes("м��щные")
      ) {
        found = searchAndNavigate(["возможности", "мощные", "features"]);
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

      // Поиск инфо�������ации о компании
      if (
        command.includes("компан") ||
        command.includes("о нас") ||
        command.includes("кто мы")
      ) {
        found = searchAndNavigate(["компан", "�� нас", "about", "кто мы"]);
        if (found) {
          speak("Показ��ваю инф��р��ацию о ко��пании");
          return;
        }
      }

      // Поиск контактов
      if (
        command.includes("кон��акт") ||
        command.includes("св��зь") ||
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
          speak("Пок�������ываю ��о��такты");
          return;
        }
      }

      // ��оиск техноло��и��
      if (
        command.includes("те��нолог") ||
        command.includes("webgl") ||
        command.includes("ии") ||
        command.includes("ис��усственный")
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

      // ��оиск качества и премиум у��луг
      if (
        command.includes("качество") ||
        command.includes("премиум") ||
        command.includes("��оддержка")
      ) {
        found = searchAndNavigate([
          "к��чест��о",
          "премиу��",
          "поддержка",
          "quality",
          "support",
        ]);
        if (found) {
          speak("По��азываю информацию о ка��естве");
          return;
        }
      }

      // ��оиск ан��литики
      if (
        command.includes("аналитик") ||
        command.includes("статистик") ||
        command.includes("да��н��е")
      ) {
        found = searchAndNavigate([
          "анал��тик",
          "ст��тистик",
          "дан���ые",
          "analytics",
        ]);
        if (found) {
          speak("Показываю аналитику");
          return;
        }
      }

      // Если ни��его специфичног����� не найдено, поп��обуем общий ��оиск
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

    // Команды навигации по стран��цам
    if (
      command.includes("перейти на глав��у��") ||
      command.includes("на ��лавную страницу") ||
      command.includes("домо��")
    ) {
      navigate("/");
      speak("Переходим на главную стр��ницу");
      return;
    }

    if (
      command.includes("войти") ||
      command.includes("лог��н") ||
      command.includes("авторизация")
    ) {
      navigate("/login");
      speak("Откр���в��ю страниц�� вх��да");
      return;
    }

    if (
      command.includes("рег����страция") ||
      command.includes("зарегистрироваться")
    ) {
      navigate("/signup");
      speak("П��реходим к регистрации");
      return;
    }

    if (
      command.includes("��рофиль") ||
      command.includes("мой профил��") ||
      command.includes("личн��й к��бинет") ||
      command.includes("открыть про���иль")
    ) {
      navigate("/profile");
      speak("Откр��ваю ли��ный кабинет");
      return;
    }

    if (command.includes("заказ") || command.includes("оформить заказ")) {
      navigate("/order");
      speak("Переходим �� ��ф��рмлен��ю зака��а");
      return;
    }

    // Команды корзины
    if (command.includes("корзина") && command.includes("о���истить")) {
      clearCart();
      speak("Корзин�� очищена");
      return;
    }

    if (
      command.includes("откр��т�� корзину") ||
      command.includes("показать корзину") ||
      command.includes("что в корзине")
    ) {
      // Нахо��им и нажимаем ���нопку ко��з���ны
      const cartButton = document.querySelector(
        '[data-testid="cart-button"]',
      ) as HTMLElement;
      if (cartButton) {
        cartButton.click();
      }
      speak("Открываю ��орзину");
      return;
    }

    // Команды доб�����вления планов в корз��н��
    if (
      command.includes("добавить базовы��") ||
      command.includes("базовый план") ||
      command.includes("базовый в корзину") ||
      command.includes("отпр����ить базовый")
    ) {
      onAddBasicPlan();
      speak("Базовый план д��б��в��ен");
      return;
    }

    if (
      command.includes("добавить ��ро") ||
      command.includes("про план") ||
      command.includes("про в корзину") ||
      command.includes("отправит���� про")
    ) {
      onAddProPlan();
      speak("Про план д��бавлен");
      return;
    }

    if (
      command.includes("добави��ь мак��") ||
      command.includes("макс план") ||
      command.includes("максимальный план") ||
      command.includes("д��а����вис пла�����") ||
      command.includes("макс в ��орзину") ||
      command.includes("о��править макс")
    ) {
      onAddMaxPlan();
      speak("Максимальн���й пл���� добавле��");
      return;
    }

    // Ра��шире��ная нави��ация ��о секциям стран��ц��
    if (
      command.includes("к планам") ||
      command.includes("показать планы") ||
      command.includes("пере��ти к плана��") ||
      command.includes("сп����ститься �� планам") ||
      command.includes("тарифы") ||
      command.includes("цены") ||
      command.includes("стоимость")
    ) {
      const found = searchAndNavigate(
        ["пл��н", "тариф", "цен", "pricing", "стоимость"],
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
        speak("��о���а����ываю п��ан��");
      }
      return;
    }

    if (
      command.includes("к пр�����мущес��вам") ||
      command.includes("наши пре��мущества") ||
      command.includes("сп��стит��ся к преимущества��") ||
      command.includes("перейти к ��реимущес���вам") ||
      command.includes("преим��щества")
    ) {
      const found = searchAndNavigate([
        "преи��ущества",
        "пр��имуществ��",
        "advantages",
      ]);
      if (found) {
        speak("Показываю преим��щества");
      }
      return;
    }

    if (
      command.includes("�� возможностям") ||
      command.includes("мощные возможности") ||
      command.includes("спу��титься к возможностям") ||
      command.includes("пере�������и к возмо��ностям") ||
      command.includes("возможности")
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
        speak("Показыв��ю возможности");
      }
      return;
    }

    // Про������утка страницы
    if (
      command.includes("прок����тить вниз") ||
      command.includes("скролл вниз") ||
      command.includes("спус����ит��ся вниз")
    ) {
      window.scrollBy(0, 500);
      speak("Прок��учиваю вн����з");
      return;
    }

    if (
      command.includes("прокрутить ввер��") ||
      command.includes("скролл вверх") ||
      command.includes("поднятьс��� ��верх")
    ) {
      window.scrollBy(0, -500);
      speak("Прокручиваю ��верх");
      return;
    }

    if (
      command.includes("наверх страни����") ||
      command.includes("в на��ало") ||
      command.includes("в самый верх")
    ) {
      window.scrollTo(0, 0);
      speak("Перехожу в нача��о");
      return;
    }

    if (
      command.includes("в коне��� стр��ницы") ||
      command.includes("в сам���й н��з") ||
      command.includes("вниз страницы")
    ) {
      window.scrollTo(0, document.body.scrollHeight);
      speak("��ерехожу в конец");
      return;
    }

    // ВАЖНО: Обработка нераспознанных команд
    // Если дошли до этого места - команда не была распознана
    console.log("�� Кома��да не распознана:", command);
    console.log("🔄 Сбрасываем состояния для следующей команды");

    // Принудительно сбрасываем все блокировки для нераспознанных команд
    setTimeout(() => {
      commandCooldownRef.current = false;
      audioPlayingRef.current = false;
      lastCommandRef.current = "";
      setIsSpeaking(false);
      setTranscript("");
      console.log("✅ Состояния сброшены, система готова к новым командам");
    }, 500); // Небольшая задержка чтобы избежать конфликтов
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

        // Принудительно очищаем все состояния перед запуском
        setTimeout(() => {
          setTranscript("");
          lastCommandRef.current = "";
        }, 100);

        try {
          recognitionRef.current.start();
          setIsListening(true);
          onListeningChange?.(true, "");
        } catch (error) {
          console.log("Распознавание уже зап��щено или н��до��ту��но");
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
          className={`w-14 h-14 rounded-full p-0 transition-all duration-300 bg-transparent hover:bg-white/10 ${
            isListening ? "animate-pulse" : ""
          } ${isSpeaking ? "ring-4 ring-blue-400/50" : ""}`}
          disabled={isSpeaking}
        >
          {isSpeaking ? (
            <Volume2 className="w-6 h-6 text-white animate-pulse" />
          ) : isListening ? (
            <Mic className="w-6 h-6 text-white" />
          ) : (
            <MicOff className="w-6 h-6 text-white" />
          )}
        </Button>

        {/* Status indicator */}
        <div className="text-xs text-white/60 text-center">
          {isSpeaking ? "Говорю..." : isListening ? "Сл���шаю..." : "ДЖАРВИС"}
        </div>
      </div>

      {/* Pulse effect when listening */}
      {isListening && (
        <div className="absolute top-0 right-0 w-14 h-14 rounded-full bg-purple-500/30 animate-ping"></div>
      )}
    </div>
  );
}
