import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArcReactor, GlitchText } from "@/components/StarkEffects";
import VoiceControl from "@/components/VoiceControl";

interface ConversationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBasicPlan: () => void;
  onAddProPlan: () => void;
  onAddMaxPlan: () => void;
}

export default function ConversationPanel({
  isOpen,
  onClose,
  onAddBasicPlan,
  onAddProPlan,
  onAddMaxPlan,
}: ConversationPanelProps) {
  const [animationState, setAnimationState] = useState<'hidden' | 'entering' | 'visible' | 'exiting'>('hidden');
  const [shouldStopVoice, setShouldStopVoice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimationState('entering');
      const timer = setTimeout(() => {
        setAnimationState('visible');
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setAnimationState('exiting');
      const timer = setTimeout(() => {
        setAnimationState('hidden');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleVoiceListeningChange = (isListening: boolean) => {
    // Теперь панель закрывается только по крестику, не автоматически при отключении микрофона
  };

  if (animationState === 'hidden') {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-2 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out",
        animationState === 'entering' ? "opacity-0 scale-90 translate-y-4" : "",
        animationState === 'visible' ? "opacity-100 scale-100 translate-y-0" : "",
        animationState === 'exiting' ? "opacity-0 scale-90 translate-y-4" : ""
      )}
    >
      <div className="bg-black/90 backdrop-blur-lg border border-cyan-400/50 rounded-2xl p-6 min-w-96 stark-glow">
        {/* Заголовок панели */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <ArcReactor size="small" pulsing />
            <div>
              <h3 className="text-lg font-bold text-cyan-400 font-mono">
                <GlitchText intensity="low">ДЖАРВИС АКТИВЕН</GlitchText>
              </h3>
              <p className="text-xs text-cyan-300/70 font-mono">
                Голосовое управление включено
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => {
              // При закрытии панели также останавливаем голосовое распознавание
              setShouldStopVoice(true);
              setTimeout(() => {
                onClose();
                setShouldStopVoice(false);
              }, 100);
            }}
            variant="ghost"
            className="w-8 h-8 p-0 rounded-full hover:bg-red-500/20 text-red-400"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Голосовое управление */}
        <div className="flex justify-center mb-4">
          <VoiceControl
            onAddBasicPlan={onAddBasicPlan}
            onAddProPlan={onAddProPlan}
            onAddMaxPlan={onAddMaxPlan}
            inNavbar={false}
            onListeningChange={handleVoiceListeningChange}
            forceStop={shouldStopVoice}
          />
        </div>

        {/* Статус и индикаторы */}
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-cyan-400 font-mono">
              Система прослушивания активна
            </span>
          </div>
          
          {/* Пульсирующие линии активности */}
          <div className="flex justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-cyan-400 rounded-full animate-pulse"
                style={{
                  height: '20px',
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
          
          {/* Подсказки команд */}
          <div className="text-center space-y-1">
            <p className="text-xs text-white/60 font-mono">
              Попробуйте: "Джарвис, покажи планы" или "добавить базовый план"
            </p>
            <p className="text-xs text-white/40 font-mono">
              Скажите "отключись" для завершения
            </p>
          </div>
        </div>

        {/* С��анирующие линии */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>
    </div>
  );
}
