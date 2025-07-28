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

export default function FaceID({
  mode,
  onSuccess,
  onError,
  onCancel,
}: FaceIDProps) {
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

  // Инициализация каме��ы
  const initializeCamera = useCallback(async () => {
    try {
      setStatus("Запрос доступа к камере...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setStatus("Камера подключена");
        setIsInitializing(false);
      }
    } catch (error) {
      console.error("Camera initialization error:", error);
      onError(
        "Не удалось получить доступ к камере. Пожалуйста, разрешите доступ к камер��.",
      );
    }
  }, [onError]);

  // Строгая детекция лица с множественными проверками
  const detectFace = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return false;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return false;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Проверка на минимальную общую яркость (защита от закрытой камеры)
    let totalBrightness = 0;
    let validPixels = 0;

    for (let i = 0; i < data.length; i += 16) {
      // Каждый 4-й пиксель
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      totalBrightness += (r + g + b) / 3;
      validPixels++;
    }

    const averageBrightness = totalBrightness / validPixels;

    // Если слишком темно (камера закрыта или очень плохое освещение)
    if (averageBrightness < 20) {
      console.log(`Too dark: brightness=${averageBrightness.toFixed(1)}`);
      return false;
    }

    // Если слишком яркое (засветка или белый экран)
    if (averageBrightness > 240) {
      console.log(`Too bright: brightness=${averageBrightness.toFixed(1)}`);
      return false;
    }

    // Анализируем центральную область для поиска лица
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const checkRadius = Math.min(canvas.width, canvas.height) / 8; // Уменьшили область для точности

    let skinPixels = 0;
    let eyeRegionDark = 0;
    let contrastVariations = 0;
    let faceShapePixels = 0;
    let totalPixels = 0;

    // Детальный анализ центральной области
    for (let y = centerY - checkRadius; y < centerY + checkRadius; y++) {
      for (let x = centerX - checkRadius; x < centerX + checkRadius; x++) {
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          const i = (y * canvas.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;

          // Строгая проверка цвета кожи
          const isSkinColor =
            // Светлая кожа
            (r > 100 && g > 60 && b > 40 && r > g && g > b && r - g > 15) ||
            // Средняя кожа
            (r > 80 && g > 50 && b > 30 && r > g && g >= b && r - b > 30) ||
            // Темная кожа
            (r > 60 && g > 40 && b > 25 && r >= g && g >= b && brightness > 40);

          if (isSkinColor) {
            skinPixels++;
          }

          // Поиск темных областей (глаза, ноздри)
          if (brightness < 50 && y < centerY) {
            eyeRegionDark++;
          }

          // Проверка на вариации контраста
          if (i + 16 < data.length) {
            const nextR = data[i + 16];
            const nextG = data[i + 17];
            const nextB = data[i + 18];
            const diff = Math.abs(r + g + b - (nextR + nextG + nextB));
            if (diff > 60) {
              contrastVariations++;
            }
          }

          // Проверка на овальную форму лица
          const distanceFromCenter = Math.sqrt(
            (x - centerX) ** 2 + (y - centerY) ** 2,
          );
          if (distanceFromCenter < checkRadius * 0.8) {
            faceShapePixels++;
          }

          totalPixels++;
        }
      }
    }

    const skinRatio = skinPixels / totalPixels;
    const eyeRatio = eyeRegionDark / (totalPixels / 4); // Глаза в верхней части
    const contrastRatio = contrastVariations / totalPixels;
    const shapeRatio = faceShapePixels / totalPixels;

    // Строгие критерии для детекции лица
    const hasEnoughSkin = skinRatio > 0.25; // Минимум 25% кожи
    const hasEyeRegions = eyeRatio > 0.05; // Есть темные области �� верхней части
    const hasContrast = contrastRatio > 0.15; // Достаточно контраста
    const hasShape = shapeRatio > 0.6; // Правильная форма
    const goodLighting = averageBrightness > 40 && averageBrightness < 200;

    const faceDetected =
      hasEnoughSkin && hasEyeRegions && hasContrast && hasShape && goodLighting;

    console.log(`Strict face detection:`, {
      brightness: averageBrightness.toFixed(1),
      skin: skinRatio.toFixed(3),
      eyes: eyeRatio.toFixed(3),
      contrast: contrastRatio.toFixed(3),
      shape: shapeRatio.toFixed(3),
      detected: faceDetected,
    });

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

  // Генерация уникального дескриптора лица
  const generateFaceDescriptor = useCallback((imageData: string): number[] => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    return new Promise<number[]>((resolve) => {
      img.onload = () => {
        if (!ctx) {
          resolve([]);
          return;
        }

        canvas.width = 128;
        canvas.height = 128;
        ctx.drawImage(img, 0, 0, 128, 128);

        const imageData = ctx.getImageData(0, 0, 128, 128);
        const data = imageData.data;
        const descriptor: number[] = [];

        // Анализируем ключевые области лица
        const faceRegions = [
          { x: 32, y: 24, w: 64, h: 20, name: "eyes" }, // Область глаз
          { x: 48, y: 56, w: 32, h: 16, name: "nose" }, // Область носа
          { x: 32, y: 80, w: 64, h: 24, name: "mouth" }, // Область рта
          { x: 16, y: 40, w: 96, h: 48, name: "center" }, // Центральная область
        ];

        faceRegions.forEach((region) => {
          const regionDescriptor: number[] = [];

          // Анализируем каждую область с высоким разрешением
          for (let y = region.y; y < region.y + region.h; y += 4) {
            for (let x = region.x; x < region.x + region.w; x += 4) {
              if (x < 128 && y < 128) {
                const i = (y * 128 + x) * 4;
                const r = data[i] / 255;
                const g = data[i + 1] / 255;
                const b = data[i + 2] / 255;

                // Добавляем RGB значения
                regionDescriptor.push(r);
                regionDescriptor.push(g);
                regionDescriptor.push(b);

                // Добавляем производные характеристики
                regionDescriptor.push((r + g + b) / 3); // Яркость
                regionDescriptor.push(Math.abs(r - g)); // Контраст R-G
                regionDescriptor.push(Math.abs(g - b)); // Контраст G-B
                regionDescriptor.push(Math.abs(r - b)); // Контраст R-B
              }
            }
          }

          // Добавляем статистические характеристики региона
          if (regionDescriptor.length > 0) {
            const avg =
              regionDescriptor.reduce((a, b) => a + b, 0) /
              regionDescriptor.length;
            const variance =
              regionDescriptor.reduce((acc, val) => acc + (val - avg) ** 2, 0) /
              regionDescriptor.length;

            descriptor.push(...regionDescriptor);
            descriptor.push(avg); // Среднее значение региона
            descriptor.push(variance); // Дисперсия региона
            descriptor.push(Math.max(...regionDescriptor)); // Максимум
            descriptor.push(Math.min(...regionDescriptor)); // Минимум
          }
        });

        // Добавляем глобальные характеристики
        const globalBrightness = [];
        for (let i = 0; i < data.length; i += 16) {
          globalBrightness.push(
            (data[i] + data[i + 1] + data[i + 2]) / (3 * 255),
          );
        }

        const globalAvg =
          globalBrightness.reduce((a, b) => a + b, 0) / globalBrightness.length;
        const globalVar =
          globalBrightness.reduce(
            (acc, val) => acc + (val - globalAvg) ** 2,
            0,
          ) / globalBrightness.length;

        descriptor.push(globalAvg);
        descriptor.push(globalVar);
        descriptor.push(Math.max(...globalBrightness));
        descriptor.push(Math.min(...globalBrightness));

        console.log(`Generated descriptor with ${descriptor.length} features`);
        resolve(descriptor);
      };
      img.src = imageData;
    }) as any;
  }, []);

  // Строгое сравнение дескрипторов лица
  const compareDescriptors = useCallback(
    (desc1: number[], desc2: number[]): number => {
      if (desc1.length !== desc2.length || desc1.length === 0) return 0;

      // Нормализуем дескрипторы
      const normalize = (arr: number[]) => {
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        const std = Math.sqrt(
          arr.reduce((acc, val) => acc + (val - mean) ** 2, 0) / arr.length,
        );
        return arr.map((val) => (std > 0 ? (val - mean) / std : 0));
      };

      const norm1 = normalize(desc1);
      const norm2 = normalize(desc2);

      // Вычисляем корреляцию Пирсона (более строгая метрика)
      const n = norm1.length;
      let sumXY = 0;
      let sumX2 = 0;
      let sumY2 = 0;

      for (let i = 0; i < n; i++) {
        sumXY += norm1[i] * norm2[i];
        sumX2 += norm1[i] * norm1[i];
        sumY2 += norm2[i] * norm2[i];
      }

      const correlation = sumXY / Math.sqrt(sumX2 * sumY2);

      // Дополнительно проверяем евклидово расстояние
      let euclideanDist = 0;
      for (let i = 0; i < n; i++) {
        euclideanDist += (norm1[i] - norm2[i]) ** 2;
      }
      euclideanDist = Math.sqrt(euclideanDist);

      // ��омбинируем метрики дл�� более строгой оценки
      const similarity = (correlation + 1 / (1 + euclideanDist)) / 2;

      console.log(
        `Descriptor comparison: correlation=${correlation.toFixed(3)}, euclidean=${euclideanDist.toFixed(3)}, similarity=${similarity.toFixed(3)}`,
      );

      return Math.max(0, similarity); // Убираем отрицательные значения
    },
    [],
  );

  // Сохранение данных лица
  const saveFaceData = useCallback(
    async (descriptors: number[][]) => {
      if (!currentUser) return;

      const faceData: FaceDescriptor = {
        id: Date.now().toString(),
        userId: currentUser.id,
        descriptors,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      };

      const existingFaces = JSON.parse(
        localStorage.getItem("faceDescriptors") || "[]",
      );
      // Удаляем старые данные этого пользователя
      const filteredFaces = existingFaces.filter(
        (face: FaceDescriptor) => face.userId !== currentUser.id,
      );
      filteredFaces.push(faceData);

      localStorage.setItem("faceDescriptors", JSON.stringify(filteredFaces));
    },
    [currentUser],
  );

  // Проверка лица
  const verifyFace = useCallback(
    async (descriptors: number[][]): Promise<boolean> => {
      if (!currentUser) return false;

      const existingFaces = JSON.parse(
        localStorage.getItem("faceDescriptors") || "[]",
      ) as FaceDescriptor[];
      const userFace = existingFaces.find(
        (face) => face.userId === currentUser.id,
      );

      if (!userFace) return false;

      // Строгие критерии верификации
      const SIMILARITY_THRESHOLD = 0.88; // Повышен до 88%
      const MIN_MATCHES = Math.ceil(descriptors.length * 0.8); // Минимум 80% дескрипторов должны совпадать

      let maxSimilarity = 0;
      let goodMatches = 0;
      let totalComparisons = 0;

      for (const newDesc of descriptors) {
        for (const savedDesc of userFace.descriptors) {
          const similarity = compareDescriptors(newDesc, savedDesc);
          maxSimilarity = Math.max(maxSimilarity, similarity);
          totalComparisons++;

          if (similarity > SIMILARITY_THRESHOLD) {
            goodMatches++;
          }
        }
      }

      // Дополнительная проверка: средняя схожесть всех сравнений
      let totalSimilarity = 0;
      for (const newDesc of descriptors) {
        for (const savedDesc of userFace.descriptors) {
          totalSimilarity += compareDescriptors(newDesc, savedDesc);
        }
      }
      const averageSimilarity = totalSimilarity / totalComparisons;

      // Требуем высокую максимальную схожесть И достаточное количество хороших совпадений И высокую среднюю схожесть
      const verified =
        maxSimilarity > SIMILARITY_THRESHOLD &&
        goodMatches >= MIN_MATCHES &&
        averageSimilarity > 0.7;

      console.log(`Strict verification:`, {
        maxSimilarity: maxSimilarity.toFixed(3),
        avgSimilarity: averageSimilarity.toFixed(3),
        goodMatches: `${goodMatches}/${MIN_MATCHES}`,
        verified: verified,
      });

      // Обновляем время последнего использования только при успешной верификации
      if (verified) {
        userFace.lastUsed = new Date().toISOString();
        const updatedFaces = existingFaces.map((face) =>
          face.userId === currentUser.id ? userFace : face,
        );
        localStorage.setItem("faceDescriptors", JSON.stringify(updatedFaces));
      }

      return verified;
    },
    [currentUser, compareDescriptors],
  );

  // Основной процесс сканирования
  const startScanning = useCallback(async () => {
    if (!currentUser) {
      onError("Пользователь не авторизован");
      return;
    }

    setIsScanning(true);
    setStatus("Поиск лица...");
    setCapturedImages([]);

    const requiredImages = mode === "register" ? 5 : 3; // Увеличиваем для точности
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
        setStatus(
          `Лицо обнаружено! Захват ${capturedImages.length + 1}/${requiredImages}`,
        );

        // Countdown
        for (let i = 2; i > 0; i--) {
          setCountdown(i);
          await new Promise((resolve) => setTimeout(resolve, 800));
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
              // Генерируем дескрипторы для всех изображений с проверкой качества
              const descriptors: number[][] = [];
              let validImages = 0;

              for (const img of capturedImages) {
                // Дополнительная проверка качества изображения
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const tempImg = new Image();

                await new Promise<void>((resolve) => {
                  tempImg.onload = () => {
                    if (!ctx) {
                      resolve();
                      return;
                    }

                    canvas.width = tempImg.width;
                    canvas.height = tempImg.height;
                    ctx.drawImage(tempImg, 0, 0);

                    const imageData = ctx.getImageData(
                      0,
                      0,
                      canvas.width,
                      canvas.height,
                    );
                    const data = imageData.data;

                    // Проверяем качество и��ображения
                    let totalBrightness = 0;
                    let contrastSum = 0;

                    for (let i = 0; i < data.length; i += 16) {
                      const r = data[i];
                      const g = data[i + 1];
                      const b = data[i + 2];
                      totalBrightness += (r + g + b) / 3;
                      contrastSum += Math.max(r, g, b) - Math.min(r, g, b);
                    }

                    const avgBrightness = totalBrightness / (data.length / 16);
                    const avgContrast = contrastSum / (data.length / 16);

                    // Изображение должно иметь нормальную яркость и достаточный контраст
                    if (
                      avgBrightness > 30 &&
                      avgBrightness < 220 &&
                      avgContrast > 20
                    ) {
                      const desc = generateFaceDescriptor(img);
                      Promise.resolve(desc).then((d) => {
                        if (d.length > 0) {
                          descriptors.push(d);
                          validImages++;
                        }
                        resolve();
                      });
                    } else {
                      console.log(
                        `Rejecting low quality image: brightness=${avgBrightness.toFixed(1)}, contrast=${avgContrast.toFixed(1)}`,
                      );
                      resolve();
                    }
                  };
                  tempImg.src = img;
                });
              }

              if (descriptors.length < requiredImages * 0.6) {
                throw new Error(
                  "Недостаточно качественных изображений лица. Попробуйте при лучшем освещении.",
                );
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
                  onError(
                    "Лицо не ра��познано. Попробуйте еще ра�� или войдите другим способом.",
                  );
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
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } else {
        setStatus("Расположите лицо в центре камеры");
      }

      attempts++;
      setTimeout(scanLoop, 50); // Уменьшили интервал проверки
    };

    scanLoop();
  }, [
    mode,
    currentUser,
    detectFace,
    captureImage,
    generateFaceDescriptor,
    saveFaceData,
    verifyFace,
    onSuccess,
    onError,
  ]);

  // Остановка камеры
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
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
          <div
            className={`absolute inset-4 border-2 rounded-lg transition-colors ${
              faceDetected ? "border-green-500" : "border-white/50"
            }`}
            style={{
              borderStyle: "dashed",
              aspectRatio: "1/1",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "60%",
              height: "auto",
            }}
          >
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
              {Array.from({ length: mode === "register" ? 5 : 3 }).map(
                (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < capturedImages.length ? "bg-green-500" : "bg-white/30"
                    }`}
                  />
                ),
              )}
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
            <Button onClick={onCancel} variant="outline" className="px-4">
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
              <p>• Мы сделаем 5 снимков для максимальной точности</p>
            </>
          ) : (
            <>
              <p>• Посмотрите прямо в камеру</p>
              <p>��� Держите устройство неподвижно</p>
              <p>• Убедитесь, что лицо хорошо освещено</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
