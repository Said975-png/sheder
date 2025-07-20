import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import RobotModel from '@/components/RobotModel';

export default function Index() {
    const { currentUser, logout, isAuthenticated, loading } = useAuth();

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
      <header className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold">AI Detect</span>
          </div>
          
                    <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="theme-nav-text transition-colors">Home</a>
            <a href="#features" className="theme-nav-text transition-colors">About Us</a>
            <a href="#how-it-works" className="theme-nav-text transition-colors">Some guide</a>
            <a href="#" className="theme-nav-text transition-colors">Pricing</a>
          </nav>
          
                    <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated && currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-white/80 hover:text-white">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:block">{currentUser.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
                  <div className="px-2 py-1.5 text-sm text-gray-300">
                    <div className="font-medium">{currentUser.name}</div>
                    <div className="text-xs text-gray-400">{currentUser.email}</div>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-700" />
                                    <DropdownMenuItem
                    onClick={() => window.location.href = '/profile'}
                    className="text-gray-300 hover:bg-gray-700 cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Профиль</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => window.location.href = '/profile'}
                    className="text-gray-300 hover:bg-gray-700 cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Настройки</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-400 hover:bg-gray-700 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" className="text-white/80 hover:text-white" asChild>
                  <Link to="/signup">Sign up</Link>
                </Button>
                <Button variant="ghost" className="text-white/80 hover:text-white" asChild>
                  <Link to="/login">Login</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center min-h-[600px]">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Protect Your App<br />
                Against Non-Humans
              </h1>
              
              <p className="text-lg text-white/70 max-w-md">
                Enter the future of bot-free mobile apps. Simplify bot detection, enhance user experiences, and fortify your app's ecosystem.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                className="bg-transparent border-white/30 text-white hover:bg-white/10 px-8 py-3"
              >
                Verify you're human
              </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
              >
                Try Demo
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-white/60">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Beta release date June 30th, 2023</span>
            </div>
          </div>
          
          {/* Right Side - 3D Robot Model */}
          <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">
            <div className="w-full h-full relative">
              <RobotModel />
              
              {/* Floating elements for ambiance */}
              <div className="absolute -top-8 -left-8 w-4 h-4 bg-white rounded-full opacity-60 animate-pulse pointer-events-none"></div>
              <div className="absolute -top-4 right-12 w-3 h-3 bg-purple-400 rounded-full opacity-80 animate-bounce pointer-events-none"></div>
              <div className="absolute bottom-8 -right-12 w-5 h-5 bg-blue-400 rounded-full opacity-70 pointer-events-none"></div>
              
              {/* Credit text - styled to match design */}
              <div className="absolute bottom-2 left-2 text-xs text-white/40 pointer-events-none">
                <p>360° Sphere Robot by mikeramos</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Мощные возможности</h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Все инструменты, необходимые для превращения дизайна в полноценное веб-приложение
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
              Простая интеграция с любыми прилож��ниями и платформами
            </p>
          </div>
          
          <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">User Experience</h3>
            <p className="text-white/60">
              Максимальное удобство для пользователей без компромиссов в безопасности
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Section - Company Logos */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center space-y-8">
          <h2 className="text-xl font-medium text-white/80 max-w-2xl mx-auto">
            Guarding The Industry's Top Apps And Games.<br />
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
    </div>
  );
}
