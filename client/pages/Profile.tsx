import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  User,
  Mail,
  Lock,
  ArrowLeft,
  Camera,
  Save,
  Calendar,
  Settings,
  Trash2,
  CheckCircle,
  Scan,
  FileText,
  Eye,
  Download,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import FaceIDProtected from "@/components/FaceIDProtected";
import FaceIDModal from "@/components/FaceIDModal";
import ServiceOrderForm from "@/components/ServiceOrderForm";
import { ContractData } from "@shared/api";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  avatar?: string;
}

function Profile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [avatar, setAvatar] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "contracts"
  >("profile");
  const [showFaceIDModal, setShowFaceIDModal] = useState(false);
  const [faceIDMode, setFaceIDMode] = useState<"register" | "verify">(
    "register",
  );
  const [hasFaceID, setHasFaceID] = useState(false);
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Получаем аватар пользователя и проверяе�� Face ID при загрузке
  useEffect(() => {
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem("users") || "[]") as User[];
      const user = users.find((u) => u.id === currentUser.id);
      if (user?.avatar) {
        setAvatar(user.avatar);
      }

      // Проверяем настройки Face ID
      const faces = JSON.parse(localStorage.getItem("faceDescriptors") || "[]");
      const userFace = faces.find(
        (face: any) => face.userId === currentUser.id,
      );
      setHasFaceID(!!userFace);
    }
  }, [currentUser]);

  // Load user contracts
  const loadContracts = async () => {
    if (!currentUser) return;

    setLoadingContracts(true);
    try {
      const response = await fetch("/api/contracts", {
        headers: {
          "user-id": currentUser.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setContracts(data.contracts || []);
        }
      }
    } catch (error) {
      console.error("Error loading contracts:", error);
    } finally {
      setLoadingContracts(false);
    }
  };

  // Load contracts when tab changes to contracts
  useEffect(() => {
    if (activeTab === "contracts" && currentUser) {
      loadContracts();
    }
  }, [activeTab, currentUser]);

  // Если пользователь не авторизован
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-indigo-950/30 text-white flex items-center justify-center p-6">
        <Card className="bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-xl border border-blue-500/20 w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Доступ запрещён
            </h2>
            <p className="text-white/70 mb-4">
              Для просмотра профиля необходимо войти в аккаунт
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Войти в а��каунт
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Размер файла не должен превышать 5MB");
        return;
      }

      // Проверяем тип файла
      if (!file.type.startsWith("image/")) {
        setError("Пожалуйста, выберите изображение");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setAvatar(base64String);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]") as User[];
      const userIndex = users.findIndex((u) => u.id === currentUser.id);

      if (userIndex === -1) {
        setError("Пользователь не найден");
        return;
      }

      // Проверяем, не занят ли email другим пользователем
      if (formData.email !== currentUser.email) {
        const emailExists = users.some(
          (u) => u.email === formData.email && u.id !== currentUser.id,
        );
        if (emailExists) {
          setError("Пользователь с таким email уже существует");
          return;
        }
      }

      // Обновляем данные пользователя
      users[userIndex] = {
        ...users[userIndex],
        name: formData.name,
        email: formData.email,
        avatar: avatar || users[userIndex].avatar,
      };

      localStorage.setItem("users", JSON.stringify(users));

      // Обновляем текущего пользователя
      const updatedCurrentUser = {
        id: currentUser.id,
        name: formData.name,
        email: formData.email,
      };
      localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));

      setSuccess("Профиль успешно обновлён");

      // Обновляем страницу через 2 секунды
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Profile update error:", error);
      setError("Произошла ошибка при обновлении профиля");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]") as User[];
      const userIndex = users.findIndex((u) => u.id === currentUser.id);

      if (userIndex === -1) {
        setError("Пользователь не найден");
        return;
      }

      // Проверяем текущий пароль
      if (users[userIndex].password !== formData.currentPassword) {
        setError("Неверный текущий пароль");
        return;
      }

      // Проверяем совпадение новых паролей
      if (formData.newPassword !== formData.confirmPassword) {
        setError("Новые пароли не совпадают");
        return;
      }

      if (formData.newPassword.length < 6) {
        setError("Новый пароль должен содержать минимум 6 символов");
        return;
      }

      // Обновляем пароль
      users[userIndex].password = formData.newPassword;
      localStorage.setItem("users", JSON.stringify(users));

      setSuccess("Пароль успешно изменён");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Password change error:", error);
      setError("Произошла ошибка при смене пароля");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.",
      )
    ) {
      const users = JSON.parse(localStorage.getItem("users") || "[]") as User[];
      const filteredUsers = users.filter((u) => u.id !== currentUser.id);
      localStorage.setItem("users", JSON.stringify(filteredUsers));
      logout();
      navigate("/");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Функции для Face ID
  const handleFaceIDSetup = () => {
    setFaceIDMode("register");
    setShowFaceIDModal(true);
  };

  const handleFaceIDSuccess = () => {
    if (faceIDMode === "register") {
      setHasFaceID(true);
      setSuccess("Face ID успешно настроен!");
    }
    setShowFaceIDModal(false);
  };

  const handleFaceIDError = (errorMessage: string) => {
    setError(errorMessage);
    setShowFaceIDModal(false);
  };

  const handleRemoveFaceID = () => {
    if (
      currentUser &&
      window.confirm(
        "Вы уверены, что хотите отключить Face ID? Это снизит безопасность вашего аккаунта.",
      )
    ) {
      const faces = JSON.parse(localStorage.getItem("faceDescriptors") || "[]");
      const filteredFaces = faces.filter(
        (face: any) => face.userId !== currentUser.id,
      );
      localStorage.setItem("faceDescriptors", JSON.stringify(filteredFaces));
      setHasFaceID(false);
      setSuccess("Face ID отключен");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Modern Business Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Назад на главную</span>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Личный кабинет
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Управление профилем и настройками аккаунта
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">Активен</span>
                </div>
                <p className="text-xs text-gray-500">
                  Последний вход: {new Date().toLocaleDateString('ru-RU')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Notifications */}
        {success && (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Modern Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-200 bg-gray-50">
                <CardTitle className="text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900 font-semibold">Профиль пользователя</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Modern Avatar */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-gray-100 shadow-lg">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <User className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {currentUser.name}
                    </h3>
                    <p className="text-gray-600">{currentUser.email}</p>
                  </div>

                  {/* Modern Stats */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">ID пользователя:</span>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        {currentUser.id}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Дата регистрации:</span>
                      <span className="text-gray-900 font-medium">
                        {formatDate(
                          JSON.parse(localStorage.getItem("users") || "[]").find(
                            (u: User) => u.id === currentUser.id,
                          )?.createdAt || new Date().toISOString(),
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Статус аккаунта:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 font-medium">Акт��вен</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Modern Settings Panel */}
          <div className="lg:col-span-3">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-200 bg-gray-50">
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      activeTab === "profile"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Профиль
                  </button>
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      activeTab === "security"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Безопасность
                  </button>
                  <button
                    onClick={() => setActiveTab("contracts")}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      activeTab === "contracts"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Договоры
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {activeTab === "profile" && (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white/80">
                        Полное имя
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Введ��те ваше имя"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/80">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Введите ваш email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Сохраняем..." : "Сохранить изменения"}
                    </Button>
                  </form>
                )}

                {activeTab === "security" && (
                  <div className="space-y-6">
                    {/* Face ID Section */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <Scan className="w-5 h-5" />
                        <span>Face ID</span>
                      </h4>

                      <div className="p-4 border border-white/20 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h5 className="text-white font-medium">
                              Распознавание лица
                            </h5>
                            <p className="text-white/70 text-sm">
                              {hasFaceID
                                ? "Face ID настроен и активен для вашего аккаунта"
                                : "Настройте Face ID для дополнительной безопасности"}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={hasFaceID ? "default" : "secondary"}
                              className={
                                hasFaceID
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-600 text-white"
                              }
                            >
                              {hasFaceID ? "Активен" : "Не настроен"}
                            </Badge>

                            {hasFaceID ? (
                              <Button
                                onClick={handleRemoveFaceID}
                                variant="outline"
                                size="sm"
                                className="border-red-500/20 text-red-300 hover:bg-red-500/10"
                              >
                                Отклю��ить
                              </Button>
                            ) : (
                              <Button
                                onClick={handleFaceIDSetup}
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <Scan className="w-4 h-4 mr-2" />
                                Настроить
                              </Button>
                            )}
                          </div>
                        </div>

                        {hasFaceID && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="text-xs text-white/50 space-y-1">
                              <p>
                                ✓ Face ID будет запрашиваться при входе в
                                ли��ный кабинет
                              </p>
                              <p>
                                ✓ Биометрические данные хранятся локально и не
                                передаются на сервер
                              </p>
                              <p>
                                ✓ Только ваше лицо может получить доступ к
                                аккаунту
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="bg-white/20" />

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <h4 className="text-lg font-semibold text-white mb-4">
                        Смена пароля
                      </h4>

                      <div className="space-y-2">
                        <Label
                          htmlFor="currentPassword"
                          className="text-white/80"
                        >
                          Текущий пароль
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            placeholder="Введите текущий пароль"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            required
                            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-white/80">
                          Новый пароль
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            placeholder="Введите новый пароль"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="confirmPassword"
                          className="text-white/80"
                        >
                          Подтвердите новый пароль
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Повторите новый пароль"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? "Изменяем..." : "Изменить пароль"}
                      </Button>
                    </form>

                    <Separator className="bg-white/20" />

                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">
                        Опасная зона
                      </h4>
                      <div className="p-4 border border-red-500/20 bg-red-500/10 rounded-lg">
                        <h5 className="text-red-300 font-medium mb-2">
                          Удалить аккаунт
                        </h5>
                        <p className="text-red-300/70 text-sm mb-4">
                          Удаление аккаунта приведёт к полному удалению всех
                          ваших данных. Это действие нельзя отменить.
                        </p>
                        <Button
                          onClick={handleDeleteAccount}
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Удалить аккаунт
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "contracts" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>Мои договоры</span>
                      </h4>
                      <Button
                        onClick={() => setShowOrderForm(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Заказать услугу
                      </Button>
                    </div>

                    {loadingContracts ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-white/70">Загружаем договоры...</p>
                      </div>
                    ) : contracts.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
                        <h5 className="text-xl font-semibold text-white mb-2">
                          У вас пока нет договоров
                        </h5>
                        <p className="text-white/70 mb-6">
                          Закажите первую услугу и получите договор
                          автоматически
                        </p>
                        <Button
                          onClick={() => setShowOrderForm(true)}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Заказать услугу
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {contracts.map((contract) => (
                          <div
                            key={contract.id}
                            className="p-4 border border-white/20 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h5 className="text-white font-medium">
                                    {contract.projectType}
                                  </h5>
                                  <Badge
                                    variant="outline"
                                    className={`${
                                      contract.status === "active"
                                        ? "border-green-500/50 text-green-400"
                                        : contract.status === "completed"
                                          ? "border-blue-500/50 text-blue-400"
                                          : contract.status === "cancelled"
                                            ? "border-red-500/50 text-red-400"
                                            : "border-yellow-500/50 text-yellow-400"
                                    }`}
                                  >
                                    {contract.status === "active" && (
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                    )}
                                    {contract.status === "draft" && (
                                      <Clock className="w-3 h-3 mr-1" />
                                    )}
                                    {contract.status === "completed" && (
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                    )}
                                    {contract.status === "cancelled" && (
                                      <XCircle className="w-3 h-3 mr-1" />
                                    )}
                                    {contract.status === "active"
                                      ? "Активный"
                                      : contract.status === "completed"
                                        ? "Завершен"
                                        : contract.status === "cancelled"
                                          ? "Отменен"
                                          : "Черновик"}
                                  </Badge>
                                </div>
                                <p className="text-white/70 text-sm mb-2">
                                  {contract.projectDescription.length > 100
                                    ? `${contract.projectDescription.substring(0, 100)}...`
                                    : contract.projectDescription}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-white/60">
                                  <span>№ {contract.id}</span>
                                  <span>•</span>
                                  <span>
                                    {new Date(
                                      contract.createdAt,
                                    ).toLocaleDateString("ru-RU")}
                                  </span>
                                  <span>•</span>
                                  <span className="font-semibold text-purple-400">
                                    {contract.price.toLocaleString("ru-RU")} ₽
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  onClick={() =>
                                    window.open(
                                      `/api/contracts/${contract.id}`,
                                      "_blank",
                                    )
                                  }
                                  size="sm"
                                  variant="outline"
                                  className="border-white/20 text-white hover:bg-white/10"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Просмотр
                                </Button>
                                <Button
                                  onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = `/api/contracts/${contract.id}`;
                                    link.download = contract.fileName;
                                    link.click();
                                  }}
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Скачать
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Face ID Modal */}
      <FaceIDModal
        isOpen={showFaceIDModal}
        onClose={() => setShowFaceIDModal(false)}
        mode={faceIDMode}
        onSuccess={handleFaceIDSuccess}
        onError={handleFaceIDError}
      />

      {/* Service Order Form */}
      <ServiceOrderForm
        isOpen={showOrderForm}
        onClose={() => {
          setShowOrderForm(false);
          // Reload contracts if we're on contracts tab
          if (activeTab === "contracts") {
            loadContracts();
          }
        }}
      />
    </div>
  );
}

// Обертка для защиты страницы профиля через Face ID
export default function ProtectedProfile() {
  return (
    <FaceIDProtected requireFaceID={true}>
      <Profile />
    </FaceIDProtected>
  );
}
