import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import VoiceControl from "@/components/VoiceControl";

import StarkHero from "@/components/StarkHero";
import JarvisInterface from "@/components/JarvisInterface";

import { StarkHUD, HologramText } from "@/components/StarkHUD";
import {
  ArcReactor,
  PowerIndicator,
  GlitchText,
} from "@/components/StarkEffects";
import { cn } from "@/lib/utils";
import {
  Shield,
  User,
  LogOut,
  Settings,
  Code,
  Cpu,
  Brain,
  Zap,
  CheckCircle,
  ShoppingCart,
  Lock,
  Eye,
  Layers,
  TrendingUp,
  Search,
  Cog,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Компонент для анимации печати кода
function TypewriterCode() {
  const [currentCodeIndex, setCurrentCodeIndex] = useState(0);
  const [displayedCode, setDisplayedCode] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const codeSnippets = [
    {
      title: "stark-interface.tsx",
      lines: [
        'import React from "react";',
        'import { Button, Card } from "@/components";',
        '',
        'export function StarkInterface() {',
        '  return (',
        '    <div className="stark-container">',
        '      <h1 className="glow-text">',
        '        STARK INDUSTRIES',
        '      </h1>',
        '      <Button variant="stark">',
        '        Активировать',
        '      </Button>',
        '    </div>',
        '  );',
        '}'
      ]
    },
    {
      title: "ai-assistant.tsx",
      lines: [
        'import { useState } from "react";',
        'import { Brain, Zap } from "lucide-react";',
        '',
        'export function AIAssistant() {',
        '  const [isActive, setIsActive] = useState(false);',
        '',
        '  const handleVoiceCommand = () => {',
        '    setIsActive(!isActive);',
        '    processNeuralNetwork();',
        '  };',
        '',
        '  return (',
        '    <div className="ai-interface">',
        '      <Brain className="neural-icon" />',
        '      <button onClick={handleVoiceCommand}>',
        '        {isActive ? "Деактивировать" : "Активировать"}',
        '      </button>',
        '    </div>',
        '  );',
        '}'
      ]
    },
    {
      title: "blockchain-wallet.tsx",
      lines: [
        'import { ethers } from "ethers";',
        'import { Shield, Lock } from "lucide-react";',
        '',
        'export function BlockchainWallet() {',
        '  const [wallet, setWallet] = useState(null);',
        '  const [balance, setBalance] = useState("0");',
        '',
        '  const connectWallet = async () => {',
        '    const provider = new ethers.BrowserProvider(window.ethereum);',
        '    const signer = await provider.getSigner();',
        '    setWallet(signer);',
        '    const bal = await provider.getBalance(signer.address);',
        '    setBalance(ethers.formatEther(bal));',
        '  };',
        '',
        '  return (',
        '    <div className="wallet-interface">',
        '      <Shield className="security-icon" />',
        '      <p>Баланс: {balance} ETH</p>',
        '      <button onClick={connectWallet}>',
        '        Подключить кошелек',
        '      </button>',
        '    </div>',
        '  );',
        '}'
      ]
    },
    {
      title: "neural-network.py",
      lines: [
        'import tensorflow as tf',
        'import numpy as np',
        'from sklearn.model_selection import train_test_split',
        '',
        'class StarkAI:',
        '    def __init__(self):',
        '        self.model = tf.keras.Sequential([',
        '            tf.keras.layers.Dense(128, activation="relu"),',
        '            tf.keras.layers.Dropout(0.2),',
        '            tf.keras.layers.Dense(64, activation="relu"),',
        '            tf.keras.layers.Dense(10, activation="softmax")',
        '        ])',
        '',
        '    def train(self, X, y):',
        '        self.model.compile(',
        '            optimizer="adam",',
        '            loss="categorical_crossentropy",',
        '            metrics=["accuracy"]',
        '        )',
        '        return self.model.fit(X, y, epochs=100)',
        '',
        '    def predict(self, data):',
        '        return self.model.predict(data)'
      ]
    }
  ];

  useEffect(() => {
    const currentSnippet = codeSnippets[currentCodeIndex];
    const fullCode = currentSnippet.lines.join('\n');

    let typingTimer: NodeJS.Timeout;
    let pauseTimer: NodeJS.Timeout;

    if (isTyping && currentCharIndex < fullCode.length) {
      typingTimer = setTimeout(() => {
        setDisplayedCode(fullCode.substring(0, currentCharIndex + 1));
        setCurrentCharIndex(prev => prev + 1);
      }, 50 + Math.random() * 50); // Варьируем скорость печати
    } else if (currentCharIndex >= fullCode.length) {
      // Пауза после завершения печати
      pauseTimer = setTimeout(() => {
        setCurrentCharIndex(0);
        setDisplayedCode("");
        setCurrentCodeIndex(prev => (prev + 1) % codeSnippets.length);
      }, 3000); // Пауза 3 секунды перед следующим кодом
    }

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(pauseTimer);
    };
  }, [currentCharIndex, currentCodeIndex, isTyping, codeSnippets]);

  const currentSnippet = codeSnippets[currentCodeIndex];

  const renderCodeWithSyntaxHighlight = (code: string) => {
    const lines = code.split('\n');
    return lines.map((line, index) => {
      if (!line.trim()) return <div key={index} className="h-5"></div>;

      // Simple syntax highlighting
      let highlightedLine = line
        .replace(/(import|export|from|const|let|var|function|return|if|else|class|def|async|await)/g, '<span class="text-purple-400">$1</span>')
        .replace(/(\{|\}|\(|\)|;)/g, '<span class="text-cyan-400">$1</span>')
        .replace(/(["'].*?["'])/g, '<span class="text-green-400">$1</span>')
        .replace(/(\d+)/g, '<span class="text-orange-400">$1</span>')
        .replace(/(\/\/.*$)/g, '<span class="text-gray-500">$1</span>')
        .replace(/(<[^>]*>)/g, '<span class="text-red-400">$1</span>')
        .replace(/(className|onClick|useState|useEffect|href|src)/g, '<span class="text-blue-400">$1</span>');

      return (
        <div
          key={index}
          className="font-mono text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlightedLine }}
        />
      );
    });
  };

  return (
    <div className="font-mono text-sm h-[400px] overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/50 pointer-events-none z-10"></div>

      <div className="space-y-1 text-white/90 h-full overflow-hidden">
        {renderCodeWithSyntaxHighlight(displayedCode)}
        {/* Мигающий курсор */}
        <span className="inline-block w-2 h-5 bg-cyan-400 animate-pulse ml-1"></span>
      </div>
    </div>
  );
}

export default function Index() {
  const { currentUser, logout, isAuthenticated, loading } = useAuth();
  const {
    getTotalItems,
    addItem,
    items,
    removeItem,
    getTotalPrice,
    clearCart,
  } = useCart();
  const navigate = useNavigate();
  const [navbarAnimated, setNavbarAnimated] = useState(false);
  const [navbarScrolled, setNavbarScrolled] = useState(false);

  const [forceStopVoice, setForceStopVoice] = useState(false);

  // Запуск аним��ции при загрузке ��омпонента
  useEffect(() => {
    const timer = setTimeout(() => {
      setNavbarAnimated(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Отслеживание скролла для навбара
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 100;
      setNavbarScrolled(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const handleAddBeginnerPlan = () => {
    addItem({
      id: "beginner-plan",
      name: "Beginner Plan",
      price: 199,
      description:
        "Access to basic blockchain guides and fundamental knowledge",
      category: "blockchain-basic",
    });
  };

  const handleAddIntermediatePlan = () => {
    addItem({
      id: "intermediate-plan",
      name: "Intermediate Plan",
      price: 349,
      description:
        "Everything in Beginner + Advanced blockchain insights and tools",
      category: "blockchain-intermediate",
    });
  };

  const handleAddAdvancedPlan = () => {
    addItem({
      id: "advanced-plan",
      name: "Advanced Plan",
      price: 495,
      description:
        "Everything in Intermediate + Professional tools and priority support",
      category: "blockchain-advanced",
    });
  };

  const handleProceedToOrder = () => {
    navigate("/order");
  };

  const handleListeningChange = (isListening: boolean, transcript?: string) => {
    // Микрофон работает в фоне, панель не показываем
    console.log("🎤 Микрофон активен:", isListening, "Транскрипт:", transcript);
  };

  const handleStopListening = () => {
    setForceStopVoice(true);
    setTimeout(() => setForceStopVoice(false), 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <ArcReactor size="large" pulsing />
          <p className="text-cyan-400 mt-4 font-mono">
            <GlitchText>INITIALIZING STARK SYSTEMS...</GlitchText>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation - Enhanced with Stark styling */}
      <nav
        className={cn(
          "fixed top-2 left-1/2 transform -translate-x-1/2 z-40 rounded-full px-2 py-1 transition-all duration-300",
          navbarScrolled
            ? "bg-black/80 backdrop-blur-lg border border-cyan-400/30 stark-glow"
            : "bg-transparent border border-cyan-400/20",
        )}
      >
        <div className="flex items-center space-x-2">
          {/* Home Button */}
          <Button
            variant="ghost"
            className="text-xs px-2 py-1 rounded-full hover:bg-cyan-400/10 transition-all duration-300 font-mono"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="stark-text-glow">Home</span>
          </Button>

          {/* JARVIS Interface in Navbar */}
          <JarvisInterface
            onAddBasicPlan={handleAddBeginnerPlan}
            onAddProPlan={handleAddIntermediatePlan}
            onAddMaxPlan={handleAddAdvancedPlan}
            inNavbar={true}
            onListeningChange={handleListeningChange}
            forceStop={forceStopVoice}
          />

          {/* Cart Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative p-1.5 rounded-full hover:bg-cyan-400/10 transition-all duration-300"
              >
                <ShoppingCart className="w-4 h-4 text-cyan-400" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {getTotalItems()}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-black/90 border-cyan-400/30 mt-2 backdrop-blur-lg"
            >
              <div className="px-3 py-2">
                <h3 className="font-semibold text-cyan-400 mb-2 font-mono">
                  CART MATRIX
                </h3>
                {items.length === 0 ? (
                  <p className="text-sm text-white/60 text-center py-4 font-mono">
                    Cart is empty
                  </p>
                ) : (
                  <>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between p-2 bg-gray-800/50 border border-cyan-400/20 rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-white font-mono">
                              {item.name}
                            </h4>
                            <p className="text-xs text-white/60 mt-1">
                              {item.description.substring(0, 60)}...
                            </p>
                            <p className="text-sm font-semibold text-cyan-400 mt-1 font-mono">
                              ${item.price}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="ml-2 h-6 w-6 p-0 hover:bg-red-500/20 text-red-400"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                    <DropdownMenuSeparator className="bg-cyan-400/20 my-3" />
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-cyan-400 font-mono">
                        TOTAL:
                      </span>
                      <span className="font-bold text-white font-mono">
                        ${getTotalPrice()}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={clearCart}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={handleProceedToOrder}
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 stark-glow"
                      >
                        Checkout
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Тестовая кнопк�� диагностики */}
          <Button
            onClick={() => {
              console.log("🧪 Тестовый запуск диагностики");
              // Имитируем голосовую команду
              const event = new CustomEvent("voiceCommand", {
                detail: { command: "диагностика" },
              });
              window.dispatchEvent(event);
            }}
            variant="ghost"
            className="text-xs px-2 py-1 rounded-full hover:bg-cyan-400/10 transition-all duration-300 font-mono"
          >
            <span className="stark-text-glow">TEST</span>
          </Button>

          <ThemeToggle />

          {isAuthenticated && currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-cyan-400/10 transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden sm:block text-sm font-mono">
                    {currentUser.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-black/90 border-cyan-400/30 mt-2 backdrop-blur-lg"
              >
                <div className="px-2 py-1.5 text-sm text-white/60">
                  <div className="font-medium text-cyan-400 font-mono">
                    {currentUser.name}
                  </div>
                  <div className="text-xs">{currentUser.email}</div>
                </div>
                <DropdownMenuSeparator className="bg-cyan-400/20" />
                <DropdownMenuItem
                  onClick={() => (window.location.href = "/profile")}
                  className="text-white hover:bg-cyan-400/10 cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => (window.location.href = "/profile")}
                  className="text-white hover:bg-cyan-400/10 cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-cyan-400/20" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-400 hover:bg-red-400/10 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                className="text-xs px-2 py-1 rounded-full hover:bg-cyan-400/10 transition-all duration-300 font-mono"
                asChild
              >
                <Link to="/login">
                  <span className="stark-text-glow">Login</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="text-xs px-2 py-1 rounded-full hover:bg-cyan-400/10 transition-all duration-300 font-mono"
                asChild
              >
                <Link to="/signup">
                  <span className="stark-text-glow">Sign up</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Stark Style */}
      <StarkHero />

      {/* Our Advantages Section - AI & Modern Websites */}
      <section className="py-20 bg-black relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-10 left-10 w-32 h-32 border border-cyan-400 rounded-full animate-spin"
            style={{ animationDuration: "25s" }}
          ></div>
          <div
            className="absolute bottom-20 right-20 w-24 h-24 border border-blue-400 rounded-full animate-spin"
            style={{ animationDuration: "18s", animationDirection: "reverse" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/3 w-16 h-16 border border-orange-400 rounded-full animate-spin"
            style={{ animationDuration: "12s" }}
          ></div>
        </div>

        {/* Glitch overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60 animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            {/* JARVIS-style Header */}
            <StarkHUD
              className="inline-block bg-black/60 backdrop-blur-lg px-6 py-3 mb-6"
              showCorners={false}
            >
              <div className="flex items-center space-x-3">
                <ArcReactor size="small" pulsing />
                <span className="text-sm text-cyan-400 uppercase tracking-widest font-mono">
                  [ НАШИ ПРЕИМУЩЕСТВА ]
                </span>
              </div>
            </StarkHUD>

            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Современные <HologramText glitch>Динамичные</HologramText> Сайты
            </h2>
            <p className="text-lg text-white/70 max-w-3xl mx-auto font-mono">
              <GlitchText intensity="low">
                Мы создаем не просто веб-сайты — мы создаем интеллектуальные цифровые экосистемы с встроенным искусственным интеллектом
              </GlitchText>
            </p>

            {/* Scanning Line */}
            <div className="mt-4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* AI Integration */}
            <StarkHUD className="bg-gray-900/80 backdrop-blur-sm p-8 hover:bg-gray-800/80 transition-all duration-300 group cursor-pointer">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-cyan-400/30">
                  <Brain className="w-8 h-8 text-cyan-400 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white font-mono">
                  <GlitchText intensity="low">Искусственный Интеллект</GlitchText>
                </h3>
              </div>

              <div className="space-y-3">
                <p className="text-white/70 text-sm leading-relaxed font-mono">
                  Интеграция передовых AI-технологий для создания умных интерфейсов
                </p>
                <div className="flex items-center text-cyan-400 text-sm">
                  <Zap className="w-4 h-4 mr-2" />
                  <span className="font-mono">JARVIS Protocol</span>
                </div>
                <div className="flex items-center text-cyan-400 text-sm">
                  <Cpu className="w-4 h-4 mr-2" />
                  <span className="font-mono">Neural Networks</span>
                </div>
              </div>
            </StarkHUD>

            {/* Dynamic Interfaces */}
            <StarkHUD className="bg-gray-900/80 backdrop-blur-sm p-8 hover:bg-gray-800/80 transition-all duration-300 group cursor-pointer">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-400/30">
                  <Layers className="w-8 h-8 text-blue-400 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white font-mono">
                  <GlitchText intensity="medium">Динамичные Интерфейсы</GlitchText>
                </h3>
              </div>

              <div className="space-y-3">
                <p className="text-white/70 text-sm leading-relaxed font-mono">
                  Адаптивные интерфейсы с анимациями и интерактивными элементами
                </p>
                <div className="flex items-center text-blue-400 text-sm">
                  <Eye className="w-4 h-4 mr-2" />
                  <span className="font-mono">Real-time Rendering</span>
                </div>
                <div className="flex items-center text-blue-400 text-sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="font-mono">Performance Optimized</span>
                </div>
              </div>
            </StarkHUD>

            {/* Advanced Features */}
            <StarkHUD className="bg-gray-900/80 backdrop-blur-sm p-8 hover:bg-gray-800/80 transition-all duration-300 group cursor-pointer md:col-span-2 lg:col-span-1">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-purple-400/30">
                  <Cog className="w-8 h-8 text-purple-400 group-hover:animate-spin" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white font-mono">
                  <GlitchText intensity="low">Передовые Технологии</GlitchText>
                </h3>
              </div>

              <div className="space-y-3">
                <p className="text-white/70 text-sm leading-relaxed font-mono">
                  Используем самые современные технологии для максимальной производительности
                </p>
                <div className="flex items-center text-purple-400 text-sm">
                  <Lock className="w-4 h-4 mr-2" />
                  <span className="font-mono">Blockchain Security</span>
                </div>
                <div className="flex items-center text-purple-400 text-sm">
                  <Search className="w-4 h-4 mr-2" />
                  <span className="font-mono">Voice Recognition</span>
                </div>
              </div>
            </StarkHUD>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="inline-block">
              <PowerIndicator className="mb-4" />
              <p className="text-cyan-400 font-mono text-sm mb-4">
                <GlitchText intensity="low">ГОТОВЫ К БУДУЩЕМУ?</GlitchText>
              </p>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg stark-glow group">
                <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                <span className="font-mono">ЗАПУСТИТЬ ПРОЕКТ</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Code to Website Demo Section */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <StarkHUD
              className="inline-block bg-black/60 backdrop-blur-lg px-6 py-3 mb-6"
              showCorners={false}
            >
              <div className="flex items-center space-x-3">
                <ArcReactor size="small" pulsing />
                <span className="text-sm text-cyan-400 uppercase tracking-widest font-mono">
                  [ ПРОЦЕСС СОЗДАНИЯ ]
                </span>
              </div>
            </StarkHUD>

            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              От <HologramText glitch>Кода</HologramText> к Реальности
            </h2>
            <p className="text-lg text-white/70 max-w-3xl mx-auto font-mono">
              <GlitchText intensity="low">
                Наблюдайте, как строки кода превращаются в живой интерфейс в реальном времени
              </GlitchText>
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Code Editor Box */}
            <StarkHUD className="bg-gray-900/90 backdrop-blur-sm p-6 h-[500px] relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-sm text-cyan-400 font-mono ml-4">
                    <GlitchText intensity="low">dynamic-typing.tsx</GlitchText>
                  </span>
                </div>
                <div className="text-xs text-white/60 font-mono">LIVE CODING...</div>
              </div>

              <TypewriterCode />
            </StarkHUD>

            {/* Website Preview Box */}
            <StarkHUD className="bg-gray-900/90 backdrop-blur-sm p-6 h-[500px] relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-sm text-cyan-400 font-mono">
                    <GlitchText intensity="low">Live Preview</GlitchText>
                  </span>
                </div>
                <PowerIndicator />
              </div>

              <div className="h-[400px] bg-black/50 rounded-lg border border-cyan-400/30 relative overflow-hidden flex items-center justify-center">
                <div className="relative z-10 text-center space-y-6">
                  <div className="animate-fade-in-up">
                    <h1 className="text-2xl lg:text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                      <GlitchText intensity="medium">STARK INDUSTRIES</GlitchText>
                    </h1>
                  </div>

                  <div className="animate-fade-in">
                    <div className="w-48 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto animate-pulse"></div>
                  </div>

                  <div className="animate-fade-in-up">
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg stark-glow">
                      <GlitchText intensity="low">Активировать</GlitchText>
                    </Button>
                  </div>

                  <div className="animate-fade-in">
                    <div className="flex justify-center space-x-4 mt-6">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  <div className="animate-fade-in">
                    <div className="text-xs text-cyan-400 font-mono mt-4">
                      <GlitchText intensity="low">STATUS: ONLINE</GlitchText>
                    </div>
                  </div>
                </div>

                <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-400 opacity-60"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-cyan-400 opacity-60"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyan-400 opacity-60"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-400 opacity-60"></div>
              </div>
            </StarkHUD>
          </div>

          <div className="text-center mt-16">
            <div className="inline-block">
              <p className="text-cyan-400 font-mono text-sm mb-4">
                <GlitchText intensity="low">ГОТОВЫ УВИДЕТЬ СВОЙ ПРОЕКТ В ДЕЙСТВИИ?</GlitchText>
              </p>
              <div className="flex justify-center space-x-4">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg stark-glow">
                  <Code className="w-5 h-5 mr-2" />
                  <span className="font-mono">ЗАКАЗАТЬ ДЕМО</span>
                </Button>
                <Button
                  variant="outline"
                  className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 px-6 py-3 rounded-lg backdrop-blur-sm"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  <span className="font-mono">ПОСМОТРЕТЬ ПОРТФОЛИО</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
