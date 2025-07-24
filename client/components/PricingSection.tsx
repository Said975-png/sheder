import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  Zap,
  Crown,
  Palette,
  Brain,
  Cpu,
  Mic,
  Globe,
  Shield,
  Rocket,
  Heart,
  ArrowRight
} from "lucide-react";

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  description: string;
  features: string[];
  highlight: boolean;
  icon: React.ReactNode;
  gradient: string;
  glowColor: string;
  badge?: string;
  ctaText: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "basic",
    name: "BASIC",
    price: "2.500.000",
    description: "Красивый и функциональный сайт с современным дизайном",
    features: [
      "Уникальный дизайн интерфейса",
      "Адаптивная верстка",
      "SEO оптимизация",
      "Быстрая загрузка",
      "Контактные формы",
      "Галерея изображений",
      "Социальные сети",
      "Техническая поддержка 3 месяца"
    ],
    highlight: false,
    icon: <Palette className="w-8 h-8" />,
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    glowColor: "shadow-blue-400/30",
    ctaText: "Выбрать Basic"
  },
  {
    id: "pro",
    name: "PRO",
    price: "3.500.000",
    originalPrice: "4.000.000",
    description: "Насыщенный функционал с встроенным ИИ и многими возможностями",
    features: [
      "Все из пакета Basic",
      "ИИ-чат бот поддержки",
      "Персонализация контента",
      "Панель управления",
      "Интеграция с CRM",
      "Аналитика и метрики",
      "Многоязычность",
      "API интеграции",
      "Онлайн платежи",
      "Техническая поддержка 6 месяцев"
    ],
    highlight: true,
    icon: <Brain className="w-8 h-8" />,
    gradient: "from-purple-500 via-pink-500 to-red-500",
    glowColor: "shadow-purple-400/40",
    badge: "ПОПУЛЯРНЫЙ",
    ctaText: "Выбрать Pro"
  },
  {
    id: "max",
    name: "MAX",
    price: "5.500.000",
    description: "Безграничные возможности с Джарвисом и инновационными функциями",
    features: [
      "Все из пакета Pro",
      "Встроенный Джарвис с голосовыми ответами",
      "Персональная настройка ИИ",
      "3D элементы и анимации",
      "VR/AR интеграция",
      "Блокчейн функции",
      "Расширенная аналитика",
      "Кастомные модули",
      "Безлимитные изменения",
      "Приоритетная поддержка 12 месяцев",
      "Персональный менеджер проекта"
    ],
    highlight: false,
    icon: <Crown className="w-8 h-8" />,
    gradient: "from-yellow-400 via-orange-500 to-red-600",
    glowColor: "shadow-yellow-400/40",
    badge: "ПРЕМИУМ",
    ctaText: "Выбрать Max"
  }
];

export default function PricingSection() {
  const [currentSlide, setCurrentSlide] = useState(1); // Start with Pro plan (highlighted)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % pricingPlans.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % pricingPlans.length);
      setIsTransitioning(false);
    }, 300);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + pricingPlans.length) % pricingPlans.length);
      setIsTransitioning(false);
    }, 300);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 300);
  };

  const currentPlan = pricingPlans[currentSlide];

  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-20 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-1 bg-gradient-to-r from-transparent to-cyan-400 mr-4"></div>
            <Star className="w-8 h-8 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
            <div className="w-12 h-1 bg-gradient-to-l from-transparent to-cyan-400 ml-4"></div>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-6 font-mono">
            НАШИ ЦЕНЫ
          </h2>
          
          <div className="w-40 h-1 bg-gradient-to-r from-yellow-400 to-red-500 mx-auto mb-8 rounded-full"></div>
          
          <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Выберите тариф, который идеально подходит для ваших целей. 
            От стильного базового сайта до премиального решения с Джарвисом
          </p>
        </div>

        {/* Main Slider Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <Button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-black/60 border border-cyan-400/40 hover:bg-cyan-400/10 hover:border-cyan-400/80 transition-all duration-300 backdrop-blur-sm"
            disabled={isTransitioning}
          >
            <ChevronLeft className="w-7 h-7 text-cyan-400" />
          </Button>

          <Button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-black/60 border border-cyan-400/40 hover:bg-cyan-400/10 hover:border-cyan-400/80 transition-all duration-300 backdrop-blur-sm"
            disabled={isTransitioning}
          >
            <ChevronRight className="w-7 h-7 text-cyan-400" />
          </Button>

          {/* Main Pricing Card */}
          <div className="flex justify-center">
            <div
              className={cn(
                "relative w-full max-w-md transition-all duration-500",
                isTransitioning ? "scale-90 opacity-70" : "scale-100 opacity-100"
              )}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <div className={cn(
                "relative p-6 rounded-2xl border-2 backdrop-blur-lg transition-all duration-500 transform hover:scale-105",
                `bg-gradient-to-br ${currentPlan.gradient}/10`,
                currentPlan.highlight 
                  ? "border-purple-400/60 shadow-2xl shadow-purple-400/30 scale-110" 
                  : "border-cyan-400/30 hover:border-cyan-400/60",
                `hover:${currentPlan.glowColor} hover:shadow-2xl`
              )}>
                {/* Glowing Border Effect */}
                <div className={cn(
                  "absolute inset-0 rounded-3xl opacity-30 blur-sm transition-all duration-500 -z-10",
                  `bg-gradient-to-br ${currentPlan.gradient}`
                )}></div>

                {/* Badge */}
                {currentPlan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className={cn(
                      "px-6 py-2 rounded-full text-sm font-bold text-white",
                      `bg-gradient-to-r ${currentPlan.gradient}`,
                      "shadow-lg animate-pulse"
                    )}>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4" />
                        <span>{currentPlan.badge}</span>
                        <Star className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className={cn(
                      "w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center mb-6 mx-auto transition-all duration-500",
                      currentPlan.gradient,
                      currentPlan.glowColor,
                      "hover:scale-110"
                    )}>
                      <div className="text-white">
                        {currentPlan.icon}
                      </div>
                    </div>

                    <h3 className="text-3xl font-bold text-white mb-2 font-mono">
                      {currentPlan.name}
                    </h3>

                    <div className="mb-4">
                      <div className="flex items-baseline justify-center space-x-2">
                        <span className="text-4xl font-bold text-white">{currentPlan.price}</span>
                        <span className="text-lg text-white/70">сум</span>
                      </div>
                      {currentPlan.originalPrice && (
                        <div className="text-white/50 line-through text-lg">
                          {currentPlan.originalPrice} сум
                        </div>
                      )}
                    </div>

                    <p className="text-white/80 text-lg leading-relaxed">
                      {currentPlan.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="text-cyan-400 font-semibold mb-6 text-lg font-mono flex items-center justify-center">
                      <Zap className="w-5 h-5 mr-2" />
                      Что включено:
                    </h4>
                    
                    <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-400/30 scrollbar-track-transparent">
                      {currentPlan.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-start text-white/90 p-3 rounded-lg bg-white/5 border border-cyan-400/10 hover:border-cyan-400/30 transition-all duration-300 group"
                        >
                          <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0 group-hover:text-green-300 transition-colors duration-300" />
                          <span className="text-sm leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={cn(
                      "w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 font-mono group",
                      `bg-gradient-to-r ${currentPlan.gradient}`,
                      "text-white shadow-lg hover:shadow-xl",
                      `hover:${currentPlan.glowColor}`
                    )}
                  >
                    <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                    {currentPlan.ctaText}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-8 space-x-4">
            {pricingPlans.map((plan, index) => (
              <button
                key={plan.id}
                onClick={() => goToSlide(index)}
                className={cn(
                  "relative transition-all duration-300",
                  index === currentSlide
                    ? "scale-110"
                    : "scale-100 hover:scale-105"
                )}
                disabled={isTransitioning}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 transition-all duration-300",
                  index === currentSlide
                    ? `bg-gradient-to-r ${plan.gradient} border-transparent shadow-lg`
                    : "bg-transparent border-cyan-400/40 hover:border-cyan-400/80"
                )}>
                  {index === currentSlide && (
                    <div className={cn(
                      "absolute inset-0 rounded-full opacity-50 blur-sm",
                      `bg-gradient-to-r ${plan.gradient}`
                    )}></div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Mini Preview Cards */}
          <div className="hidden lg:flex justify-center mt-12 space-x-6 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <button
                key={plan.id}
                onClick={() => goToSlide(index)}
                className={cn(
                  "flex-1 p-6 rounded-xl border transition-all duration-300 group",
                  index === currentSlide
                    ? `border-cyan-400/60 bg-gradient-to-br ${plan.gradient}/10 scale-105`
                    : "border-cyan-400/20 bg-black/20 hover:border-cyan-400/40 hover:bg-cyan-400/5"
                )}
                disabled={isTransitioning}
              >
                <div className="text-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center mx-auto mb-3 transition-all duration-300",
                    index === currentSlide ? plan.gradient : "from-gray-600 to-gray-700",
                    "group-hover:" + plan.gradient
                  )}>
                    <div className="text-white scale-75">
                      {plan.icon}
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold text-white mb-2 font-mono">
                    {plan.name}
                  </h4>
                  
                  <div className="text-cyan-400 font-semibold text-sm">
                    {plan.price} сум
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-black/50 to-gray-900/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4 font-mono">
              Не можете определиться?
            </h3>
            <p className="text-white/70 mb-6 leading-relaxed">
              Свяжитесь с нами для бесплатной консультации. 
              Мы поможем выбрать идеальный пакет для ваших потребностей.
            </p>
            <Button
              className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-lg hover:shadow-cyan-400/25 transition-all duration-300 transform hover:scale-105 font-mono"
            >
              <Heart className="w-5 h-5 mr-2" />
              Бесплатная Консультация
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
