import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import BookingForm from "@/components/BookingForm";
import {
  CheckCircle,
  Star,
  Sparkles,
  Zap,
  Crown,
  Palette,
  Brain,
  ArrowRight,
  Heart,
  Calendar,
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
  popular?: boolean;
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
      "Техническая поддержка 3 месяца",
    ],
    highlight: false,
    icon: <Palette className="w-6 h-6" />,
    gradient: "from-blue-500 to-cyan-500",
    glowColor: "shadow-blue-500/30",
    ctaText: "Выбрать Basic",
  },
  {
    id: "pro",
    name: "PRO",
    price: "3.500.000",
    originalPrice: "4.000.000",
    description:
      "Насыщенный функционал с встроенным ИИ и многими возможностями",
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
      "Техническая поддержка 6 месяцев",
    ],
    highlight: true,
    popular: true,
    icon: <Brain className="w-6 h-6" />,
    gradient: "from-purple-500 to-pink-500",
    glowColor: "shadow-purple-500/40",
    badge: "ПОПУЛЯРНЫЙ",
    ctaText: "Выбрать Pro",
  },
  {
    id: "max",
    name: "MAX",
    price: "5.500.000",
    description:
      "Безграничные возмо���ности с Джарвисом и инновационными функциями",
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
      "Персональный менеджер проекта",
    ],
    highlight: false,
    icon: <Crown className="w-6 h-6" />,
    gradient: "from-yellow-400 to-orange-500",
    glowColor: "shadow-yellow-400/40",
    badge: "ПРЕМИУМ",
    ctaText: "Выбрать Max",
  },
];

function PricingSection() {
  const { addItem } = useCart();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const handleAddToCart = (plan: PricingPlan) => {
    addItem({
      id: plan.id,
      name: plan.name,
      price: parseInt(plan.price.replace(/\./g, "")),
      description: plan.description,
      category: "website-package",
    });
  };

  return (
    <section
      data-section="pricing"
      className="relative py-20 px-4 overflow-hidden bg-black"
    >
      {/* Background Effects - Removed for clean look */}
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
            НАШИ ЦЕНЫ
          </h2>

          <div className="w-40 h-1 bg-white mx-auto mb-8 rounded-full" />

          <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Выберите тариф, к��торый идеально подходит для ваших целей. От
            стильного базового сайта до премиального решения с Джарвисом
          </p>
        </div>

        {/* Three Cards Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.id}
              className={cn(
                "relative group transition-all duration-500 transform",
                plan.highlight ? "md:scale-110 md:-mt-4" : "hover:scale-105",
                hoveredCard === plan.id ? "z-10" : "z-0",
              )}
              onMouseEnter={() => setHoveredCard(plan.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span>{plan.badge}</span>
                      <Star className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}

              {/* Card */}
              <div
                className={cn(
                  "relative h-full p-8 rounded-3xl border-2 backdrop-blur-lg transition-all duration-500",
                  plan.highlight
                    ? "border-white bg-white/10 shadow-2xl shadow-white/20"
                    : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10",
                  "hover:shadow-2xl",
                )}
              >
                {/* Gradient Background for highlighted card */}
                {plan.highlight && (
                  <div className="absolute inset-0 rounded-3xl opacity-10 bg-gradient-to-br from-white to-gray-300" />
                )}

                <div className="relative z-10 h-full flex flex-col">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto transition-all duration-500",
                        plan.highlight
                          ? "!bg-white !text-black"
                          : "bg-white/10 text-white border border-white/20",
                      )}
                    >
                      {plan.icon}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4">
                      {plan.name}
                    </h3>

                    <div className="mb-4">
                      <div className="flex items-baseline justify-center space-x-2">
                        <span className="text-4xl font-bold text-white">
                          {plan.price}
                        </span>
                        <span className="text-lg text-white/70">сум</span>
                      </div>
                      {plan.originalPrice && (
                        <div className="text-white/50 line-through text-sm mt-1">
                          {plan.originalPrice} сум
                        </div>
                      )}
                    </div>

                    <p className="text-white/80 text-sm leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="flex-1 mb-8">
                    <h4 className="text-white font-semibold mb-4 text-sm flex items-center justify-center">
                      <Zap className="w-4 h-4 mr-2" />
                      Что включено:
                    </h4>

                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-start text-white/90"
                        >
                          <CheckCircle className="w-4 h-4 text-white mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleAddToCart(plan)}
                      variant={plan.highlight ? "secondary" : "outline"}
                      className={cn(
                        "w-full py-4 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 group",
                        plan.highlight
                          ? "!bg-white !text-black hover:!bg-white/90 hover:!text-black shadow-lg"
                          : "bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:border-white/40",
                      )}
                    >
                      <Sparkles className="w-4 h-4 mr-2 group-hover:animate-spin" />
                      {plan.ctaText}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>

                    <Button
                      onClick={() => setShowBookingForm(true)}
                      variant="outline"
                      className="w-full py-3 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 group bg-transparent text-white hover:bg-white/10 border border-white/30 hover:border-white/50"
                    >
                      <Calendar className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      Забронировать
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Form Modal */}
      <BookingForm
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        onSuccess={() => {
          console.log("✅ Бронь успешно создана из PricingSection");
        }}
      />
    </section>
  );
}

export default React.memo(PricingSection);
