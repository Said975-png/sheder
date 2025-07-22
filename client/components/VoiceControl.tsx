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

        // Дополнительные настройки для Chrome/WebKit - улучшаем чувствительн��с��ь
        if (
          recognitionRef.current.webkitSpeechRecognition ||
          "webkitSpeechRecognition" in window
        ) {
          // @ts-ignore - WebKit specific properties
          recognitionRef.current.webkitContinuous = true;
          // @ts-ignore
          recognitionRef.current.webkitInterimResults = true;
          // @ts-ignore - Увеличиваем таймаут для лучшего захвата длинных фраз
          recognitionRef.current.webkitGrammars = null;
          // @ts-ignore
          recognitionRef.current.webkitMaxAlternatives = 5;
        }

        // Дополнительные настройки для лучшего ра��познавания длинных фраз
        try {
          // @ts-ignore - Эти настройки помогают лучше распознава��ь речь
          if (recognitionRef.current.webkitSpeechRecognition) {
            recognitionRef.current.webkitSpeechRecognition.continuous = true;
            recognitionRef.current.webkitSpeechRecognition.interimResults =
              true;
          }
        } catch (e) {
          // Игнорируем ����ибки настроек
        }
        // @ts-ignore - эти свойства могут не быть в типах, но р��ботают �� браузерах
        if ("webkitSpeechRecognition" in window) {
          recognitionRef.current.serviceURI =
            "wss://www.google.com/speech-api/full-duplex/v1/up";
        }

        recognitionRef.current.onstart = () => {
          console.log("🎤 Ра��познавание речи запущено");
        };

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = "";
          let interimTranscript = "";
          let combinedTranscript = "";

          // Обрабатываем только ПОСЛЕДНИЙ результат, чтобы не накапливать старые
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

          // Фильтруем повторяющиеся фразы и слишком длинные результаты
          if (combinedTranscript.length > 50) {
            console.log(
              "🚫 Отклоняем слишком длинный результат:",
              combinedTranscript.length,
              "символов",
            );
            combinedTranscript = "";
          }

          // Проверяем на повторяющиеся слова (признак накопления)
          const words = combinedTranscript.split(" ");
          const uniqueWords = [...new Set(words)];
          if (words.length > uniqueWords.length * 2) {
            console.log("🚫 Отклоняем результат с повторяющимися словами");
            combinedTranscript = "";
          }

          // Показывае�� промежуточный результат только если система свободна и это новый короткий контент
          if (
            combinedTranscript &&
            combinedTranscript.length > 2 &&
            combinedTranscript.length < 100 && // Фильтр для предотвращения ��акопленных транскриптов
            !commandCooldownRef.current &&
            !isSpeaking &&
            !audioPlayingRef.current &&
            combinedTranscript !== lastCommandRef.current
          ) {
            setTranscript(combinedTranscript);
            onListeningChange?.(true, combinedTranscript);
            console.log("🎯 Распознано:", `"${combinedTranscript}"`);
          }

          // Обрабатываем финальные результаты или достаточно длинные промежуточные
          if (
            (finalTranscript || combinedTranscript.length > 5) &&
            !commandCooldownRef.current &&
            !isSpeaking
          ) {
            const command = (finalTranscript || combinedTranscript)
              .toLowerCase()
              .trim();
            console.log("🔍 Анализируем ком��нду:", `"${command}"`);

            // Проверяем, что команда отличается от предыдущей и достаточно дли��ная
            if (
              command &&
              command !== lastCommandRef.current &&
              command.length > 2
            ) {
              console.log(
                "✅ К��манда принята дл�� обработ��и:",
                `"${command}"`,
              );
              setTranscript(command);
              onListeningChange?.(true, command);

              // Очи��аем п��едыдущи�� таймер
              if (commandDelayRef.current) {
                clearTimeout(commandDelayRef.current);
              }

              // Добавляем неболь��ую задержку для завершения фразы
              commandDelayRef.current = setTimeout(
                () => {
                  lastCommandRef.current = command;
                  setNoSpeechCount(0); // Сбрасываем счетчик при успешном распознавании

                  processVoiceCommand(command);

                  // Быстрая очистка транскрипта после запуска команды
                  setTimeout(() => {
                    console.log("🧹 Быстрая очистка транскрипта");
                    setTranscript("");
                    onListeningChange?.(true, "");
                  }, 800);

                  // Полная очистка состояния команды и перезапуск Recognition
                  setTimeout(() => {
                    console.log("🧹 Полная очистка состоя��ия после команды");
                    setTranscript("");
                    onListeningChange?.(true, "");
                    lastCommandRef.current = "";

                    // Перезапускаем Recognition для очистки накопленной истории
                    if (recognitionRef.current && isListening) {
                      console.log(
                        "🔄 Перезапуск Recognition для очистки истории",
                      );
                      try {
                        recognitionRef.current.stop();
                        setTimeout(() => {
                          if (recognitionRef.current && isListening) {
                            recognitionRef.current.start();
                            console.log("✅ Recognition перезапущен и очищен");
                          }
                        }, 300);
                      } catch (error) {
                        console.log("Ошибка перезапуска Recognition:", error);
                      }
                    }
                  }, 2000);
                },
                finalTranscript ? 100 : 1000,
              ); // Меньше задержки для фи��альных результатов
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
            "🎤 Р���спознавание завершилось, isListening:",
            isListening,
            "isSpeaking:",
            isSpeaking,
          );

          // Автоматически перезапускаем распознавание, если мы все еще слушаем
          if (isListening && !isSpeaking) {
            console.log("�� Перезапускаем распознавание...");

            // Очищаем сост��яние перед перезапуском
            setTranscript("");
            lastCommandRef.current = "";

            setTimeout(() => {
              if (recognitionRef.current && isListening && !isSpeaking) {
                try {
                  recognitionRef.current.start();
                  console.log("✅ Распознавание п��резапущено");
                } catch (error) {
                  console.log(
                    "ℹ️ Распозн��вание уже запущено или недоступно:",
                    error,
                  );
                }
              }
            }, 100);
          } else {
            console.log("🛑 Останавливаем распознавание");
            setIsListening(false);
            onListeningChange?.(false, "");
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.log("Speech recognition event:", event.error);

          // Критические ошибки - полностью останавливаем
          if (event.error === "network" || event.error === "not-allowed") {
            console.error(
              "��� Критическая ошибка ра��по��навания:",
              event.error,
            );
            setIsListening(false);
            onListeningChange?.(false, "");
          }
          // Некритические ошибки - игнорируе�� и продолж��ем
          else if (
            event.error === "no-speech" ||
            event.error === "audio-capture" ||
            event.error === "aborted"
          ) {
            if (event.error === "no-speech") {
              setNoSpeechCount((prev) => prev + 1);
              console.log(
                `ℹ️ No-speech ошибка #${noSpeechCount + 1} - п��одолжаем слушать`,
              );

              // Если сл��шком м��ого no-speech ошибок подряд, делаем небольшую паузу
              if (noSpeechCount >= 3) {
                console.log("⏸️ Много no-speech ошибок, дела��м паузу 2 сек...");
                setTimeout(() => {
                  setNoSpeechCount(0);
                  if (isListening && recognitionRef.current) {
                    try {
                      recognitionRef.current.start();
                    } catch (error) {
                      console.log("Перезапус�� после паузы");
                    }
                  }
                }, 2000);
              }
            } else {
              console.log(
                "ℹ️ Некритическая ошибка распознавания:",
                event.error,
                "- ��родолжаем слушать",
              );
            }
            // Система автоматически переза��устится через onend
          }
          // Другие оши��ки - ��ерезапускаем через короткое время
          else {
            console.warn(
              "⚠️ Неожиданная ошибка распозна����ния:",
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
      // Останавливаем любое воспроизводящееся а��дио при размонтировании
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }
      // Очищаем таймер ко��анд
      if (commandDelayRef.current) {
        clearTimeout(commandDelayRef.current);
      }
    };
  }, []);

  // Функция для полного сброса Speech Recognition
  const resetSpeechRecognition = () => {
    if (recognitionRef.current) {
      console.log("🔄 Полный сброс Speech Recognition");
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
            console.log("Ошибка запуска при сброс��:", error);
          }
        }
      }, 200);
    }
  };

  // Effect ��ля обработки тестов��х команд
  useEffect(() => {
    const handleTestCommand = (event: any) => {
      console.log("🧪 Получена тестовая ��ом��нда:", event.detail.command);
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

  // Вспомогательная функция для восстановления прослушивания
  const restoreListening = () => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        console.log("🎤 Прослушивание восстановлено");
      } catch (error) {
        console.log("Recognition уже активен:", error);
      }
    }
  };

  // Функция для полного сброса состояния после команды
  const resetCommandState = (delay: number = 3000) => {
    setTimeout(() => {
      commandCooldownRef.current = false;
      lastCommandRef.current = "";
      setTranscript("");
      onListeningChange?.(true, "");

      // Важно: если микрофон был включен, восстанавливаем прослушивание
      restoreListening();

      console.log("🧹 Полный сброс состояния команды");
    }, delay);
  };

  const speak = (text: string) => {
    // Пре��отвращаем повторное в��спроиз��е��ение
    if (isSpeaking || commandCooldownRef.current) return;

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Очищаем транскрипт когда начинаем говорить
    setTranscript("");
    onListeningChange?.(true, "");

    // Созда��м и воспрои��водим ваш новый ау��ио-файл
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fdb47541068444a9093b406f29a6af3ce?alt=media&token=43fbc024-64ae-479b-8a6c-5b9d12b43294&apiKey=236158b44f8b45f680ab2467abfc361c",
    );

    audio.onended = () => {
      setIsSpeaking(false);
      // Сбрасываем состояние через более длительную задержку после аудио
      resetCommandState(3000);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
        restoreListening();
      }, 500);
      console.error("Ошибка воспроизведения ауди��");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
        restoreListening();
      }, 500);
      console.error("Не удалось воспроизвести аудио:", error);
    });
  };

  const speakShutdown = () => {
    // Оста����авливаем любое текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Создаем и воспроизводи�� аудио для команды "от��лючись"
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
      // После око��чания аудио отключаем микрофон
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setTranscript("");
      onListeningChange?.(false, "");
    };

    audio.onended = shutdownComplete;

    audio.onerror = () => {
      console.error("��шибка вос���роизведения а��ди�� отключения");
      shutdownComplete();
    };

    audio.play().catch((error) => {
      console.error("Н�� удалось воспроизвести аудио отключен��я:", error);
      shutdownComplete();
    });
  };

  const speakWelcomeBack = () => {
    if (isSpeaking || commandCooldownRef.current) return;

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Создаем и воспроизводим ауд��о для команды "Джарвис я вернулся"
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fd8b2e931609e45c3ad40a718329bc1c4?alt=media&token=78714408-6862-47cc-a4ac-8f778b958265&apiKey=236158b44f8b45f680ab2467abfc361c",
    );

    audio.onended = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
        restoreListening();
      }, 500);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
        restoreListening();
      }, 500);
      console.error("О��ибка воспроизведен���я ау������о приветств��я");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
        restoreListening();
      }, 500);
      console.error("Не уд��лось воспроизвести аудио приветствия:", error);
    });
  };

  const speakThankYou = () => {
    if (isSpeaking || commandCooldownRef.current) return;

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Создаем и восп��оизводим аудио дл�� благодарности
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F4b8ea25f0ef042cbac23e1ab53938a6b%2Fafb1b8a7fc8645a7ab1e8513e8c1faa7?alt=media&token=be057092-6988-45dd-94dc-90427146589d&apiKey=4b8ea25f0ef042cbac23e1ab53938a6b",
    );

    audio.onended = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
        restoreListening();
      }, 500);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
        restoreListening();
      }, 500);
      console.error("Ошибка во������оизведения ��удио благодар��о��ти");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
        restoreListening();
      }, 500);
      console.error("Не удал��сь восп��оизвести аудио благо��арности:", error);
    });
  };

  const speakGoodMorning = () => {
    // Множеств��нная защита от п��вторного воспроизведения
    if (isSpeaking || commandCooldownRef.current || audioPlayingRef.current) {
      return;
    }

    // Останавливаем любое текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Создаем и воспроизводим ауд��о для утреннего приветстви��
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
        restoreListening();
      }, 2000); // Увеличен таймаут до 2 секунд
    };

    audio.onended = resetState;
    audio.onerror = () => {
      resetState();
      console.error("Ошибка во��произведения аудио утреннего при��етствия");
    };

    audio.play().catch((error) => {
      resetState();
      console.error(
        "Не удалось во��произвести аудио утреннего ����риветствия:",
        error,
      );
    });
  };

  const speakIAmHere = () => {
    if (isSpeaking || commandCooldownRef.current) return;

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Создаем и во��производим аудио для ответа "��ж��рв����с ты тут?"
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F4b8ea25f0ef042cbac23e1ab53938a6b%2F5baee2408110417fbab785b0c6ffdde6?alt=media&token=a957a2b4-68ad-46de-bc3e-11943c8fb38b&apiKey=4b8ea25f0ef042cbac23e1ab53938a6b",
    );

    audio.onended = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
        restoreListening();
      }, 500);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
        restoreListening();
      }, 500);
      console.error("Ошибка воспроиз��едения аудио о��вета");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
        restoreListening();
      }, 500);
      console.error("Не удалось воспроизв��ст�� аудио ��тве��а:", error);
    });
  };

  const speakWithElevenLabs = async (text: string) => {
    // Множественна�� защи��а от повторного восп��оизведения
    if (isSpeaking || commandCooldownRef.current || audioPlayingRef.current) {
      return;
    }

    // Оста����авливаем любое текущее воспроизведение
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
        restoreListening();
      }, 500);
    };

    try {
      // Используем ElevenLabs API для синтеза речи с вашим ��астомным голосом
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
        console.error("Ошибка воспроизведения аудио из ElevenLabs");
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
    // Множественная защита от повторного воспроизведения
    if (isSpeaking || commandCooldownRef.current || audioPlayingRef.current) {
      return;
    }

    // О��танавливаем любое текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    // Запоминаем состояние прослушивания ДО остановки
    const wasListening = isListening;

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Немедлен��о очищаем транскрипт когда начинаем говорить
    setTranscript("");
    onListeningChange?.(true, "");

    // Вр��менн�� останавливаем ��аспознав��ние речи во время воспроизведения
    if (recognitionRef.current && wasListening) {
      console.log("⏸️ Временно остана��ливаем распознавание на время аудио");
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("Ошибка остановки распознавания:", error);
      }
    }

    // Используем ваш оригинальный аудиофайл Джарвиса
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2Fddde4fe5b47946c2a3bbb80e3bca0073%2F54eb93b1452742b6a1cd87cc6104bb59?alt=media&token=fc948eba-bbcd-485c-b129-d5a0c25cfc74&apiKey=ddde4fe5b47946c2a3bbb80e3bca0073",
    );
    currentAudioRef.current = audio;

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;

      // Возо��новляем распознавание речи после завершения аудио, используя сохраненн��е состояние
      setTimeout(() => {
        if (wasListening && recognitionRef.current) {
          console.log("▶️ Возобновляем распозна��ание после аудио");
          try {
            recognitionRef.current.start();
            // НЕ изменяем isListening здесь, так как оно должно остаться true
          } catch (error) {
            console.log("Распознавание уже активно:", error);
          }
        }
      }, 500);

      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
        restoreListening();
      }, 1000);
    };

    audio.onended = resetState;
    audio.onerror = () => {
      resetState();
      console.error("Ошибка воспроизведения оригина��ьного аудио Джарвиса");
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
    await speakWithElevenLabs("Все системы функцио��ируют нор��ально");
  };

  const speakHowAreYou = () => {
    // ��ноже��твенная ��ащита от повторног�� восп��оизве��ения
    if (isSpeaking || commandCooldownRef.current || audioPlayingRef.current) {
      return;
    }

    // Ос��анавливаем ��юбое те��ущее воспрои��ведение
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
        "у меня все в порядке сэр",
      );

      // Настр��йки максимально приближенные к ElevenLabs Jarvis (wDsJlOXPqcvIUKdLXjDs)
      // Stability: 20 (низкая ст��бильность для более естестве��ной речи)
      // Similarity Boost: 90 (высок��е сходс��во с оригинальным голосом)
      // Style: Assistant/Narration (помощник/повеств��вание)

      utterance.lang = "en-US"; // Английский для лучшего качества, потом переклю��им ��а русский
      utterance.rate = 0.75; // Мед��ен��ая, размеренная речь как �� Джарвиса из фильма
      utterance.pitch = 0.7; // Сред����-ни��кий тон для ��втор��тет��ос��и
      utterance.volume = 0.95; // Четкая, но не резкая громкость

      // Поиск наиболе�� подходящего ��олоса для имитации Jarvis
      const voices = speechSynthesis.getVoices();

      // Приоритет: голоса, похожие на британский/американский мужской
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

      // ��сли н���� нашли подходящий а��глийский, ищем русский мужской
      const russianMaleVoice = voices.find(
        (voice) =>
          voice.lang.includes("ru") &&
          (voice.name.toLowerCase().includes("male") ||
            voice.name.toLowerCase().includes("муж�����к��й") ||
            voice.name.toLowerCase().includes("антон") ||
            voice.name.toLowerCase().includes("ник��лай")),
      );

      if (jarvisLikeVoice) {
        utterance.voice = jarvisLikeVoice;
        utterance.lang = "ru-RU";
        utterance.pitch = 0.6; // Чуть ниже для лучшего звучания русского
      } else if (russianMaleVoice) {
        utterance.voice = russianMaleVoice;
        utterance.lang = "ru-RU";
        utterance.pitch = 0.6; // Чуть ниже для русского голоса
      } else {
        // Fallback: любой доступный го��ос с оптимиз��рованными настройками
        const anyVoice = voices.find(
          (voice) => voice.lang.includes("en") || voice.lang.includes("ru"),
        );
        if (anyVoice) {
          utterance.voice = anyVoice;
          utterance.lang = "ru-RU"; // Всегда русский язык
        }
        utterance.pitch = 0.55; // Еще ниже для компенсации
        utterance.rate = 0.7; // Е����е медленнее ��ля большей солидно��ти
      }

      const resetState = () => {
        setIsSpeaking(false);
        audioPlayingRef.current = false;
        currentAudioRef.current = null;
        setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
        restoreListening();
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
        restoreListening();
      }, 500);
      };

      console.log("Джарвис: у меня все в порядке сэр");
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
    console.log("🔧 Запуск диагн��стики систем��...");
    testAudioUrls(); // Тестируем URL

    // Множественная защита от повторного воспроизведения
    if (isSpeaking || commandCooldownRef.current || audioPlayingRef.current) {
      console.log("❌ Диагностика заблокирована - система занята");
      return;
    }

    // Останавл��ваем любое текущее воспроиз��ед��ние
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Воспроизводим первое аудио
    console.log("��� Создаем первое аудио для диагнос��ики");
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
        restoreListening();
      }, 500);
    };

    firstAudio.onended = () => {
      console.log("✅ Пер��ое аудио за��ончилось, ждем 2 секун��ы...");
      // Ч��рез 2 секунды в��спроизводим второе аудио
      setTimeout(() => {
        console.log("🎵 ��оздаем второе аудио для диагностики");
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
          console.error("❌ Ошибка воспроизведения второго аудио ��иагностики");
        };

        console.log("▶️ Запускаем второе аудио");
        secondAudio.play().catch((error) => {
          resetState();
          console.error(
            "❌ Не удалось воспроизвести второе аудио диагностики:",
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

  const processVoiceCommand = (command: string) => {
    console.log("🔧 Обработка команды:", command);

    // Простая очистка транскрипта в начале обработки
    setTranscript("");
    onListeningChange?.(true, "");

    // Планируем сброс Recognition после обработки команды
    setTimeout(() => {
      resetSpeechRecognition();
    }, 3000);

    // Фильтруем пустые или ��лишком короткие кома��ды
    const trimmedCommand = command.trim();
    if (trimmedCommand.length < 3) {
      return;
    }

    // Команда о��ключения (приоритетная)
    if (
      command.includes("от��лючись") ||
      command.includes("вык��ючись") ||
      command.includes("отключи микрофон") ||
      command.includes("стоп джарвис") ||
      command.includes("выключи")
    ) {
      // Принудительно выполняем команду отключения независимо от состояния
      speakShutdown();
      return;
    }

    // Команда п��иветствия "Д��арвис я вернулся"
    if (
      command.includes("джарв���с я вернулся") ||
      command.includes("я вернулся ��жарвис") ||
      command.includes("джарвис я здесь") ||
      command.includes("я снова здесь")
    ) {
      speakWelcomeBack();
      return;
    }

    // Команды ��ля оригинально��о голоса Джарвиса (из фи��ьма)
    if (
      command.includes("ори��инальный джарвис") ||
      command.includes("настоящий джарвис") ||
      command.includes("джарвис как в фильме") ||
      command.includes("железный чело��ек") ||
      command.includes("tony stark") ||
      command.includes("тони старк") ||
      command.includes("authentic jarvis") ||
      command.includes("real jarvis") ||
      command.includes("movie jarvis") ||
      command.includes("джарвис из железного ч��ловека") ||
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

    // Команда утреннего приветстви��� "Доброе утр�� Джарвис"
    if (
      command.includes("доброе утро джарвис") ||
      command.includes("джарвис до��рое утро") ||
      command.includes("утро джар��ис") ||
      (command.includes("доброе утро") && command.length < 20) ||
      command.includes("good morning jarvis") ||
      (command.includes("good morning") && command.length < 20) ||
      command.includes("доброго утра")
    ) {
      // Дополнит����льная проверка, ч��обы избе������ть повторны�� срабатываний
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        speakGoodMorning();
      }
      return;
    }

    // Команда пр��ветствия "Приве�� Джарвис" - улучшенное распознавание �� защитой от повторов
    if (
      command.includes("привет джарвис") ||
      command.includes("джарвис привет") ||
      command.includes("здравствуй джар��ис") ||
      command.includes("джарв��с здравствуй") ||
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

      // Дополнительная проверка + защита от повторов (минимум 10 секунд между приветствиями)
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current &&
        timeSinceLastGreeting > 10000
      ) {
        console.log("✅ Выполняем команду приветствия");
        lastGreetingTimeRef.current = now;
        speakAuthenticJarvis();
      } else {
        console.log("❌ Приветствие заблокировано:", {
          isSpeaking,
          commandCooldown: commandCooldownRef.current,
          audioPlaying: audioPlayingRef.current,
          timeSinceLastGreeting,
        });
      }
      return;
    }

    // Команда "Джарвис как дела" с ответом "Все системы функционируют нормал��но"
    if (
      command.includes("дж��рвис как дела") ||
      command.includes("как дела джарвис") ||
      command.includes("жарвис как дела") || // частые ошибки рас��ознавания
      command.includes("как дела жарв��с") ||
      command.includes("ярвис как дела") ||
      (command.includes("джарвис") && command.includes("как дела")) ||
      (command.includes("жарвис") && command.includes("как дела")) ||
      (command.includes("как дела") && command.length < 20) // ��сли с��ышно ��олько "как дела"
    ) {
      // ������олнительная провер���а, ��тобы избежать повторных срабат��ва��ий
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        speakSystemsOperational();
      }
      return;
    }

    // Команда "Как дела" (общая, без имени ����а��вис)
    if (
      command.includes("как дела") ||
      command.includes("как поживаешь джарвис") ||
      command.includes("джарвис как поживаешь") ||
      command.includes("��ак ты дж��рвис") ||
      command.includes("how are you jarvis") ||
      command.includes("jarvis how are you") ||
      command.includes("how are you") ||
      command.includes("как тв��и дела") ||
      command.includes("что ново��о джарвис")
    ) {
      // Дополнительная про���ерка, чтобы избежать п����торных с��абатываний
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
      command.includes("ра��мат") ||
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
      command.includes("диагностик") ||
      command.includes("прове��и") ||
      command.includes("запусти") ||
      command.includes("проверь систему") ||
      command.includes("тест")
    ) {
      console.log("🎯 Распознана ко����ан��а диагностики:", command);

      // Дополнительн��я проверка, чтобы избежать пов��орных срабатываний
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        console.log("✅ Условия выполнены, ��ап��ск��ем диагностику");
        speakSystemDiagnostics();
      } else {
        console.log("❌ ����иагн��стика заблокирована:", {
          isSpeaking,
          commandCooldown: commandCooldownRef.current,
          audioPlaying: audioPlayingRef.current,
        });
      }
      return;
    }

    // Команда проверки присутствия "��жарвис ты тут?"
    if (
      command.includes("джарвис ты тут") ||
      command.includes("ты тут джарвис") ||
      command.includes("джарвис ты здесь") ||
      command.includes("ты здесь джарвис") ||
      command.includes("джарвис на месте") ||
      command.includes("джар��ис ��рисутствуешь") ||
      command.includes("jarvis are you there") ||
      command.includes("are you there jarvis")
    ) {
      speakIAmHere();
      return;
    }

    // Прове��я��м, со��ержит л����� команда значимые слова
    const meaningfulWords = [
      "перейти",
      "войти",
      "регистрация",
      "профиль",
      "заказ",
      "��орзина",
      "доба���ить",
      "план",
      "джарвис",
      "жарвис", // частые ошибки распозна����ания
      "ярвис",
      "джаров",
      "базовый",
      "про",
      "макс",
      "прокрутить",
      "скролл",
      "наверх",
      "планам",
      "преимущества",
      "возможности",
      "от��рыть",
      "личный",
      "кабинет",
      "отправить",
      "секция",
      "спустить��я",
      "перейти",
      "покажи",
      "на��ди",
      "где",
      "что",
      "как",
      "цена",
      "стоимость",
      "тариф",
      "услуги",
      "компания",
      "контакты",
      "п��ддержка",
      "технологи��",
      "разр��ботка",
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
      "��отовы",
      "создать",
      "биз��ес",
      "помощник",
      "персональный",
      "откл��чись",
      "в��ключись",
      "от��лючи",
      "выключи",
      "ст��п",
      "вернулся",
      "здесь",
      "снова",
      "спас��бо",
      "благодарю",
      "благ��дарность",
      "спс",
      "thank",
      "thanks",
      "мерси",
      "��ахмат",
      "рахмет",
      "хорошо",
      "отличн��",
      "замечате��ьно",
      "круто",
      "пре��расно",
      "чудесно",
      "добр���е",
      "утро",
      "утра",
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
      // П��иск по заголовкам
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

      // ��оиск по id элем��нтов
      for (const term of searchTerms) {
        const elementById = document.getElementById(term);
        if (elementById) {
          elementById.scrollIntoView({ behavior: "smooth" });
          return true;
        }
      }

      // Пои��к по тексту элементов
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

      // Если ничего не найдено, выполняем запасное дейст��ие
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
      command.includes("спустис�� к")
    ) {
      let found = false;

      // Поис���� преимущ����ств
      if (
        command.includes("преимущества") ||
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

      // ��оиск возмож��о��тей
      if (
        command.includes("возможности") ||
        command.includes("возможность") ||
        command.includes("м��щны��")
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

      // Поиск инфор��ации о компании
      if (
        command.includes("комп��н") ||
        command.includes("�� нас") ||
        command.includes("кто мы")
      ) {
        found = searchAndNavigate(["компан", "�� нас", "about", "кто мы"]);
        if (found) {
          speak("П��каз��ваю инфор��ацию о ко��пании");
          return;
        }
      }

      // Поиск кон��актов
      if (
        command.includes("контакт") ||
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
          speak("Пок����ываю ��о��такты");
          return;
        }
      }

      // ��оиск технологи��
      if (
        command.includes("технолог") ||
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

      // Пои��к качества и премиум услуг
      if (
        command.includes("качество") ||
        command.includes("премиум") ||
        command.includes("поддержка")
      ) {
        found = searchAndNavigate([
          "к��чество",
          "премиум",
          "поддержка",
          "quality",
          "support",
        ]);
        if (found) {
          speak("По��азываю информацию о ка��естве");
          return;
        }
      }

      // ��оиск аналитики
      if (
        command.includes("аналитик") ||
        command.includes("статистик") ||
        command.includes("да��ные")
      ) {
        found = searchAndNavigate([
          "анал��тик",
          "ст��тистик",
          "дан��ые",
          "analytics",
        ]);
        if (found) {
          speak("Показываю аналитику");
          return;
        }
      }

      // Если ни��его специфичного не найдено, попробуем общий ��оиск
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

    // Команды навигации по страницам
    if (
      command.includes("перейти на глав��у��") ||
      command.includes("на ��лавную страницу") ||
      command.includes("домо��")
    ) {
      navigate("/");
      speak("Переходим на главную страницу");
      return;
    }

    if (
      command.includes("войти") ||
      command.includes("лог��н") ||
      command.includes("авторизация")
    ) {
      navigate("/login");
      speak("Откр���ваю страницу вх��да");
      return;
    }

    if (
      command.includes("рег��страция") ||
      command.includes("зарегистрироваться")
    ) {
      navigate("/signup");
      speak("Переходим к регистрации");
      return;
    }

    if (
      command.includes("профиль") ||
      command.includes("мой профиль") ||
      command.includes("личн��й к��бинет") ||
      command.includes("открыть про��иль")
    ) {
      navigate("/profile");
      speak("Откр��ваю ли��ный кабинет");
      return;
    }

    if (command.includes("заказ") || command.includes("оформить заказ")) {
      navigate("/order");
      speak("Переходим к оф��рмлен��ю зака��а");
      return;
    }

    // Команды корзины
    if (command.includes("корзина") && command.includes("о��истить")) {
      clearCart();
      speak("Корзин�� очищена");
      return;
    }

    if (
      command.includes("открыт�� корзину") ||
      command.includes("показать корзину") ||
      command.includes("что в корзине")
    ) {
      // Нахо��им и нажимаем ��нопку ко��зины
      const cartButton = document.querySelector(
        '[data-testid="cart-button"]',
      ) as HTMLElement;
      if (cartButton) {
        cartButton.click();
      }
      speak("Открываю корзину");
      return;
    }

    // Команды доб�����вления планов в корзину
    if (
      command.includes("добавить базовый") ||
      command.includes("базовый план") ||
      command.includes("базовый в корзину") ||
      command.includes("отправить базовый")
    ) {
      onAddBasicPlan();
      speak("Базовый план д��бавлен");
      return;
    }

    if (
      command.includes("добавить ��ро") ||
      command.includes("про план") ||
      command.includes("про в корзину") ||
      command.includes("отправит�� про")
    ) {
      onAddProPlan();
      speak("Про план д��бавлен");
      return;
    }

    if (
      command.includes("добави��ь мак��") ||
      command.includes("макс план") ||
      command.includes("максимальный план") ||
      command.includes("д��а��вис пла����") ||
      command.includes("макс в ��орзину") ||
      command.includes("о��править макс")
    ) {
      onAddMaxPlan();
      speak("Максимальный пл��н добавле��");
      return;
    }

    // Ра��шире��ная навигация ��о секциям стран��ц��
    if (
      command.includes("к планам") ||
      command.includes("по��азать пла��ы") ||
      command.includes("пере��ти к планам") ||
      command.includes("сп��ститься �� планам") ||
      command.includes("тарифы") ||
      command.includes("ц��ны") ||
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
        speak("По���а���ываю п��аны");
      }
      return;
    }

    if (
      command.includes("к пре���мущес��вам") ||
      command.includes("наши пре��мущества") ||
      command.includes("спустит��ся к преимуществам") ||
      command.includes("перейти к ��реимущес��вам") ||
      command.includes("преим��щества")
    ) {
      const found = searchAndNavigate([
        "преи��ущества",
        "преимуще��тв��",
        "advantages",
      ]);
      if (found) {
        speak("Показываю преим��щества");
      }
      return;
    }

    if (
      command.includes("к возможностям") ||
      command.includes("мощные возможности") ||
      command.includes("спуститься к возможностям") ||
      command.includes("пере�����и к возмо��ностям") ||
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

    // Прокрутка страницы
    if (
      command.includes("прок����тить вниз") ||
      command.includes("скролл вниз") ||
      command.includes("спустит��ся вниз")
    ) {
      window.scrollBy(0, 500);
      speak("Прок��учиваю вн��з");
      return;
    }

    if (
      command.includes("прокрутить вверх") ||
      command.includes("скролл вверх") ||
      command.includes("поднятьс��� ��верх")
    ) {
      window.scrollBy(0, -500);
      speak("Прокручиваю вверх");
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
      command.includes("в коне�� страницы") ||
      command.includes("в сам��й н��з") ||
      command.includes("вниз страницы")
    ) {
      window.scrollTo(0, document.body.scrollHeight);
      speak("��ерехожу в конец");
      return;
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setTranscript("");
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
