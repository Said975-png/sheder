import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastCommandRef = useRef<string>("");
  const commandTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingAudioRef = useRef<boolean>(false);
  const navigate = useNavigate();
  const { getTotalItems, clearCart } = useCart();

  // Инициализация распознавания речи
  const initializeRecognition = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.error("Распознавание речи не поддерживается");
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "ru-RU";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("🎤 Ми��рофон активирован");
      setIsListening(true);
      onListeningChange?.(true, "");
    };

    recognition.onresult = (event) => {
      // БЛОКИРОВКА: Игнорируем все результаты во время вос��роизведения аудио
      if (isPlayingAudioRef.current || isSpeaking) {
        console.log("🚫 Игнорируем результат распознавания - играет аудио");
        return;
      }

      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += result;
        } else {
          interimTranscript += result;
        }
      }

      const combinedTranscript = (finalTranscript + interimTranscript).trim();

      if (combinedTranscript.length >= 2) {
        setTranscript(combinedTranscript);
        // Не вызываем onListeningChange для промежуточных результатов чтобы избежать мигания
      }

      // Обрабатываем только финальные рез��льтаты
      if (finalTranscript.trim()) {
        const command = finalTranscript.trim().toLowerCase();
        console.log("📝 Финальна�� команда:", command);

        // Проверяем не повторяется ли команда (только в течение короткого времени)
        if (command === lastCommandRef.current) {
          console.log("⏭��� Пропускаем повторную команду:", command);
          return;
        }

        // Запоминаем команду на короткое время для предотвр��щения дублей
        lastCommandRef.current = command;

        // Очищаем транскрипт
        setTimeout(() => {
          setTranscript("");
          // Не выз��ваем onListeningChange при очистке что��ы избежать мигания
        }, 500);

        // Обрабатываем команду
        processVoiceCommand(command);

        // Очищаем команду через короткое время чтобы можно было ска��ать новую
        setTimeout(() => {
          lastCommandRef.current = "";
          console.log("🧹 Команда очищена, можно говорить новую");
        }, 1000); // Очищаем через 1 секун��у вместо 2
      }
    };

    recognition.onerror = (event) => {
      console.log("❌ Ошибка распознавания:", event.error);
      
      if (event.error === "not-allowed") {
        console.error("🚫 Доступ к микрофону запрещен");
        setIsListening(false);
        onListeningChange?.(false, "");
      }
    };

    recognition.onend = () => {
      console.log("🔄 Распознавание завершилось");
      
      // Перезапу��каем автоматически есл�� слушаем
      if (isListening && !isSpeaking) {
        setTimeout(() => {
          if (isListening && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.log("ℹ️ Пере��апуск через секунду");
              setTimeout(() => {
                if (isListening && recognitionRef.current) {
                  try {
                    recognitionRef.current.start();
                  } catch (e) {
                    console.log("❌ Не удалось п��резапустить");
                  }
                }
              }, 1000);
            }
          }
        }, 100);
      }
    };

    return recognition;
  }, [isListening, isSpeaking, onListeningChange]);

  // Обработка голосовы�� команд
  const processVoiceCommand = useCallback((command: string) => {
    console.log("🎯 Обрабатываем команду:", command);

    // Команды отключения им��ют приоритет
    if (command.includes("отключись") || command.includes("выключись")) {
      console.log("🔴 Команда отключения");
      speakShutdown();
      return;
    }

    // Ос��альные команды
    if (command.includes("джарвис") || command.includes("jarvis")) {
      if (command.includes("я вернулся") || command.includes("привет")) {
        speakWelcomeBack();
      } else if (command.includes("полный доступ")) {
        speakFullAccess();
      } else if (command.includes("ты тут")) {
        speakIAmHere();
      } else {
        speakAuthenticJarvis();
      }
    } else if (command.includes("спасибо") || command.includes("б��агодарю")) {
      speakThankYou();
    } else if (command.includes("доброе у��ро")) {
      speakGoodMorning();
    } else if (command.includes("как дела")) {
      speakHowAreYou();
    } else if (command.includes("покрути модель") || command.includes("поверни модель")) {
      speakRotateModel();
    } else if (command.includes("хватит") || command.includes("останови")) {
      speakStopModel();
    } else if (command.includes("диагностика") || command.includes("проверка")) {
      speakSystemDiagnostics();
    } else if (command.includes("продолжим") || command.includes("давай")) {
      speakContinue();
    } else if (command.includes("верно") || command.includes("прав��льно")) {
      speakCorrect();
    } else if (command.includes("базовый") || command.includes("basic")) {
      onAddBasicPlan();
      speak();
    } else if (command.includes("про") || command.includes("п���офессиональный")) {
      onAddProPlan();
      speak();
    } else if (command.includes("макс") || command.includes("мак��имальный")) {
      onAddMaxPlan();
      speak();
    } else {
      // Д��я неизвестны�� команд просто подтверждаем
      speak();
    }
  }, [onAddBasicPlan, onAddProPlan, onAddMaxPlan, onModelRotateStart, onModelRotateStop]);

  // Перек��ючение прослушивания
  const toggleListening = useCallback(() => {
    if (isListening) {
      // Останавливаем
      setIsListening(false);
      onListeningChange?.(false, "");
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log("ℹ️ Ошибка остановки:", error);
        }
      }
      
      setTranscript("");
      // Очищаем команду при остановке
      lastCommandRef.current = "";
    } else {
      // Запускаем
      // Очищаем команду при з��пуске для свежего старта
      lastCommandRef.current = "";

      if (!recognitionRef.current) {
        recognitionRef.current = initializeRecognition();
      }
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error("❌ Не удалось запустить распознавание:", error);
        }
      }
    }
  }, [isListening, onListeningChange, initializeRecognition]);

  // Испра��ленная функция воспроизведения ауди��
  const playAudio = useCallback((url: string, onComplete?: () => void) => {
    // З��щит�� от множественного воспроизведения
    if (isSpeaking) {
      console.log("⏸️ Аудио уже ��оспроизводится, пропускаем");
      return;
    }

    // Без��пасно останавливаем предыдущее аудио
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      } catch (error) {
        console.log("ℹ️ Ошибка остановки предыдущего аудио:", error);
      }
    }

    setIsSpeaking(true);

    // КРИТИЧЕСКАЯ БЛОКИРОВКА: Устанавливаем флаг перед любыми другими действиями
    isPlayingAudioRef.current = true;
    console.log("🚫 БЛОКИРОВКА: Все результаты распознавания будут игнорироваться");

    // Останавливаем распознавание речи во время воспроизведения чтобы микрофон не записывал аудио
    const wasListening = isListening;
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        console.log("🔇 Микрофон временно отключен во время аудио");
      } catch (error) {
        console.log("ℹ️ Ошибка остановки распознавания для аудио:", error);
      }
    }

    // Очищаем предыдущую команду чтобы можно было говорить новую во время воспроизведения
    lastCommandRef.current = "";
    console.log("🧹 Команда очищена при начале аудио");

    // Небольшая задержка для полной очистки предыдущего аудио
    setTimeout(() => {
      // Запоминаем состояние слушания для использования в обработчиках
      const wasListeningAtStart = wasListening;
      const audio = new Audio(url);
      currentAudioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        currentAudioRef.current = null;

        // СНИМАЕМ БЛОКИРОВКУ: Полная очистка состояния перед разрешением о��работки
        setTimeout(() => {
          // Полностью очищаем все старые коман��ы и состояния
          lastCommandRef.current = "";
          setTranscript("");

          // Снимаем блокировку
          isPlayingAudioRef.current = false;
          console.log("✅ БЛОК��РОВКА СНЯТА + СОСТОЯНИЕ ОЧИЩЕНО: Готов к новым ко��а��дам");
        }, 1000); // Увеличиваем задержку для полной уверенности

        // Возобновляем распознавание речи если оно было активно
        if (wasListeningAtStart && !recognitionRef.current) {
          console.log("🔊 Возобновляем микрофон после аудио");
          setTimeout(() => {
            // РАДИКАЛЬНАЯ ОЧИСТКА: Полностью уничтожаем старый recognition объект
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
                recognitionRef.current = null;
              } catch (error) {
                console.log("ℹ️ Ошибка уничтожения старого recognition:", error);
              }
            }

            // Полная очистка всех состояний
            lastCommandRef.current = "";
            setTranscript("");
            console.log("🔥 РАДИКАЛЬНАЯ ОЧИСТКА: Уничтожен старый recognition, создаем новый");

            // Создаем СОВЕРШ��ННО НОВЫЙ recognition объект
            recognitionRef.current = initializeRecognition();
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
                console.log("✅ Новый чистый recognition запущен");
              } catch (error) {
                console.log("ℹ️ Ошибка запуска нового recognition:", error);
              }
            }
          }, 1200); // Увеличиваем задержку чтобы сначала сняли блокировку
        }

        onComplete?.();
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        currentAudioRef.current = null;

        // СНИМ��ЕМ БЛОКИРОВКУ при ошибке + полная очистка
        lastCommandRef.current = "";
        setTranscript("");
        isPlayingAudioRef.current = false;
        console.log("✅ БЛОКИРОВКА СНЯТА + СОСТОЯНИЕ ОЧИЩЕНО после ошибки аудио");

        // РАДИКАЛЬНОЕ возобновление при ошибке аудио
        if (wasListeningAtStart) {
          console.log("🔊 РАДИКАЛЬНОЕ восстановление микрофона посл�� ошибки аудио");
          setTimeout(() => {
            // Уничтожаем любой существующий recognition
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
                recognitionRef.current = null;
              } catch (error) {
                console.log("ℹ️ Ошибка уничтожения recognition при ошибке:", error);
              }
            }

            // Создаем новый чистый recognition
            recognitionRef.current = initializeRecognition();
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
                console.log("✅ Новый чистый recognition создан после ошибки");
              } catch (error) {
                console.log("ℹ️ Ошибка запуска нового recognition после ошибки:", error);
              }
            }
          }, 500);
        }

        console.error("❌ Ошибка воспроизведения аудио");
      };

      // Проверяем что элемент еще актуален перед воспроизве��ением
      if (currentAudioRef.current === audio) {
        audio.play().catch((error) => {
          setIsSpeaking(false);
          currentAudioRef.current = null;

          // СНИМАЕМ БЛОКИРОВКУ при неудачном воспроизведении + полная очистка
          lastCommandRef.current = "";
          setTranscript("");
          isPlayingAudioRef.current = false;
          console.log("✅ БЛОКИРОВКА СНЯТА + СОСТОЯНИЕ ОЧИЩЕНО после неудачного воспроизведения");

          // РАДИКАЛЬНОЕ возобновление при неудачном воспроизведении
          if (wasListeningAtStart) {
            console.log("🔊 РАДИКАЛЬНОЕ восстановление микрофона после неудачного воспроизведения");
            setTimeout(() => {
              // Уничтожаем любой существующи�� recognition
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.stop();
                  recognitionRef.current = null;
                } catch (error) {
                  console.log("ℹ️ Ошибка уничтожения recognition при неудачном воспроизведении:", error);
                }
              }

              // Создаем новый чистый recognition
              recognitionRef.current = initializeRecognition();
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                  console.log("✅ Новый чистый recognition создан после неудачного воспроизведения");
                } catch (error) {
                  console.log("ℹ️ Ошибка запуска нового recognition после неудачного воспроизведения:", error);
                }
              }
            }, 500);
          }

          console.error("❌ Не удалось воспроизвести аудио:", error);
        });
      }
    }, 50); // Короткая задержка в 50мс
  }, [isSpeaking]);

  const speak = () => {
    playAudio("https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fdb47541068444a9093b406f29a6af3ce?alt=media&token=43fbc024-64ae-479b-8a6c-5b9d12b43294&apiKey=236158b44f8b45f680ab2467abfc361c");
  };

  const speakShutdown = () => {
    console.log("🔴 Выполняем отключение");
    
    // Сначала отключаем прослушива��ие
    setIsListening(false);
    onListeningChange?.(false, "");
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("ℹ️ Ошибка остановки при отключении:", error);
      }
    }

    // Очищаем команду при отключени��
    lastCommandRef.current = "";
    console.log("🧹 Команда оч��щена при отключении");

    // Воспроизводим аудио отключения
    playAudio("https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fa7471f308f3b4a36a50440bf01707cdc?alt=media&token=9a246f92-9460-41f2-8125-eb0a7e936b47&apiKey=236158b44f8b45f680ab2467abfc361c");
  };

  const speakWelcomeBack = () => {
    playAudio("https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fd8b2e931609e45c3ad40a718329bc1c4?alt=media&token=78714408-6862-47cc-a4ac-8f778b958265&apiKey=236158b44f8b45f680ab2467abfc361c");
  };

  const speakFullAccess = () => {
    playAudio("https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fd8b2e931609e45c3ad40a718329bc1c4?alt=media&token=78714408-6862-47cc-a4ac-8f778b958265&apiKey=236158b44f8b45f680ab2467abfc361c");
  };

  const speakIAmHere = () => {
    playAudio("https://cdn.builder.io/o/assets%2F4b8ea25f0ef042cbac23e1ab53938a6b%2F5baee2408110417fbab785b0c6ffdde6?alt=media&token=a957a2b4-68ad-46de-bc3e-11943c8fb38b&apiKey=4b8ea25f0ef042cbac23e1ab53938a6b");
  };

  const speakThankYou = () => {
    playAudio("https://cdn.builder.io/o/assets%2F4b8ea25f0ef042cbac23e1ab53938a6b%2Fafb1b8a7fc8645a7ab1e8513e8c1faa7?alt=media&token=be057092-6988-45dd-94dc-90427146589d&apiKey=4b8ea25f0ef042cbac23e1ab53938a6b");
  };

  const speakGoodMorning = () => {
    playAudio("https://cdn.builder.io/o/assets%2F4b8ea25f0ef042cbac23e1ab53938a6b%2F501f46b9470c453e8a6730b05b556d76?alt=media&token=7933c53d-1d4b-4bbe-9be8-d74322cb2e84&apiKey=4b8ea25f0ef042cbac23e1ab53938a6b");
  };

  const speakHowAreYou = () => {
    if ("speechSynthesis" in window) {
      // Останав��иваем распознавание речи во время TTS
      const wasListening = isListening;
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
          console.log("🔇 Микрофон в��еменно отключен во время TTS");
        } catch (error) {
          console.log("ℹ️ Ошибка останов��и распознавания для TTS:", error);
        }
      }

      const utterance = new SpeechSynthesisUtterance("у меня все в порядке сэр");
      utterance.lang = "ru-RU";
      utterance.rate = 0.75;
      utterance.pitch = 0.7;
      utterance.volume = 0.95;

      setIsSpeaking(true);

      // КРИТИЧЕСКАЯ БЛОКИРОВКА для TTS
      isPlayingAudioRef.current = true;
      console.log("🚫 БЛОКИРОВКА TTS: Все результаты распознавания будут игнорироваться");

      utterance.onend = () => {
        setIsSpeaking(false);

        // СНИМАЕМ БЛОКИРОВК�� после TTS + полная очистка
        setTimeout(() => {
          // Полностью очищаем все старые команды и сос��ояния для TTS
          lastCommandRef.current = "";
          setTranscript("");

          isPlayingAudioRef.current = false;
          console.log("✅ БЛОКИРОВКА TTS СНЯТА + СОСТОЯНИЕ ОЧИЩЕНО: Готов к новым командам");
        }, 1000);

        // РАДИКАЛЬНОЕ возобновление после TTS
        if (wasListening) {
          console.log("🔊 РАДИКАЛЬНОЕ восстановление микрофона после TTS");
          setTimeout(() => {
            // Уничтожаем любой существующий recognition
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
                recognitionRef.current = null;
              } catch (error) {
                console.log("ℹ️ Ошибка уничтожения recognition после TTS:", error);
              }
            }

            // Создаем новый чистый recognition
            recognitionRef.current = initializeRecognition();
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.log("ℹ️ Ошибка возобновления распознавания после TTS:", error);
              }
            }
          }, 500);
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);

        // СНИМАЕ�� БЛОКИРОВКУ при ошибке TTS + полная очистка
        lastCommandRef.current = "";
        setTranscript("");
        isPlayingAudioRef.current = false;
        console.log("✅ БЛОКИРОВКА TTS СНЯТА + СОСТОЯНИЕ ОЧИЩЕНО после ошибки");

        // Возобновляем распознавание речи при ошибке TTS
        if (wasListening && !recognitionRef.current) {
          console.log("🔊 Возобно��ляем микрофон после ошибки TTS");
          setTimeout(() => {
            if (!recognitionRef.current) {
              recognitionRef.current = initializeRecognition();
            }
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.log("ℹ️ Ошибка возобновления распознавани�� после ошибки TTS:", error);
              }
            }
          }, 500);
        }
      };

      speechSynthesis.speak(utterance);
    }
  };

  const speakAuthenticJarvis = () => {
    playAudio("https://cdn.builder.io/o/assets%2Fddde4fe5b47946c2a3bbb80e3bca0073%2F54eb93b1452742b6a1cd87cc6104bb59?alt=media&token=fc948eba-bbcd-485c-b129-d5a0c25cfc74&apiKey=ddde4fe5b47946c2a3bbb80e3bca0073");
  };

  const speakRotateModel = () => {
    onModelRotateStart?.();
    playAudio("https://cdn.builder.io/o/assets%2F28664c445c564f3b84784ae20e29b5c6%2F3e5bf796358f469d8d209d10e88df9a2?alt=media&token=9a768fb8-b835-43b4-aa44-72650861fdf5&apiKey=28664c445c564f3b84784ae20e29b5c6");
  };

  const speakStopModel = () => {
    onModelRotateStop?.();
    playAudio("https://cdn.builder.io/o/assets%2F28664c445c564f3b84784ae20e29b5c6%2F66456b8b01d0421188b26fac843a5d29?alt=media&token=6ba25f9a-cdbf-48ab-98f4-da121a81fd2e&apiKey=28664c445c564f3b84784ae20e29b5c6");
  };

  const speakSystemDiagnostics = () => {
    playAudio("https://cdn.builder.io/o/assets%2Ff623eb4c005f4a40a75c4b9a0beb1b76%2Fe84cbc4e1b6d4e408263b15a7e68cd11?alt=media&token=db88c399-0c44-4b82-a1eb-251e7fb476b3&apiKey=f623eb4c005f4a40a75c4b9a0beb1b76", () => {
      // Вос��роизводим второе аудио через 2 секунды
      setTimeout(() => {
        playAudio("https://cdn.builder.io/o/assets%2Ff623eb4c005f4a40a75c4b9a0beb1b76%2Ff74fdea7f34b4c2fa5df3d62bd9efe29?alt=media&token=80cd6e08-efaa-4afd-b3aa-66aa3f68623c&apiKey=f623eb4c005f4a40a75c4b9a0beb1b76");
      }, 2000);
    });
  };

  const speakContinue = () => {
    playAudio("https://cdn.builder.io/o/assets%2F6b72a929cd24415c8486df051bbaa5a2%2F35be1bb3c0f84dab8d368ae39c4dde3c?alt=media&token=39b27ede-43e5-43ac-8175-031ef131c2ef&apiKey=6b72a929cd24415c8486df051bbaa5a2");
  };

  const speakCorrect = () => {
    playAudio("https://cdn.builder.io/o/assets%2F6b72a929cd24415c8486df051bbaa5a2%2F3f0d27eed6164908bd9b24c2c5bc67e1?alt=media&token=5fa73b0b-df79-4f5a-b12c-4d182e8ed23f&apiKey=6b72a929cd24415c8486df051bbaa5a2");
  };

  // Принудительная остановка
  useEffect(() => {
    if (forceStop && isListening) {
      setIsListening(false);
      onListeningChange?.(false, "");
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log("ℹ️ Ошибка принудительной остановки:", error);
        }
      }
      
      setTranscript("");
    }
  }, [forceStop, isListening, onListeningChange]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log("ℹ️ Ошибка очистки:", error);
        }
      }
      
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }

      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }

      // Сбрасываем флаг блокировки при размонтировании
      isPlayingAudioRef.current = false;
    };
  }, []);

  // Автоматическая очистка зависших состояний
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // Если говорим, но нет активного аудио
      if (isSpeaking && !currentAudioRef.current && !speechSynthesis.speaking) {
        console.log("🧹 Очистка зависшего состояния речи");
        setIsSpeaking(false);
        isPlayingAudioRef.current = false; // Сбрасываем блокировку при очистке
      }
    }, 2000);

    return () => clearInterval(cleanupInterval);
  }, [isSpeaking]);

  if (inNavbar) {
    return (
      <Button
        onClick={toggleListening}
        variant="outline"
        size="sm"
        className={`relative ${
          isListening
            ? "bg-red-500/20 border-red-500/50 text-red-400"
            : "border-slate-600/50 bg-slate-800/50 text-slate-300"
        } hover:bg-slate-700/50 transition-colors`}
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        {transcript && (
          <span className="absolute -top-8 left-0 text-xs bg-slate-800 px-2 py-1 rounded">
            {transcript}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-center gap-2">
        {transcript && (
          <div className="bg-slate-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm max-w-xs">
            {transcript}
          </div>
        )}
        
        <Button
          onClick={toggleListening}
          size="lg"
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-200 ${
            isListening
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>
        
        {isSpeaking && (
          <div className="flex items-center gap-1">
            <Volume2 className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400">Говорю...</span>
          </div>
        )}
      </div>
    </div>
  );
}
