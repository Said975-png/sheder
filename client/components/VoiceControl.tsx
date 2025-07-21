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
    const audio = new Audio("https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2F082a96935ef2407b89d85335af83e973?alt=media&token=35e77ac0-b617-4ac6-8e96-3083b18e620b&apiKey=236158b44f8b45f680ab2467abfc361c");

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
      return;
    }

    // Проверяем, содержит ли команда значимые слова
    const meaningfulWords = ["перейти", "войти", "регистрация", "профиль", "заказ", "корзина", "добавить", "план", "джарвис", "базовый", "про", "макс", "прокрутить", "скролл", "наверх", "планам", "преимущества", "возможности", "открыть", "личный", "кабинет", "отправить", "секция", "спуститься", "перейти"];
    const hasValidWords = meaningfulWords.some(word => trimmedCommand.includes(word));

    if (!hasValidWords) {
      return;
    }

    // Команды навигации по страницам
    if (
      command.includes("перейти на главную") ||
      command.includes("на главную страницу") ||
      command.includes("домой")
    ) {
      navigate("/");
      return;
    }

    if (
      command.includes("войти") ||
      command.includes("логин") ||
      command.includes("авторизация")
    ) {
      navigate("/login");
      return;
    }

    if (
      command.includes("регистрация") ||
      command.includes("зарегистрироваться")
    ) {
      navigate("/signup");
      return;
    }

    if (
      command.includes("профиль") ||
      command.includes("мой профиль") ||
      command.includes("личный кабинет") ||
      command.includes("открыть профиль")
    ) {
      navigate("/profile");
      return;
    }

    if (command.includes("заказ") || command.includes("оформить заказ")) {
      navigate("/order");
      return;
    }

    // Команды корзины
    if (command.includes("корзина") && command.includes("очистить")) {
      clearCart();
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
      return;
    }

    if (
      command.includes("добавить про") ||
      command.includes("про план") ||
      command.includes("про в корзину") ||
      command.includes("отправить про")
    ) {
      onAddProPlan();
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
      return;
    }

    // Навигация по секциям страницы
    if (
      command.includes("к планам") ||
      command.includes("показать планы") ||
      command.includes("перейти к планам") ||
      command.includes("спуститься к планам")
    ) {
      const pricingSection = document.querySelector('[data-section="pricing"]');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    if (
      command.includes("к преимуществам") ||
      command.includes("наши преимущества") ||
      command.includes("спуститься к преимуществам") ||
      command.includes("перейти к преимуществам")
    ) {
      // Ищем секцию с преимуществами по заголовку
      const advantagesSection = Array.from(document.querySelectorAll('h2')).find(h =>
        h.textContent?.toLowerCase().includes('преимущества')
      );
      if (advantagesSection) {
        advantagesSection.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    if (
      command.includes("к возможностям") ||
      command.includes("мощные возможности") ||
      command.includes("спуститься к возможностям") ||
      command.includes("перейти к возможностям")
    ) {
      // Ищем секцию с возможностями
      const featuresSection = document.getElementById('features') ||
                             Array.from(document.querySelectorAll('h2')).find(h =>
                               h.textContent?.toLowerCase().includes('возможности')
                             );
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: "smooth" });
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
      return;
    }

    if (
      command.includes("прокрутить вверх") ||
      command.includes("скролл вверх") ||
      command.includes("подняться вверх")
    ) {
      window.scrollBy(0, -500);
      return;
    }

    if (
      command.includes("наверх страницы") ||
      command.includes("в начало") ||
      command.includes("в самый верх")
    ) {
      window.scrollTo(0, 0);
      return;
    }

    if (
      command.includes("в конец страницы") ||
      command.includes("в самый низ") ||
      command.includes("вниз страницы")
    ) {
      window.scrollTo(0, document.body.scrollHeight);
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
