import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2, VolumeX, Mic } from "lucide-react";
import { useJarvisVoiceCommands } from "@/components/JarvisVoiceCommands";

export default function JarvisDemo() {
  const {
    speakSystemsOperational,
    speakWelcomeBack,
    speakGoodMorning,
    speakIAmHere,
    speakThankYou,
    speakAuthenticJarvis,
    speakHowAreYou,
    speakSystemDiagnostics,
    speakContinue,
    speakCorrect,
    speakLabActivation,
    speakLabDeactivation,
    stop,
    isSpeaking,
  } = useJarvisVoiceCommands();

  const testPhrases = [
    { text: "Приветствие", action: speakAuthenticJarvis },
    { text: "Доброе утро", action: speakGoodMorning },
    { text: "Добро пожаловать", action: speakWelcomeBack },
    { text: "Я здесь", action: speakIAmHere },
    { text: "Как дела", action: speakHowAreYou },
    { text: "Системы", action: speakSystemsOperational },
    { text: "Диагностика", action: speakSystemDiagnostics },
    { text: "Спасибо", action: speakThankYou },
    { text: "Продолжим", action: speakContinue },
    { text: "Верно", action: speakCorrect },
    { text: "Активация лаборатории", action: speakLabActivation },
    { text: "Деактивация лаборатории", action: speakLabDeactivation },
  ];

  return (
    <Card className="theme-card w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-white text-center flex items-center justify-center space-x-2">
          <Mic className="w-5 h-5" />
          <span>Тест голоса Джарвиса</span>
          {isSpeaking() && (
            <Volume2 className="w-5 h-5 text-green-400 animate-pulse" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center mb-4">
          <p className="text-white/70 text-sm mb-2">
            Голос Джарвиса настроен согласно промпту ElevenLabs
          </p>
          <p className="text-white/50 text-xs mb-2">
            Мужской 40-45 лет • Средне-низкий тембр • Элегантно-вежливый
          </p>
          <div className="text-xs text-white/40 space-y-1">
            <div>🎙️ Размеренная подача • Небольшие смысловые паузы</div>
            <div>🤖 Деловой но теплый тон • Литературный русский</div>
            <div>⚡ Технологический оттенок • Кристально чистая дикция</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {testPhrases.map((phrase, index) => (
            <Button
              key={index}
              onClick={phrase.action}
              disabled={isSpeaking()}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10 disabled:opacity-50"
              size="sm"
            >
              {phrase.text}
            </Button>
          ))}
        </div>

        <div className="flex justify-center space-x-2 pt-4 border-t border-white/20">
          <Button
            onClick={stop}
            variant="destructive"
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            <VolumeX className="w-4 h-4 mr-2" />
            Остановить
          </Button>

          <div className="flex items-center space-x-2 text-xs text-white/50">
            <span>Статус:</span>
            <span className={isSpeaking() ? "text-green-400" : "text-white/70"}>
              {isSpeaking() ? "Говорит..." : "Готов"}
            </span>
          </div>
        </div>

        <div className="text-xs text-white/50 space-y-1 pt-4 border-t border-white/20">
          <p>
            <strong>Реализованные характеристики промпта:</strong>
          </p>
          <ul className="space-y-1 ml-4">
            <li>• Мужской голос 40-45 лет (средне-низкий тембр)</li>
            <li>• Спокойный, уверенный, элегантно-вежливый характер</li>
            <li>• Размеренная подача с точными формулировками</li>
            <li>• Небольшие смысловые паузы в речи</li>
            <li>• Деловой но теплый тон с нотками дружелюбия</li>
            <li>• Литературный русский без эмоциональных всплесков</li>
            <li>• Интеллигентный техно-помощник элитного уровня</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
