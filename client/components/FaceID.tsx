import React, { useRef, useEffect, useState, useCallback } from "react";
import { Camera, Scan, Check, X, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

interface FaceIDProps {
  mode: "register" | "verify";
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

interface FaceDescriptor {
  id: string;
  userId: string;
  descriptors: number[][];
  createdAt: string;
  lastUsed: string;
}

export default function FaceID({ mode, onSuccess, onError, onCancel }: FaceIDProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { currentUser } = useAuth();
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("Инициализация камеры...");

  // Инициализация камеры
  const initializeCamera = useCallback(async () => {
    try {
      setStatus("Запрос доступа к камере...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setStatus("Камера подключена");
        setIsInitializing(false);
      }
    } catch (error) {
      console.error("Camera initialization error:", error);
      onError("Не удалось получить доступ к камере. Пожалуйста, разрешите доступ к камере.");
    }
  }, [onError]);

  // Детекция лица
  const detectFace = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return false;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return false;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Улучшенная детекция лица с несколькими методами
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Анализируем несколько областей
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const checkRadius = Math.min(canvas.width, canvas.height) / 5; // Увеличили область

    let skinPixels = 0;
    let brightPixels = 0;
    let contrastPixels = 0;
    let totalPixels = 0;

    // Проверяем центральную область
    for (let y = centerY - checkRadius; y < centerY + checkRadius; y++) {
      for (let x = centerX - checkRadius; x < centerX + checkRadius; x++) {
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          const i = (y * canvas.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;

          // Улучшенная проверка на цвет кожи (более широкий диапазон)
          if ((r > 80 && g > 30 && b > 15 && r > g && r > b) ||
              (r > 60 && g > 20 && b > 10 && Math.abs(r - g) < 40 && r >= g)) {
            skinPixels++;
          }

          // Проверка на яркость (наличие освещенных участков)
          if (brightness > 100) {
            brightPixels++;
          }

          // Проверка на контраст (наличие теней и светов)
          if (Math.max(r, g, b) - Math.min(r, g, b) > 30) {
            contrastPixels++;
          }

          totalPixels++;
        }
      }
    }

    const skinRatio = skinPixels / totalPixels;
    const brightRatio = brightPixels / totalPixels;
    const contrastRatio = contrastPixels / totalPixels;

    // Комбинированная проверка: либо достаточно кожи, либо есть яркость с контрастом
    const faceDetected = (skinRatio > 0.15) ||
                        (brightRatio > 0.4 && contrastRatio > 0.2) ||
                        (skinRatio > 0.08 && brightRatio > 0.3);

    console.log(`Face detection: skin=${skinRatio.toFixed(3)}, bright=${brightRatio.toFixed(3)}, contrast=${contrastRatio.toFixed(3)}, detected=${faceDetected}`);

    return faceDetected;
  }, []);

  // Захват изображения
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.8);
  }, []);

  // Генерация дескриптора лица (упрощенная версия)
  const generateFaceDescriptor = useCallback((imageData: string): number[] => {
    // Простой алгоритм генерации дескриптора на основе пикселей изображения
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    return new Promise<number[]>((resolve) => {
      img.onload = () => {
        if (!ctx) {
          resolve([]);
          return;
        }

        canvas.width = 64;
        canvas.height = 64;
        ctx.drawImage(img, 0, 0, 64, 64);
        
        const imageData = ctx.getImageData(0, 0, 64, 64);
        const data = imageData.data;
        const descriptor: number[] = [];
        
        // Соз��аем дескриптор из RGB значений каждого 4-го пикселя
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i] / 255;
          const g = data[i + 1] / 255;
          const b = data[i + 2] / 255;
          descriptor.push((r + g + b) / 3);
        }
        
        resolve(descriptor);
      };
      img.src = imageData;
    }) as any;
  }, []);

  // Сравнение дескрипторов
  const compareDescriptors = useCallback((desc1: number[], desc2: number[]): number => {
    if (desc1.length !== desc2.length) return 0;
    
    let similarity = 0;
    for (let i = 0; i < desc1.length; i++) {
      similarity += 1 - Math.abs(desc1[i] - desc2[i]);
    }
    
    return similarity / desc1.length;
  }, []);

  // Сохранение данных лица
  const saveFaceData = useCallback(async (descriptors: number[][]) => {
    if (!currentUser) return;

    const faceData: FaceDescriptor = {
      id: Date.now().toString(),
      userId: currentUser.id,
      descriptors,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };

    const existingFaces = JSON.parse(localStorage.getItem("faceDescriptors") || "[]");
    // Удаляем старые данные этого пользователя
    const filteredFaces = existingFaces.filter((face: FaceDescriptor) => face.userId !== currentUser.id);
    filteredFaces.push(faceData);
    
    localStorage.setItem("faceDescriptors", JSON.stringify(filteredFaces));
  }, [currentUser]);

  // Проверка лица
  const verifyFace = useCallback(async (descriptors: number[][]): Promise<boolean> => {
    if (!currentUser) return false;

    const existingFaces = JSON.parse(localStorage.getItem("faceDescriptors") || "[]") as FaceDescriptor[];
    const userFace = existingFaces.find(face => face.userId === currentUser.id);
    
    if (!userFace) return false;

    // Сравниваем каждый новый дескриптор с каждым сохраненным
    let maxSimilarity = 0;
    for (const newDesc of descriptors) {
      for (const savedDesc of userFace.descriptors) {
        const similarity = compareDescriptors(newDesc, savedDesc);
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }
    }

    // Обновляем время последнего использования
    if (maxSimilarity > 0.75) {
      userFace.lastUsed = new Date().toISOString();
      const updatedFaces = existingFaces.map(face => 
        face.userId === currentUser.id ? userFace : face
      );
      localStorage.setItem("faceDescriptors", JSON.stringify(updatedFaces));
    }

    return maxSimilarity > 0.65; // 65% схожести для успешной верификации
  }, [currentUser, compareDescriptors]);

  // Основной процесс сканирования
  const startScanning = useCallback(async () => {
    if (!currentUser) {
      onError("Пользователь не авторизован");
      return;
    }

    setIsScanning(true);
    setStatus("Поиск лица...");
    setCapturedImages([]);

    const requiredImages = mode === "register" ? 3 : 2; // Уменьшили количество снимков
    const capturedImages: string[] = [];
    let attempts = 0;
    const maxAttempts = 50; // Увеличили количество попыток

    const scanLoop = async () => {
      if (attempts >= maxAttempts) {
        setIsScanning(false);
        onError("Не удалось обнаружить лицо. Попробуйте еще раз.");
        return;
      }

      const faceFound = await detectFace();
      setFaceDetected(faceFound);

      if (faceFound) {
        setStatus(`Лицо обнаружено! Захват ${capturedImages.length + 1}/${requiredImages}`);
        
        // Countdown
        for (let i = 2; i > 0; i--) {
          setCountdown(i);
          await new Promise(resolve => setTimeout(resolve, 800));
        }
        setCountdown(0);

        const image = captureImage();
        if (image) {
          capturedImages.push(image);
          setCapturedImages([...capturedImages]);
          
          if (capturedImages.length >= requiredImages) {
            setIsProcessing(true);
            setStatus("Обработка данных...");
            
            try {
              // Генерируем дескрипторы для всех изображений
              const descriptors: number[][] = [];
              for (const img of capturedImages) {
                const desc = await generateFaceDescriptor(img);
                if (desc.length > 0) {
                  descriptors.push(desc);
                }
              }

              if (descriptors.length === 0) {
                throw new Error("Не удалось обработать изображения лица");
              }

              if (mode === "register") {
                await saveFaceData(descriptors);
                setStatus("Face ID успешно настроен!");
                onSuccess();
              } else {
                const verified = await verifyFace(descriptors);
                if (verified) {
                  setStatus("Лицо распознано! Доступ разрешен.");
                  onSuccess();
                } else {
                  setStatus("Лицо не распознано. Доступ запрещен.");
                  onError("Лицо не распознано. Попробуйте еще раз или войдите другим способом.");
                }
              }
            } catch (error) {
              console.error("Face processing error:", error);
              onError("Ошибка обработки данных лица");
            } finally {
              setIsProcessing(false);
              setIsScanning(false);
            }
            return;
          }
        }
        
        // Пауза между захватами
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        setStatus("Расположите лицо в центре камеры");
      }

      attempts++;
      setTimeout(scanLoop, 50); // Уменьшили интервал проверки
    };

    scanLoop();
  }, [mode, currentUser, detectFace, captureImage, generateFaceDescriptor, saveFaceData, verifyFace, onSuccess, onError]);

  // Остановка камеры
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Инициализация
  useEffect(() => {
    initializeCamera();
    return () => stopCamera();
  }, [initializeCamera, stopCamera]);

  // Компонент не рендерится без пользователя
  if (!currentUser) {
    return null;
  }

  return (
    <Card className="theme-card w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-white text-center flex items-center justify-center space-x-2">
          <Scan className="w-5 h-5" />
          <span>
            {mode === "register" ? "Настройка Face ID" : "Вход через Face ID"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Видео превью */}
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg bg-black"
            style={{ aspectRatio: "4/3" }}
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Рамка для лица */}
          <div className={`absolute inset-4 border-2 rounded-lg transition-colors ${
            faceDetected ? "border-green-500" : "border-white/50"
          }`} style={{ 
            borderStyle: "dashed",
            aspectRatio: "1/1",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            height: "auto"
          }}>
            {countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-white bg-black/50 rounded-full w-16 h-16 flex items-center justify-center">
                  {countdown}
                </span>
              </div>
            )}
          </div>

          {/* Индикатор обработки */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Статус */}
        <div className="text-center">
          <p className="text-white/90 text-sm">{status}</p>
          {capturedImages.length > 0 && (
            <div className="flex justify-center space-x-1 mt-2">
              {Array.from({ length: mode === "register" ? 3 : 2 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < capturedImages.length ? "bg-green-500" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Кнопки управления */}
        <div className="flex space-x-2">
          {!isScanning && !isProcessing && !isInitializing && (
            <Button
              onClick={startScanning}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Camera className="w-4 h-4 mr-2" />
              {mode === "register" ? "Начать настройку" : "Сканировать лицо"}
            </Button>
          )}
          
          {(isScanning || isProcessing) && (
            <Button
              onClick={() => {
                setIsScanning(false);
                setIsProcessing(false);
                setCapturedImages([]);
                setStatus("Готов к сканированию");
              }}
              variant="outline"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Отменить
            </Button>
          )}

          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              className="px-4"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Инструкции */}
        <div className="text-xs text-white/60 text-center space-y-1">
          {mode === "register" ? (
            <>
              <p>• Расположите лицо в центре рамки</p>
              <p>• Держите устройство на уровне глаз</p>
              <p>• Обеспечьте хорошее освещение</p>
              <p>• Мы сделаем 5 снимков для лучшего распознавания</p>
            </>
          ) : (
            <>
              <p>• Посмотрите прямо в камеру</p>
              <p>• Держите устройство неподвижно</p>
              <p>• Убедитесь, что лицо хорошо освещено</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
