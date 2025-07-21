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
        utterance.lang = 'ru-RU';
        utterance.rate = 0.75; // Медленнее для более роботичного звучания
        utterance.pitch = 0.7; // Более низкий тон
        utterance.volume = 0.9;

        // Получаем список голосов
        const voices = speechSynthesis.getVoices();

        // Строго ищем только мужские голоса, исключаем все женские
        const maleVoices = voices.filter(voice => {
          const name = voice.name.toLowerCase();
          const isRussian = voice.lang.includes('ru') || voice.lang.includes('RU');

          // Исключаем все женские голоса
          const isFemale = name.includes('female') ||
                          name.includes('женский') ||
                          name.includes('елена') ||
                          name.includes('анна') ||
                          name.includes('ирина') ||
                          name.includes('maria') ||
                          name.includes('татьяна') ||
                          name.includes('светлана') ||
                          name.includes('kate') ||
                          name.includes('alice') ||
                          name.includes('siri') ||
                          name.includes('milena') ||
                          name.includes('alena');

          // Ищем мужские голоса
          const isMale = name.includes('male') ||
                        name.includes('мужской') ||
                        name.includes('pavel') ||
                        name.includes('александр') ||
                        name.includes('dmitry') ||
                        name.includes('андрей') ||
                        name.includes('михаил') ||
                        name.includes('viktor') ||
                        name.includes('sergey') ||
                        name.includes('alexey');

          return isRussian && !isFemale && (isMale || (!name.includes('female') && !name.includes('женский')));
        });

        // Используем первый найденный мужской голос или дефолтный с низким тоном
        if (maleVoices.length > 0) {
          utterance.voice = maleVoices[0];
          console.log('Используется голос:', maleVoices[0].name);
        } else {
          // Если мужских голосов не найдено, используем дефолтный с очень низким тоном
          utterance.pitch = 0.5;
          console.log('Мужские голоса не найдены, используется дефолтный с низким тоном');
        }

        utterance.onend = () => {
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
      return;
    }

    if (command.includes('войти') || command.includes('логин') || command.includes('авторизация')) {
      navigate('/login');
      return;
    }

    if (command.includes('регистрация') || command.includes('зарегистрироваться')) {
      navigate('/signup');
      return;
    }

    if (command.includes('профиль') || command.includes('мой профиль')) {
      navigate('/profile');
      return;
    }

    if (command.includes('заказ') || command.includes('оформить заказ')) {
      navigate('/order');
      return;
    }

    // Команды корзины
    if (command.includes('корзина') && command.includes('очистить')) {
      clearCart();
      return;
    }

    // Команды добавления планов
    if (command.includes('добавить базовый') || command.includes('базовый план') || command.includes('basic план')) {
      onAddBasicPlan();
      return;
    }

    if (command.includes('добавить про') || command.includes('про план') || command.includes('pro план')) {
      onAddProPlan();
      return;
    }

    if (command.includes('добавить макс') || command.includes('макс план') || command.includes('max план') || command.includes('джарвис')) {
      onAddMaxPlan();
      return;
    }

    // Прокрутка страницы
    if (command.includes('прокрутить вниз') || command.includes('скролл вниз')) {
      window.scrollBy(0, 500);
      return;
    }

    if (command.includes('прокрутить вверх') || command.includes('скролл вверх')) {
      window.scrollBy(0, -500);
      return;
    }

    if (command.includes('наверх страницы') || command.includes('в начало')) {
      window.scrollTo(0, 0);
      return;
    }

    if (command.includes('к планам') || command.includes('показать планы')) {
      const pricingSection = document.querySelector('[data-section="pricing"]');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
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
