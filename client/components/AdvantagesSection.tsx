import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Palette,
  Brain,
  Code,
  Rocket,
  Globe,
  ChevronLeft,
  ChevronRight,
  Star,
  Zap,
  Layers3,
  Cpu
} from "lucide-react";

interface Advantage {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  gradient: string;
  glowColor: string;
}

const advantages: Advantage[] = [
  {
    id: "unique-design",
    title: "Уникальный Дизайн",
    description: "Создаем неповторимые веб-сайты с потрясающим визуальным оформлением",
    icon: <Palette className="w-8 h-8" />,
    features: [
      "Персонализированный стиль",
      "Современные UI/UX тренды", 
      "Адаптивная верстка",
      "Анимации и эффекты"
    ],
    gradient: "from-pink-500 via-purple-500 to-blue-500",
    glowColor: "shadow-pink-500/30"
  },
  {
    id: "ai-integration",
    title: "Интеграция с ИИ",
    description: "Внедряем передовые AI-технологии для умных и интерактивных решений",
    icon: <Brain className="w-8 h-8" />,
    features: [
      "Чат-боты с ИИ",
      "Персонализация контента",
      "Автоматизация процессов",
      "Машинное обучение"
    ],
    gradient: "from-cyan-400 via-blue-500 to-purple-600",
    glowColor: "shadow-cyan-400/30"
  },
  {
    id: "3d-experience",
    title: "3D Взаимодействие",
    description: "Погружаем пользователей в мир трехмерных интерактивных элементов",
    icon: <Layers3 className="w-8 h-8" />,
    features: [
      "3D модели и анимации",
      "WebGL технологии",
      "Виртуальные туры",
      "Иммерсивный опыт"
    ],
    gradient: "from-emerald-400 via-teal-500 to-blue-600",
    glowColor: "shadow-emerald-400/30"
  },
  {
    id: "performance",
    title: "Высокая Производительность",
    description: "Оптимизируем каждый элемент для максимальной скорости и отзывчивости",
    icon: <Rocket className="w-8 h-8" />,
    features: [
      "Молниеносная загрузка",
      "SEO оптимизация",
      "Кроссбраузерность",
      "Масштабируемость"
    ],
    gradient: "from-orange-400 via-red-500 to-pink-600",
    glowColor: "shadow-orange-400/30"
  },
  {
    id: "custom-features",
    title: "Под Ваши Потребности",
    description: "Реализуем любые функции, которые вы хотите видеть на своем сайте",
    icon: <Cpu className="w-8 h-8" />,
    features: [
      "Индивидуальные решения",
      "API интеграции",
      "Пользовательские панели",
      "Гибкая архитектура"
    ],
    gradient: "from-violet-400 via-purple-500 to-indigo-600",
    glowColor: "shadow-violet-400/30"
  },
  {
    id: "global-reach",
    title: "Глобальный Охват",
    description: "Создаем сайты, готовые к международному масштабированию",
    icon: <Globe className="w-8 h-8" />,
    features: [
      "Мультиязычность",
      "CDN интеграция",
      "Геолокация",
      "Международные стандарты"
    ],
    gradient: "from-green-400 via-emerald-500 to-teal-600",
    glowColor: "shadow-green-400/30"
  }
];

export default function AdvantagesSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % advantages.length);
        setIsFlipping(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % advantages.length);
      setIsFlipping(false);
    }, 300);
  };

  const prevSlide = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + advantages.length) % advantages.length);
      setIsFlipping(false);
    }, 300);
  };

  const goToSlide = (index: number) => {
    if (isFlipping || index === currentSlide) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsFlipping(false);
    }, 300);
  };

  const currentAdvantage = advantages[currentSlide];

  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-blue-500/5 to-transparent rounded-full"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, cyan 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6 font-mono">
            НАШИ ПРЕИМУЩЕСТВА
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-600 mx-auto mb-8 rounded-full"></div>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Мы создаем не просто сайты — мы создаем цифровые шедевры, 
            объединяющие передовые технологии с безупречным дизайном
          </p>
        </div>

        {/* Main Slider Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <Button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 border border-cyan-400/30 hover:bg-cyan-400/10 hover:border-cyan-400/60 transition-all duration-300"
            disabled={isFlipping}
          >
            <ChevronLeft className="w-6 h-6 text-cyan-400" />
          </Button>

          <Button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 border border-cyan-400/30 hover:bg-cyan-400/10 hover:border-cyan-400/60 transition-all duration-300"
            disabled={isFlipping}
          >
            <ChevronRight className="w-6 h-6 text-cyan-400" />
          </Button>

          {/* Main Card */}
          <div className="flex justify-center">
            <div 
              className={cn(
                "relative w-full max-w-4xl transition-all duration-500",
                isFlipping ? "scale-95 opacity-50" : "scale-100 opacity-100"
              )}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <div className={cn(
                "relative p-8 rounded-3xl border border-cyan-400/20 backdrop-blur-lg transition-all duration-500",
                `bg-gradient-to-br ${currentAdvantage.gradient}/10`,
                `hover:${currentAdvantage.glowColor} hover:shadow-2xl`,
                "transform hover:scale-105"
              )}>
                {/* Glowing Border Effect */}
                <div className={cn(
                  "absolute inset-0 rounded-3xl opacity-50 blur-sm transition-all duration-500",
                  `bg-gradient-to-br ${currentAdvantage.gradient}`
                )}></div>
                
                {/* Card Content */}
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Icon and Title */}
                    <div className="flex-shrink-0 text-center md:text-left">
                      <div className={cn(
                        "w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center mb-4 mx-auto md:mx-0 transition-all duration-500",
                        currentAdvantage.gradient,
                        currentAdvantage.glowColor
                      )}>
                        <div className="text-white">
                          {currentAdvantage.icon}
                        </div>
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 font-mono">
                        {currentAdvantage.title}
                      </h3>
                      
                      <p className="text-white/80 text-lg leading-relaxed max-w-md">
                        {currentAdvantage.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="flex-1">
                      <h4 className="text-cyan-400 font-semibold mb-4 text-lg font-mono flex items-center">
                        <Star className="w-5 h-5 mr-2" />
                        Ключевые возможности:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentAdvantage.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center text-white/90 p-3 rounded-lg bg-white/5 border border-cyan-400/10 hover:border-cyan-400/30 transition-all duration-300 group"
                          >
                            <Zap className="w-4 h-4 text-cyan-400 mr-3 group-hover:text-yellow-400 transition-colors duration-300" />
                            <span className="text-sm font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-8 space-x-3">
            {advantages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300 border",
                  index === currentSlide
                    ? "bg-cyan-400 border-cyan-400 shadow-lg shadow-cyan-400/50"
                    : "bg-transparent border-cyan-400/40 hover:border-cyan-400/80 hover:bg-cyan-400/20"
                )}
                disabled={isFlipping}
              />
            ))}
          </div>

          {/* Mini Preview Cards */}
          <div className="hidden lg:flex justify-center mt-12 space-x-4 max-w-5xl mx-auto">
            {advantages.map((advantage, index) => (
              <button
                key={advantage.id}
                onClick={() => goToSlide(index)}
                className={cn(
                  "flex-1 p-4 rounded-xl border transition-all duration-300 group",
                  index === currentSlide
                    ? "border-cyan-400/60 bg-cyan-400/10 scale-105"
                    : "border-cyan-400/20 bg-black/20 hover:border-cyan-400/40 hover:bg-cyan-400/5"
                )}
                disabled={isFlipping}
              >
                <div className="text-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center mx-auto mb-2 transition-all duration-300",
                    index === currentSlide ? advantage.gradient : "from-gray-600 to-gray-700",
                    "group-hover:" + advantage.gradient
                  )}>
                    <div className="text-white scale-75">
                      {advantage.icon}
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-white/90 font-mono">
                    {advantage.title}
                  </h4>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Button
            className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-full shadow-lg hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105 font-mono"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Обсудить Проект
          </Button>
        </div>
      </div>
    </section>
  );
}
