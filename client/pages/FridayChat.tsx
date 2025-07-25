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
        // Автоматически отправляем сообщение после расп��знавания речи
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
          "Привет! Я Пятница, ваш ИИ-консультант. Готов ответить на любые вопросы о наших услугах, тарифах и помочь выбрать подходящий пакет для в��шего проекта. Также могу обсудить любые другие темы. Чем могу помочь?",
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
          "Извините, не удалось отправить сообщение. Проверь��е подключение к интернету.",
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
    <div className="min-h-screen bg-black text-white p-4">
      {/* Background effects matching main site */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-blue-500/5 to-transparent rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <Card className="h-[85vh] flex flex-col bg-black/85 backdrop-blur-xl border border-cyan-500/40 shadow-lg shadow-cyan-500/20">
          <CardHeader className="border-b border-cyan-400/30 bg-black/60 backdrop-blur-md">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="p-2 rounded-full hover:bg-cyan-400/20 hover:shadow-md hover:shadow-cyan-400/30 transition-all duration-300 border border-cyan-400/20 bg-black/40"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-400" />
                </Button>
                <Bot className="w-6 h-6 text-cyan-400" />
                <div className="flex flex-col">
                  <span className="text-white font-mono stark-text-glow">Чат с Пятницей</span>
                  <span className="text-xs text-cyan-400/70">
                    Ваш ИИ-консультант по веб-разработке
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="border-cyan-400/20 bg-black/40 text-cyan-400 hover:bg-cyan-400/20 hover:shadow-md hover:shadow-cyan-400/30 transition-all duration-300"
                >
                  <Home className="w-4 h-4 mr-1" />
                  <span className="stark-text-glow">Главная</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleListening}
                  className={`transition-all duration-300 ${
                    isListening
                      ? "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 hover:shadow-md hover:shadow-red-500/30"
                      : "border-cyan-400/20 bg-black/40 text-cyan-400 hover:bg-cyan-400/20 hover:shadow-md hover:shadow-cyan-400/30"
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                  <span className="stark-text-glow">{isListening ? "Стоп" : "Микрофон"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopSpeaking}
                  disabled={!isSpeaking}
                  className={`transition-all duration-300 ${
                    isSpeaking
                      ? "bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30 hover:shadow-md hover:shadow-blue-500/30"
                      : "border-cyan-400/20 bg-black/40 text-cyan-400/60"
                  }`}
                >
                  {isSpeaking ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                  <span className="stark-text-glow">{isSpeaking ? "Стоп" : "Голос"}</span>
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 w-full">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 w-full ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0 border border-cyan-400/30 shadow-md shadow-cyan-400/30">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[70%] min-w-0 rounded-lg px-4 py-2 backdrop-blur-md ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 text-white shadow-md shadow-cyan-400/20"
                        : "bg-black/60 border border-cyan-400/20 text-white shadow-md shadow-cyan-400/10"
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words word-break-break-word overflow-wrap-break-word">
                      {message.content}
                    </div>
                    <div className="text-xs opacity-70 mt-1 text-cyan-400/70">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 flex items-center justify-center flex-shrink-0 shadow-md shadow-cyan-400/30">
                      <User className="w-4 h-4 text-cyan-400" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0 border border-cyan-400/30 shadow-md shadow-cyan-400/30">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="bg-black/60 border border-cyan-400/20 rounded-lg px-4 py-2 backdrop-blur-md shadow-md shadow-cyan-400/10">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      <span className="text-sm text-white stark-text-glow">
                        Пятница думает...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {isListening && (
                <div className="flex gap-3 justify-center">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 backdrop-blur-md shadow-md shadow-red-500/20">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-red-500 animate-pulse" />
                      <span className="text-sm text-red-400 stark-text-glow">Слушаю...</span>
                    </div>
                  </div>
                </div>
              )}

              {isSpeaking && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0 border border-cyan-400/30 shadow-md shadow-cyan-400/30">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2 backdrop-blur-md shadow-md shadow-blue-500/20">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-blue-500 animate-pulse" />
                      <span className="text-sm text-blue-400 stark-text-glow">Говорю...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-gray-500/20 bg-black backdrop-blur-lg p-4">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isListening
                      ? "Говорите в микрофон..."
                      : "Спросите о наших услугах, тарифах или любую другую тему..."
                  }
                  disabled={isLoading || isListening}
                  className="flex-1 bg-black/50 border-cyan-400/30 text-white placeholder:text-white/50 focus:border-cyan-400/60"
                />
                <Button
                  onClick={toggleListening}
                  variant="outline"
                  size="icon"
                  disabled={isLoading}
                  className={`transition-all duration-300 ${
                    isListening
                      ? "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                      : "border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
