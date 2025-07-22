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
        "Базовая вёрстка, адаптив под все устройс��ва, бесплатный SSL, техподдержка 24/7",
      category: "website",
    });
  };

  const handleAddProPlan = () => {
    addItem({
      id: "pro-plan",
      name: "Pro сайт с ИИ",
      price: 3500000,
      description:
        "ИИ: чат-бот, автозаполнение, умные блоки, полный ада��тив, быстрая загрузка, SEO оптимизация",
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
          {/* Энергетическое поле */}
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
                      Корзина пуста
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
                        <span className="font-semibold theme-text">Итого:</span>
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
              Профессиональные решения для создания современных веб-сайтов
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
                      Basic сайт
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
                      Без искусственного интеллекта
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
                      Техподдержка 24/7
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
                      Pro са��т с ИИ
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
                      Полный адаптив
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
                      Технологии нового поколения
                    </li>
                    <li className="flex items-center theme-text-muted group">
                      <div className="w-5 h-5 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-cyan-500/30 transition-colors">
                        <CheckCircle className="w-3 h-3 text-cyan-400" />
                      </div>
                      Поддержка WebGL �� AI интерфейса
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
              Мы создаем не просто сайты — мы разрабатываем интеллектуал��ные
              решения, которые работают как ваш персональный ИИ-помощник
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
                  месяцами, мы реализуем за недели.
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
                  бизнеса. Джарвис умеет общаться с клиентами, обрабатывать
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
                  ��оддержка 24/7
                </h3>
                <p className="theme-text-muted leading-relaxed">
                  Круглосуточная техническая п��ддержка и мониторинг вашего
                  ��айта. Мы оперативно решаем любые вопросы и следим за
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
                  Премиум ка��ество
                </h3>
                <p className="theme-text-muted leading-relaxed">
                  Используем только современные ��ехнологии и лучшие практики.
                  Каждый сайт проходит тщательное тестирование и оптимизацию
                  производительности.
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
                  Встроенная ИИ-аналитика отслеживает поведение пользователей и
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
                  Внедряем передовые технологии: WebGL, машинное об��чение,
                  голосовое управление и AR/VR элементы для максимального
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
                  Позвольте нашему ИИ Джа��вису стать цифровым помощником вашего
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
