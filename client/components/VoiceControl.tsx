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
    
    // Создаем и воспроизводим ваш аудио-файл
    const audio = new Audio("https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2F866a5966692d4b478ca44624c6e615af?alt=media&token=78fdbae1-412f-4acd-845f-987732b53098&apiKey=236158b44f8b45f680ab2467abfc361c");
    
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

  const processVoiceCommand = (command: string) => {
    console.log("Обработка команды:", command);

    // Фильтруем пустые или слишком короткие команды
    const trimmedCommand = command.trim();
    if (trimmedCommand.length < 3) {
      return; // Не обрабатываем слишком короткие ��оманды
    }

    // Проверяем, содержит ли команда значимые слова
    const meaningfulWords = ["перейти", "войти", "регистрация", "профиль", "заказ", "корзина", "добавить", "план", "джарвис", "помощь", "команды", "расскажи", "тарифы", "привет", "здравствуй", "прокрутить", "скролл", "наверх", "планам", "что", "как", "где"];
    const hasValidWords = meaningfulWords.some(word => trimmedCommand.includes(word));
    
    if (!hasValidWords) {
      return; // Не обрабатываем команды без значимых слов
    }

    // Команды навигации
    if (
      command.includes("перейти на главную") ||
      command.includes("на главную страницу") ||
      command.includes("домой")
    ) {
      navigate("/");
      speak("Переходим на главную страницу.");
      return;
    }

    if (
      command.includes("войти") ||
      command.includes("логин") ||
      command.includes("авторизация")
    ) {
      navigate("/login");
      speak("Открываю страницу входа в систему.");
      return;
    }

    if (
      command.includes("регистрация") ||
      command.includes("зарегистрироваться")
    ) {
      navigate("/signup");
      speak("Переходим к регистрации нового пользователя.");
      return;
    }

    if (command.includes("профиль") || command.includes("мой профиль")) {
      navigate("/profile");
      speak("Открываю настройки вашего профиля.");
      return;
    }

    if (command.includes("заказ") || command.includes("оформить заказ")) {
      navigate("/order");
      speak("Переходим к оформлению заказа.");
      return;
    }

    // Команды корзины
    if (command.includes("корзина") && command.includes("очистить")) {
      clearCart();
      speak("Корзина очищена.");
      return;
    }

    if (
      command.includes("что в корзине") ||
      command.includes("показать корзину")
    ) {
      const itemsCount = getTotalItems();
      if (itemsCount === 0) {
        speak("Ваша корзина пуста.");
      } else {
        speak(`В корзине ${itemsCount} товаров.`);
      }
      return;
    }

    // Команды добавления планов
    if (
      command.includes("добавить базовый") ||
      command.includes("базовый план") ||
      command.includes("basic план")
    ) {
      onAddBasicPlan();
      speak("Базовый план добавлен в корзину.");
      return;
    }

    if (
      command.includes("добавить про") ||
      command.includes("про план") ||
      command.includes("pro план")
    ) {
      onAddProPlan();
      speak("Про план с искусственным интеллектом добавлен в корзину.");
      return;
    }

    if (
      command.includes("добавить макс") ||
      command.includes("макс план") ||
      command.includes("max план") ||
      command.includes("джарвис")
    ) {
      onAddMaxPlan();
      speak("Максимальный план с Джарвисом добавлен в корзину.");
      return;
    }

    // Информационные команды
    if (
      command.includes("что ты умеешь") ||
      command.includes("помощь") ||
      command.includes("команды")
    ) {
      speak(
        "Я умею навигировать по сайту, управлять корзиной, добавлять планы и контролировать функции сайта. Просто дайте мне команду.",
      );
      return;
    }

    if (
      command.includes("расскажи о планах") ||
      command.includes("какие планы") ||
      command.includes("тарифы")
    ) {
      speak(
        "У нас есть три плана: Базовый за 2 миллиона сум, Про с ИИ за 3.5 миллиона, и Максимальный с Джарвисом за 5 миллионов сум.",
      );
      return;
    }

    if (command.includes("привет") || command.includes("здравствуй")) {
      speak(
        "Добро пожаловать! Я Джарвис, ваш персональный ИИ-помощник. Чем могу помочь?",
      );
      return;
    }

    // Прокрутка страницы
    if (
      command.includes("прокрутить вниз") ||
      command.includes("скролл вниз")
    ) {
      window.scrollBy(0, 500);
      speak("Прокручиваю страницу вниз.");
      return;
    }

    if (
      command.includes("прокрутить вверх") ||
      command.includes("скролл вверх")
    ) {
      window.scrollBy(0, -500);
      speak("Прокручиваю страницу вверх.");
      return;
    }

    if (command.includes("наверх страницы") || command.includes("в начало")) {
      window.scrollTo(0, 0);
      speak("Возвращаемся в начало страницы.");
      return;
    }

    if (command.includes("к планам") || command.includes("показать планы")) {
      const pricingSection = document.querySelector('[data-section="pricing"]');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: "smooth" });
        speak("Показываю тарифные планы.");
      }
      return;
    }

    // Если команда не распознана
    speak("Извините, я не понял команду. Попробуйте переформулировать.");
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
