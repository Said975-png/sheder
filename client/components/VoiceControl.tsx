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

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            setTranscript(finalTranscript);
            processVoiceCommand(finalTranscript.toLowerCase());
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const speak = (text: string) => {
    setIsSpeaking(true);

    // Создаем и воспроизводим ваш новый аудио-файл
    const audio = new Audio("https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fdb47541068444a9093b406f29a6af3ce?alt=media&token=43fbc024-64ae-479b-8a6c-5b9d12b43294&apiKey=236158b44f8b45f680ab2467abfc361c");

    audio.onended = () => {
      setIsSpeaking(false);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      console.error("Ошибка воспроизведения аудио");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      console.error("Не удалось воспроизвести аудио:", error);
    });
  };

  const speakShutdown = () => {
    setIsSpeaking(true);

    // Создаем и воспроизводим аудио для команды "отключись"
    const audio = new Audio("https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fa7471f308f3b4a36a50440bf01707cdc?alt=media&token=9a246f92-9460-41f2-8125-eb0a7e936b47&apiKey=236158b44f8b45f680ab2467abfc361c");

    audio.onended = () => {
      setIsSpeaking(false);
      // После окончания аудио отключаем микрофон
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setTranscript("");
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      // Если ошибка с аудио, все равно отключаем микрофон
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setTranscript("");
      console.error("Ошибка воспроизведения аудио отключения");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      // Если ошибка с аудио, все равно отключаем микрофон
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setTranscript("");
      console.error("Не удалось воспроизвести аудио отключения:", error);
    });
  };

  const speakWelcomeBack = () => {
    setIsSpeaking(true);

    // Создаем и воспроизводим аудио для команды "Джарвис я вернулся"
    const audio = new Audio("https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fd8b2e931609e45c3ad40a718329bc1c4?alt=media&token=78714408-6862-47cc-a4ac-8f778b958265&apiKey=236158b44f8b45f680ab2467abfc361c");

    audio.onended = () => {
      setIsSpeaking(false);
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      console.error("Ошибка воспроизведения аудио приветствия");
    };

    audio.play().catch((error) => {
      setIsSpeaking(false);
      console.error("Не удалось воспроизвести аудио приветствия:", error);
    });
  };

  const processVoiceCommand = (command: string) => {
    console.log("Обработка команды:", command);

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

    // Проверяем, содержит ли команда значимые слова
    const meaningfulWords = [
      "перейти", "войти", "регистрация", "профиль", "заказ", "корзина", "добавить", "план", "джарвис",
      "базовый", "про", "макс", "прокрутить", "скролл", "наверх", "планам", "пре��мущества", "возможности",
      "открыть", "личный", "кабинет", "отправить", "секция", "спуститься", "перейти", "покажи", "найди",
      "где", "что", "как", "цена", "стоимость", "тариф", "услуги", "компания", "контакты", "поддержка",
      "технологии", "разработка", "сайт", "интеллект", "ии", "jarvis", "мощный", "уникальный", "качество",
      "аналитика", "премиум", "невероятное", "готовы", "создать", "бизнес", "помощник", "персональный",
      "отключись", "выключись", "отключи", "выключи", "стоп"
    ];
    const hasValidWords = meaningfulWords.some(word => trimmedCommand.includes(word));

    if (!hasValidWords) {
      return;
    }

    // Умный поиск контента по всему сайту
    const searchAndNavigate = (searchTerms: string[], fallbackAction?: () => void) => {
      // Поиск по заголовкам
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      for (const heading of headings) {
        const headingText = heading.textContent?.toLowerCase() || '';
        if (searchTerms.some(term => headingText.includes(term))) {
          heading.scrollIntoView({ behavior: "smooth" });
          return true;
        }
      }

      // Поиск по data-section атрибутам
      const sections = Array.from(document.querySelectorAll('[data-section]'));
      for (const section of sections) {
        const sectionName = section.getAttribute('data-section')?.toLowerCase() || '';
        if (searchTerms.some(term => sectionName.includes(term))) {
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
      const allElements = Array.from(document.querySelectorAll('p, div, span, li'));
      for (const element of allElements) {
        const elementText = element.textContent?.toLowerCase() || '';
        if (searchTerms.some(term => elementText.includes(term)) && element.offsetParent !== null) {
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

      // Поиск преимуществ
      if (command.includes("преимущества") || command.includes("преимущество")) {
        found = searchAndNavigate(["преимущества", "преимущество", "advantages"]);
        if (found) {
          speak("Показываю преимущества");
          return;
        }
      }

      // Поиск возможностей
      if (command.includes("возможности") || command.includes("возможность") || command.includes("мощные")) {
        found = searchAndNavigate(["возмож��ости", "мощные", "features"]);
        if (found) {
          speak("Показываю возможности");
          return;
        }
      }

      // Поиск планов и тарифов
      if (command.includes("план") || command.includes("тариф") || command.includes("цен") || command.includes("стоимость")) {
        found = searchAndNavigate(["план", "тариф", "цен", "pricing"], () => {
          const pricingSection = document.querySelector('[data-section="pricing"]');
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
      if (command.includes("компан") || command.includes("о нас") || command.includes("кто мы")) {
        found = searchAndNavigate(["компан", "о нас", "about", "кто мы"]);
        if (found) {
          speak("Показываю информацию о компании");
          return;
        }
      }

      // Поиск контактов
      if (command.includes("контакт") || command.includes("связь") || command.includes("телефон") || command.includes("email")) {
        found = searchAndNavigate(["контакт", "связь", "телефон", "email", "contact"]);
        if (found) {
          speak("Показываю контакты");
          return;
        }
      }

      // Поиск технологий
      if (command.includes("технолог") || command.includes("webgl") || command.includes("ии") || command.includes("искусственный")) {
        found = searchAndNavigate(["технолог", "webgl", "ии", "искусственный", "ai", "джарвис", "jarvis"]);
        if (found) {
          speak("Показываю технологии");
          return;
        }
      }

      // Поиск качества и премиум услуг
      if (command.includes("качество") || command.includes("премиум") || command.includes("поддержка")) {
        found = searchAndNavigate(["качество", "премиум", "поддержка", "quality", "support"]);
        if (found) {
          speak("Показываю информацию о качестве");
          return;
        }
      }

      // Поиск анал��тики
      if (command.includes("аналитик") || command.includes("статистик") || command.includes("данные")) {
        found = searchAndNavigate(["аналитик", "статистик", "данные", "analytics"]);
        if (found) {
          speak("Показываю аналитику");
          return;
        }
      }

      // Если ничего специфичного не найдено, попробуем общий поиск
      if (!found) {
        const searchTerms = command.split(' ').filter(word => word.length > 2);
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
      command.includes("домой")
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
      speak("Открываю страницу входа");
      return;
    }

    if (
      command.includes("регистрация") ||
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
      // Находим и нажимаем кнопку корзины
      const cartButton = document.querySelector('[data-testid="cart-button"]') as HTMLElement;
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
      speak("Базовый план добавлен");
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
      command.includes("макс в корзину") ||
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
      const found = searchAndNavigate(["план", "тариф", "цен", "pricing", "стоимость"], () => {
        const pricingSection = document.querySelector('[data-section="pricing"]');
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: "smooth" });
        }
      });
      if (found) {
        speak("Показываю планы");
      }
      return;
    }

    if (
      command.includes("к преимуществам") ||
      command.includes("наши преимущества") ||
      command.includes("спуститься к преимуществам") ||
      command.includes("перейти к преимуществам") ||
      command.includes("преимущества")
    ) {
      const found = searchAndNavigate(["преимущества", "преимущество", "advantages"]);
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
      const found = searchAndNavigate(["возможности", "мощные", "features"], () => {
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
          featuresSection.scrollIntoView({ behavior: "smooth" });
        }
      });
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
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        setTranscript("");
        recognitionRef.current.start();
        setIsListening(true);
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
