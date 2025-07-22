import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

interface VoiceControlProps {
  onAddBasicPlan: () => void;
  onAddProPlan: () => void;
  onAddMaxPlan: () => void;
}

export default function VoiceControl({
  onAddBasicPlan,
  onAddProPlan,
  onAddMaxPlan,
}: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastCommandRef = useRef<string>("");
  const commandCooldownRef = useRef<boolean>(false);
  const audioPlayingRef = useRef<boolean>(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const { getTotalItems, clearCart } = useCart();

  useEffect(() => {
    // Проверяем поддержку Speech Recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "ru-RU";
        // Улучшенные настройки для лучшего распознавания тихих команд
        recognitionRef.current.maxAlternatives = 3;
        // @ts-ignore - эти свойства могут не быть в типах, но р��ботают в браузерах
        if ("webkitSpeechRecognition" in window) {
          recognitionRef.current.serviceURI =
            "wss://www.google.com/speech-api/full-duplex/v1/up";
        }

        recognitionRef.current.onresult = (event) => {
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

          // Показываем промежуточный результат
          if (interimTranscript) {
            setTranscript(interimTranscript);
          }

          if (finalTranscript && !commandCooldownRef.current) {
            const command = finalTranscript.toLowerCase().trim();
            // Проверяем, что команда отличается от предыдущей и не пустая
            if (
              command &&
              command !== lastCommandRef.current &&
              command.length > 2
            ) {
              setTranscript(finalTranscript);
              lastCommandRef.current = command;
              processVoiceCommand(command);
            }
          }
        };

        recognitionRef.current.onend = () => {
          // Автоматически перезапу��каем распознавание, если мы все еще слушаем
          if (isListening && !isSpeaking) {
            setTimeout(() => {
              if (recognitionRef.current && isListening) {
                try {
                  recognitionRef.current.start();
                } catch (error) {
                  console.log("Распознавание уже запущено");
                }
              }
            }, 100);
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          // Не отключаем полностью при ошибках, кроме критических
          if (event.error === "network" || event.error === "not-allowed") {
            setIsListening(false);
          } else {
            // Перезапускаем через короткое время для других ошибок
            setTimeout(() => {
              if (isListening && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (error) {
                  console.log("Перезапуск после ошиб��и");
                }
              }
            }, 500);
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      // Останавливаем любое воспроизводящееся аудио при размонтировании
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  const speak = (text: string) => {
    // Предотвращаем повторное воспроизведение
    if (isSpeaking || commandCooldownRef.current) return;

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Создаем и воспроизводим ваш новый аудио-файл
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fdb47541068444a9093b406f29a6af3ce?alt=media&token=43fbc024-64ae-479b-8a6c-5b9d12b43294&apiKey=236158b44f8b45f680ab2467abfc361c",
    );

    audio.onended = () => {
      setIsSpeaking(false);
      // Сбрасываем кулдаун через небольшую задержку
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 1000);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 1000);
      console.error("Ошибка воспроизведения аудио");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 1000);
      console.error("Не удалось воспроизвести аудио:", error);
    });
  };

  const speakShutdown = () => {
    // Оста��авливаем любое текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Создаем и воспроизводим аудио для команды "отключись"
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
      // После окончания аудио отключаем микрофон
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setTranscript("");
    };

    audio.onended = shutdownComplete;

    audio.onerror = () => {
      console.error("Ошибка воспроизведения аудио отключения");
      shutdownComplete();
    };

    audio.play().catch((error) => {
      console.error("Не удалось воспроизвести аудио отключения:", error);
      shutdownComplete();
    });
  };

  const speakWelcomeBack = () => {
    if (isSpeaking || commandCooldownRef.current) return;

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Создаем и воспроизводим аудио для команды "Джарвис я вернулся"
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fd8b2e931609e45c3ad40a718329bc1c4?alt=media&token=78714408-6862-47cc-a4ac-8f778b958265&apiKey=236158b44f8b45f680ab2467abfc361c",
    );

    audio.onended = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 1000);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 1000);
      console.error("О��ибка воспроизведения аудио приветствия");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 1000);
      console.error("Не удалось воспроизвести аудио приветствия:", error);
    });
  };

  const speakThankYou = () => {
    if (isSpeaking || commandCooldownRef.current) return;

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Создаем и воспроизводим аудио дл�� благодарности
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F4b8ea25f0ef042cbac23e1ab53938a6b%2Fafb1b8a7fc8645a7ab1e8513e8c1faa7?alt=media&token=be057092-6988-45dd-94dc-90427146589d&apiKey=4b8ea25f0ef042cbac23e1ab53938a6b",
    );

    audio.onended = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 1000);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 1000);
      console.error("Ошибка во��произведения аудио благодарности");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 1000);
      console.error("Не удалось восп��оизвести аудио благодарности:", error);
    });
  };

  const speakGoodMorning = () => {
    // Множественная защита от повторного воспроизведения
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

    // Создаем и воспроизводим ауд��о для утренне��о приветствия
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
      }, 2000); // Увеличен таймаут до 2 секунд
    };

    audio.onended = resetState;
    audio.onerror = () => {
      resetState();
      console.error("Ошибка воспроизведения аудио утреннего при��етствия");
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
    if (isSpeaking || commandCooldownRef.current) return;

    setIsSpeaking(true);
    commandCooldownRef.current = true;

    // Создаем и воспроизводим аудио для ответа "Джарвис ты тут?"
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2F4b8ea25f0ef042cbac23e1ab53938a6b%2F5baee2408110417fbab785b0c6ffdde6?alt=media&token=a957a2b4-68ad-46de-bc3e-11943c8fb38b&apiKey=4b8ea25f0ef042cbac23e1ab53938a6b",
    );

    audio.onended = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 1000);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 1000);
      console.error("Ошибка воспроизведения аудио ответа");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 1000);
      console.error("Не удалось воспроизвести аудио ��твета:", error);
    });
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

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Используем ваш оригинальный аудиофайл Джарвиса
    const audio = new Audio(
      "https://cdn.builder.io/o/assets%2Fddde4fe5b47946c2a3bbb80e3bca0073%2F54eb93b1452742b6a1cd87cc6104bb59?alt=media&token=fc948eba-bbcd-485c-b129-d5a0c25cfc74&apiKey=ddde4fe5b47946c2a3bbb80e3bca0073",
    );
    currentAudioRef.current = audio;

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 2000);
    };

    audio.onended = resetState;
    audio.onerror = () => {
      resetState();
      console.error("Ошибка воспроизведения оригинального аудио Джарвиса");
    };

    audio.play().catch((error) => {
      resetState();
      console.error(
        "Не удалос�� воспроизвести оригинальное аудио Джарвиса:",
        error,
      );
    });
  };

  const speakSystemsOperational = async () => {
    // Множественная защита от повторного воспроизведения
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

    const resetState = () => {
      setIsSpeaking(false);
      audioPlayingRef.current = false;
      currentAudioRef.current = null;
      setTimeout(() => {
        commandCooldownRef.current = false;
        lastCommandRef.current = "";
      }, 1000);
    };

    try {
      // Используем ElevenLabs API для синтеза речи с вашим кастомным голосом
      const response = await fetch('/api/elevenlabs-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: "Все системы функционируют нормально",
          voice_id: "YyXZ45ZTmrPak6Ecz0mK"
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
      console.log("Джарвис: Все системы функционируют нормально");
    }
    if ("speechSynthesis" in window) {


      // Настройки максимально приближенные к ElevenLabs Jarvis
      // Мужской голос ИИ с глубоким, уверенным тоном, как голос из научной фантастики
      // Говорит по-русски чётко и без акцента. Подходит для ассистента наподобие Джарвиса
      // Стиль — вежливый, спокойный, слегка роботизированный, интеллектуальный

      utterance.lang = "ru-RU"; // Русский язык
      utterance.rate = 0.75; // Медленная, размеренная речь как у Джарвиса
      utterance.pitch = 0.6; // Глубокий, низкий тон для авторитетности
      utterance.volume = 0.95; // Громкость 90-100%

      // Поиск наиболее подходящего голоса для имитации Jarvis
      const voices = speechSynthesis.getVoices();

      // Приоритет: русский мужской голос с глубоким тембром
      const russianMaleVoice = voices.find(
        (voice) =>
          voice.lang.includes("ru") &&
          (voice.name.toLowerCase().includes("male") ||
            voice.name.toLowerCase().includes("мужской") ||
            voice.name.toLowerCase().includes("антон") ||
            voice.name.toLowerCase().includes("николай") ||
            voice.name.toLowerCase().includes("дмитрий") ||
            voice.name.toLowerCase().includes("павел")),
      );

      // Если не нашли ��усский мужской, ищем английский с настройками для русского
      const englishMaleVoice = voices.find(
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

      if (russianMaleVoice) {
        utterance.voice = russianMaleVoice;
        utterance.pitch = 0.6; // Глубокий тон для русского голоса
        utterance.rate = 0.75; // Спокойная речь
      } else if (englishMaleVoice) {
        utterance.voice = englishMaleVoice;
        utterance.lang = "ru-RU";
        utterance.pitch = 0.5; // Еще ниже для английского голоса на русском
        utterance.rate = 0.7; // Медленнее для лучшего произношения
      } else {
        // Fallback: любой доступный голос с оптимизированными нас��ройками
        const anyVoice = voices.find(
          (voice) => voice.lang.includes("ru") || voice.lang.includes("en"),
        );
        if (anyVoice) {
          utterance.voice = anyVoice;
          utterance.lang = "ru-RU";
        }
        utterance.pitch = 0.45; // Самый низкий тон для компенсации
        utterance.rate = 0.65; // Самая медленная речь для солидности
      }

      const resetState = () => {
        setIsSpeaking(false);
        audioPlayingRef.current = false;
        currentAudioRef.current = null;
        setTimeout(() => {
          commandCooldownRef.current = false;
          lastCommandRef.current = "";
        }, 1000);
      };

      utterance.onend = resetState;
      utterance.onerror = () => {
        resetState();
        console.error("Ошибка синтеза речи");
      };

      try {
        speechSynthesis.speak(utterance);
      } catch (error) {
        resetState();
        console.error("Не удалось синтезировать речь:", error);
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
        }, 1000);
      };

      console.log("Джарвис: Все системы функционируют нормально");
      setTimeout(resetState, 2000);
    }
  };

  const speakHowAreYou = () => {
    // Множественная защита от повторного воспроизведения
    if (isSpeaking || commandCooldownRef.current || audioPlayingRef.current) {
      return;
    }

    // Ос��анавливаем любое текущее воспроизведение
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    setIsSpeaking(true);
    commandCooldownRef.current = true;
    audioPlayingRef.current = true;

    // Используем Web Speech API для синтеза фразы "у меня все в порядке сэр"
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        "у меня все в порядке сэр",
      );

      // Настройки ��аксимально приближенные к ElevenLabs Jarvis (wDsJlOXPqcvIUKdLXjDs)
      // Stability: 20 (низкая ст��бильность для более естественной речи)
      // Similarity Boost: 90 (высокое сходство с оригинальным голосом)
      // Style: Assistant/Narration (помощник/повеств��вание)

      utterance.lang = "en-US"; // Английский для лучшего качества, потом переключим на русский
      utterance.rate = 0.75; // Медленная, размеренная речь как у Джарвиса из фильма
      utterance.pitch = 0.7; // Средне-ни��кий тон для авторитет��ости
      utterance.volume = 0.95; // Четкая, но не резкая громкость

      // Поиск наиболее подходящего голоса для имитации Jarvis
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

      // ��сли н�� нашли подходящий а��глийский, ищем русский мужской
      const russianMaleVoice = voices.find(
        (voice) =>
          voice.lang.includes("ru") &&
          (voice.name.toLowerCase().includes("male") ||
            voice.name.toLowerCase().includes("мужской") ||
            voice.name.toLowerCase().includes("антон") ||
            voice.name.toLowerCase().includes("николай")),
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
        // Fallback: любой доступный голос с оптимизированными настройками
        const anyVoice = voices.find(
          (voice) => voice.lang.includes("en") || voice.lang.includes("ru"),
        );
        if (anyVoice) {
          utterance.voice = anyVoice;
          utterance.lang = "ru-RU"; // Всегда русский язык
        }
        utterance.pitch = 0.55; // Еще ниже для компенсации
        utterance.rate = 0.7; // Е��е медленнее для большей солидности
      }

      const resetState = () => {
        setIsSpeaking(false);
        audioPlayingRef.current = false;
        currentAudioRef.current = null;
        setTimeout(() => {
          commandCooldownRef.current = false;
          lastCommandRef.current = "";
        }, 1000);
      };

      utterance.onend = resetState;
      utterance.onerror = () => {
        resetState();
        console.error("Ошибка синтеза речи");
      };

      try {
        speechSynthesis.speak(utterance);
      } catch (error) {
        resetState();
        console.error("Не удалось синтезировать речь:", error);
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
        }, 1000);
      };

      console.log("Джарвис: у меня все в порядке сэр");
      setTimeout(resetState, 2000);
    }
  };

  const processVoiceCommand = (command: string) => {
    console.log("Обрабо��ка ко��анды:", command);

    // Фил��труем пустые или слишком короткие команды
    const trimmedCommand = command.trim();
    if (trimmedCommand.length < 3) {
      return;
    }

    // Команда о��ключения (приоритетная)
    if (
      command.includes("отключись") ||
      command.includes("выключись") ||
      command.includes("отключи микрофон") ||
      command.includes("стоп джарвис") ||
      command.includes("выключи")
    ) {
      // Принудительно выполняем команду отключения независимо от состояния
      speakShutdown();
      return;
    }

    // Команда приве��ствия "Джарвис я вернулся"
    if (
      command.includes("джарвис я вернулся") ||
      command.includes("я вернулся джарвис") ||
      command.includes("джарвис я здесь") ||
      command.includes("я снова здесь")
    ) {
      speakWelcomeBack();
      return;
    }

    // Команды ��ля оригинального голоса Джарвиса (из фильма)
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

    // Команда утреннего приветствия "Доброе утр�� Джарв��с"
    if (
      command.includes("доброе утро джарвис") ||
      command.includes("джарвис доброе утро") ||
      command.includes("утро джар��ис") ||
      (command.includes("доброе утро") && command.length < 20) ||
      command.includes("good morning jarvis") ||
      (command.includes("good morning") && command.length < 20) ||
      command.includes("доброго утра")
    ) {
      // Дополнит����льная проверка, ч��обы избеж��ть повторных срабатываний
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        speakGoodMorning();
      }
      return;
    }

    // Команда приветствия "Привет Дж��рвис"
    if (
      command.includes("привет джарвис") ||
      command.includes("джарвис привет") ||
      command.includes("здравствуй джарвис") ||
      command.includes("джарвис здравствуй") ||
      command.includes("хай джарвис") ||
      command.includes("hello jarvis") ||
      command.includes("hi jarvis") ||
      command.includes("hey jarvis") ||
      (command.includes("привет") && command.includes("джарвис"))
    ) {
      // Дополнительная проверка, чтобы избежать повторных срабатываний
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        speakAuthenticJarvis();
      }
      return;
    }

    // Команда "Джарвис как дела" с ответом "Все системы функционируют нормально"
    if (
      command.includes("джарвис как дела") ||
      command.includes("как дела джарвис") ||
      (command.includes("джарвис") && command.includes("как дела"))
    ) {
      // Дополнительная проверка, ��тобы избежать повторных срабат��ваний
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        speakSystemsOperational();
      }
      return;
    }

    // Команда "Как дела" (общая, без имени Джарвис)
    if (
      command.includes("как дела") ||
      command.includes("как поживаешь джарвис") ||
      command.includes("джарвис как поживаешь") ||
      command.includes("как ты джарвис") ||
      command.includes("how are you jarvis") ||
      command.includes("jarvis how are you") ||
      command.includes("how are you") ||
      command.includes("как твои дела") ||
      command.includes("что нового джарвис")
    ) {
      // Дополнительная проверка, чтобы избежать повторных с��абатываний
      if (
        !isSpeaking &&
        !commandCooldownRef.current &&
        !audioPlayingRef.current
      ) {
        speakHowAreYou();
      }
      return;
    }

    // Команды благод��рности
    if (
      command.includes("спасибо") ||
      command.includes("благодарю") ||
      command.includes("благодарно��ть") ||
      command.includes("спс") ||
      command.includes("сенк ю") ||
      command.includes("thank you") ||
      command.includes("thanks") ||
      command.includes("мерси") ||
      command.includes("рахмат") ||
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

    // Команда проверки присутствия "Джарвис ты тут?"
    if (
      command.includes("джарвис ты тут") ||
      command.includes("ты тут джарвис") ||
      command.includes("джарвис ты здесь") ||
      command.includes("ты здесь джарвис") ||
      command.includes("джарвис на месте") ||
      command.includes("джарвис присутствуешь") ||
      command.includes("jarvis are you there") ||
      command.includes("are you there jarvis")
    ) {
      speakIAmHere();
      return;
    }

    // Проверяем, содержит л�� команда значимые слова
    const meaningfulWords = [
      "перейти",
      "войти",
      "регистрация",
      "профиль",
      "заказ",
      "корзина",
      "добавить",
      "план",
      "д��арвис",
      "базовый",
      "про",
      "макс",
      "прокрутить",
      "скролл",
      "наверх",
      "планам",
      "преимущества",
      "возможности",
      "открыть",
      "личный",
      "кабинет",
      "отправить",
      "секция",
      "спуститься",
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
      "поддержка",
      "технологии",
      "разработка",
      "сайт",
      "интеллект",
      "ии",
      "jarvis",
      "мощный",
      "уникальный",
      "качество",
      "аналитика",
      "премиум",
      "невероятное",
      "готовы",
      "создать",
      "бизнес",
      "помощник",
      "персональный",
      "отключись",
      "выключись",
      "отключи",
      "выключи",
      "стоп",
      "вернулся",
      "здесь",
      "снова",
      "спасибо",
      "благодарю",
      "благодарность",
      "спс",
      "thank",
      "thanks",
      "мерси",
      "рахмат",
      "рахмет",
      "хорошо",
      "отлично",
      "замечательно",
      "круто",
      "прекрасно",
      "чудесно",
      "добр��е",
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
      "работают",
      "дела",
      "поживаешь",
      "порядке",
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
      // Поиск по заголовкам
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

      // Поиск по id элементов
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

      // Если ничего не найдено, выполняем запасное действие
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
      command.includes("спустись к")
    ) {
      let found = false;

      // Поис�� преимущ��ств
      if (
        command.includes("преимущества") ||
        command.includes("преимущество")
      ) {
        found = searchAndNavigate([
          "преимущества",
          "преимущество",
          "advantages",
        ]);
        if (found) {
          speak("Показываю преимущества");
          return;
        }
      }

      // Поиск возможно��тей
      if (
        command.includes("возможности") ||
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

      // Поиск инфор��ации о компании
      if (
        command.includes("компан") ||
        command.includes("о нас") ||
        command.includes("кто мы")
      ) {
        found = searchAndNavigate(["компан", "о нас", "about", "кто мы"]);
        if (found) {
          speak("Показ��ваю информацию о компании");
          return;
        }
      }

      // Поиск контактов
      if (
        command.includes("контакт") ||
        command.includes("связь") ||
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
          speak("Пок����зываю контакты");
          return;
        }
      }

      // Поиск технологи��
      if (
        command.includes("технолог") ||
        command.includes("webgl") ||
        command.includes("ии") ||
        command.includes("искусственный")
      ) {
        found = searchAndNavigate([
          "технолог",
          "webgl",
          "ии",
          "искусственный",
          "ai",
          "джарвис",
          "jarvis",
        ]);
        if (found) {
          speak("Показываю технологии");
          return;
        }
      }

      // ��оиск качества и премиум услуг
      if (
        command.includes("качество") ||
        command.includes("премиум") ||
        command.includes("поддержка")
      ) {
        found = searchAndNavigate([
          "качество",
          "премиум",
          "поддержка",
          "quality",
          "support",
        ]);
        if (found) {
          speak("Показываю информацию о ка��естве");
          return;
        }
      }

      // Поиск аналитики
      if (
        command.includes("аналитик") ||
        command.includes("статистик") ||
        command.includes("да��ные")
      ) {
        found = searchAndNavigate([
          "анал��тик",
          "статистик",
          "данные",
          "analytics",
        ]);
        if (found) {
          speak("Показываю аналитику");
          return;
        }
      }

      // Если ничего специфичного не найдено, попробуем общий ��оиск
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
      command.includes("пере��ти на главную") ||
      command.includes("на главную страницу") ||
      command.includes("домо��")
    ) {
      navigate("/");
      speak("Переходим на главную страницу");
      return;
    }

    if (
      command.includes("войти") ||
      command.includes("��огин") ||
      command.includes("авторизация")
    ) {
      navigate("/login");
      speak("Откр��ваю страницу вх��да");
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
      command.includes("личный к��бинет") ||
      command.includes("открыть профиль")
    ) {
      navigate("/profile");
      speak("Открываю личный кабинет");
      return;
    }

    if (command.includes("заказ") || command.includes("оформить заказ")) {
      navigate("/order");
      speak("Переход��м к оформлению заказа");
      return;
    }

    // Команды корзины
    if (command.includes("корзина") && command.includes("очистить")) {
      clearCart();
      speak("Корзина очищена");
      return;
    }

    if (
      command.includes("открыть корзину") ||
      command.includes("показать корзину") ||
      command.includes("что в корзине")
    ) {
      // Находим и нажимаем ��нопку корзины
      const cartButton = document.querySelector(
        '[data-testid="cart-button"]',
      ) as HTMLElement;
      if (cartButton) {
        cartButton.click();
      }
      speak("Открываю корзину");
      return;
    }

    // Команды добавления планов в корзину
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
      command.includes("добавить про") ||
      command.includes("про план") ||
      command.includes("про в корзину") ||
      command.includes("отправить про")
    ) {
      onAddProPlan();
      speak("Про план добавлен");
      return;
    }

    if (
      command.includes("добавить макс") ||
      command.includes("макс план") ||
      command.includes("максимальный план") ||
      command.includes("джарвис пла��") ||
      command.includes("макс в ��орзи��у") ||
      command.includes("о��править макс")
    ) {
      onAddMaxPlan();
      speak("Максимальный пл��н добавлен");
      return;
    }

    // Расширенная навигация по секциям страницы
    if (
      command.includes("к планам") ||
      command.includes("показать планы") ||
      command.includes("перейти к планам") ||
      command.includes("спуститься к планам") ||
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
        speak("Показываю планы");
      }
      return;
    }

    if (
      command.includes("к преимуществам") ||
      command.includes("наши преимущества") ||
      command.includes("спустит��ся к преимуществам") ||
      command.includes("перейти к преимуществам") ||
      command.includes("преим��щества")
    ) {
      const found = searchAndNavigate([
        "преимущества",
        "преимущество",
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
      command.includes("перейти к возможностям") ||
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
        speak("Показываю возможности");
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
      speak("Прок��учиваю вниз");
      return;
    }

    if (
      command.includes("прокрутить вверх") ||
      command.includes("скролл вверх") ||
      command.includes("поднятьс�� вверх")
    ) {
      window.scrollBy(0, -500);
      speak("Прокручиваю вверх");
      return;
    }

    if (
      command.includes("наверх страницы") ||
      command.includes("в начало") ||
      command.includes("в самый вер��")
    ) {
      window.scrollTo(0, 0);
      speak("Перехожу в нача��о");
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
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      lastCommandRef.current = "";
      commandCooldownRef.current = false;
    } else {
      if (recognitionRef.current) {
        setTranscript("");
        lastCommandRef.current = "";
        commandCooldownRef.current = false;
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (error) {
          console.log("Распознавание уже зап��щено или недосту��но");
        }
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end space-y-2">
        {/* Transcript display */}
        {transcript && (
          <div className="max-w-xs p-3 bg-black/80 backdrop-blur-lg border border-purple-500/30 rounded-lg text-white text-sm">
            {transcript}
          </div>
        )}

        {/* Voice control button */}
        <Button
          onClick={toggleListening}
          className={`w-14 h-14 rounded-full p-0 transition-all duration-300 ${
            isListening
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-purple-600 hover:bg-purple-700"
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
          {isSpeaking ? "Говорю..." : isListening ? "Слушаю..." : "ДЖАРВИС"}
        </div>
      </div>

      {/* Pulse effect when listening */}
      {isListening && (
        <div className="absolute top-0 right-0 w-14 h-14 rounded-full bg-purple-500/30 animate-ping"></div>
      )}
    </div>
  );
}
