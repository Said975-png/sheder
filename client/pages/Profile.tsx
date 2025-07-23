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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import FaceIDProtected from "@/components/FaceIDProtected";
import FaceIDModal from "@/components/FaceIDModal";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  avatar?: string;
}

export default function Profile() {
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
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [showFaceIDModal, setShowFaceIDModal] = useState(false);
  const [faceIDMode, setFaceIDMode] = useState<"register" | "verify">("register");
  const [hasFaceID, setHasFaceID] = useState(false);

  // Получаем аватар пользователя и проверяем Face ID при загрузке
  useEffect(() => {
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem("users") || "[]") as User[];
      const user = users.find((u) => u.id === currentUser.id);
      if (user?.avatar) {
        setAvatar(user.avatar);
      }

      // Проверяем настройки Face ID
      const faces = JSON.parse(localStorage.getItem("faceDescriptors") || "[]");
      const userFace = faces.find((face: any) => face.userId === currentUser.id);
      setHasFaceID(!!userFace);
    }
  }, [currentUser]);

  // Если пользователь не авторизован
  if (!currentUser) {
    return (
      <div className="min-h-screen theme-gradient theme-text flex items-center justify-center p-6">
        <Card className="theme-card w-full max-w-md">
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
              Войти в аккаунт
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

      // Обновляем текущего по��ьзователя
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
        setError("Неверный текущий парол��");
        return;
      }

      // Пров��ряем совпадение новых паролей
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
    if (currentUser && window.confirm("Вы уверены, что хотите отключить Face ID? Это снизит безопасность вашего а��каунта.")) {
      const faces = JSON.parse(localStorage.getItem("faceDescriptors") || "[]");
      const filteredFaces = faces.filter((face: any) => face.userId !== currentUser.id);
      localStorage.setItem("faceDescriptors", JSON.stringify(filteredFaces));
      setHasFaceID(false);
      setSuccess("Face ID отключен");
    }
  };

  return (
    <div className="min-h-screen theme-gradient theme-text p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 theme-nav-text"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад на главную</span>
            </Link>
            <ThemeToggle />
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Проф��ль пользователя</h1>
              <p className="text-white/70">
                Управляйте настройками вашего аккаунта
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <Card className="theme-card">
              <CardHeader>
                <CardTitle className="text-white text-center">
                  Информация о профиле
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {/* Avatar */}
                <div className="relative mb-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <h3 className="text-xl font-semibold text-white mb-1">
                  {currentUser.name}
                </h3>
                <p className="text-white/70 mb-4">{currentUser.email}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">ID пользователя:</span>
                    <Badge
                      variant="secondary"
                      className="bg-white/10 text-white"
                    >
                      {currentUser.id}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Дата регистрации:</span>
                    <span className="text-white">
                      {formatDate(
                        JSON.parse(localStorage.getItem("users") || "[]").find(
                          (u: User) => u.id === currentUser.id,
                        )?.createdAt || new Date().toISOString(),
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings */}
          <div className="lg:col-span-2">
            <Card className="theme-card">
              <CardHeader>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "profile"
                        ? "bg-purple-600 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Профиль
                  </button>
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "security"
                        ? "bg-purple-600 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Безопасность
                  </button>
                </div>
              </CardHeader>
              <CardContent>
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
                          placeholder="Введите ваше имя"
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
                          Удаление аккаунта приведёт к полному удалению все��
                          ваших данных. Это дейст��ие нельзя отменить.
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
