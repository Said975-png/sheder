import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
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

  const codeSnippets = useMemo(
    () => [
      {
        title: "stark-interface.tsx",
        lines: [
          'import React from "react";',
          'import { Button, Card } from "@/components";',
          "",
          "export function StarkInterface() {",
          "  return (",
          '    <div className="stark-container">',
          '      <h1 className="glow-text">',
          "        STARK INDUSTRIES",
          "      </h1>",
          '      <Button variant="stark">',
          "        Активировать",
          "      </Button>",
          "    </div>",
          "  );",
          "}",
        ],
      },
      {
        title: "ai-assistant.tsx",
        lines: [
          'import { useState } from "react";',
          'import { Brain, Zap } from "lucide-react";',
          "",
          "export function AIAssistant() {",
          "  const [isActive, setIsActive] = useState(false);",
          "",
          "  const handleVoiceCommand = () => {",
          "    setIsActive(!isActive);",
          "    processNeuralNetwork();",
          "  };",
          "",
          "  return (",
          '    <div className="ai-interface">',
          '      <Brain className="neural-icon" />',
          "      <button onClick={handleVoiceCommand}>",
          '        {isActive ? "Деактивировать" : "Активировать"}',
          "      </button>",
          "    </div>",
          "  );",
          "}",
        ],
      },
      {
        title: "blockchain-wallet.tsx",
        lines: [
          'import { ethers } from "ethers";',
          'import { Shield, Lock } from "lucide-react";',
          "",
          "export function BlockchainWallet() {",
          "  const [wallet, setWallet] = useState(null);",
          '  const [balance, setBalance] = useState("0");',
          "",
          "  const connectWallet = async () => {",
          "    const provider = new ethers.BrowserProvider(window.ethereum);",
          "    const signer = await provider.getSigner();",
          "    setWallet(signer);",
          "    const bal = await provider.getBalance(signer.address);",
          "    setBalance(ethers.formatEther(bal));",
          "  };",
          "",
          "  return (",
          '    <div className="wallet-interface">',
          '      <Shield className="security-icon" />',
          "      <p>Баланс: {balance} ETH</p>",
          "      <button onClick={connectWallet}>",
          "        Подключить кошелек",
          "      </button>",
          "    </div>",
          "  );",
          "}",
        ],
      },
      {
        title: "neural-network.py",
        lines: [
          "import tensorflow as tf",
          "import numpy as np",
          "from sklearn.model_selection import train_test_split",
          "",
          "class StarkAI:",
          "    def __init__(self):",
          "        self.model = tf.keras.Sequential([",
          '            tf.keras.layers.Dense(128, activation="relu"),',
          "            tf.keras.layers.Dropout(0.2),",
          '            tf.keras.layers.Dense(64, activation="relu"),',
          '            tf.keras.layers.Dense(10, activation="softmax")',
          "        ])",
          "",
          "    def train(self, X, y):",
          "        self.model.compile(",
          '            optimizer="adam",',
          '            loss="categorical_crossentropy",',
          '            metrics=["accuracy"]',
          "        )",
          "        return self.model.fit(X, y, epochs=100)",
          "",
          "    def predict(self, data):",
          "        return self.model.predict(data)",
        ],
      },
    ],
    [],
  );

  useEffect(() => {
    const currentSnippet = codeSnippets[currentCodeIndex];
    const fullCode = currentSnippet.lines.join("\n");

    let typingTimer: NodeJS.Timeout;
    let pauseTimer: NodeJS.Timeout;

    if (isTyping && currentCharIndex < fullCode.length) {
      typingTimer = setTimeout(
        () => {
          setDisplayedCode(fullCode.substring(0, currentCharIndex + 1));
          setCurrentCharIndex((prev) => prev + 1);
        },
        50 + Math.random() * 50,
      ); // Варьируем скорость печати
    } else if (currentCharIndex >= fullCode.length) {
      // Пауза после завершения печати
      pauseTimer = setTimeout(() => {
        setCurrentCharIndex(0);
        setDisplayedCode("");
        setCurrentCodeIndex((prev) => (prev + 1) % codeSnippets.length);
      }, 3000); // Пауза 3 секунды перед следующим кодом
    }

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(pauseTimer);
    };
  }, [currentCharIndex, currentCodeIndex, isTyping, codeSnippets]);

  const currentSnippet = codeSnippets[currentCodeIndex];

  const renderCodeWithSyntaxHighlight = (code: string) => {
    const lines = code.split("\n");
    return lines.map((line, index) => {
      if (!line.trim()) return <div key={index} className="h-5"></div>;

      // Simple syntax highlighting
      let highlightedLine = line
        .replace(
          /(import|export|from|const|let|var|function|return|if|else|class|def|async|await)/g,
          '<span class="text-purple-400">$1</span>',
        )
        .replace(/(\{|\}|\(|\)|;)/g, '<span class="text-cyan-400">$1</span>')
        .replace(/(["'].*?["'])/g, '<span class="text-green-400">$1</span>')
        .replace(/(\d+)/g, '<span class="text-orange-400">$1</span>')
        .replace(/(\/\/.*$)/g, '<span class="text-gray-500">$1</span>')
        .replace(/(<[^>]*>)/g, '<span class="text-red-400">$1</span>')
        .replace(
          /(className|onClick|useState|useEffect|href|src)/g,
          '<span class="text-blue-400">$1</span>',
        );

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
  const [isScrolling, setIsScrolling] = useState(false);

  const [forceStopVoice, setForceStopVoice] = useState(false);
  const [isModelRotating, setIsModelRotating] = useState(false);
  const [showAdvantages, setShowAdvantages] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Запуск анимации при загрузке компонента
  useEffect(() => {
    const timer = setTimeout(() => {
      setNavbarAnimated(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Отслеживание скролла для навбара с эффектом "брови"
  useEffect(() => {
    let timeoutRef: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      const scrolled = window.scrollY > 100;
      setNavbarScrolled(scrolled);
      setIsScrolling(true);

      // Очищаем предыдущий таймаут
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }

      // Устанавливаем новый таймаут для остановки скролла
      timeoutRef = setTimeout(() => {
        setIsScrolling(false);
      }, 3000); // 3 секунды после остановки скролла
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
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

  const handleModelRotateStart = () => {
    console.log("🔄 Запуск вращения модели");
    setIsModelRotating(true);
  };

  const handleModelRotateStop = () => {
    console.log("⏹️ Остановка вращения модели");
    setIsModelRotating(false);
  };

  const handleShowAdvantages = () => {
    console.log("🎯 Переключение на секцию преимуществ");
    setIsTransitioning(true);

    // Глитч эффект
    setTimeout(() => {
      setShowAdvantages(true);
      setIsTransitioning(false);
    }, 1500);
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
      {/* Неоновый фиолетовый фон */}
      <div className="neon-purple-background"></div>

      {/* Неоновые углы */}
      <div className="neon-corners">
        <div className="neon-corner neon-corner-tl"></div>
        <div className="neon-corner neon-corner-tr"></div>
        <div className="neon-corner neon-corner-bl"></div>
        <div className="neon-corner neon-corner-br"></div>
      </div>

      {/* Неоновые краевые свечения */}
      <div className="neon-edges"></div>

      {/* Центральное неоновое свечение */}
      <div className="neon-center-glow"></div>

      {/* Неоновые частицы */}
      <div className="neon-particles">
        <div className="neon-particle"></div>
        <div className="neon-particle"></div>
        <div className="neon-particle"></div>
        <div className="neon-particle"></div>
        <div className="neon-particle"></div>
      </div>
      {/* Navigation - Enhanced with Stark styling */}
      <nav
        className={cn(
          "fixed left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300",
          // Базовые стили в зависимости от состояния скролла
          navbarScrolled
            ? "bg-black/80 backdrop-blur-lg border border-cyan-400/30 stark-glow"
            : "bg-transparent border border-cyan-400/20",
          // Эффект "брови" при скролле
          isScrolling
            ? "top-1 rounded-full px-1 py-0.5 w-32 h-6" // Компактная "бровь"
            : "top-2 rounded-full px-2 py-1 w-auto h-auto", // Обычный навбар
        )}
      >
        <div
          className={cn(
            "flex items-center transition-all duration-500 overflow-hidden",
            isScrolling
              ? "space-x-1 opacity-100 scale-100"
              : "space-x-2 opacity-100 scale-100",
          )}
        >
          {/* Home Button */}
          <Button
            variant="ghost"
            className={cn(
              "text-xs px-2 py-1 rounded-full hover:bg-cyan-400/10 transition-all duration-500 font-mono transform",
              isScrolling
                ? "scale-0 opacity-0 w-0 overflow-hidden"
                : "scale-100 opacity-100 w-auto",
            )}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="stark-text-glow">Home</span>
          </Button>

          {/* JARVIS Interface in Navbar */}
          <div
            className={cn(
              "transition-all duration-500 transform",
              isScrolling
                ? "scale-0 opacity-0 w-0 overflow-hidden"
                : "scale-100 opacity-100 w-auto",
            )}
          >
            <JarvisInterface
              onAddBasicPlan={handleAddBeginnerPlan}
              onAddProPlan={handleAddIntermediatePlan}
              onAddMaxPlan={handleAddAdvancedPlan}
              inNavbar={true}
              onListeningChange={handleListeningChange}
              forceStop={forceStopVoice}
              onModelRotateStart={handleModelRotateStart}
              onModelRotateStop={handleModelRotateStop}
              onShowAdvantages={handleShowAdvantages}
            />
          </div>

          {/* Dynamic Island indicator during scroll */}
          <div
            className={cn(
              "flex items-center space-x-1 transition-all duration-500 transform",
              isScrolling
                ? "scale-100 opacity-100 w-auto"
                : "scale-0 opacity-0 w-0 overflow-hidden",
            )}
          >
            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
            <div
              className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>

          {/* Cart Dropdown */}
          <div
            className={cn(
              "transition-all duration-500 transform",
              isScrolling
                ? "scale-0 opacity-0 w-0 overflow-hidden"
                : "scale-100 opacity-100 w-auto",
            )}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  data-testid="cart-button"
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
                            className="flex items-start justify-between p-2 bg-gray-800/50 border border-cyan-400/20 rounded-lg stark-corners"
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
          </div>

          <div
            className={cn(
              "transition-all duration-500 transform",
              isScrolling
                ? "scale-0 opacity-0 w-0 overflow-hidden"
                : "scale-100 opacity-100 w-auto",
            )}
          >
            <ThemeToggle />
          </div>

          {isAuthenticated && currentUser ? (
            <div
              className={cn(
                "transition-all duration-500 transform",
                isScrolling
                  ? "scale-0 opacity-0 w-0 overflow-hidden"
                  : "scale-100 opacity-100 w-auto",
              )}
            >
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
            </div>
          ) : (
            <div
              className={cn(
                "flex items-center space-x-1 transition-all duration-500 transform",
                isScrolling
                  ? "scale-0 opacity-0 w-0 overflow-hidden"
                  : "scale-100 opacity-100 w-auto",
              )}
            >
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

      {/* Главная секция с условным рендерингом */}
      <div className="relative">
        {/* Эффект перехода */}
        {isTransitioning && (
          <div className="absolute inset-0 z-50 bg-black">
            {/* Глитч эффект */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-600/30 to-purple-600/20 animate-pulse"></div>
            <div className="absolute inset-0 bg-black/50">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
              <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse" style={{ animationDelay: "0.4s" }}></div>
              <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-pulse" style={{ animationDelay: "0.6s" }}></div>
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" style={{ animationDelay: "0.8s" }}></div>
            </div>
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <ArcReactor size="large" pulsing />
                <p className="text-cyan-400 mt-4 font-mono text-xl">
                  <GlitchText intensity="high">SYSTEM TRANSFORMATION...</GlitchText>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hero секция */}
        {!showAdvantages && !isTransitioning && (
          <StarkHero
            isModelRotating={isModelRotating}
            onModelRotationStart={handleModelRotateStart}
            onModelRotationStop={handleModelRotateStop}
          />
        )}

        {/* Секция преимуществ */}
        {showAdvantages && !isTransitioning && (
          <section className="min-h-screen bg-black relative overflow-hidden py-20">
            {/* Анимированные фоновые элементы */}
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

            {/* Глитч оверлей */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"></div>
              <div
                className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60 animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
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

                <h2 className="text-4xl lg:text-6xl font-bold mb-6">
                  Создаем <HologramText glitch>3D Сайты</HologramText> Будущего
                </h2>
                <p className="text-lg text-white/70 max-w-3xl mx-auto font-mono">
                  <GlitchText intensity="low">
                    Мы создаем уникальные 3D сайты с крутым дизайном, интегрированным ИИ
                    и всем, что клиент захочет видеть на своем сайте
                  </GlitchText>
                </p>

                {/* Scanning Line */}
                <div className="mt-4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"></div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* 3D Технологии */}
                <StarkHUD className="bg-gray-900/80 backdrop-blur-sm p-8 hover:bg-gray-800/80 transition-all duration-300 group cursor-pointer">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-cyan-400/30">
                      <Layers className="w-8 h-8 text-cyan-400 group-hover:animate-pulse" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-white font-mono">
                      <GlitchText intensity="low">3D Технологии</GlitchText>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <p className="text-white/70 text-sm leading-relaxed font-mono">
                      Интерактивные 3D модели, анимации и иммерсивный опыт
                    </p>
                    <div className="flex items-center text-cyan-400 text-sm">
                      <Zap className="w-4 h-4 mr-2" />
                      <span className="font-mono">Three.js & WebGL</span>
                    </div>
                    <div className="flex items-center text-cyan-400 text-sm">
                      <Cpu className="w-4 h-4 mr-2" />
                      <span className="font-mono">Real-time Rendering</span>
                    </div>
                  </div>
                </StarkHUD>

                {/* ИИ Интеграция */}
                <StarkHUD className="bg-gray-900/80 backdrop-blur-sm p-8 hover:bg-gray-800/80 transition-all duration-300 group cursor-pointer">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-400/30">
                      <Brain className="w-8 h-8 text-blue-400 group-hover:animate-pulse" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-white font-mono">
                      <GlitchText intensity="medium">ИИ Интеграция</GlitchText>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <p className="text-white/70 text-sm leading-relaxed font-mono">
                      Умные чат-боты, голосовое управление и машинное обучение
                    </p>
                    <div className="flex items-center text-blue-400 text-sm">
                      <Eye className="w-4 h-4 mr-2" />
                      <span className="font-mono">Computer Vision</span>
                    </div>
                    <div className="flex items-center text-blue-400 text-sm">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <span className="font-mono">Neural Networks</span>
                    </div>
                  </div>
                </StarkHUD>

                {/* Кастомные Решения */}
                <StarkHUD className="bg-gray-900/80 backdrop-blur-sm p-8 hover:bg-gray-800/80 transition-all duration-300 group cursor-pointer md:col-span-2 lg:col-span-1">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-purple-400/30">
                      <Cog className="w-8 h-8 text-purple-400 group-hover:animate-spin" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-white font-mono">
                      <GlitchText intensity="low">Любые Пожелания</GlitchText>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <p className="text-white/70 text-sm leading-relaxed font-mono">
                      Реализуем любые идеи клиента - от простых до самых сложных
                    </p>
                    <div className="flex items-center text-purple-400 text-sm">
                      <Lock className="w-4 h-4 mr-2" />
                      <span className="font-mono">Custom Features</span>
                    </div>
                    <div className="flex items-center text-purple-400 text-sm">
                      <Search className="w-4 h-4 mr-2" />
                      <span className="font-mono">Unlimited Possibilities</span>
                    </div>
                  </div>
                </StarkHUD>
              </div>

              {/* Call to Action */}
              <div className="text-center mt-16">
                <div className="inline-block">
                  <PowerIndicator className="mb-4" />
                  <p className="text-cyan-400 font-mono text-sm mb-4">
                    <GlitchText intensity="low">ГОТОВЫ СОЗДАТЬ УНИКАЛЬНЫЙ САЙТ?</GlitchText>
                  </p>
                  <Button
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg stark-glow group"
                    onClick={() => {
                      setShowAdvantages(false);
                      setIsTransitioning(true);
                      setTimeout(() => setIsTransitioning(false), 1500);
                    }}
                  >
                    <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                    <span className="font-mono">ВЕРНУТЬСЯ К ГЛАВНОЙ</span>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
