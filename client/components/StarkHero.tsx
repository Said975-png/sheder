import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import GLBModel from "@/components/GLBModel";
import { TypewriterText } from "@/components/TypewriterText";
import { SiteSearch } from "@/components/SiteSearch";
import JarvisCommandsPanel from "@/components/JarvisCommandsPanel";
import {
  Play,
  Star,
  ArrowRight,
  Sparkles,
  Bot,
  Mic,
  Search,
} from "lucide-react";

interface StarkHeroProps {
  className?: string;
  isModelRotating?: boolean;
  onModelRotationStart?: () => void;
  onModelRotationStop?: () => void;
}

export default function StarkHero({
  className,
  isModelRotating = false,
  onModelRotationStart,
  onModelRotationStop,
}: StarkHeroProps) {
  const [titleComplete, setTitleComplete] = useState(false);
  const [descriptionComplete, setDescriptionComplete] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [showCommandsPanel, setShowCommandsPanel] = useState(false);
  const [currentModelUrl, setCurrentModelUrl] = useState(
    "https://cdn.builder.io/o/assets%2F4349887fbc264ef3847731359e547c4f%2F14cdeb74660b46e6b8c349fa5339f8ae?alt=media&token=fa99e259-7582-4df0-9a1e-b9bf6cb20289&apiKey=4349887fbc264ef3847731359e547c4f",
  );

  const handleModelChange = (newUrl: string) => {
    console.log("🔄 StarkHero: Смена модели на", newUrl);
    setCurrentModelUrl(newUrl);
  };

  useEffect(() => {
    // Show CTA after description completes
    if (descriptionComplete) {
      const timer = setTimeout(() => setShowCTA(true), 500);
      return () => clearTimeout(timer);
    }
  }, [descriptionComplete]);

  return (
    <section
      className={cn(
        "relative min-h-screen bg-black overflow-hidden",
        className,
      )}
    >
      {/* Refined minimal background */}
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/[0.01] rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-3 sm:px-6 lg:px-8 relative z-10 max-w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center min-h-screen py-16 sm:py-20 lg:py-0">
          {/* Enhanced Content Section */}
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Premium Status Badge */}
            <div className="inline-flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-full max-w-full overflow-hidden">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <div className="text-xs sm:text-sm font-medium text-white/90 truncate">
                <TypewriterText
                  text="STARK INDUSTRIES"
                  speed={80}
                  className="text-white"
                />
                <span className="text-white/60 mx-2">•</span>
                <TypewriterText
                  text="AI DIVISION"
                  speed={80}
                  delay={1000}
                  className="text-white/80"
                />
              </div>
              <div className="w-2 h-2 bg-white/50 rounded-full" />
            </div>

            {/* Enhanced Typography */}
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-7xl xl:text-8xl font-bold leading-[0.9] tracking-tight break-words">
                <div className="relative">
                  <div className="text-white">
                    <TypewriterText
                      text="Jarvis"
                      speed={150}
                      delay={500}
                      onComplete={() => setTitleComplete(true)}
                      className="block"
                    />
                    {titleComplete && (
                      <TypewriterText
                        text="ваш AI-помощник"
                        speed={100}
                        delay={200}
                        className="block text-white/80 text-lg sm:text-2xl lg:text-5xl xl:text-6xl font-normal mt-2 break-words"
                      />
                    )}
                  </div>
                </div>
              </h1>

              <div className="relative max-w-full lg:max-w-2xl">
                <p className="text-sm sm:text-base lg:text-xl xl:text-2xl text-white/70 leading-relaxed hyphens-auto break-words">
                  {titleComplete && (
                    <TypewriterText
                      text="Революционный ИИ-ассистент, который понимает ваши потребности и превращает идеи в реальность. Будущее взаимодействия с техноло��иями уже здесь."
                      speed={30}
                      delay={800}
                      onComplete={() => setDescriptionComplete(true)}
                    />
                  )}
                </p>
              </div>
            </div>

            {/* Enhanced CTA Section */}
            <div
              className={cn(
                "flex flex-col gap-3 sm:gap-4 transition-all duration-1000 w-full max-w-full",
                showCTA
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4",
              )}
            >
              {/* Primary CTA */}
              <Button
                onClick={() => setShowCommandsPanel(true)}
                className="group bg-white text-black hover:bg-white/90 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 min-h-[48px] touch-manipulation w-full sm:w-auto max-w-full overflow-hidden"
              >
                <Bot className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3 group-hover:animate-pulse flex-shrink-0" />
                <span className="truncate">Начать с Jarvis</span>
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
              </Button>

              {/* Secondary CTA */}
              <SiteSearch />

              {/* Tertiary Action */}
              <Button
                variant="ghost"
                className="group text-white border border-white/20 hover:border-white/40 hover:bg-white/5 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 rounded-2xl transition-all duration-300 min-h-[48px] touch-manipulation w-full sm:w-auto max-w-full overflow-hidden"
              >
                <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span>Смотреть де����о</span>
              </Button>
            </div>

            {/* Feature Highlights */}
            <div
              className={cn(
                "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 pt-6 sm:pt-8 transition-all duration-1000 delay-300",
                showCTA
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4",
              )}
            >
              {[
                {
                  icon: <Mic className="w-4 h-4" />,
                  text: "Голосовое управление",
                },
                {
                  icon: <Sparkles className="w-4 h-4" />,
                  text: "ИИ-аналитика",
                },
                {
                  icon: <Star className="w-4 h-4" />,
                  text: "24/7 доступность",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-white/60 group cursor-pointer"
                >
                  <div className="text-white group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <span className="text-sm font-medium group-hover:text-white/80 transition-colors duration-300">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced 3D Model Section */}
          <div className="flex items-center justify-center lg:justify-end order-first lg:order-last">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl h-64 sm:h-80 lg:h-96 xl:h-[500px]">
              {/* Model Container without borders */}
              <div className="relative w-full h-full group">
                {/* Model */}
                <div className="relative z-10 w-full h-full overflow-hidden">
                  <GLBModel
                    url={currentModelUrl}
                    scale={2.5}
                    autoRotate={true}
                    isRotating={isModelRotating}
                    onRotationStart={onModelRotationStart}
                    onRotationStop={onModelRotationStop}
                    onModelChange={handleModelChange}
                  />
                </div>

                {/* Floating UI Elements - positioned to not overlap */}
                <div className="absolute top-6 right-6 bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-2xl p-3 z-20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-white">
                      ACTIVE
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-2xl p-4 z-20">
                  <div className="text-xs font-medium text-white mb-1">
                    Neural Network
                  </div>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-white/60 rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 16 + 8}px`,
                          animationDelay: `${i * 100}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section with stats - moved outside model area */}
        <div
          className={cn(
            "mt-16 pb-12 transition-all duration-1000 delay-500",
            showCTA ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-center">
            {[
              { number: "99.9%", label: "Точность ответов" },
              { number: "24/7", label: "Доступность" },
              { number: "1000+", label: "Довольных клиентов" },
              { number: "<1сек", label: "Время отклика" },
            ].map((stat, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="text-2xl lg:text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Панель команд Jarvis */}
      <JarvisCommandsPanel
        isOpen={showCommandsPanel}
        onClose={() => setShowCommandsPanel(false)}
      />
    </section>
  );
}
