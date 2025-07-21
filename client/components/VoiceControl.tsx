import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';

interface VoiceControlProps {
  onAddBasicPlan: () => void;
  onAddProPlan: () => void;
  onAddMaxPlan: () => void;
}

export default function VoiceControl({ onAddBasicPlan, onAddProPlan, onAddMaxPlan }: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const navigate = useNavigate();
  const { getTotalItems, clearCart } = useCart();

  useEffect(() => {
    // Проверяем поддержку Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'ru-RU';

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
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
          console.error('Speech recognition error:', event.error);
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
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.75; // Медленнее для более роботичного звучания
      utterance.pitch = 0.7; // Более низкий тон
      utterance.volume = 0.9;

      // Найдем т��лько мужские голоса, исключив женские
      const voices = speechSynthesis.getVoices();

      // Сначала ищем явно мужские голоса
      const maleVoices = voices.filter(voice =>
        voice.lang.includes('ru') &&
        (voice.name.toLowerCase().includes('male') ||
         voice.name.toLowerCase().includes('мужской') ||
         voice.name.toLowerCase().includes('russian male') ||
         voice.name.toLowerCase().includes('pavel') ||
         voice.name.toLowerCase().includes('александр') ||
         voice.name.toLowerCase().includes('dmitry') ||
         voice.name.toLowerCase().includes('андрей') ||
         voice.name.toLowerCase().includes('михаил'))
      );

      // Если нашли явно мужские голоса, используем их
      if (maleVoices.length > 0) {
        utterance.voice = maleVoices[0];
      } else {
        // Иначе ищем русские голоса, но исключаем женские
        const russianVoices = voices.filter(voice =>
          voice.lang.includes('ru') &&
          !voice.name.toLowerCase().includes('female') &&
          !voice.name.toLowerCase().includes('женский') &&
          !voice.name.toLowerCase().includes('елена') &&
          !voice.name.toLowerCase().includes('анна') &&
          !voice.name.toLowerCase().includes('ирина') &&
          !voice.name.toLowerCase().includes('maria') &&
          !voice.name.toLowerCase().includes('татьяна') &&
          !voice.name.toLowerCase().includes('светлана')
        );

        if (russianVoices.length > 0) {
          utterance.voice = russianVoices[0];
        }
      }

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      speechSynthesis.speak(utterance);
    }
  };

  const processVoiceCommand = (command: string) => {
    console.log('Обработка команды:', command);
    
    // Команды навигации
    if (command.includes('перейти на главную') || command.includes('на главную страницу') || command.includes('домой')) {
      navigate('/');
      speak('Переходим на главную страницу');
      return;
    }

    if (command.includes('войти') || command.includes('логин') || command.includes('авторизация')) {
      navigate('/login');
      speak('Переходим на страницу входа');
      return;
    }

    if (command.includes('регистрация') || command.includes('зарегистрироваться')) {
      navigate('/signup');
      speak('Переходим на страницу регистрации');
      return;
    }

    if (command.includes('профиль') || command.includes('мой профиль')) {
      navigate('/profile');
      speak('Переходим в профиль');
      return;
    }

    if (command.includes('заказ') || command.includes('оформить заказ')) {
      navigate('/order');
      speak('Переходим к оформлению заказа');
      return;
    }

    // Команды корзины
    if (command.includes('корзина') && command.includes('очистить')) {
      clearCart();
      speak('Корзина очищена');
      return;
    }

    if (command.includes('что в корзине') || command.includes('показать корзину')) {
      const itemsCount = getTotalItems();
      if (itemsCount === 0) {
        speak('Корзина пуста');
      } else {
        speak(`В корзине ${itemsCount} товаров`);
      }
      return;
    }

    // Команды добавления планов
    if (command.includes('добавить базовый') || command.includes('базовый план') || command.includes('basic план')) {
      onAddBasicPlan();
      speak('Базовый план добавлен в корзину');
      return;
    }

    if (command.includes('добавить про') || command.includes('про план') || command.includes('pro план')) {
      onAddProPlan();
      speak('Про план с ИИ добавлен в корзину');
      return;
    }

    if (command.includes('добавить макс') || command.includes('макс план') || command.includes('max план') || command.includes('джарвис')) {
      onAddMaxPlan();
      speak('Максимальный план с Джарвисом добавлен в корзину');
      return;
    }

    // Информационные команды
    if (command.includes('что ты умеешь') || command.includes('помощь') || command.includes('команды')) {
      speak('Я умею: переходить по страницам, добавлять планы в корзину, очищать корзину, отвечать на вопросы о сайте. Скажите "добавить про план" или "перейти на главную" для примера');
      return;
    }

    if (command.includes('расскажи о планах') || command.includes('какие планы') || command.includes('тарифы')) {
      speak('У нас есть три плана: Базовый за 2 миллиона сум - простой сайт, Про за 3.5 миллиона с ИИ функциями, и Максимальный за 5 миллионов с Джарвисом');
      return;
    }

    if (command.includes('привет') || command.includes('здравствуй')) {
      speak('Привет! Я ваш ИИ-помощник Джарвис. Чем могу помочь?');
      return;
    }

    // Прокрутка страницы
    if (command.includes('прокрутить вниз') || command.includes('скролл вниз')) {
      window.scrollBy(0, 500);
      speak('Прокручиваю страницу вниз');
      return;
    }

    if (command.includes('прокрутить вверх') || command.includes('скролл вверх')) {
      window.scrollBy(0, -500);
      speak('Прокручиваю страницу вверх');
      return;
    }

    if (command.includes('наверх страницы') || command.includes('в начало')) {
      window.scrollTo(0, 0);
      speak('Переходим в начало страницы');
      return;
    }

    if (command.includes('к планам') || command.includes('показать планы')) {
      const pricingSection = document.querySelector('[data-section="pricing"]');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
        speak('Показываю планы');
      }
      return;
    }

    // Если команда не распознана
    speak('Извините, я не понял команду. Скажите "помощь" чтобы узнать что я умею');
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        setTranscript('');
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
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-purple-600 hover:bg-purple-700'
          } ${isSpeaking ? 'ring-4 ring-blue-400/50' : ''}`}
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
          {isSpeaking ? 'Говорю...' : isListening ? 'Слушаю...' : 'Джарвис'}
        </div>
      </div>

      {/* Pulse effect when listening */}
      {isListening && (
        <div className="absolute top-0 right-0 w-14 h-14 rounded-full bg-purple-500/30 animate-ping"></div>
      )}
    </div>
  );
}
