import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  Zap,
  CheckCircle,
  Shield,
  Rocket,
  Palette,
  Globe,
  Users,
  ArrowRight,
} from "lucide-react";

interface Advantage {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  gradient: string;
  glowColor: string;
}

const advantages: Advantage[] = [
  {
    id: "design",
    title: "Современный Дизайн",
    description:
      "Создаем визуально потрясающие интерфейсы, которые впечатляют и конвертируют",
    features: [
      "Уникальные решения",
      "Адаптивный дизайн",
      "Брендинг и стиль",
      "UX/UI оптимизация",
    ],
    icon: <Palette className="w-8 h-8" />,
    gradient: "from-pink-500 via-purple-500 to-blue-500",
    glowColor: "shadow-pink-500/30",
  },
  {
    id: "technology",
    title: "Передовые Технологии",
    description:
      "Используем новейшие технологии для создания мощных и безопасных решений",
    features: [
      "React & Next.js",
      "TypeScript",
      "Современные API",
      "Cloud Technologies",
    ],
    icon: <Rocket className="w-8 h-8" />,
    gradient: "from-cyan-400 via-blue-500 to-purple-600",
    glowColor: "shadow-cyan-400/30",
  },
  {
    id: "performance",
    title: "Высокая Производительность",
    description:
      "Оптимизируем каждый элемент для максимальной скорости и отзывчивости",
    features: [
      "Молниеносная загрузка",
      "SEO оптимизация",
      "Кроссбраузерность",
      "Масштабируемость",
    ],
    icon: <Zap className="w-8 h-8" />,
    gradient: "from-emerald-400 via-teal-500 to-blue-600",
    glowColor: "shadow-emerald-400/30",
  },
  {
    id: "security",
    title: "Безопасность",
    description:
      "Гарантируем максимальную защиту данных и соответствие стандартам",
    features: [
      "SSL шифрование",
      "Защита от атак",
      "Резервное копирование",
      "Мониторинг 24/7",
    ],
    icon: <Shield className="w-8 h-8" />,
    gradient: "from-orange-400 via-red-500 to-pink-600",
    glowColor: "shadow-orange-400/30",
  },
  {
    id: "ai",
    title: "ИИ Интеграция",
    description:
      "Встраиваем искусственный интеллект для автоматизации и улучшения UX",
    features: ["Чат-боты", "Персонализация", "Аналитика", "Автоматизация"],
    icon: <Sparkles className="w-8 h-8" />,
    gradient: "from-violet-400 via-purple-500 to-indigo-600",
    glowColor: "shadow-violet-400/30",
  },
  {
    id: "support",
    title: "Поддержка и Обслуживание",
    description:
      "Предоставляем полную техническую поддержку и регулярные обновления",
    features: [
      "24/7 поддержка",
      "Регулярные обновления",
      "Обучение команды",
      "Консультации",
    ],
    icon: <Users className="w-8 h-8" />,
    gradient: "from-green-400 via-emerald-500 to-teal-600",
    glowColor: "shadow-green-400/30",
  },
];

function AdvantagesSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = React.useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % advantages.length);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning]);

  const prevSlide = React.useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(
        (prev) => (prev - 1 + advantages.length) % advantages.length,
      );
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning]);

  const goToSlide = React.useCallback(
    (index: number) => {
      if (isTransitioning || index === currentSlide) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsTransitioning(false);
      }, 300);
    },
    [isTransitioning, currentSlide],
  );

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [nextSlide]);

  const currentAdvantage = advantages[currentSlide];

  return (
    <section
      data-section="advantages"
      className="relative py-20 px-4 overflow-hidden bg-black"
    >
      {/* Clean minimal background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-1 bg-white mr-4" />
            <Star className="w-8 h-8 text-white" />
            <div className="w-12 h-1 bg-white ml-4" />
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            НАШИ ПРЕИМУЩЕСТВА
          </h2>

          <div className="w-32 h-1 bg-white mx-auto mb-8 rounded-full" />

          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Мы создаем не просто сайты — мы создаем цифровые шедевры,
            объединяющие передовые технологии с безупречным дизайном
          </p>
        </div>

        {/* Main Advantage Showcase */}
        <div className="relative">
          {/* Navigation Buttons */}
          <Button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
            disabled={isTransitioning}
          >
            <ChevronLeft className="w-7 h-7 text-white" />
          </Button>

          <Button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
            disabled={isTransitioning}
          >
            <ChevronRight className="w-7 h-7 text-white" />
          </Button>

          {/* Main Advantage Card */}
          <div className="flex justify-center">
            <div
              className={cn(
                "relative w-full max-w-4xl transition-all duration-500",
                isTransitioning
                  ? "scale-95 opacity-70"
                  : "scale-100 opacity-100",
              )}
            >
              <div className="relative p-8 rounded-3xl border border-white/20 bg-white/5 backdrop-blur-lg transition-all duration-500 hover:border-white/40 hover:bg-white/10 hover:shadow-2xl">
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Icon and Title */}
                    <div className="flex-shrink-0 text-center md:text-left">
                      <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4 mx-auto md:mx-0 transition-all duration-500 hover:scale-110">
                        <div className="text-white">
                          {currentAdvantage.icon}
                        </div>
                      </div>

                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                        {currentAdvantage.title}
                      </h3>

                      <p className="text-white/80 text-lg leading-relaxed max-w-md">
                        {currentAdvantage.description}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-4 text-lg flex items-center">
                        <Star className="w-5 h-5 mr-2" />
                        Ключевые возможности:
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentAdvantage.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center text-white/90 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 group"
                          >
                            <CheckCircle className="w-4 h-4 text-white mr-3 group-hover:scale-110 transition-transform duration-300" />
                            <span className="text-sm font-medium">
                              {feature}
                            </span>
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
                  "w-3 h-3 rounded-full transition-all duration-300",
                  index === currentSlide
                    ? "bg-white border-2 border-white scale-125"
                    : "bg-white/30 border border-white/40 hover:bg-white/50 hover:scale-110",
                )}
                disabled={isTransitioning}
              />
            ))}
          </div>

          {/* Mini Preview Cards */}
          <div className="hidden lg:grid grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
            {advantages.slice(0, 3).map((advantage, index) => {
              const actualIndex = (currentSlide + index) % advantages.length;
              const displayAdvantage = advantages[actualIndex];

              return (
                <button
                  key={actualIndex}
                  onClick={() => goToSlide(actualIndex)}
                  className={cn(
                    "p-6 rounded-2xl border transition-all duration-300 group text-left",
                    actualIndex === currentSlide
                      ? "border-white bg-white/10 scale-105"
                      : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10",
                  )}
                  disabled={isTransitioning}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110">
                      <div className="text-white scale-75">
                        {displayAdvantage.icon}
                      </div>
                    </div>

                    <h4 className="text-lg font-bold text-white mb-2">
                      {displayAdvantage.title}
                    </h4>

                    <p className="text-white/70 text-sm line-clamp-2">
                      {displayAdvantage.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <Button
            variant="secondary"
            className="px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-semibold !bg-white !text-black hover:!bg-white/90 hover:!text-black rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 w-full sm:w-auto max-w-full"
          >
            <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Узнать больше о наших услугах</span>
            <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-1 sm:ml-2 flex-shrink-0" />
          </Button>
        </div>
      </div>
    </section>
  );
}

export default React.memo(AdvantagesSection);
