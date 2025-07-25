import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Brain,
  User,
  Mic,
  Volume2,
  Zap,
  MessageCircle,
  Bot,
  Waves,
  Sparkles,
  ArrowRight,
  Star,
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "jarvis";
  content: string;
  timestamp: Date;
}

const demoConversations = [
  {
    user: "Джарвис, расскажи о блокчейне простыми словами",
    jarvis:
      "Блокчейн - это цифровая книга записей, которая хранится одновременно на множес��ве компьютеров. Каждая новая запись связана с предыдущей криптографически, что делает данные неизменными и прозрачными. Это как цифровой нотариус, который никогда не спит.",
  },
  {
    user: "Как создать смарт-контракт?",
    jarvis:
      "Смарт-контракт - это программа на блокчейне, которая автоматически выполняет условия соглашения. Я могу помочь вам написать код на Solidity, протестировать его в тестовой сети и развернуть в основной сети Ethereum. Начнем с простого примера?",
  },
  {
    user: "Какие криптовалюты сейчас перспективны?",
    jarvis:
      "Анализируя текущие тренды и технологические разработки, обратите внимание на Ethereum 2.0 с переходом на Proof-of-Stake, развитие Layer 2 решений как Polygon, и экосистему DeFi. Однако помните - это не финансовый совет, всегд�� проводите собственное исследование.",
  },
  {
    user: "Помоги оптимизировать мой код",
    jarvis:
      "Конечно! Загрузите ваш код, и я проанализирую его на предмет газ-эффективности, безопасности и лучших практик. Могу предложить рефакторинг, найти потенциальные уязвимости и оптимизировать производительность.",
  },
];

export default function JarvisDemo() {
  const [currentConversation, setCurrentConversation] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [audioWaves, setAudioWaves] = useState<number[]>([]);

  // Генерация аудио волн для визуализации
  useEffect(() => {
    const generateWaves = () => {
      const waves = Array.from({ length: 12 }, () => Math.random() * 40 + 10);
      setAudioWaves(waves);
    };

    generateWaves();
    const interval = setInterval(generateWaves, 150);
    return () => clearInterval(interval);
  }, []);

  // Автоматическая демонстрация диалогов
  useEffect(() => {
    const startConversation = () => {
      const conversation = demoConversations[currentConversation];

      // Добавляем сообщение пользователя
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: "user",
        content: conversation.user,
        timestamp: new Date(),
      };

      setMessages([userMessage]);

      // Начинаем печатать ответ Джарвиса через 1 секунду
      setTimeout(() => {
        setIsTyping(true);
        setCurrentTypingText(conversation.jarvis);
        setCurrentCharIndex(0);
      }, 1000);
    };

    startConversation();
  }, [currentConversation]);

  // Эффект печати для ответов Джарвиса
  useEffect(() => {
    if (!isTyping || currentCharIndex >= currentTypingText.length) {
      if (isTyping && currentCharIndex >= currentTypingText.length) {
        // Завершаем печать
        const jarvisMessage: Message = {
          id: `jarvis-${Date.now()}`,
          type: "jarvis",
          content: currentTypingText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, jarvisMessage]);
        setIsTyping(false);

        // Переходим к следующему диалогу через 4 секунды
        setTimeout(() => {
          setCurrentConversation(
            (prev) => (prev + 1) % demoConversations.length,
          );
        }, 4000);
      }
      return;
    }

    const timeout = setTimeout(
      () => {
        setCurrentCharIndex((prev) => prev + 1);
      },
      50 + Math.random() * 50,
    );

    return () => clearTimeout(timeout);
  }, [isTyping, currentCharIndex, currentTypingText]);

  const displayedTypingText = currentTypingText.substring(0, currentCharIndex);

  return (
    <section className="relative py-20 px-4 overflow-hidden bg-black">
      {/* Clean minimal background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-1 bg-white mr-4" />
            <Brain className="w-8 h-8 text-white" />
            <div className="w-12 h-1 bg-white ml-4" />
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            ДЖАРВИС В ДЕЙСТВИИ
          </h2>

          <div className="w-40 h-1 bg-white mx-auto mb-8 rounded-full" />

          <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Посмотрите, как наш ИИ-ассистент Джарвис помогает решать сложные
            задачи в области блокчейна и криптовалют
          </p>
        </div>

        {/* Main Demo Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Chat Interface */}
          <div className="relative">
            <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-3xl p-8 min-h-[600px] relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">ДЖАРВИС</h3>
                    <p className="text-xs text-white/70">AI Assistant</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {audioWaves.map((height, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-full w-1 transition-all duration-150"
                        style={{
                          height: `${height}px`,
                          animationDelay: `${index * 50}ms`,
                        }}
                      />
                    ))}
                  </div>
                  <Volume2 className="w-4 h-4 text-white animate-pulse" />
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start space-x-3 animate-fadeIn",
                      message.type === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {message.type === "jarvis" && (
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-xs lg:max-w-sm xl:max-w-md px-4 py-3 rounded-2xl relative",
                        message.type === "user"
                          ? "bg-white text-black ml-auto"
                          : "bg-white/10 border border-white/20 text-white",
                      )}
                    >
                      <p className="text-sm leading-relaxed relative z-10">
                        {message.content}
                      </p>
                    </div>

                    {message.type === "user" && (
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Animation */}
                {isTyping && (
                  <div className="flex items-start space-x-3 animate-fadeIn">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                      <Bot className="w-4 h-4 text-white" />
                    </div>

                    <div className="max-w-xs lg:max-w-sm xl:max-w-md px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white relative">
                      <p className="text-sm leading-relaxed relative z-10">
                        {displayedTypingText}
                        <span className="inline-block w-2 h-5 bg-white animate-pulse ml-1" />
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="flex items-center space-x-3 p-4 bg-white/5 border border-white/20 rounded-xl">
                <MessageCircle className="w-5 h-5 text-white" />
                <div className="flex-1 text-sm text-white/60">
                  Задайте вопрос Джарвису...
                </div>
                <Mic className="w-5 h-5 text-white animate-pulse" />
              </div>
            </div>
          </div>

          {/* Features & Info */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white mb-6">
                Возможности <span className="text-white">Джарвиса</span>
              </h3>

              <div className="space-y-4">
                {[
                  {
                    icon: <Brain className="w-6 h-6" />,
                    title: "Анализ блокчейн данных",
                    description:
                      "Глубокий анализ транзакций, смарт-контрактов и DeFi протоколов",
                  },
                  {
                    icon: <Zap className="w-6 h-6" />,
                    title: "Мгновенные ответы",
                    description:
                      "Получайте точные ответы на сложные технические вопросы",
                  },
                  {
                    icon: <Sparkles className="w-6 h-6" />,
                    title: "Помощь в разработке",
                    description:
                      "Написание и оптимизация смарт-контрактов на Solidity",
                  },
                  {
                    icon: <Waves className="w-6 h-6" />,
                    title: "Голосовое управление",
                    description:
                      "Взаимодействуйте с ИИ через голосовые команды",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-6 bg-white/5 border border-white/20 rounded-2xl hover:border-white/40 hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="text-white group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors duration-300">
                        {feature.title}
                      </h4>
                      <p className="text-white/70 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Indicators */}
            <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                <Bot className="w-5 h-5 text-white mr-2" />
                Статистика Джарвиса
              </h4>
              <div className="space-y-4">
                {[
                  { label: "Точность ответов", value: 96 },
                  { label: "Скорость обработки", value: 89 },
                  { label: "Довольство клиентов", value: 98 },
                ].map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">{stat.label}</span>
                      <span className="text-white font-bold">
                        {stat.value}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${stat.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Conversation Topics */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center text-white mb-8">
            О чем можно спросить <span className="text-white">Джарвиса</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {demoConversations.map((conv, index) => (
              <button
                key={index}
                onClick={() => setCurrentConversation(index)}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-300 text-left",
                  index === currentConversation
                    ? "border-white bg-white/10 scale-105"
                    : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10",
                )}
              >
                <p className="text-sm text-white line-clamp-2">{conv.user}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
