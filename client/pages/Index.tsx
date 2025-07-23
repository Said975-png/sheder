import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import VoiceControl from "@/components/VoiceControl";

import StarkHero from "@/components/StarkHero";
import VoicePanel from "@/components/VoicePanel";
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
  Brain,
  Zap,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";


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

  const [isVoicePanelActive, setIsVoicePanelActive] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState("");
  const [forceStopVoice, setForceStopVoice] = useState(false);





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

  const handleListeningChange = (isListening: boolean, transcript?: string, isSpeaking?: boolean) => {
    // Панель остается активной, если микрофон включен ИЛИ если был активен ранее
    if (isListening) {
      setIsVoicePanelActive(true);
    }
    // Не закрываем панель автоматически - пользователь сам решает когда закрыть

    // Простая логика: если транскрипт пустой - очищаем, если нет - отображаем
    if (!transcript || transcript.trim() === "") {
      console.log("📱 Очищаем транскрипт в Index.tsx");
      setCurrentTranscript("");
      setLastProcessedTranscript("");
    } else {
      // Показываем транскрипт только если он отличается от предыдущего и не слишком длинный
      if (transcript !== lastProcessedTranscript && transcript.length < 50) {
        console.log("📱 Устанавливаем новый транскрипт:", transcript);
        setCurrentTranscript(transcript);
        setLastProcessedTranscript(transcript);
      } else if (transcript.length >= 50) {
        console.log(
          "📱 Отклоняем слишком длинный транскрипт:",
          transcript.length,
          "символов",
        );
        setCurrentTranscript("");
        setLastProcessedTranscript("");
      }
    }
  };

  const handleCloseVoicePanel = () => {
    setIsVoicePanelActive(false);
    setCurrentTranscript("");
    setLastProcessedTranscript("");
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
      {/* Voice Panel - показывается при активации микрофона */}
      {isVoicePanelActive && (
        <VoicePanel
          onAddBasicPlan={handleAddBeginnerPlan}
          onAddProPlan={handleAddIntermediatePlan}
          onAddMaxPlan={handleAddAdvancedPlan}
          onClose={handleCloseVoicePanel}
          onStopListening={handleStopListening}
          isListening={isVoicePanelActive}
          transcript={currentTranscript}
        />
      )}

      {/* Hero Section - Stark Style */}
      <StarkHero />

      {/* Why Blockchain Matters Section */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold">
                Why Blockchain <HologramText glitch>Matters</HologramText>
              </h2>

              <p className="text-lg text-white/70 leading-relaxed font-mono">
                <GlitchText intensity="low">
                  Blockchain is revolutionizing how we handle data,
                  transactions, and trust. By eliminating intermediaries and
                  creating secure, transparent systems, blockchain is laying the
                  foundation for a more efficient and fair digital future.
                </GlitchText>
              </p>

              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg stark-glow">
                <Code className="w-5 h-5 mr-2" />
                Read More
              </Button>
            </div>

            {/* Right Side - Content or other elements */}
            <div className="flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="w-64 h-64 mx-auto bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-cyan-400/30">
                  <div className="text-6xl text-cyan-400">
                    <Code className="w-16 h-16" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Enhanced */}
      <section id="pricing" className="py-20 bg-black relative overflow-hidden">
        {/* JARVIS Tech Background */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute top-1/4 left-10 w-40 h-40 border border-cyan-400 rounded-full animate-spin"
            style={{ animationDuration: "20s" }}
          ></div>
          <div
            className="absolute bottom-1/4 right-10 w-32 h-32 border border-cyan-400 rotate-45 animate-pulse"
            style={{ animationDuration: "3s" }}
          ></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 border border-cyan-400 rounded-full animate-bounce"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              <GlitchText intensity="medium">Choose Your Path</GlitchText>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto font-mono">
              Select the blockchain knowledge tier that matches your goals and
              expertise level
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <div className="group hover:scale-105 transition-all duration-300">
              <StarkHUD
                className="p-8 h-full bg-black/50 backdrop-blur-lg border border-cyan-400/30 rounded-lg stark-glow hover:border-cyan-400/60"
                showCorners={true}
                showScanlines={true}
                animated={true}
              >
                <div className="text-center mb-6">
                  <ArcReactor size="small" pulsing />
                  <h3 className="text-2xl font-bold text-cyan-400 mt-4 font-mono">
                    <GlitchText intensity="low">Beginner</GlitchText>
                  </h3>
                  <div className="text-4xl font-bold text-white mt-2">
                    $199
                    <span className="text-lg text-white/60 font-normal">
                      /month
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-white/80">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mr-3" />
                    <span className="font-mono text-sm">
                      Basic blockchain fundamentals
                    </span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mr-3" />
                    <span className="font-mono text-sm">
                      Cryptocurrency basics
                    </span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mr-3" />
                    <span className="font-mono text-sm">
                      Community access
                    </span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mr-3" />
                    <span className="font-mono text-sm">Email support</span>
                  </div>
                </div>

                <Button
                  onClick={handleAddBeginnerPlan}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-lg stark-glow font-mono"
                >
                  Get Started
                </Button>
              </StarkHUD>
            </div>

            {/* Pro Plan */}
            <div className="group hover:scale-105 transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-bold stark-glow">
                MOST POPULAR
              </div>
              <StarkHUD
                className="p-8 h-full bg-black/50 backdrop-blur-lg border border-orange-400/50 rounded-lg stark-glow hover:border-orange-400/80"
                showCorners={true}
                showScanlines={true}
                animated={true}
              >
                <div className="text-center mb-6">
                  <ArcReactor size="medium" pulsing />
                  <h3 className="text-2xl font-bold text-orange-400 mt-4 font-mono">
                    <GlitchText intensity="medium">Intermediate</GlitchText>
                  </h3>
                  <div className="text-4xl font-bold text-white mt-2">
                    $349
                    <span className="text-lg text-white/60 font-normal">
                      /month
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-white/80">
                    <CheckCircle className="w-5 h-5 text-orange-400 mr-3" />
                    <span className="font-mono text-sm">
                      Everything in Beginner
                    </span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <CheckCircle className="w-5 h-5 text-orange-400 mr-3" />
                    <span className="font-mono text-sm">
                      Advanced DeFi strategies
                    </span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <CheckCircle className="w-5 h-5 text-orange-400 mr-3" />
                    <span className="font-mono text-sm">Smart contract basics</span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <CheckCircle className="w-5 h-5 text-orange-400 mr-3" />
                    <span className="font-mono text-sm">
                      Priority support
                    </span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <CheckCircle className="w-5 h-5 text-orange-400 mr-3" />
                    <span className="font-mono text-sm">Weekly webinars</span>
                  </div>
                </div>

                <Button
                  onClick={handleAddIntermediatePlan}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-lg stark-glow font-mono"
                >
                  Level Up
                </Button>
              </StarkHUD>
            </div>

            {/* Advanced Plan */}
            <div className="group hover:scale-105 transition-all duration-300">
              <StarkHUD
                className="p-8 h-full bg-black/50 backdrop-blur-lg border border-purple-400/30 rounded-lg stark-glow hover:border-purple-400/60"
                showCorners={true}
                showScanlines={true}
                animated={true}
              >
                <div className="text-center mb-6">
                  <ArcReactor size="large" pulsing />
                  <h3 className="text-2xl font-bold text-purple-400 mt-4 font-mono">
                    <GlitchText intensity="high">Advanced</GlitchText>
                  </h3>
                  <div className="text-4xl font-bold text-white mt-2">
                    $495
                    <span className="text-lg text-white/60 font-normal">
                      /month
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-white/80">
                    <CheckCircle className="w-5 h-5 text-purple-400 mr-3" />
                    <span className="font-mono text-sm">
                      Everything in Intermediate
                    </span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <CheckCircle className="w-5 h-5 text-purple-400 mr-3" />
                    <span className="font-mono text-sm">
                      Professional trading tools
                    </span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <CheckCircle className="w-5 h-5 text-purple-400 mr-3" />
                    <span className="font-mono text-sm">
                      Advanced smart contracts
                    </span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <CheckCircle className="w-5 h-5 text-purple-400 mr-3" />
                    <span className="font-mono text-sm">1-on-1 mentoring</span>
                  </div>
                  <div className="flex items-center text-white/80">
                    <CheckCircle className="w-5 h-5 text-purple-400 mr-3" />
                    <span className="font-mono text-sm">API access</span>
                  </div>
                </div>

                <Button
                  onClick={handleAddAdvancedPlan}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-3 rounded-lg stark-glow font-mono"
                >
                  Go Pro
                </Button>
              </StarkHUD>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Powerful <HologramText>Features</HologramText>
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Experience the next generation of blockchain learning with our
              advanced platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group">
              <StarkHUD
                className="p-6 bg-black/50 backdrop-blur-lg border border-cyan-400/30 rounded-lg stark-glow hover:border-cyan-400/60 transition-all duration-300"
                showCorners={true}
                animated={true}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-400/30">
                    <Shield className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 font-mono">
                    <GlitchText intensity="low">Secure Learning</GlitchText>
                  </h3>
                  <p className="text-white/70 font-mono text-sm">
                    Advanced encryption and security protocols protect your
                    learning journey
                  </p>
                </div>
              </StarkHUD>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <StarkHUD
                className="p-6 bg-black/50 backdrop-blur-lg border border-cyan-400/30 rounded-lg stark-glow hover:border-cyan-400/60 transition-all duration-300"
                showCorners={true}
                animated={true}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-400/30">
                    <Brain className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 font-mono">
                    <GlitchText intensity="low">AI-Powered</GlitchText>
                  </h3>
                  <p className="text-white/70 font-mono text-sm">
                    Intelligent learning paths adapted to your progress and
                    goals
                  </p>
                </div>
              </StarkHUD>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <StarkHUD
                className="p-6 bg-black/50 backdrop-blur-lg border border-cyan-400/30 rounded-lg stark-glow hover:border-cyan-400/60 transition-all duration-300"
                showCorners={true}
                animated={true}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-400/30">
                    <Zap className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 font-mono">
                    <GlitchText intensity="low">Lightning Fast</GlitchText>
                  </h3>
                  <p className="text-white/70 font-mono text-sm">
                    Optimized performance for seamless learning experience
                  </p>
                </div>
              </StarkHUD>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-black border-t border-cyan-400/20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <ArcReactor size="small" pulsing />
                <span className="text-2xl font-bold text-cyan-400 font-mono">
                  <GlitchText>BlockchainAI</GlitchText>
                </span>
              </div>
              <p className="text-white/60 font-mono text-sm">
                Advanced blockchain education powered by artificial intelligence
              </p>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white font-mono">
                Platform
              </h4>
              <div className="space-y-2">
                <Link
                  to="/courses"
                  className="block text-white/60 hover:text-cyan-400 transition-colors font-mono text-sm"
                >
                  Courses
                </Link>
                <Link
                  to="/tools"
                  className="block text-white/60 hover:text-cyan-400 transition-colors font-mono text-sm"
                >
                  Tools
                </Link>
                <Link
                  to="/community"
                  className="block text-white/60 hover:text-cyan-400 transition-colors font-mono text-sm"
                >
                  Community
                </Link>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white font-mono">Support</h4>
              <div className="space-y-2">
                <Link
                  to="/help"
                  className="block text-white/60 hover:text-cyan-400 transition-colors font-mono text-sm"
                >
                  Help Center
                </Link>
                <Link
                  to="/contact"
                  className="block text-white/60 hover:text-cyan-400 transition-colors font-mono text-sm"
                >
                  Contact
                </Link>
                <Link
                  to="/docs"
                  className="block text-white/60 hover:text-cyan-400 transition-colors font-mono text-sm"
                >
                  Documentation
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white font-mono">Legal</h4>
              <div className="space-y-2">
                <Link
                  to="/privacy"
                  className="block text-white/60 hover:text-cyan-400 transition-colors font-mono text-sm"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="block text-white/60 hover:text-cyan-400 transition-colors font-mono text-sm"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-cyan-400/20 pt-8 text-center">
            <p className="text-white/60 font-mono text-sm">
              © 2024 BlockchainAI. All rights reserved.{" "}
              <GlitchText intensity="low">Powered by STARK Technology</GlitchText>
            </p>
          </div>
        </div>
      </footer>

      {/* Voice Control Component (Fixed Position) */}
      <VoiceControl
        onAddBasicPlan={handleAddBeginnerPlan}
        onAddProPlan={handleAddIntermediatePlan}
        onAddMaxPlan={handleAddAdvancedPlan}
        inNavbar={false}
        onListeningChange={handleListeningChange}
        forceStop={forceStopVoice}
      />
    </div>
  );
}
