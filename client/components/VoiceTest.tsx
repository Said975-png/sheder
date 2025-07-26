import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useVoiceChat } from "@/hooks/useVoiceChat";

export default function VoiceTest() {
  const [lastTranscript, setLastTranscript] = useState("");
  const [responses, setResponses] = useState<string[]>([]);

  const { isListening, isSpeaking, toggleListening, speakText } = useVoiceChat({
    onTranscriptReceived: (text: string) => {
      console.log("Получен текст:", text);
      setLastTranscript(text);
      
      // Простые ответы на команды
      let response = "Команда принята";
      
      if (text.toLowerCase().includes("привет")) {
        response = "Привет! Как дела?";
      } else if (text.toLowerCase().includes("как дела")) {
        response = "У меня все отлично, спасибо!";
      } else if (text.toLowerCase().includes("спасибо")) {
        response = "Пожалуйста!";
      }
      
      setResponses(prev => [...prev, `Вы: ${text}`, `Ассистент: ${response}`]);
      
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
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center">Тест голосового управления</h2>
      
      <div className="flex justify-center mb-4">
        <Button
          onClick={toggleListening}
          className={`w-16 h-16 rounded-full ${
            isListening 
              ? "bg-red-500 hover:bg-red-600 animate-pulse" 
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>
      </div>
      
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          {isListening ? "🎤 Слушаю..." : "Нажмите микрофон для начала"}
        </p>
        {isSpeaking && (
          <p className="text-sm text-green-600 flex items-center justify-center gap-2">
            <Volume2 className="w-4 h-4" />
            Говорю...
          </p>
        )}
      </div>
      
      {lastTranscript && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p className="text-sm"><strong>Последняя команда:</strong></p>
          <p className="text-sm">{lastTranscript}</p>
        </div>
      )}
      
      <div className="mb-4 max-h-40 overflow-y-auto">
        {responses.map((response, index) => (
          <div 
            key={index} 
            className={`text-sm p-2 mb-1 rounded ${
              response.startsWith("Вы:") 
                ? "bg-blue-100 text-blue-800" 
                : "bg-green-100 text-green-800"
            }`}
          >
            {response}
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={clearHistory} 
          variant="outline" 
          size="sm"
          className="flex-1"
        >
          Очистить
        </Button>
        <Button 
          onClick={() => speakText("Тест воспроизведения речи")} 
          variant="outline" 
          size="sm"
          className="flex-1"
          disabled={isSpeaking}
        >
          Тест TTS
        </Button>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Попробуйте сказать:</strong></p>
        <ul>
          <li>• "Привет"</li>
          <li>• "Как дела?"</li>
          <li>• "Спасибо"</li>
        </ul>
      </div>
    </div>
  );
}
