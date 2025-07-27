import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import ModernNavbar from "@/components/ModernNavbar";
import VoiceControl from "@/components/VoiceControl";
import StarkModeOverlay from "@/components/StarkModeOverlay";

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
  Code,
  Cpu,
  Brain,
  Zap,
  CheckCircle,
  Lock,
  Eye,
  Layers,
  TrendingUp,
  Search,
  Cog,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";

// Ком��онент для анимации печати кода
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
      }, 3000); // Пауза 3 секунды перед следующ��м к���дом
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

  const [isModelRotating, setIsModelRotating] = useState(false);

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
      {/* Modern Navigation Component */}
      <ModernNavbar
        onAddBasicPlan={handleAddBeginnerPlan}
        onAddProPlan={handleAddIntermediatePlan}
        onAddMaxPlan={handleAddAdvancedPlan}
      />

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

      {/* Voice Control с автоматическим циклом */}
      <VoiceControl
        onCommand={(command) => {
          console.log("🎤 Команда получена:", command);
        }}
        floating={true}
        size="lg"
      />

      {/* Stark Mode Overlay */}
      <StarkModeOverlay />
    </div>
  );
}
