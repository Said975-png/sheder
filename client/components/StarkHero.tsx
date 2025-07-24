import React, { useEffect, useState } from "react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  StarkHUD,
  DataStream,
  CircuitPattern,
  HologramText,
} from "@/components/StarkHUD";
import {
  ArcReactor,
  PowerIndicator,
  GlitchText,
  MatrixRain,
} from "@/components/StarkEffects";
import GLBModel from "@/components/GLBModel";
import { TypewriterText } from "@/components/TypewriterText";
import { SiteSearch } from "@/components/SiteSearch";

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
  onModelRotationStop
}: StarkHeroProps) {
  const [scanProgress, setScanProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [targetLocked, setTargetLocked] = useState(false);
  const [titleComplete, setTitleComplete] = useState(false);
  const [descriptionComplete, setDescriptionComplete] = useState(false);

  useEffect(() => {
    // Симуляция сканирования
    const scanInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          setIsAnalyzing(true);
          setTimeout(() => {
            setTargetLocked(true);
            setIsAnalyzing(false);
          }, 1500);
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(scanInterval);
  }, []);

  return (
    <section
      className={cn(
        "relative min-h-screen bg-black overflow-hidden",
        className,
      )}
    >
      {/* Фоновые эффекты */}
      <div className="absolute inset-0">
        {/* Матричный дождь */}
        <MatrixRain density="low" speed="slow" color="cyan" />

        {/* Схемы и паттерны */}
        <CircuitPattern size="large" className="top-10 left-10 opacity-20" />
        <CircuitPattern
          size="medium"
          className="top-20 right-20 opacity-15"
          animated
        />
        <CircuitPattern size="small" className="bottom-20 left-20 opacity-25" />

        {/* Потоки данных */}
        <DataStream
          direction="vertical"
          speed="medium"
          color="cyan"
          className="top-0 left-1/4"
        />
        <DataStream
          direction="vertical"
          speed="slow"
          color="blue"
          className="top-0 right-1/3"
        />
        <DataStream
          direction="horizontal"
          speed="fast"
          color="orange"
          className="top-1/3 left-0"
        />
      </div>

      {/* HUD углы экрана */}
      <div className="absolute top-4 left-4 w-20 h-20 border-l-2 border-t-2 border-cyan-400/60 opacity-80">
        <div className="absolute top-2 left-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
      </div>
      <div className="absolute top-4 right-4 w-20 h-20 border-r-2 border-t-2 border-cyan-400/60 opacity-80">
        <div
          className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>
      <div className="absolute bottom-4 left-4 w-20 h-20 border-l-2 border-b-2 border-cyan-400/60 opacity-80">
        <div
          className="absolute bottom-2 left-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>
      <div className="absolute bottom-4 right-4 w-20 h-20 border-r-2 border-b-2 border-cyan-400/60 opacity-80">
        <div
          className="absolute bottom-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* Сканирующие линии */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"></div>

      <div className="container mx-auto px-6 relative z-10 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[80vh]">
          {/* Левая часть - контент */}
          <div className="space-y-8">
            {/* Статус хедер */}
            <StarkHUD
              className="inline-block bg-black/60 backdrop-blur-lg px-6 py-3"
              showCorners={false}
            >
              <div className="flex items-center space-x-3">
                <ArcReactor size="small" pulsing />
                <div className="font-mono text-sm">
                  <TypewriterText
                    text="STARK INDUSTRIES"
                    speed={80}
                    className="text-cyan-400"
                  />
                  <span className="text-gray-400 ml-2">|</span>
                  <TypewriterText
                    text="BLOCKCHAIN DIVISION"
                    speed={80}
                    delay={1000}
                    className="text-blue-400 ml-2"
                  />
                </div>
              </div>
            </StarkHUD>

            {/* Заголовок */}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <HologramText
                  className="text-4xl lg:text-6xl xl:text-7xl font-bold"
                  glitch
                >
                  <TypewriterText
                    text="Jarvis - ваш искусственный интеллект"
                    speed={30}
                    delay={500}
                    onComplete={() => setTitleComplete(true)}
                  />
                </HologramText>
              </h1>

              <div className="relative">
                <p className="text-lg lg:text-xl text-gray-300 leading-relaxed max-w-lg font-mono">
                  {targetLocked ? (
                    <span className="text-cyan-400 stark-text-glow">
                      {titleComplete && (
                        <TypewriterText
                          text="Вы говорите — Джарвис делает. Это не просто сайт. Это — ваш персональный AI-помощник, встроенный в интерфейс"
                          speed={30}
                          delay={300}
                          onComplete={() => setDescriptionComplete(true)}
                        />
                      )}
                    </span>
                  ) : (
                    "Scanning quantum blockchain matrices... Analyzing distributed networks..."
                  )}
                </p>

                {/* Прогресс сканирования */}
                {!targetLocked && (
                  <div className="mt-4">
                    <PowerIndicator
                      level={scanProgress}
                      label={isAnalyzing ? "ANALYZING" : "SCANNING"}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Поиск по сайту */}
            <div className="flex flex-col sm:flex-row gap-4">
              <SiteSearch />
            </div>
          </div>

          {/* Правая часть - GLB модель */}
          <div className="flex items-center justify-center lg:justify-end order-first lg:order-last">
            <div className="w-full max-w-md lg:max-w-xl h-96 lg:h-[500px]">
              <GLBModel
                url="https://cdn.builder.io/o/assets%2F4349887fbc264ef3847731359e547c4f%2F14cdeb74660b46e6b8c349fa5339f8ae?alt=media&token=fa99e259-7582-4df0-9a1e-b9bf6cb20289&apiKey=4349887fbc264ef3847731359e547c4f"
                scale={3.0}
                autoRotate={true}
                isRotating={isModelRotating}
                onRotationStart={onModelRotationStart}
                onRotationStop={onModelRotationStop}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
