import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, Lock, User, CheckCircle, X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
}: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Сброс формы при открытии/закрытии модального окна
  useEffect(() => {
    if (!isOpen) {
      setLoginData({ email: "", password: "" });
      setSignupData({ name: "", email: "", password: "", confirmPassword: "" });
      setError("");
      setSuccess(false);
      setIsLogin(true);
    }
  }, [isOpen]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]") as User[];
      const user = users.find(
        (u) => u.email === loginData.email && u.password === loginData.password,
      );

      if (!user) {
        setError("Неверный email или пароль");
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
        }),
      );

      setSuccess(true);
      setSuccessMessage("Вход выполнен успешно!");

      setTimeout(() => {
        onAuthSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      setError("Произошла ошибка при входе");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (signupData.password !== signupData.confirmPassword) {
      setError("Пароли не совпадают");
      setLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      setLoading(false);
      return;
    }

    try {
      const existingUsers = JSON.parse(
        localStorage.getItem("users") || "[]",
      ) as User[];

      if (existingUsers.find((user) => user.email === signupData.email)) {
        setError("Пользователь с таким email уже существует");
        setLoading(false);
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        createdAt: new Date().toISOString(),
      };

      existingUsers.push(newUser);
      localStorage.setItem("users", JSON.stringify(existingUsers));

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        }),
      );

      setSuccess(true);
      setSuccessMessage(
        `Регистрация успешна! Добро пожаловать, ${signupData.name}!`,
      );

      setTimeout(() => {
        onAuthSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      setError("Произошла ошибка при регистрации");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <Card
          className="bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-xl border border-green-500/20 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Успешно!</h2>
            <p className="text-white/70 mb-4">{successMessage}</p>
            <p className="text-white/70 text-sm">
              Открываем форму заказа услуги...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <Card
        className="bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-xl border border-blue-500/20 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">AI Detect</h1>
          </div>
          <CardTitle className="text-white">
            {isLogin ? "Вход в аккаунт" : "Создать аккаунт"}
          </CardTitle>
          <p className="text-white/70 text-sm">
            {isLogin
              ? "Войдите, чтобы заказать услугу"
              : "Создайте аккаунт для оформления заказа"}
          </p>
        </CardHeader>

        <CardContent>
          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  {error}
                </div>
              )}

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
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">
                  Пароль
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Введите ваш пароль"
                    value={loginData.password}
                    onChange={handleLoginChange}
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
                {loading ? "Входим в аккаунт..." : "Войти"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  {error}
                </div>
              )}

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
                    value={signupData.name}
                    onChange={handleSignupChange}
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
                    value={signupData.email}
                    onChange={handleSignupChange}
                    required
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">
                  Пароль
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Создайте пароль"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    required
                    minLength={6}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/80">
                  Подтвердите пароль
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Повторите пароль"
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
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
                {loading ? "Создаем аккаунт..." : "Создать аккаунт"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-white/70">
              {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                {isLogin ? "Зарегистрироваться" : "Войти"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
