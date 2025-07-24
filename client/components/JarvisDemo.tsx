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
      "Блокчейн - это цифровая книга записей, которая хранится од��овременно на множестве компьютеров. Каждая новая запись связана с предыдущей криптографически, что делает данные неизменными и прозрачными. Это как цифровой нотариус, который никогда не спит.",
  },
  {
    user: "Как создать смарт-контракт?",
    jarvis:
      "Смарт-контракт - это программа на блокчейне, которая автоматически выполняет условия соглашения. Я могу помочь вам написать код на Solidity, протестировать его в тестовой сети и развернуть в основной сети Ethereum. Начнем с простого примера?",
  },
  {
    user: "Какие криптовалюты сейчас перспективны?",
    jarvis:
      "Анализируя текущие тренды и технологические разработки, обратите внимание на Ethereum 2.0 с переходом на Proof-of-Stake, развитие Layer 2 решений как Polygon, и экосистему DeFi. Однако помните - это не финансовый совет, всегда проводите собственное исследование.",
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
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Neural Network Grid */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-1 bg-gradient-to-r from-transparent to-cyan-400 mr-4"></div>
            <Brain className="w-8 h-8 text-cyan-400 animate-pulse" />
            <div className="w-12 h-1 bg-gradient-to-l from-transparent to-cyan-400 ml-4"></div>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-6 font-mono">
            ДЖАРВИС В ДЕЙСТВИИ
          </h2>

          <div className="w-40 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-8 rounded-full"></div>

          <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Посмотрите, как наш ИИ-ассистент Джарвис помогает решать сложные
            задачи в области блокчейна и криптовалют
          </p>
        </div>

        {/* Main Demo Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Chat Interface */}
          <div className="relative">
            <div className="bg-black/60 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-6 min-h-[600px] relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-cyan-400/20">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Bot className="w-8 h-8 text-cyan-400" />
                    <div className="absolute inset-0 bg-cyan-400/20 blur-md rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-mono">
                      ДЖАРВИС
                    </h3>
                    <p className="text-xs text-cyan-400">AI Assistant</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {audioWaves.map((height, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-t from-cyan-400 to-blue-400 rounded-full w-1 transition-all duration-150"
                        style={{
                          height: `${height}px`,
                          animationDelay: `${index * 50}ms`,
                        }}
                      ></div>
                    ))}
                  </div>
                  <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
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
                      <div className="relative">
                        <Bot className="w-6 h-6 text-cyan-400" />
                        <div className="absolute inset-0 bg-cyan-400/20 blur-sm rounded-full animate-pulse"></div>
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-xs lg:max-w-sm xl:max-w-md px-4 py-3 rounded-2xl relative",
                        message.type === "user"
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white ml-auto"
                          : "bg-gray-800/60 border border-cyan-400/20 text-white",
                      )}
                    >
                      {message.type === "jarvis" && (
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-2xl"></div>
                      )}
                      <p className="text-sm leading-relaxed relative z-10 font-mono">
                        {message.content}
                      </p>
                    </div>

                    {message.type === "user" && (
                      <User className="w-6 h-6 text-blue-400" />
                    )}
                  </div>
                ))}

                {/* Typing Animation */}
                {isTyping && (
                  <div className="flex items-start space-x-3 animate-fadeIn">
                    <div className="relative">
                      <Bot className="w-6 h-6 text-cyan-400" />
                      <div className="absolute inset-0 bg-cyan-400/20 blur-sm rounded-full animate-pulse"></div>
                    </div>

                    <div className="max-w-xs lg:max-w-sm xl:max-w-md px-4 py-3 rounded-2xl bg-gray-800/60 border border-cyan-400/20 text-white relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-2xl"></div>
                      <p className="text-sm leading-relaxed relative z-10 font-mono">
                        {displayedTypingText}
                        <span className="inline-block w-2 h-5 bg-cyan-400 animate-pulse ml-1"></span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="flex items-center space-x-3 p-3 bg-gray-800/40 border border-cyan-400/20 rounded-xl">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                <div className="flex-1 text-sm text-white/60 font-mono">
                  Задайте вопрос Джарвису...
                </div>
                <Mic className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>

              {/* Glowing border effect */}
              <div className="absolute inset-0 rounded-2xl border border-cyan-400/30 animate-pulse pointer-events-none"></div>
            </div>
          </div>

          {/* Features & Info */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white mb-6 font-mono">
                Возможности <span className="text-cyan-400">Джарвиса</span>
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
                    className="flex items-start space-x-4 p-4 bg-gray-800/40 border border-cyan-400/20 rounded-xl hover:border-cyan-400/40 transition-all duration-300 group"
                  >
                    <div className="text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-2 font-mono group-hover:text-cyan-400 transition-colors duration-300">
                        {feature.title}
                      </h4>
                      <p className="text-white/70 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Indicators */}
            <div className="bg-black/40 border border-cyan-400/20 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4 font-mono flex items-center">
                <Bot className="w-5 h-5 text-cyan-400 mr-2" />
                Статистика Джарвиса
              </h4>
              <div className="space-y-3">
                {[
                  { label: "Точность ответов", value: 96 },
                  { label: "Скорость обработки", value: 89 },
                  { label: "Довольство клиентов", value: 98 },
                ].map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80 font-mono">
                        {stat.label}
                      </span>
                      <span className="text-cyan-400 font-mono">
                        {stat.value}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${stat.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Conversation Topics */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-white mb-8 font-mono">
            О чем можно спросить <span className="text-cyan-400">Джарвиса</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {demoConversations.map((conv, index) => (
              <button
                key={index}
                onClick={() => setCurrentConversation(index)}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-300 text-left",
                  index === currentConversation
                    ? "border-cyan-400/60 bg-cyan-400/10 scale-105"
                    : "border-cyan-400/20 bg-gray-800/40 hover:border-cyan-400/40 hover:bg-cyan-400/5",
                )}
              >
                <p className="text-sm text-white/80 font-mono line-clamp-2">
                  {conv.user}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
