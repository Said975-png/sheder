import React, { useEffect, useState } from "react";
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

interface StarkHeroProps {
  className?: string;
}

export default function StarkHero({ className }: StarkHeroProps) {
  const [scanProgress, setScanProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [targetLocked, setTargetLocked] = useState(false);

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
        {/* Матричный ��ождь */}
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
          {/* Левая час��ь - контент */}
          <div className="space-y-8">
            {/* Статус хедер */}
            <StarkHUD
              className="inline-block bg-black/60 backdrop-blur-lg px-6 py-3"
              showCorners={false}
            >
              <div className="flex items-center space-x-3">
                <ArcReactor size="small" pulsing />
                <div className="font-mono text-sm">
                  <span className="text-cyan-400">STARK INDUSTRIES</span>
                  <span className="text-gray-400 ml-2">|</span>
                  <span className="text-blue-400 ml-2">
                    BLOCKCHAIN DIVISION
                  </span>
                </div>
              </div>
            </StarkHUD>

            {/* Заголовок */}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <div className="mb-2">
                  <GlitchText intensity="low">
                    <span className="text-white">Unleashing the</span>
                  </GlitchText>
                </div>
                <HologramText className="text-4xl lg:text-6xl xl:text-7xl font-bold" glitch>
                  Power of Blockchain
                </HologramText>
              </h1>

              <div className="relative">
                <p className="text-lg lg:text-xl text-gray-300 leading-relaxed max-w-lg font-mono">
                  {targetLocked ? (
                    <span className="text-cyan-400 stark-text-glow">
                      TARGET ACQUIRED: Transforming industries with secure,
                      decentralized and transparent technology.
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

            {/* Кнопки действий */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-lg text-lg font-bold stark-glow transition-all duration-300 hover:shadow-cyan-500/40 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <Zap className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                <span className="relative z-10">Initialize Protocol</span>
              </Button>

              <Button
                variant="outline"
                className="group relative border-2 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 px-8 py-4 rounded-lg text-lg font-bold transition-all duration-300 backdrop-blur-sm overflow-hidden"
              >
                <div className="absolute inset-0 bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Code className="w-6 h-6 mr-3 group-hover:animate-spin" />
                <span className="relative z-10">Analyze Systems</span>
              </Button>
            </div>
          </div>

          {/* Правая часть - GLB модель */}
          <div className="flex items-center justify-center lg:justify-end order-first lg:order-last">
            <StarkHUD className="w-full max-w-sm lg:max-w-md h-80 lg:h-96 overflow-hidden">
              <GLBModel
                url="https://cdn.builder.io/o/assets%2F4349887fbc264ef3847731359e547c4f%2Fb4ef7bf18c5549bd9f8852b83394ebc8?alt=media&token=b8c73f7a-800f-4ec6-8ff9-36107fc91a86&apiKey=4349887fbc264ef3847731359e547c4f"
                scale={1.8}
                autoRotate={true}
              />
            </StarkHUD>
          </div>
        </div>
      </div>
    </section>
  );
}
