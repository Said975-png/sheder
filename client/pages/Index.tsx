import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, User, LogOut, Settings, Code, Cpu, Brain, Zap, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
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
    <div className="min-h-screen theme-gradient theme-text overflow-hidden">
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

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 pt-24">
        <div className="grid md:grid-cols-2 gap-12 items-center min-h-[600px]">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight theme-text">
                Jarvis - искусственный интеллект для вашего бизнеса
              </h1>

              <p className="text-lg theme-text-muted max-w-md">
                Enter the future of bot-free mobile apps. Simplify bot
                detection, enhance user experiences, and fortify your app's
                ecosystem.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-sm text-white/60">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Beta release date June 30th, 2023</span>
            </div>
          </div>

                    {/* Right Side - Empty space where 3D model was */}
          <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">
            <div className="w-full h-full relative">
              {/* Floating elements for ambiance */}
              <div className="absolute -top-8 -left-8 w-4 h-4 bg-white rounded-full opacity-60 animate-pulse pointer-events-none"></div>
              <div className="absolute -top-4 right-12 w-3 h-3 bg-purple-400 rounded-full opacity-80 animate-bounce pointer-events-none"></div>
              <div className="absolute bottom-8 -right-12 w-5 h-5 bg-blue-400 rounded-full opacity-70 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Мощные воз��ожности</h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Все инструменты, необходимые для превращения дизайна в полноценное
            веб-приложение
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Detection</h3>
            <p className="text-white/60">
              Передовые алгоритмы для обнаружения ботов и автоматических систем
            </p>
          </div>

          <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy Integration</h3>
            <p className="text-white/60">
              Простая интеграция �� любыми прилож��ниями и платформами
            </p>
          </div>

          <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">User Experience</h3>
            <p className="text-white/60">
              Максимальное удобство для пользователей без компромиссов в
              безопасности
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Section - Company Logos */}
      <section className="container mx-auto px-6 py-16">
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
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-6 py-24">
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
                  <div className="text-4xl mb-3">💼</div>
                  <h3 className="text-xl font-semibold theme-text mb-2">Basik сайт</h3>
                  <div className="text-3xl font-bold text-blue-400 mb-1">2 000 000</div>
                  <div className="text-sm theme-text-muted">сум</div>
                </div>

                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center theme-text-muted">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 pulse-dot"></div>
                    Без искусственного интеллекта
                  </li>
                  <li className="flex items-center theme-text-muted">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 pulse-dot"></div>
                    Базовая вёрстка
                  </li>
                  <li className="flex items-center theme-text-muted">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 pulse-dot"></div>
                    Адаптив под все устройства
                  </li>
                  <li className="flex items-center theme-text-muted">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 pulse-dot"></div>
                    Бесплатный SSL
                  </li>
                  <li className="flex items-center theme-text-muted">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 pulse-dot"></div>
                    Техподдержка 24/7
                  </li>
                </ul>

                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 glow-button">
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
                  <div className="text-4xl mb-3">🤖</div>
                  <h3 className="text-xl font-semibold theme-text mb-2">Pro сайт с ИИ</h3>
                  <div className="text-3xl font-bold text-orange-400 mb-1">3 500 000</div>
                  <div className="text-sm theme-text-muted">сум</div>
                </div>

                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center theme-text-muted">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-3 pulse-dot"></div>
                    ИИ: чат-бот, автозаполнение, умные блоки
                  </li>
                  <li className="flex items-center theme-text-muted">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-3 pulse-dot"></div>
                    Полный адаптив
                  </li>
                  <li className="flex items-center theme-text-muted">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-3 pulse-dot"></div>
                    Быстрая загрузка
                  </li>
                  <li className="flex items-center theme-text-muted">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-3 pulse-dot"></div>
                    SEO оптимизация
                  </li>
                  <li className="flex items-center theme-text-muted">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-3 pulse-dot"></div>
                    Техподдержка 24/7
                  </li>
                </ul>

                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30 glow-button">
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
                  <div className="text-4xl mb-3">🧠</div>
                  <h3 className="text-xl font-semibold theme-text mb-2">Max сайт с Джарвисом</h3>
                  <div className="text-3xl font-bold text-cyan-400 mb-1">5 000 000</div>
                  <div className="text-sm theme-text-muted">сум</div>
                </div>

                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center theme-text-muted">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-3 pulse-dot"></div>
                    ИИ-помощник типа Джарвис (голосовой ввод)
                  </li>
                  <li className="flex items-center theme-text-muted">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-3 pulse-dot"></div>
                    Интеграция с API
                  </li>
                  <li className="flex items-center theme-text-muted">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-3 pulse-dot"></div>
                    Технологии нового поколения
                  </li>
                  <li className="flex items-center theme-text-muted">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-3 pulse-dot"></div>
                    Поддержка WebGL и AI интерфейса
                  </li>
                  <li className="flex items-center theme-text-muted">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-3 pulse-dot"></div>
                    Максимальный уровень кастомизации
                  </li>
                </ul>

                <Button className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 glow-button">
                  Заказать
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
