import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, AlertCircle } from "lucide-react";
import { useVoiceChat } from "@/hooks/useVoiceChat";

export default function VoiceTest() {
  const [lastTranscript, setLastTranscript] = useState("");
  const [responses, setResponses] = useState<string[]>([]);
  const [commandCount, setCommandCount] = useState(0);
  const [lastCommandTime, setLastCommandTime] = useState<number>(0);

  const { isListening, isSpeaking, toggleListening, speakText } = useVoiceChat({
    onTranscriptReceived: (text: string) => {
      const now = Date.now();
      const timeSinceLastCommand = now - lastCommandTime;
      
      console.log("Получен текс��:", text);
      console.log("Время с последней команды:", timeSinceLastCommand, "мс");
      
      // Проверяем не дублируется ли команда
      if (text === lastTranscript && timeSinceLastCommand < 2000) {
        console.log("⚠️ Дублированная команда обнаружена:", text);
        setResponses(prev => [...prev, `⚠️ ДУБЛЬ: ${text} (через ${timeSinceLastCommand}мс)`]);
        return;
      }
      
      setLastTranscript(text);
      setLastCommandTime(now);
      setCommandCount(prev => prev + 1);
      
      // Простые ответы на команды
      let response = "Команда принята";
      
      if (text.toLowerCase().includes("привет")) {
        response = "Привет! Как дела?";
      } else if (text.toLowerCase().includes("как дела")) {
        response = "У меня все отлично, спасибо!";
      } else if (text.toLowerCase().includes("спасибо")) {
        response = "Пожалуйста!";
      } else if (text.toLowerCase().includes("джарвис")) {
        response = "Да, сэр?";
      }
      
      setResponses(prev => [...prev, `${commandCount + 1}. Вы: ${text}`, `   Ассистент: ${response}`]);
      
      // Воспроизводим ответ
      setTimeout(() => {
        speakText(response);
      }, 500);
    },
    onTextToSpeech: (text: string) => {
      console.log("Воспроизводим:", text);
    },
  });

  const clearHistory = () => {
    setResponses([]);
    setLastTranscript("");
    setCommandCount(0);
    setLastCommandTime(0);
  };

  const testMultipleCommands = () => {
    const commands = ["Привет", "Как дела", "Спасибо"];
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < commands.length) {
        console.log("Тестовая команда:", commands[index]);
        // Симулируем получение команды
        const event = new CustomEvent('voiceCommand', { 
          detail: { command: commands[index] } 
        });
        window.dispatchEvent(event);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 1000);
  };

  // Индикатор состояния
  const getStatusColor = () => {
    if (isSpeaking) return "text-green-600";
    if (isListening) return "text-blue-600";
    return "text-gray-600";
  };

  const getStatusText = () => {
    if (isSpeaking && isListening) return "🔇 Микрофон временно отключен (во время аудио)";
    if (isSpeaking) return "🔊 Говорю...";
    if (isListening) return "🎤 Слушаю...";
    return "⏹️ Остановлено";
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center">Тест исправлений голосового управления</h2>
      
      <div className="flex justify-center mb-4">
        <Button
          onClick={toggleListening}
          className={`w-16 h-16 rounded-full transition-all ${
            isListening 
              ? "bg-red-500 hover:bg-red-600 animate-pulse" 
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>
      </div>
      
      <div className="text-center mb-4">
        <p className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </p>
        <p className="text-xs text-gray-500">
          Команд обработано: {commandCount}
        </p>
        {lastTranscript && (
          <p className="text-xs text-green-600">
            ✅ П��следняя команда будет очищена через несколько секунд
          </p>
        )}
      </div>
      
      {lastTranscript && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p className="text-sm"><strong>Последняя команда:</strong></p>
          <p className="text-sm">{lastTranscript}</p>
          <p className="text-xs text-gray-500">
            Время: {new Date(lastCommandTime).toLocaleTimeString()}
          </p>
        </div>
      )}
      
      <div className="mb-4 max-h-48 overflow-y-auto border rounded p-2">
        {responses.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Команды будут отображаться здесь...</p>
        ) : (
          responses.map((response, index) => (
            <div 
              key={index} 
              className={`text-sm p-1 mb-1 rounded ${
                response.includes("ДУБЛЬ") 
                  ? "bg-red-100 text-red-800 font-bold" 
                  : response.startsWith("   ") 
                    ? "bg-green-100 text-green-800 ml-4" 
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {response}
            </div>
          ))
        )}
      </div>
      
      <div className="flex gap-2 mb-4">
        <Button 
          onClick={clearHistory} 
          variant="outline" 
          size="sm"
          className="flex-1"
        >
          Очистить
        </Button>
        <Button 
          onClick={() => speakText("Тест воспроизведения речи без дублирования")} 
          variant="outline" 
          size="sm"
          className="flex-1"
          disabled={isSpeaking}
        >
          Тест TTS
        </Button>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
          <div className="text-xs">
            <p className="font-medium text-yellow-800">Исправления:</p>
            <ul className="text-yellow-700 mt-1">
              <li>• Убрано мигание кнопки микрофона</li>
              <li>• Предотвращено дублирование команд</li>
              <li>• Защита от множественного воспроизведения аудио</li>
              <li>• <strong>Быстрая очистка ��оманд (1 сек вместо 2)</strong></li>
              <li>• <strong>Возможность говорить новые команды сразу</strong></li>
              <li>• <strong>🔇 Микрофон отключается во время аудио ответа</strong></li>
              <li>• <strong>🔊 Нет записи собственного голоса системы</strong></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        <p><strong>Попробуйте сказать:</strong></p>
        <ul>
          <li>• "Привет" или "Джарвис"</li>
          <li>• "Как дела?"</li>
          <li>• "Спасибо"</li>
        </ul>
        <p className="mt-2"><strong>Проверьте:</strong></p>
        <ul className="text-xs text-gray-600 mt-1">
          <li>• Команды не дублируются</li>
          <li>• Кнопка не мигает</li>
          <li>• <strong>Можно говорить новые команды сразу после предыдущей</strong></li>
          <li>• <strong>Старые команды быстро очищаются</strong></li>
          <li>• <strong>Микрофон не записывает аудио ответы системы</strong></li>
          <li>• <strong>Нет обратной связи (эхо) от динамиков</strong></li>
        </ul>
      </div>
    </div>
  );
}
