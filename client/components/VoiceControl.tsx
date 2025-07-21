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

      const speakWithVoice = () => {
        const utterance = new SpeechSynthesisUtterance(text);

        // Настройки голоса Джарвиса
        utterance.rate = 0.85; // Спокойная, уверенная речь
        utterance.pitch = 0.6; // Низкий тон, как у Джарвиса
        utterance.volume = 0.95; // Четкая громкость

        // Получаем список голосов
        const voices = speechSynthesis.getVoices();
        console.log('Доступные голоса:', voices.map(v => `${v.name} (${v.lang})`));

        // Приоритетный поиск голоса Джарвиса
        let selectedVoice = null;

        // 1. Ищем британские мужские голоса (как у Джарвиса)
        const britishMaleVoices = voices.filter(voice => {
          const name = voice.name.toLowerCase();
          const lang = voice.lang.toLowerCase();
          return (lang.includes('en-gb') || lang.includes('en-uk')) &&
                 (name.includes('male') || name.includes('daniel') || name.includes('oliver') || name.includes('arthur'));
        });

        // 2. Ищем любые английские мужские голоса
        const englishMaleVoices = voices.filter(voice => {
          const name = voice.name.toLowerCase();
          const lang = voice.lang.toLowerCase();
          return lang.includes('en') &&
                 (name.includes('male') ||
                  name.includes('alex') ||
                  name.includes('daniel') ||
                  name.includes('david') ||
                  name.includes('microsoft david') ||
                  name.includes('google uk english male'));
        });

        // 3. Ищем русские мужские голоса для русского текста
        const russianMaleVoices = voices.filter(voice => {
          const name = voice.name.toLowerCase();
          const lang = voice.lang.toLowerCase();
          return lang.includes('ru') &&
                 !name.includes('female') &&
                 !name.includes('женский') &&
                 (name.includes('male') ||
                  name.includes('мужской') ||
                  name.includes('pavel') ||
                  name.includes('александр') ||
                  name.includes('dmitry'));
        });

        // Выбираем голос в порядке приоритета
        if (britishMaleVoices.length > 0) {
          selectedVoice = britishMaleVoices[0];
          utterance.lang = 'en-GB';
          console.log('Используется британский голос Джарвиса:', selectedVoice.name);
        } else if (englishMaleVoices.length > 0) {
          selectedVoice = englishMaleVoices[0];
          utterance.lang = 'en-US';
          console.log('Используется английский мужской голос:', selectedVoice.name);
        } else if (russianMaleVoices.length > 0) {
          selectedVoice = russianMaleVoices[0];
          utterance.lang = 'ru-RU';
          console.log('Используется русский мужской голос:', selectedVoice.name);
        } else {
          // Последний шанс - любой мужской голос
          const anyMaleVoice = voices.find(voice =>
            voice.name.toLowerCase().includes('male') &&
            !voice.name.toLowerCase().includes('female')
          );
          if (anyMaleVoice) {
            selectedVoice = anyMaleVoice;
            utterance.lang = anyMaleVoice.lang;
            console.log('Используется запасной мужской голос:', selectedVoice.name);
          } else {
            // Если ничего не найдено, делаем очень низкий тон
            utterance.pitch = 0.4;
            utterance.lang = 'en-US';
            console.log('Голос Джарвиса не найден, используется дефолтный с низким тоном');
          }
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.onend = () => {
          setIsSpeaking(false);
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
        };

        speechSynthesis.speak(utterance);
      };

      // Ждем загрузки голосов
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener('voiceschanged', speakWithVoice, { once: true });
      } else {
        speakWithVoice();
      }
    }
  };

  const processVoiceCommand = (command: string) => {
    console.log('Обработка команды:', command);

    // Команды навигации
    if (command.includes('перейти на главную') || command.includes('на главную страницу') || command.includes('домой')) {
      navigate('/');
      speak('Navigating to homepage, sir.');
      return;
    }

    if (command.includes('войти') || command.includes('логин') || command.includes('авторизация')) {
      navigate('/login');
      speak('Opening login interface.');
      return;
    }

    if (command.includes('регистрация') || command.includes('зарегистрироваться')) {
      navigate('/signup');
      speak('Accessing registration portal.');
      return;
    }

    if (command.includes('профиль') || command.includes('мой профиль')) {
      navigate('/profile');
      speak('Opening your profile settings.');
      return;
    }

    if (command.includes('заказ') || command.includes('оформить заказ')) {
      navigate('/order');
      speak('Proceeding to order confirmation.');
      return;
    }

    // Команды корзины
    if (command.includes('корзина') && command.includes('очистить')) {
      clearCart();
      speak('Shopping cart has been cleared.');
      return;
    }

    if (command.includes('что в корзине') || command.includes('показать корзину')) {
      const itemsCount = getTotalItems();
      if (itemsCount === 0) {
        speak('Your cart is currently empty, sir.');
      } else {
        speak(`You have ${itemsCount} items in your cart.`);
      }
      return;
    }

    // Команды добавления планов
    if (command.includes('добавить базовый') || command.includes('базовый план') || command.includes('basic план')) {
      onAddBasicPlan();
      speak('Basic plan added to cart.');
      return;
    }

    if (command.includes('добавить про') || command.includes('про план') || command.includes('pro план')) {
      onAddProPlan();
      speak('Pro plan with AI features added to cart.');
      return;
    }

    if (command.includes('добавить макс') || command.includes('макс план') || command.includes('max план') || command.includes('джарвис')) {
      onAddMaxPlan();
      speak('Maximum plan with Jarvis AI added to cart.');
      return;
    }

    // Информационные команды
    if (command.includes('что ты умеешь') || command.includes('помощь') || command.includes('команды')) {
      speak('I can navigate pages, manage your cart, add plans, and control website functions. Just give me a command, sir.');
      return;
    }

    if (command.includes('расскажи о планах') || command.includes('какие планы') || command.includes('тарифы')) {
      speak('We offer three plans: Basic for 2 million sum, Pro with AI for 3.5 million, and Maximum with Jarvis for 5 million sum.');
      return;
    }

    if (command.includes('привет') || command.includes('здравствуй')) {
      speak('Good day, sir. Jarvis at your service. How may I assist you today?');
      return;
    }

    // Прокрутка страницы
    if (command.includes('прокрутить вниз') || command.includes('скролл вниз')) {
      window.scrollBy(0, 500);
      speak('Scrolling down.');
      return;
    }

    if (command.includes('прокрутить вверх') || command.includes('скролл вверх')) {
      window.scrollBy(0, -500);
      speak('Scrolling up.');
      return;
    }

    if (command.includes('наверх страницы') || command.includes('в начало')) {
      window.scrollTo(0, 0);
      speak('Returning to top of page.');
      return;
    }

    if (command.includes('к планам') || command.includes('показать планы')) {
      const pricingSection = document.querySelector('[data-section="pricing"]');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
        speak('Displaying pricing plans.');
      }
      return;
    }

    // Если команда не распознана
    speak('I did not quite catch that, sir. Please try rephrasing your command.');
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
          }`}
        >
          {isListening ? (
            <Mic className="w-6 h-6 text-white" />
          ) : (
            <MicOff className="w-6 h-6 text-white" />
          )}
        </Button>

        {/* Status indicator */}
        <div className="text-xs text-white/60 text-center">
          {isListening ? 'Слушаю...' : 'Джарвис'}
        </div>
      </div>

      {/* Pulse effect when listening */}
      {isListening && (
        <div className="absolute top-0 right-0 w-14 h-14 rounded-full bg-purple-500/30 animate-ping"></div>
      )}
    </div>
  );
}
