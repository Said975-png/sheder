import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Bot,
  FileText,
  User,
  Home,
  MessageCircle,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  ArrowUp,
} from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    scrollToTop();
  };

  return (
    <footer className="relative bg-black border-t border-white/10 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
              radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px, 40px 40px",
          }}
        />
      </div>

      {/* Subtle glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.01] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/[0.005] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Detect</h3>
                <p className="text-white/60 text-sm">STARK INDUSTRIES</p>
              </div>
            </div>
            <p className="text-white/70 leading-relaxed">
              Революционный ИИ-ассистент, который понимает ваши потребности и
              превращает идеи в реальность. Будущее взаимодействия с
              технологиями уже здесь.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10 p-2"
              >
                <Github className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10 p-2"
              >
                <Twitter className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10 p-2"
              >
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10 p-2"
              >
                <Instagram className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Навигация</h4>
            <nav className="space-y-3">
              <Button
                variant="ghost"
                className="justify-start p-0 h-auto text-white/70 hover:text-white font-normal"
                onClick={() => handleNavigation("/")}
              >
                <Home className="w-4 h-4 mr-2" />
                Главная
              </Button>
              <Button
                variant="ghost"
                className="justify-start p-0 h-auto text-white/70 hover:text-white font-normal"
                onClick={() => handleNavigation("/profile")}
              >
                <User className="w-4 h-4 mr-2" />
                Личный кабинет
              </Button>
              <Button
                variant="ghost"
                className="justify-start p-0 h-auto text-white/70 hover:text-white font-normal"
                onClick={() => handleNavigation("/chat")}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Чат с Jarvis
              </Button>
              <Button
                variant="ghost"
                className="justify-start p-0 h-auto text-white/70 hover:text-white font-normal"
                onClick={() => handleNavigation("/admin")}
              >
                <Bot className="w-4 h-4 mr-2" />
                Панель управления
              </Button>
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Услуги</h4>
            <nav className="space-y-3">
              <Link
                to="#"
                className="flex items-center text-white/70 hover:text-white transition-colors duration-300"
              >
                <FileText className="w-4 h-4 mr-2" />
                Веб-разработка
              </Link>
              <Link
                to="#"
                className="flex items-center text-white/70 hover:text-white transition-colors duration-300"
              >
                <Bot className="w-4 h-4 mr-2" />
                ИИ-интеграция
              </Link>
              <Link
                to="#"
                className="flex items-center text-white/70 hover:text-white transition-colors duration-300"
              >
                <Shield className="w-4 h-4 mr-2" />
                Защита от ботов
              </Link>
              <Link
                to="#"
                className="flex items-center text-white/70 hover:text-white transition-colors duration-300"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Техподдержка 24/7
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Контакты</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-white/60 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white/70 text-sm">Email</p>
                  <a
                    href="mailto:info@aidetect.com"
                    className="text-white hover:text-blue-400 transition-colors duration-300"
                  >
                    info@aidetect.com
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-white/60 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white/70 text-sm">Телефон</p>
                  <a
                    href="tel:+998901234567"
                    className="text-white hover:text-blue-400 transition-colors duration-300"
                  >
                    +998 (90) 123-45-67
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-white/60 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white/70 text-sm">Адрес</p>
                  <p className="text-white">
                    Ташкент, Узбекистан
                    <br />
                    ул. Мустакиллик, 1
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-white/60 text-sm">
                © 2024 AI Detect. Все права защищены.
              </p>
              <p className="text-white/40 text-xs mt-1">
                Powered by STARK INDUSTRIES AI Division
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link
                to="#"
                className="text-white/60 hover:text-white text-sm transition-colors duration-300"
              >
                Политика конфиденциальности
              </Link>
              <Link
                to="#"
                className="text-white/60 hover:text-white text-sm transition-colors duration-300"
              >
                Условия использования
              </Link>
              <Button
                onClick={scrollToTop}
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10 p-2"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
