import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import VoiceControl from "@/components/VoiceControl";

import StarkHero from "@/components/StarkHero";
import JarvisInterface from "@/components/JarvisInterface";
import AdvantagesSection from "@/components/AdvantagesSection";
import JarvisDemo from "@/components/JarvisDemo";
import PricingSection from "@/components/PricingSection";

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

// Компонент для анимации пе����ат�� кода
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
      }, 3000); // Пауза 3 секунды перед следующ��м кодом
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
          '<span class="text-white">$1</span>',
        )
        .replace(/(\{|\}|\(|\)|;)/g, '<span class="text-white">$1</span>')
        .replace(/(["'].*?["'])/g, '<span class="text-white">$1</span>')
        .replace(/(\d+)/g, '<span class="text-white">$1</span>')
        .replace(/(\/\/.*$)/g, '<span class="text-white">$1</span>')
        .replace(/(<[^>]*>)/g, '<span class="text-white">$1</span>')
        .replace(
          /(className|onClick|useState|useEffect|href|src)/g,
          '<span class="text-white">$1</span>',
        );

      return (
        <div
          key={index}
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlightedLine }}
        />
      );
    });
  };

  return (
    <div className="text-sm h-[400px] overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none z-10"></div>

      <div className="space-y-1 text-white/90 h-full overflow-hidden">
        {renderCodeWithSyntaxHighlight(displayedCode)}
        {/* Миг��ющий курсор */}
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
  const [isModelRotating, setIsModelRotating] = useState(false);

  // Запуск анимации при загрузке компонента
  useEffect(() => {
    const timer = setTimeout(() => {
      setNavbarAnimated(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Отслеживание скролла для навбара (без эффекта "брови")
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 100;
      setNavbarScrolled(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = React.useCallback(() => {
    logout();
    window.location.reload();
  }, [logout]);

  const handleAddBeginnerPlan = React.useCallback(() => {
    addItem({
      id: "beginner-plan",
      name: "Beginner Plan",
      price: 199,
      description:
        "Access to basic blockchain guides and fundamental knowledge",
      category: "blockchain-basic",
    });
  }, [addItem]);

  const handleAddIntermediatePlan = React.useCallback(() => {
    addItem({
      id: "intermediate-plan",
      name: "Intermediate Plan",
      price: 349,
      description:
        "Everything in Beginner + Advanced blockchain insights and tools",
      category: "blockchain-intermediate",
    });
  }, [addItem]);

  const handleAddAdvancedPlan = React.useCallback(() => {
    addItem({
      id: "advanced-plan",
      name: "Advanced Plan",
      price: 495,
      description:
        "Everything in Intermediate + Professional tools and priority support",
      category: "blockchain-advanced",
    });
  }, [addItem]);

  const handleProceedToOrder = React.useCallback(() => {
    navigate("/order");
  }, [navigate]);

  const handleListeningChange = React.useCallback(
    (isListening: boolean, transcript?: string) => {
      // Микрофон работает в ф��не, панель не показываем
      console.log(
        "🎤 Микрофон активен:",
        isListening,
        "Транскрипт:",
        transcript,
      );
    },
    [],
  );

  const handleStopListening = React.useCallback(() => {
    setForceStopVoice(true);
    setTimeout(() => setForceStopVoice(false), 100);
  }, []);

  const handleModelRotateStart = React.useCallback(() => {
    console.log("🔄 Запуск вращения модели");
    setIsModelRotating(true);
  }, []);

  const handleModelRotateStop = React.useCallback(() => {
    console.log("⏹️ Остановка вращения модели");
    setIsModelRotating(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <ArcReactor size="large" pulsing />
          <p className="text-white mt-4">
            <GlitchText>INITIALIZING STARK SYSTEMS...</GlitchText>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Убраны неоновые эффекты */}
      {/* Navigation - Enhanced with Stark styling */}
      <nav
        className={cn(
          "fixed left-1/2 transform -translate-x-1/2 z-40 transition-all duration-500",
          // Базовые стили в зависимости от состояния скролла
          navbarScrolled
            ? "bg-black/85 backdrop-blur-xl border border-cyan-500/40 shadow-lg shadow-cyan-500/20"
            : "bg-black/60 backdrop-blur-md border border-cyan-400/30 shadow-md shadow-cyan-400/10",

          "top-2 rounded-full px-3 py-2 w-auto h-auto", // Улучшенные отступы
        )}
      >
        <div
          className={cn(
            "flex items-center transition-all duration-500 overflow-hidden",
            "space-x-3 opacity-100 scale-100", // Увеличенное расстояние между элементами
          )}
        >
          {/* Home Button */}
          <Button
            variant="ghost"
            className={cn(
              "text-xs px-2 py-1 rounded-full hover:bg-cyan-400/10 transition-all duration-500 transform",
              "scale-100 opacity-100 w-auto",
            )}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="stark-text-glow">Home</span>
          </Button>

          {/* JARVIS Interface in Navbar */}
          <div
            className={cn(
              "transition-all duration-500 transform",
              "scale-100 opacity-100 w-auto",
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
            />
          </div>

          {/* Dynamic Island indicator during scroll */}
          <div
            className={cn(
              "flex items-center space-x-1 transition-all duration-500 transform",
              "scale-0 opacity-0 w-0 overflow-hidden",
            )}
          >
            <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
            <div
              className="w-1 h-1 bg-white rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-1 h-1 bg-white rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>

          {/* Cart Dropdown */}
          <div
            className={cn(
              "transition-all duration-500 transform",
              "scale-100 opacity-100 w-auto",
            )}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  data-testid="cart-button"
                  className="relative p-1.5 rounded-full hover:bg-cyan-400/10 transition-all duration-300"
                >
                  <ShoppingCart className="w-4 h-4 text-white" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {getTotalItems()}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 bg-black/90 border-gray-500/30 mt-2 backdrop-blur-lg"
              >
                <div className="px-3 py-2">
                  <h3 className="font-semibold text-white mb-2">CART MATRIX</h3>
                  {items.length === 0 ? (
                    <p className="text-sm text-white/60 text-center py-4">
                      Cart is empty
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between p-2 bg-black/50 border border-gray-500/20 rounded-lg"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-white">
                                {item.name}
                              </h4>
                              <p className="text-xs text-white/60 mt-1">
                                {item.description.substring(0, 60)}...
                              </p>
                              <p className="text-sm font-semibold text-white mt-1">
                                {item.price.toLocaleString()} сум
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="ml-2 h-6 w-6 p-0 hover:bg-gray-500/20 text-white"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                      <DropdownMenuSeparator className="bg-cyan-400/20 my-3" />
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-white">TOTAL:</span>
                        <span className="font-bold text-white">
                          {getTotalPrice().toLocaleString()} сум
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={clearCart}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-gray-500/50 text-white hover:bg-gray-500/10"
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
              "scale-100 opacity-100 w-auto",
            )}
          >
            <ThemeToggle />
          </div>

          {isAuthenticated && currentUser ? (
            <div
              className={cn(
                "transition-all duration-500 transform",
                "scale-100 opacity-100 w-auto",
              )}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-cyan-400/10 transition-all duration-300"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:block text-sm">
                      {currentUser.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-black/90 border-cyan-400/30 mt-2 backdrop-blur-lg"
                >
                  <div className="px-2 py-1.5 text-sm text-white/60">
                    <div className="font-medium text-white">
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
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/chat")}
                    className="text-white hover:bg-cyan-400/10 cursor-pointer"
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    <span>Чат с Пятницей</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-cyan-400/20" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-white hover:bg-gray-500/10 cursor-pointer"
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
                "scale-100 opacity-100 w-auto",
              )}
            >
              <Button
                variant="ghost"
                className="text-xs px-2 py-1 rounded-full hover:bg-cyan-400/10 transition-all duration-300"
                asChild
              >
                <Link to="/login">
                  <span className="stark-text-glow">Login</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="text-xs px-2 py-1 rounded-full hover:bg-cyan-400/10 transition-all duration-300"
                asChild
              >
                <Link to="/signup">
                  <span className="stark-text-glow">Sign up</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="text-xs px-2 py-1 rounded-full hover:bg-cyan-400/10 transition-all duration-300"
                asChild
              >
                <Link to="/chat">
                  <span className="stark-text-glow">Пятница</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Stark Style */}
      <StarkHero
        isModelRotating={isModelRotating}
        onModelRotationStart={handleModelRotateStart}
        onModelRotationStop={handleModelRotateStop}
      />

      {/* Advantages Section */}
      <AdvantagesSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Jarvis Demo Section */}
      <JarvisDemo />
    </div>
  );
}
