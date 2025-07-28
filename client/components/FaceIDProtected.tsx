import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Scan,
  AlertTriangle,
  CheckCircle,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import FaceIDModal from "./FaceIDModal";

interface FaceIDProtectedProps {
  children: React.ReactNode;
  requireFaceID?: boolean;
}

interface FaceDescriptor {
  id: string;
  userId: string;
  descriptors: number[][];
  createdAt: string;
  lastUsed: string;
}

export default function FaceIDProtected({
  children,
  requireFaceID = true,
}: FaceIDProtectedProps) {
  const { currentUser } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [hasFaceID, setHasFaceID] = useState(false);
  const [showFaceIDModal, setShowFaceIDModal] = useState(false);
  const [faceIDMode, setFaceIDMode] = useState<"register" | "verify">("verify");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Проверяем, есть ли у пользователя настроенный Face ID
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const checkFaceID = () => {
      const faces = JSON.parse(
        localStorage.getItem("faceDescriptors") || "[]",
      ) as FaceDescriptor[];
      const userFace = faces.find((face) => face.userId === currentUser.id);
      setHasFaceID(!!userFace);
      setIsLoading(false);

      // Если Face ID настроен, сразу предлагаем верификацию
      if (userFace && requireFaceID) {
        setFaceIDMode("verify");
        setShowFaceIDModal(true);
      } else if (!userFace && requireFaceID) {
        // Если Face ID не настроен, но требуется, предлагаем настройку
        setFaceIDMode("register");
      }
    };

    checkFaceID();
  }, [currentUser, requireFaceID]);

  const handleFaceIDSuccess = () => {
    if (faceIDMode === "register") {
      setHasFaceID(true);
      setSuccess(
        "Face ID успешно настроен! Теперь вы можете использовать его для входа в личный кабинет.",
      );
      setIsVerified(true);
    } else {
      setIsVerified(true);
      setSuccess("Лицо успешно распознано! Добро пожаловать в личный кабинет.");
    }
    setError("");
  };

  const handleFaceIDError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess("");

    if (faceIDMode === "verify") {
      // При ошибке верификации предлагаем повторить попытку
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  const startFaceIDSetup = () => {
    setFaceIDMode("register");
    setShowFaceIDModal(true);
    setError("");
    setSuccess("");
  };

  const startFaceIDVerification = () => {
    setFaceIDMode("verify");
    setShowFaceIDModal(true);
    setError("");
    setSuccess("");
  };

  const skipFaceID = () => {
    setIsVerified(true);
  };

  // Если пользователь не авторизован
  if (!currentUser) {
    return (
      <Card className="theme-card w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <Shield className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Требуется авторизация
          </h2>
          <p className="text-white/70">
            Для доступа к личному кабинету необходимо войти в аккаунт
          </p>
        </CardContent>
      </Card>
    );
  }

  // Показываем загрузку
  if (isLoading) {
    return (
      <Card className="theme-card w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Проверка настроек безопасности...</p>
        </CardContent>
      </Card>
    );
  }

  // Если Face ID не требуется или уже верифицирован
  if (!requireFaceID || isVerified) {
    return <>{children}</>;
  }

  // Если Face ID не настроен
  if (!hasFaceID) {
    return (
      <div className="space-y-4">
        <Card className="theme-card w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-white text-center flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Безопасность личного кабинета</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="space-y-2">
              <Scan className="w-12 h-12 text-purple-400 mx-auto" />
              <h3 className="text-lg font-semibold text-white">
                Настройте Face ID
              </h3>
              <p className="text-white/70 text-sm">
                Для дополнительной защиты личного кабинета рекомендуется
                настроить распознавание лица. Это обеспечит безопасный доступ
                только для вас.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={startFaceIDSetup}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Scan className="w-4 h-4 mr-2" />
                Настроить Face ID
              </Button>

              <Button
                onClick={skipFaceID}
                variant="outline"
                className="w-full border-white/20 text-white/70 hover:text-white"
              >
                Пропустить (не рекомендуется)
              </Button>
            </div>

            <div className="text-xs text-white/50 space-y-1">
              <p>✓ Ваши биометрические данные хранятся локально</p>
              <p>✓ Никто кроме вас не получит доступ</p>
              <p>✓ Данные не передаются на сервер</p>
            </div>
          </CardContent>
        </Card>

        {/* Сообщения об ошибках и успехе */}
        {error && (
          <Card className="theme-card border-red-500/20 bg-red-500/10">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-300">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="theme-card border-green-500/20 bg-green-500/10">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-green-300">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <FaceIDModal
          isOpen={showFaceIDModal}
          onClose={() => setShowFaceIDModal(false)}
          mode={faceIDMode}
          onSuccess={handleFaceIDSuccess}
          onError={handleFaceIDError}
        />
      </div>
    );
  }

  // Если Face ID настроен, но треб��ется верификация
  return (
    <div className="space-y-4">
      <Card className="theme-card w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-white text-center flex items-center justify-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Доступ к личному кабинету</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="space-y-2">
            <Scan className="w-12 h-12 text-purple-400 mx-auto" />
            <h3 className="text-lg font-semibold text-white">
              Подтвердите личность
            </h3>
            <p className="text-white/70 text-sm">
              Для доступа к личному кабинету необходимо пройти проверку Face ID.
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={startFaceIDVerification}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Scan className="w-4 h-4 mr-2" />
              Сканировать лицо
            </Button>

            <Button
              onClick={skipFaceID}
              variant="outline"
              className="w-full border-white/20 text-white/70 hover:text-white"
            >
              Войти без Face ID
            </Button>
          </div>

          <div className="text-xs text-white/50">
            <p>🔒 Защищено биометрической аутентификацией</p>
          </div>
        </CardContent>
      </Card>

      {/* Сообщения об ошибках и успехе */}
      {error && (
        <Card className="theme-card border-red-500/20 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-300">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
            <div className="mt-2">
              <Button
                onClick={startFaceIDVerification}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Повторить попытку
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="theme-card border-green-500/20 bg-green-500/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-green-300">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">{success}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <FaceIDModal
        isOpen={showFaceIDModal}
        onClose={() => setShowFaceIDModal(false)}
        mode={faceIDMode}
        onSuccess={handleFaceIDSuccess}
        onError={handleFaceIDError}
      />
    </div>
  );
}
