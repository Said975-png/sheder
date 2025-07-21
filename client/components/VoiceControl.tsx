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
          // Автоматически перезапускаем распознавание, если мы все еще слушаем
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
                  console.log("Перезапуск после ошибки");
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
      console.error("Ошибка воспроизведения ау��ио");
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
    // Останавливаем любое текущее воспроизведение
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
      // После окончани�� аудио отключаем микрофон
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

    // Создаем и воспроизводим ауд��о для утреннего приветствия
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

    // Останавливаем любое текущее воспроизведение
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
      console.error("Не удалось воспроизвести оригинальное аудио Джарвиса:", error);
    });
  };

  const speakHowAreYou = () => {
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

    // Используем тот же аудиофайл для ответа на "как дела" (можно заменить на специальный ответ)
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
      console.error("Ошибка воспроизведения ответа на 'как дела'");
    };

    audio.play().catch((error) => {
      resetState();
      console.error("Не удалось воспроизвести ответ на 'как дела':", error);
    });
  };

  const processVoiceCommand = (command: string) => {
    console.log("Обрабо��ка ко��анды:", command);

    // Фильтруем пустые или слишком короткие команды
    const trimmedCommand = command.trim();
    if (trimmedCommand.length < 3) {
      return;
    }

    // Команда отключения (приоритетная)
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

    // Команда приветствия "Джарвис я вернулся"
    if (
      command.includes("джарвис я вернулся") ||
      command.includes("я вернулся джарвис") ||
      command.includes("джарвис я здесь") ||
      command.includes("я снова здесь")
    ) {
      speakWelcomeBack();
      return;
    }

    // Команды для оригинального голоса Джарвиса (из фильма)
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
      command.includes("джарвис из железного человека") ||
      command.includes("голос джарвиса") ||
      command.includes("оригинал") ||
      command.includes("как в марвел")
    ) {
      if (!isSpeaking && !commandCooldownRef.current && !audioPlayingRef.current) {
        speakAuthenticJarvis();
      }
      return;
    }

    // Команда утреннего приветствия "Доброе утр�� Джарвис"
    if (
      command.includes("доброе утро джарвис") ||
      command.includes("джарвис доброе утро") ||
      command.includes("утро джарвис") ||
      (command.includes("доброе утро") && command.length < 20) ||
      command.includes("good morning jarvis") ||
      (command.includes("good morning") && command.length < 20) ||
      command.includes("доброго утра")
    ) {
      // Дополнит��льная проверка, чтобы избеж��ть повторных срабатываний
      if (!isSpeaking && !commandCooldownRef.current && !audioPlayingRef.current) {
        speakGoodMorning();
      }
      return;
    }

    // Команда приветствия "Привет Джарвис"
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
      // Дополнительная проверка, чтобы избежать повторных ср��батываний
      if (!isSpeaking && !commandCooldownRef.current && !audioPlayingRef.current) {
        speakAuthenticJarvis();
      }
      return;
    }

    // Команды благодарности
    if (
      command.includes("спасибо") ||
      command.includes("благодарю") ||
      command.includes("благодарность") ||
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

    // Проверяем, содержит ли команда значимые слова
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

      // Поис�� преимуществ
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

      // Поиск возможностей
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

      // Поиск информации о компании
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
          speak("Пок��зываю контакты");
          return;
        }
      }

      // Поиск технологий
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

      // Поиск качества и премиум услуг
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
          speak("Показываю информацию о качестве");
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
          "аналитик",
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
      command.includes("перейти на главную") ||
      command.includes("на главную страницу") ||
      command.includes("домо��")
    ) {
      navigate("/");
      speak("Переходим на главную страницу");
      return;
    }

    if (
      command.includes("войти") ||
      command.includes("логин") ||
      command.includes("авторизация")
    ) {
      navigate("/login");
      speak("Открываю страницу вх��да");
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
      command.includes("личный кабинет") ||
      command.includes("открыть профиль")
    ) {
      navigate("/profile");
      speak("Открываю личный кабинет");
      return;
    }

    if (command.includes("заказ") || command.includes("оформить заказ")) {
      navigate("/order");
      speak("Переходим к оформлению заказа");
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
      command.includes("джарвис план") ||
      command.includes("макс в ��орзину") ||
      command.includes("отправить макс")
    ) {
      onAddMaxPlan();
      speak("Максимальный план добавлен");
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
        ["план", "тариф", "цен", "pricing", "стоимость"],
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
        speak("Показываю преимущества");
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
      command.includes("скролл вни��") ||
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
      command.includes("наверх страницы") ||
      command.includes("в начало") ||
      command.includes("в самый верх")
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
          console.log("Распознавание уже запущено или недоступно");
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
