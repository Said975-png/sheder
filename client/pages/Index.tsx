import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import VoiceControl from "@/components/VoiceControl";

import StarkHero from "@/components/StarkHero";
import JarvisInterface from "@/components/JarvisInterface";
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
  const [isVoicePanelActive, setIsVoicePanelActive] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [forceStopVoice, setForceStopVoice] = useState(false);

  // Запуск аним��ции при загрузке компонента
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
    setIsVoicePanelActive(isListening);
    setCurrentTranscript(transcript || "");
  };

  const handleCloseVoicePanel = () => {
    setIsVoicePanelActive(false);
    setCurrentTranscript("");
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
          isListening={isVoicePanelActive}
          transcript={currentTranscript}
        />
      )}

      {/* Navigation - Enhanced with Stark styling */}
      <nav
        className={cn(
          "fixed top-2 left-1/2 transform -translate-x-1/2 z-40 rounded-full px-2 py-1 transition-all duration-300",
          navbarScrolled
            ? "bg-black/80 backdrop-blur-lg border border-cyan-400/30 stark-glow"
            : "bg-transparent border border-cyan-400/20",
          isVoicePanelActive && "opacity-20 pointer-events-none",
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
            className="absolute bottom-1/4 right-10 w-32 h-32 border border-blue-400 rounded-full animate-spin"
            style={{ animationDuration: "15s", animationDirection: "reverse" }}
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
                  [ SUBSCRIPTION MATRIX ]
                </span>
              </div>
            </StarkHUD>

            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Access <HologramText glitch>Protocols</HologramText>
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto font-mono">
              <GlitchText intensity="low">
                Select your clearance level and initialize blockchain protocol
                access
              </GlitchText>
            </p>

            {/* Scanning Line */}
            <div className="mt-4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Beginner Plan */}
            <StarkHUD className="bg-gray-900/80 backdrop-blur-sm p-8 hover:bg-gray-800/80 transition-all duration-300 group cursor-pointer">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-4 text-white font-mono">
                  <GlitchText intensity="low">Beginner Plan</GlitchText>
                </h3>
                <div className="text-4xl font-bold mb-2 font-mono">
                  <HologramText>$199</HologramText>
                  <span className="text-lg text-white/60">/month</span>
                </div>
                <p className="text-white/60 font-mono">
                  Individuals new to blockchain
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="font-semibold font-mono text-cyan-400">
                  Features:
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    Access to basic blockchain guides
                  </li>
                  <li className="flex items-center text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    Fundamental blockchain knowledge
                  </li>
                  <li className="flex items-center text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    Community support
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleAddBeginnerPlan}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-3 rounded-xl stark-glow"
              >
                Choose Plan
              </Button>
            </StarkHUD>

            {/* Intermediate Plan */}
            <StarkHUD className="bg-gray-900/80 backdrop-blur-sm border-2 border-cyan-400 p-8 relative transform scale-105 group cursor-pointer">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-full font-mono">
                  Most Popular
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-4 text-white font-mono">
                  <GlitchText intensity="medium">Intermediate Plan</GlitchText>
                </h3>
                <div className="text-4xl font-bold mb-2 font-mono">
                  <HologramText glitch>$349</HologramText>
                  <span className="text-lg text-white/60">/month</span>
                </div>
                <p className="text-white/60 font-mono">
                  Users with some blockchain knowledge
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="font-semibold font-mono text-cyan-400">
                  Features:
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    Everything in Beginner
                  </li>
                  <li className="flex items-center text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    Access to advanced blockchain
                  </li>
                  <li className="flex items-center text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    Priority email support
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleAddIntermediatePlan}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-3 rounded-xl stark-glow"
              >
                Choose Plan
              </Button>
            </StarkHUD>

            {/* Advanced Plan */}
            <StarkHUD className="bg-gray-900/80 backdrop-blur-sm p-8 hover:bg-gray-800/80 transition-all duration-300 group cursor-pointer">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-4 text-white font-mono">
                  <GlitchText intensity="low">Advanced Plan</GlitchText>
                </h3>
                <div className="text-4xl font-bold mb-2 font-mono">
                  <HologramText>$495</HologramText>
                  <span className="text-lg text-white/60">/month</span>
                </div>
                <p className="text-white/60 font-mono">
                  Professionals looking for advanced tools and insights
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="font-semibold font-mono text-cyan-400">
                  Features:
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    Everything in Intermediate
                  </li>
                  <li className="flex items-center text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    Professional tools
                  </li>
                  <li className="flex items-center text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    1-on-1 consultations
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleAddAdvancedPlan}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-3 rounded-xl stark-glow"
              >
                Choose Plan
              </Button>
            </StarkHUD>
          </div>
        </div>
      </section>
    </div>
  );
}
