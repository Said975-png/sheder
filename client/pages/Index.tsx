import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import RobotModel from "@/components/RobotModel";
import VoiceControl from "@/components/VoiceControl";
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
  Rocket,
  Clock,
  Star,
  Target,
  Sparkles,
  Bot,
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

  // Запуск анимации при загрузке компонента
  useEffect(() => {
    const timer = setTimeout(() => {
      setNavbarAnimated(true);
    }, 300); // Задержка для более драматичного появления

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const handleAddBasicPlan = () => {
    addItem({
      id: "basic-plan",
      name: "Basic сайт",
      price: 2000000,
      description:
        "Базовая вёрстка, адаптив под все устройства, бесплатный SSL, техподдержка 24/7",
      category: "website",
    });
  };

  const handleAddProPlan = () => {
    addItem({
      id: "pro-plan",
      name: "Pro сайт с ИИ",
      price: 3500000,
      description:
        "ИИ: чат-бот, автозаполнение, умные блоки, полный адаптив, быстрая загрузка, SEO оптимизация",
      category: "website-ai",
    });
  };

  const handleAddMaxPlan = () => {
    addItem({
      id: "max-plan",
      name: "Max сайт с Джарвисом",
      price: 5000000,
      description:
        "ИИ-помощник типа Джарвис, интеграция с API, технологии нового поколения, WebGL и AI интерфейс",
      category: "website-jarvis",
    });
  };

  const handleProceedToOrder = () => {
    navigate("/order");
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-gradient theme-text flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <p className="text-white/70">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ai-hero-container theme-text overflow-x-hidden">
      {/* Header */}
      {/* Oval Navbar */}
      <nav
        className={`fixed top-6 left-1/2 z-50 ${navbarAnimated ? "portal-entrance" : "opacity-0 transform -translate-x-1/2 scale-50"}`}
      >
        <div
          className="relative flex items-center space-x-8 bg-white/10 dark:bg-black/20 backdrop-blur-lg border border-purple-500/30 px-6 py-2 neon-glow holographic"
          style={{ borderRadius: "9999px" }}
        >
          {/* Энергетичес��ое поле */}
          <div className="energy-field rounded-full"></div>
          {/* Частицы */}
          <div className="portal-particles">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center logo-pulse">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold theme-text text-flicker">
              NEURA
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <a
              href="#"
              className="theme-nav-text transition-colors text-sm font-medium"
            >
              Home
            </a>
          </div>

          <div className="flex items-center space-x-3">
            {/* Cart Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative theme-button-text p-2 rounded-full hover:bg-white/10"
                  data-testid="cart-button"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 theme-dropdown border mt-2"
              >
                <div className="px-3 py-2">
                  <h3 className="font-semibold theme-text mb-2">Корзина</h3>
                  {items.length === 0 ? (
                    <p className="text-sm theme-text-muted text-center py-4">
                      Корзина пуст��
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between p-2 theme-card-solid rounded-lg"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-sm theme-text">
                                {item.name}
                              </h4>
                              <p className="text-xs theme-text-muted mt-1">
                                {item.description.substring(0, 60)}...
                              </p>
                              <p className="text-sm font-semibold theme-text mt-1">
                                {item.price.toLocaleString()} сум
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="ml-2 h-6 w-6 p-0 hover:bg-red-500/20"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                      <DropdownMenuSeparator className="bg-border my-3" />
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold theme-text">Итог��:</span>
                        <span className="font-bold theme-text">
                          {getTotalPrice().toLocaleString()} сум
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={clearCart}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Очистить
                        </Button>
                        <Button
                          onClick={handleProceedToOrder}
                          size="sm"
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          Оформить заказ
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
                    className="flex items-center space-x-2 theme-button-text p-2 rounded-full hover:bg-white/10"
                  >
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:block text-sm">
                      {currentUser.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 theme-dropdown border mt-2"
                >
                  <div className="px-2 py-1.5 text-sm theme-text-muted">
                    <div className="font-medium theme-text">
                      {currentUser.name}
                    </div>
                    <div className="text-xs">{currentUser.email}</div>
                  </div>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/profile")}
                    className="theme-dropdown-item cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Профиль</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/profile")}
                    className="theme-dropdown-item cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Настройки</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="theme-dropdown-item cursor-pointer text-red-500 hover:text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="theme-button-text text-sm px-4 py-2 rounded-full hover:bg-white/10"
                  asChild
                >
                  <Link to="/signup">Sign up</Link>
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-full"
                  asChild
                >
                  <Link to="/login">Login</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* AI Hero Section */}
      <main className="ai-hero-container py-20 pt-32 min-h-screen flex items-center">
        {/* Neural Network Background */}
        <div className="neural-network">
          {/* Neural Nodes */}
          <div
            className="neural-node"
            style={{ top: "10%", left: "15%", animationDelay: "0s" }}
          ></div>
          <div
            className="neural-node"
            style={{ top: "25%", left: "75%", animationDelay: "1s" }}
          ></div>
          <div
            className="neural-node"
            style={{ top: "60%", left: "20%", animationDelay: "2s" }}
          ></div>
          <div
            className="neural-node"
            style={{ top: "80%", left: "85%", animationDelay: "0.5s" }}
          ></div>
          <div
            className="neural-node"
            style={{ top: "40%", left: "50%", animationDelay: "1.5s" }}
          ></div>

          {/* Neural Connections */}
          <div
            className="neural-connection"
            style={{
              top: "15%",
              left: "15%",
              width: "60%",
              transform: "rotate(15deg)",
              animationDelay: "0.5s",
            }}
          ></div>
          <div
            className="neural-connection"
            style={{
              top: "45%",
              left: "20%",
              width: "30%",
              transform: "rotate(-25deg)",
              animationDelay: "1.2s",
            }}
          ></div>
          <div
            className="neural-connection"
            style={{
              top: "70%",
              left: "50%",
              width: "35%",
              transform: "rotate(35deg)",
              animationDelay: "0.8s",
            }}
          ></div>
        </div>

        {/* AI Particles */}
        <div className="ai-particles">
          <div
            className="ai-particle"
            style={{ top: "20%", left: "10%", animationDelay: "0s" }}
          ></div>
          <div
            className="ai-particle"
            style={{ top: "40%", left: "90%", animationDelay: "2s" }}
          ></div>
          <div
            className="ai-particle"
            style={{ top: "70%", left: "15%", animationDelay: "4s" }}
          ></div>
          <div
            className="ai-particle"
            style={{ top: "30%", left: "80%", animationDelay: "1s" }}
          ></div>
          <div
            className="ai-particle"
            style={{ top: "85%", left: "70%", animationDelay: "3s" }}
          ></div>
          <div
            className="ai-particle"
            style={{ top: "15%", left: "60%", animationDelay: "5s" }}
          ></div>
        </div>

        {/* Data Streams */}
        <div
          className="data-stream"
          style={{ top: "10%", left: "25%", animationDelay: "0s" }}
        ></div>
        <div
          className="data-stream"
          style={{ top: "20%", left: "70%", animationDelay: "1s" }}
        ></div>
        <div
          className="data-stream"
          style={{ top: "60%", left: "15%", animationDelay: "2s" }}
        ></div>
        <div
          className="data-stream"
          style={{ top: "40%", left: "85%", animationDelay: "1.5s" }}
        ></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-16">
            {/* Left Side - Content */}
            <div className="flex-1 space-y-10">
              <div className="space-y-8">
                <h1
                  className="text-5xl lg:text-7xl font-bold leading-tight hologram-text"
                  data-text="Jarvis - искусственный интеллект для вашего бизнеса"
                >
                  Jarvis - искусственный интеллект для вашего бизнеса
                </h1>

                <div className="relative p-6 bg-black/20 backdrop-blur-md border border-purple-500/30 rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl"></div>
                  <p className="text-lg text-purple-100 relative z-10 leading-relaxed">
                    Enter the future of bot-free mobile apps. Simplify bot
                    detection, enhance user experiences, and fortify your app's
                    ecosystem.
                  </p>

                  {/* Holographic corner accents */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-purple-500 opacity-60"></div>
                  <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-purple-500 opacity-60"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-purple-500 opacity-60"></div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-purple-500 opacity-60"></div>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-black/30 backdrop-blur-sm border border-purple-500/20 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                </div>
                <span className="text-purple-200 text-sm font-mono">
                  Beta release date June 30th, 2023
                </span>
                <div className="ml-auto text-xs text-purple-400 font-mono">
                  STATUS: ACTIVE
                </div>
              </div>
            </div>

            {/* Right Side - 3D Model positioned at header level */}
            <div className="flex-shrink-0 w-full md:w-96 h-96 md:-mt-4 lg:-mt-8 xl:-mt-12">
              <div
                className="relative w-full h-full overflow-visible z-30"
                style={{ padding: "20px" }}
              >
                {/* 3D Model */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-full h-full relative">
                    <RobotModel />

                    {/* Glowing effect around 3D model */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
                    <div className="absolute inset-4 bg-gradient-to-r from-purple-400/20 to-cyan-400/20 rounded-full blur-2xl animate-ping pointer-events-none"></div>
                  </div>
                </div>

                {/* Floating Code Elements with Gravity */}
                <div className="absolute -top-8 -right-12 p-3 bg-black/40 backdrop-blur-sm border border-green-500/30 rounded text-green-400 font-mono text-xs gravity-float z-10">
                  {'{ AI: "active" }'}
                </div>
                <div
                  className="absolute -bottom-6 -left-12 p-2 bg-black/40 backdrop-blur-sm border border-blue-500/30 rounded text-blue-400 font-mono text-xs gravity-bounce z-10"
                  style={{ animationDelay: "1s" }}
                >
                  neural.connect()
                </div>
                <div
                  className="absolute top-24 -right-16 p-2 bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded text-purple-400 font-mono text-xs gravity-drift z-10"
                  style={{ animationDelay: "2s" }}
                >
                  ML.process()
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="ai-hero-container py-16 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Мощ��ые возможности</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Все инструменты, необходимые для превращения дизайна в полноценное
              ��еб-приложение
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Detection</h3>
              <p className="text-white/60">
                Перед��вые алгоритмы ��ля обнаруж��ния ботов и автоматических
                систем
              </p>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Integration</h3>
              <p className="text-white/60">
                Простая интеграция с любыми приложениями и платформами
              </p>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">User Experience</h3>
              <p className="text-white/60">
                Максимальное удобство для пользователей без компромиссов в
                б��зопасности
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section - Company Logos */}
      <section className="ai-hero-container py-16 relative">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-8">
            <h2 className="text-xl font-medium text-white/80 max-w-2xl mx-auto">
              Guarding The Industry's Top Apps And Games.
              <br />
              From Innovative Startups To Renowned Enterprises.
            </h2>

            <div className="flex items-center justify-center space-x-12 opacity-60">
              {/* Unity Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <span className="text-black font-bold text-sm">U</span>
                </div>
                <span className="text-white font-medium">Unity</span>
              </div>

              {/* Unreal Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">U</span>
                </div>
                <span className="text-white font-medium">UNREAL</span>
              </div>

              {/* Apple Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <span className="text-black font-bold text-sm">🍎</span>
                </div>
                <span className="text-white font-medium">Apple</span>
              </div>

              {/* Meta Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-white font-medium">Meta</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        data-section="pricing"
        className="ai-hero-container py-24 relative"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 theme-text">
              Выберите подходящий план
            </h2>
            <p className="text-lg theme-text-muted max-w-2xl mx-auto">
              Пр��фессиональные решения для создания современных веб-сайтов
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Plan Card */}
            <div className="group relative pricing-card-enter">
              <div className="relative p-8 bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-lg border border-blue-500/30 rounded-3xl hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/25">
                {/* Glowing border effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 to-purple-600/40 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30 relative">
                        <Code className="w-8 h-8 text-blue-400" />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-2xl animate-pulse"></div>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>
                      <div className="absolute top-0 left-0 w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                    </div>
                    <h3 className="text-xl font-semibold theme-text mb-2">
                      Basic сай��
                    </h3>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                      2 000 000
                    </div>
                    <div className="text-sm theme-text-muted">сум</div>
                  </div>

                  <ul className="space-y-4 mb-8 text-sm">
                    <li className="flex items-center theme-text-muted group">
                      <div className="w-5 h-5 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-500/30 transition-colors">
                        <CheckCircle className="w-3 h-3 text-blue-400" />
                      </div>
                      Без искус��твенного интеллекта
                    </li>
                    <li className="flex items-center theme-text-muted group">
                      <div className="w-5 h-5 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-500/30 transition-colors">
                        <CheckCircle className="w-3 h-3 text-blue-400" />
                      </div>
                      Базовая вёрстка
                    </li>
                    <li className="flex items-center theme-text-muted group">
                      <div className="w-5 h-5 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-500/30 transition-colors">
                        <CheckCircle className="w-3 h-3 text-blue-400" />
                      </div>
                      Адаптив под все устройства
                    </li>
                    <li className="flex items-center theme-text-muted group">
                      <div className="w-5 h-5 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-500/30 transition-colors">
                        <CheckCircle className="w-3 h-3 text-blue-400" />
                      </div>
                      Бесплатный SSL
                    </li>
                    <li className="flex items-center theme-text-muted group">
                      <div className="w-5 h-5 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-500/30 transition-colors">
                        <CheckCircle className="w-3 h-3 text-blue-400" />
                      </div>
                      Т��хподдержка 24/7
                    </li>
                  </ul>

                  <Button
                    onClick={handleAddBasicPlan}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 glow-button"
                  >
                    Заказать
                  </Button>
                </div>
              </div>
            </div>

            {/* Pro Plan Card */}
            <div className="group relative transform md:scale-105 pricing-card-enter">
              <div className="relative p-8 bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-lg border border-orange-500/30 rounded-3xl hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/25">
                {/* Glowing border effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/40 to-red-600/40 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>

                {/* Popular badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-semibold px-4 py-2 rounded-full">
                    Популярный
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-2xl flex items-center justify-center border border-orange-500/30 relative">
                        <Cpu className="w-8 h-8 text-orange-400" />
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-600/10 rounded-2xl animate-pulse"></div>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                      <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                    </div>
                    <h3 className="text-xl font-semibold theme-text mb-2">
                      Pro сайт с ИИ
                    </h3>
                    <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-1">
                      3 500 000
                    </div>
                    <div className="text-sm theme-text-muted">сум</div>
                  </div>

                  <ul className="space-y-4 mb-8 text-sm">
                    <li className="flex items-center theme-text-muted group">
                      <div className="w-5 h-5 bg-orange-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-500/30 transition-colors">
                        <Zap className="w-3 h-3 text-orange-400" />
                      </div>
                      ИИ: чат-бот, автозаполнение, умные блоки
                    </li>
                    <li className="flex items-center theme-text-muted group">
                      <div className="w-5 h-5 bg-orange-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-500/30 transition-colors">
                        <CheckCircle className="w-3 h-3 text-orange-400" />
                      </div>
                      Полн��й адаптив
                    </li>
                    <li className="flex items-center theme-text-muted group">
                      <div className="w-5 h-5 bg-orange-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-500/30 transition-colors">
                        <CheckCircle className="w-3 h-3 text-orange-400" />
                      </div>
                      Быстрая загрузка
                    </li>
                    <li className="flex items-center theme-text-muted group">
                      <div className="w-5 h-5 bg-orange-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-500/30 transition-colors">
                        <CheckCircle className="w-3 h-3 text-orange-400" />
                      </div>
                      SEO оптимизация
                    </li>
                    <li className="flex items-center theme-text-muted group">
                      <div className="w-5 h-5 bg-orange-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-500/30 transition-colors">
                        <CheckCircle className="w-3 h-3 text-orange-400" />
                      </div>
                      Техподдержка 24/7
                    </li>
                  </ul>

                  <Button
                    onClick={handleAddProPlan}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30 glow-button"
                  >
                    Заказать
                  </Button>
                </div>
              </div>
            </div>

            {/* Max Plan Card */}
            <div className="group relative pricing-card-enter">
              <div className="relative p-8 bg-gradient-to-br from-cyan-500/20 to-teal-600/20 backdrop-blur-lg border border-cyan-500/30 rounded-3xl hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/25">
                {/* Glowing border effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/40 to-teal-600/40 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500/20 to-teal-600/20 rounded-2xl flex items-center justify-center border border-cyan-500/30 relative">
                        <Brain className="w-8 h-8 text-cyan-400" />
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-600/10 rounded-2xl animate-pulse"></div>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-teal-500 rounded-full animate-ping"></div>
                      <div className="absolute top-0 left-0 w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    </div>
                    <h3 className="text-xl font-semibold theme-text mb-2">
                      Max сайт с Джарвисом
                    </h3>
                    <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent mb-1">
                      5 000 000
                    </div>
                    <div className="text-sm theme-text-muted">сум</div>
                  </div>

                  <ul className="space-y-4 mb-8 text-sm">
                    <li className="flex items-center theme-text-muted group">
                      <div className="w-5 h-5 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-cyan-500/30 transition-colors">
                        <Brain className="w-3 h-3 text-cyan-400" />
                      </div>
                      ИИ-помощник типа Джарвис (голосовой ввод)
                    </li>
                    <li className="flex items-center theme-text-muted group">
                      <div className="w-5 h-5 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-cyan-500/30 transition-colors">
                        <Zap className="w-3 h-3 text-cyan-400" />
                      </div>
                      Интеграция с API
                    </li>
                    <li className="flex items-center theme-text-muted group">
                      <div className="w-5 h-5 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-cyan-500/30 transition-colors">
                        <Cpu className="w-3 h-3 text-cyan-400" />
                      </div>
                      Технол��гии нового поколения
                    </li>
                    <li className="flex items-center theme-text-muted group">
                      <div className="w-5 h-5 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-cyan-500/30 transition-colors">
                        <CheckCircle className="w-3 h-3 text-cyan-400" />
                      </div>
                      Подде��жка WebGL и AI интерфейса
                    </li>
                    <li className="flex items-center theme-text-muted group">
                      <div className="w-5 h-5 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-cyan-500/30 transition-colors">
                        <CheckCircle className="w-3 h-3 text-cyan-400" />
                      </div>
                      Максимальный уровень кастомизации
                    </li>
                  </ul>

                  <Button
                    onClick={handleAddMaxPlan}
                    className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 glow-button"
                  >
                    Заказать
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Advantages Section */}
      <section className="ai-hero-container py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 theme-text">
              Наши преимущества
            </h2>
            <p className="text-lg theme-text-muted max-w-3xl mx-auto">
              Мы создаем не просто сайты — мы разрабатываем и��теллектуальные
              реше��ия, которые работают как ваш персональный ИИ-помощник
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Speed Advantage */}
            <div className="group relative p-8 theme-card border border-purple-500/20 rounded-2xl hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold theme-text mb-4">
                  Молниеносная разработка
                </h3>
                <p className="theme-text-muted leading-relaxed">
                  Создаем полноценные сайты в 3-5 раз быстрее благодаря нашим
                  ИИ-инструментам и готовым модулям. То, что другие делают
                  меся��ами, мы реализуем за недели.
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* AI Jarvis */}
            <div className="group relative p-8 theme-card border border-cyan-500/20 rounded-2xl hover:border-cyan-500/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative">
                  <Brain className="w-8 h-8 text-cyan-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-xl font-bold theme-text mb-4">
                  Уникальный ИИ Джарвис
                </h3>
                <p className="theme-text-muted leading-relaxed">
                  Разрабатываем персонального ИИ-помощника специально для вашего
                  бизнеса. Джарвис ум��ет общаться с клиентами, обрабатывать
                  заказы и управлять контентом.
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* 24/7 Support */}
            <div className="group relative p-8 theme-card border border-orange-500/20 rounded-2xl hover:border-orange-500/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold theme-text mb-4">
                  Поддержка 24/7
                </h3>
                <p className="theme-text-muted leading-relaxed">
                  Круглосуточная техническая поддержка и мониторинг ваше��о
                  сайта. Мы оперативно решаем любые вопросы и следим за
                  стабильной работой.
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Premium Quality */}
            <div className="group relative p-8 theme-card border border-yellow-500/20 rounded-2xl hover:border-yellow-500/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold theme-text mb-4">
                  Прем��ум качество
                </h3>
                <p className="theme-text-muted leading-relaxed">
                  Используе�� только современные технологии и лучшие практики.
                  Каждый сайт проходит тщательное тестирование и оптимизацию
                  производител��ности.
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Smart Analytics */}
            <div className="group relative p-8 theme-card border border-green-500/20 rounded-2xl hover:border-green-500/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold theme-text mb-4">
                  Умная аналитика
                </h3>
                <p className="theme-text-muted leading-relaxed">
                  Встроенная ИИ-аналитика отслеживает поведение пользова��елей и
                  автоматически оптимизирует конверсию вашего онлайн-магазина.
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Innovation */}
            <div className="group relative p-8 theme-card border border-pink-500/20 rounded-2xl hover:border-pink-500/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold theme-text mb-4">
                  Инновационные решения
                </h3>
                <p className="theme-text-muted leading-relaxed">
                  Внедряем передовые технологии: WebGL, м��шинное ��бучение,
                  голосово�� управление и AR/VR эл��менты для максимального
                  wow-эффекта.
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-purple-600/20 to-cyan-600/20 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-8">
                <h3 className="text-2xl font-bold theme-text mb-4">
                  Готовы создать что-то невероятное?
                </h3>
                <p className="theme-text-muted mb-6 max-w-2xl mx-auto">
                  Позвольте нашему ИИ Джарвису стать цифровым помощником вашего
                  бизнеса. Начнем разработку уже сегодня!
                </p>
                <Button
                  onClick={() =>
                    document
                      .querySelector('[data-section="pricing"]')
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-3 text-lg font-semibold"
                >
                  <Bot className="w-5 h-5 mr-2" />
                  Заказать разработку
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Control Component */}
      <VoiceControl
        onAddBasicPlan={handleAddBasicPlan}
        onAddProPlan={handleAddProPlan}
        onAddMaxPlan={handleAddMaxPlan}
      />
    </div>
  );
}
