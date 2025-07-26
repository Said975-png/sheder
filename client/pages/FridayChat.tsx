import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Bot,
  User,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Home,
  ArrowLeft,
  Settings,
  MoreVertical,
  Sparkles,
  Zap,
  Brain,
  Cpu,
} from "lucide-react";
import { ChatMessage, ChatRequest, ChatResponse } from "@shared/api";
import { useVoiceChat } from "@/hooks/useVoiceChat";

export default function FridayChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { isListening, isSpeaking, toggleListening, speakText, stopSpeaking } =
    useVoiceChat({
      onTranscriptReceived: (text: string) => {
        setInputValue(text);
        // Автоматически отправляем сообщение после распознавания речи
        sendMessageWithText(text);
      },
      onTextToSpeech: (text: string) => {
        console.log("Speaking:", text);
      },
    });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Приветственное сообщение при загрузке
    setMessages([
      {
        role: "assistant",
        content:
          "Привет! Я Пятница, ваш ИИ-консультант. Готов ответить на любые вопросы о наших услугах, тарифах и помочь выбрать подходящий пакет для вашего проекта. Также могу обсудить любые другие темы. Чем могу помочь?",
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const sendMessageWithText = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const request: ChatRequest = {
        messages: [...messages, userMessage],
      };

      const response = await fetch("/api/groq-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      if (data.success && data.message) {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.message,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: ChatMessage = {
          role: "assistant",
          content: `Извините, произошла ошибка: ${data.error || "Неизвестная ошибка"}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "Извините, не удалось отправить сообщение. Проверьте подключение к интернету.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    await sendMessageWithText(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-indigo-950/30 text-white relative overflow-hidden">
      {/* Futuristic Background Effects */}
      <div className="fixed inset-0 -z-10">
        {/* Animated Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-64 h-64 bg-cyan-400/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Scanning Lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      <div className="max-w-6xl mx-auto p-2 sm:p-4 relative z-10">
        {/* Modern Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-slate-900/80 to-blue-900/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-2xl shadow-blue-500/10 gap-4 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="p-2 sm:p-3 rounded-xl hover:bg-blue-500/20 transition-all duration-300 border border-blue-400/20 bg-slate-800/50 min-h-[44px] touch-manipulation"
              >
                <ArrowLeft className="w-5 h-5 text-blue-400" />
              </Button>

              {/* AI Avatar */}
              <div className="relative">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Brain className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 sm:w-4 h-3 sm:h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
              </div>

              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Пятница AI
                </h1>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-slate-300">
                    Онлайн • ИИ-консультант
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
                className="border-blue-400/30 bg-slate-800/50 text-blue-400 hover:bg-blue-500/20 transition-all duration-300 rounded-xl min-h-[44px] touch-manipulation"
              >
                <Home className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Главная</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="p-3 rounded-xl hover:bg-slate-700/50 transition-all duration-300"
              >
                <Settings className="w-4 h-4 text-slate-400" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="p-3 rounded-xl hover:bg-slate-700/50 transition-all duration-300"
              >
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="h-[calc(100vh-160px)] sm:h-[calc(100vh-200px)] bg-gradient-to-br from-slate-900/90 to-blue-900/30 backdrop-blur-xl border border-blue-500/20 rounded-2xl sm:rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden">
          {/* Messages Area */}
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-2 sm:p-6 space-y-2 sm:space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-2 sm:gap-4 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/30">
                        <Cpu className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                      </div>
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] min-w-0 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                        : "bg-gradient-to-r from-slate-800/80 to-slate-700/80 text-white shadow-lg shadow-slate-900/20 border border-slate-600/30"
                    } rounded-lg sm:rounded-2xl px-2 sm:px-5 py-2 sm:py-4 backdrop-blur-md relative overflow-hidden`}
                  >
                    {/* Message glow effect */}
                    <div
                      className={`absolute inset-0 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                          : "bg-gradient-to-r from-blue-500/5 to-purple-500/5"
                      } rounded-2xl`}
                    ></div>

                    <div className="relative z-10">
                      <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                      <div
                        className={`text-[10px] sm:text-xs mt-1 sm:mt-2 ${
                          message.role === "user"
                            ? "text-blue-100/70"
                            : "text-slate-400"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-emerald-400/30">
                        <User className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading State */}
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/30">
                      <Cpu className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 rounded-2xl px-5 py-4 backdrop-blur-md shadow-lg shadow-slate-900/20 border border-slate-600/30">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm text-slate-300">
                        Пятница анализирует...
                      </span>
                      <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {/* Listening State */}
              {isListening && (
                <div className="flex justify-center">
                  <div className="bg-gradient-to-r from-red-600/80 to-pink-600/80 rounded-2xl px-6 py-3 backdrop-blur-md shadow-lg shadow-red-500/20 border border-red-400/30">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                      <Mic className="w-4 h-4 text-red-200 animate-pulse" />
                      <span className="text-xs sm:text-sm text-red-100">
                        Слушаю вас...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Speaking State */}
              {isSpeaking && (
                <div className="flex gap-4 justify-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/30">
                      <Volume2 className="w-5 h-5 text-white animate-pulse" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-600/80 to-emerald-600/80 rounded-2xl px-5 py-3 backdrop-blur-md shadow-lg shadow-green-500/20 border border-green-400/30">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-green-300 rounded-full animate-pulse"
                            style={{
                              height: `${Math.random() * 16 + 8}px`,
                              animationDelay: `${i * 100}ms`,
                            }}
                          ></div>
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm text-green-100">Говорю...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Input Area */}
            <div className="border-t border-slate-700/50 bg-gradient-to-r from-slate-900/80 to-blue-900/40 backdrop-blur-xl p-3 sm:p-6">
              <div className="flex items-end gap-2 sm:gap-4">
                {/* Voice Control */}
                <div className="flex flex-col gap-1 sm:gap-2">
                  <Button
                    onClick={toggleListening}
                    variant="outline"
                    size="icon"
                    disabled={isLoading}
                    className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl transition-all duration-300 touch-manipulation ${
                      isListening
                        ? "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 shadow-lg shadow-red-500/20"
                        : "border-blue-400/30 bg-slate-800/50 text-blue-400 hover:bg-blue-500/20 shadow-lg shadow-blue-500/10"
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-4 sm:w-5 h-4 sm:h-5" />
                    ) : (
                      <Mic className="w-4 sm:w-5 h-4 sm:h-5" />
                    )}
                  </Button>

                  <Button
                    onClick={stopSpeaking}
                    variant="outline"
                    size="icon"
                    disabled={!isSpeaking}
                    className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl transition-all duration-300 touch-manipulation ${
                      isSpeaking
                        ? "bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30 shadow-lg shadow-green-500/20"
                        : "border-slate-600/30 bg-slate-800/30 text-slate-500"
                    }`}
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-4 sm:w-5 h-4 sm:h-5" />
                    ) : (
                      <Volume2 className="w-4 sm:w-5 h-4 sm:h-5" />
                    )}
                  </Button>
                </div>

                {/* Message Input */}
                <div className="flex-1 relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      isListening
                        ? "🎤 Говорите..."
                        : "💬 Спросите о наших услугах..."
                    }
                    disabled={isLoading || isListening}
                    className="h-12 sm:h-14 px-4 sm:px-6 pr-12 sm:pr-16 bg-slate-800/50 border-slate-600/30 text-white placeholder:text-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20 rounded-xl sm:rounded-2xl text-sm sm:text-base backdrop-blur-md"
                  />

                  {/* Input decorations */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {inputValue && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>

                {/* Send Button */}
                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0 shadow-lg shadow-blue-500/30 hover:shadow-blue-400/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Send className="w-6 h-6" />
                  )}
                </Button>
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  <span>Powered by AI • Secure & Private</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>{messages.length} сообщений</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Подключено</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
