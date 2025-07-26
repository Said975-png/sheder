import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, SkipForward } from "lucide-react";

export default function AudioTest() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const testUrls = [
    "https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fdb47541068444a9093b406f29a6af3ce?alt=media&token=43fbc024-64ae-479b-8a6c-5b9d12b43294&apiKey=236158b44f8b45f680ab2467abfc361c",
    "https://cdn.builder.io/o/assets%2F236158b44f8b45f680ab2467abfc361c%2Fa7471f308f3b4a36a50440bf01707cdc?alt=media&token=9a246f92-9460-41f2-8125-eb0a7e936b47&apiKey=236158b44f8b45f680ab2467abfc361c",
    "https://cdn.builder.io/o/assets%2F4b8ea25f0ef042cbac23e1ab53938a6b%2F5baee2408110417fbab785b0c6ffdde6?alt=media&token=a957a2b4-68ad-46de-bc3e-11943c8fb38b&apiKey=4b8ea25f0ef042cbac23e1ab53938a6b"
  ];

  const playAudio = async (trackIndex: number) => {
    // Безопасно останавливаем предыдущее аудио
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      } catch (error) {
        console.log("ℹ️ Ошибка остановки предыдущего аудио:", error);
      }
    }

    setIsPlaying(true);
    setCurrentTrack(trackIndex);

    // Небольшая задержка для полной очистки
    setTimeout(() => {
      const audio = new Audio(testUrls[trackIndex]);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
        console.log("✅ Аудио завершено без ошибок");
      };

      audio.onerror = () => {
        setIsPlaying(false);
        audioRef.current = null;
        console.error("❌ Ошибка воспроизведения аудио");
      };

      // Проверяем что элемент еще актуален
      if (audioRef.current === audio) {
        audio.play().catch((error) => {
          setIsPlaying(false);
          audioRef.current = null;
          console.error("❌ Не удалось воспроизвести аудио:", error);
        });
      }
    }, 50);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      } catch (error) {
        console.log("ℹ️ Ошибка остановки:", error);
      }
    }
    setIsPlaying(false);
  };

  const playNext = () => {
    const nextTrack = (currentTrack + 1) % testUrls.length;
    playAudio(nextTrack);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center">Тест аудио воспроизведения</h2>
      
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          Текущий трек: {currentTrack + 1} из {testUrls.length}
        </p>
        <p className="text-sm text-gray-600">
          Статус: {isPlaying ? "▶️ Воспроизведение" : "⏹️ Остановлено"}
        </p>
      </div>
      
      <div className="flex gap-2 mb-4">
        <Button 
          onClick={() => playAudio(currentTrack)} 
          disabled={isPlaying}
          className="flex-1"
        >
          <Play className="w-4 h-4 mr-2" />
          Воспроизвести
        </Button>
        
        <Button 
          onClick={stopAudio} 
          disabled={!isPlaying}
          variant="outline"
          className="flex-1"
        >
          <Square className="w-4 h-4 mr-2" />
          Остановить
        </Button>
        
        <Button 
          onClick={playNext} 
          variant="outline"
          className="flex-1"
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Следующий
        </Button>
      </div>
      
      <div className="space-y-2">
        {testUrls.map((_, index) => (
          <Button
            key={index}
            onClick={() => playAudio(index)}
            variant={currentTrack === index ? "default" : "outline"}
            size="sm"
            className="w-full"
            disabled={isPlaying && currentTrack === index}
          >
            Трек {index + 1}
          </Button>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Тест исправлений:</strong></p>
        <ul>
          <li>• Проверка безопасной остановки предыдущего аудио</li>
          <li>• Предотвращение конфликтов play/pause</li>
          <li>• Быстрое переключение между треками</li>
        </ul>
      </div>
    </div>
  );
}
