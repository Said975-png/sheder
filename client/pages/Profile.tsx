import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  Activity,
  CreditCard,
  Bell,
  Palette,
  Globe,
  Smartphone,
  BarChart3,
  TrendingUp,
  Users,
  Award,
  Zap,
  Briefcase,
  MapPin,
  Phone,
  Edit3,
  Star,
  HelpCircle,
  ExternalLink,
  Database,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import FaceIDProtected from "@/components/FaceIDProtected";
import FaceIDModal from "@/components/FaceIDModal";
import ServiceOrderForm from "@/components/ServiceOrderForm";
import BookingForm from "@/components/BookingForm";
import { ContractData, BookingData } from "@shared/api";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  company?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  preferences?: {
    theme: "light" | "dark" | "auto";
    language: string;
    timezone: string;
  };
}

interface ActivityLog {
  id: string;
  type:
    | "login"
    | "profile_update"
    | "password_change"
    | "contract_created"
    | "security_change";
  description: string;
  timestamp: string;
  ip?: string;
  device?: string;
}

interface DashboardStats {
  totalContracts: number;
  activeProjects: number;
  completedProjects: number;
  totalSpent: number;
  accountLevel: "Bronze" | "Silver" | "Gold" | "Platinum";
}

function Profile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    bio: "",
    phone: "",
    location: "",
    website: "",
    company: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatar, setAvatar] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showFaceIDModal, setShowFaceIDModal] = useState(false);
  const [faceIDMode, setFaceIDMode] = useState<"register" | "verify">(
    "register",
  );
  const [hasFaceID, setHasFaceID] = useState(false);
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    theme: "auto" as "light" | "dark" | "auto",
    language: "ru",
    timezone: "Europe/Moscow",
  });

  // Activity log
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  // Dashboard stats
  const [stats, setStats] = useState<DashboardStats>({
    totalContracts: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalSpent: 0,
    accountLevel: "Bronze",
  });

  // Network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load user data and activity
  useEffect(() => {
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem("users") || "[]") as User[];
      const user = users.find((u) => u.id === currentUser.id);

      if (user) {
        if (user.avatar) setAvatar(user.avatar);
        setFormData((prev) => ({
          ...prev,
          bio: user.bio || "",
          phone: user.phone || "",
          location: user.location || "",
          website: user.website || "",
          company: user.company || "",
        }));

        if (user.notifications) setNotifications(user.notifications);
        if (user.preferences) setPreferences(user.preferences);
      }

      // Check Face ID
      const faces = JSON.parse(localStorage.getItem("faceDescriptors") || "[]");
      const userFace = faces.find(
        (face: any) => face.userId === currentUser.id,
      );
      setHasFaceID(!!userFace);

      // Load activity log
      loadActivityLog();
      loadDashboardStats();
    }
  }, [currentUser]);

  const loadActivityLog = () => {
    const logs = JSON.parse(
      localStorage.getItem(`activityLog_${currentUser?.id}`) || "[]",
    );
    setActivityLog(logs.slice(0, 10)); // Show last 10 activities
  };

  const addActivityLog = (type: ActivityLog["type"], description: string) => {
    if (!currentUser) return;

    const newLog: ActivityLog = {
      id: Date.now().toString(),
      type,
      description,
      timestamp: new Date().toISOString(),
      ip: "127.0.0.1", // Mock IP
      device: navigator.userAgent.split("(")[0].trim(),
    };

    const logs = JSON.parse(
      localStorage.getItem(`activityLog_${currentUser.id}`) || "[]",
    );
    logs.unshift(newLog);
    localStorage.setItem(
      `activityLog_${currentUser.id}`,
      JSON.stringify(logs.slice(0, 50)),
    ); // Keep last 50
    setActivityLog(logs.slice(0, 10));
  };

  const loadDashboardStats = () => {
    // Calculate stats from contracts and other data
    const userContracts = JSON.parse(
      localStorage.getItem(`contracts_${currentUser?.id}`) || "[]",
    );
    const active = userContracts.filter(
      (c: any) => c.status === "active",
    ).length;
    const completed = userContracts.filter(
      (c: any) => c.status === "completed",
    ).length;
    const totalSpent = userContracts.reduce(
      (sum: number, c: any) => sum + (c.price || 0),
      0,
    );

    let accountLevel: DashboardStats["accountLevel"] = "Bronze";
    if (totalSpent > 500000) accountLevel = "Platinum";
    else if (totalSpent > 200000) accountLevel = "Gold";
    else if (totalSpent > 50000) accountLevel = "Silver";

    setStats({
      totalContracts: userContracts.length,
      activeProjects: active,
      completedProjects: completed,
      totalSpent,
      accountLevel,
    });
  };

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

  // Load user bookings
  const loadBookings = async () => {
    if (!currentUser) return;

    setLoadingBookings(true);
    try {
      const response = await fetch("/api/bookings", {
        headers: {
          "user-id": currentUser.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBookings(data.bookings || []);
        }
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Load contracts and bookings when needed
  useEffect(() => {
    if (
      (activeTab === "contracts" || activeTab === "dashboard") &&
      currentUser
    ) {
      loadContracts();
    }
    if (
      (activeTab === "bookings" || activeTab === "dashboard") &&
      currentUser
    ) {
      loadBookings();
    }
  }, [activeTab, currentUser]);

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
      if (file.size > 5 * 1024 * 1024) {
        setError("Размер файла не должен превышать 5MB");
        return;
      }

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

      if (formData.email !== currentUser.email) {
        const emailExists = users.some(
          (u) => u.email === formData.email && u.id !== currentUser.id,
        );
        if (emailExists) {
          setError("Пользователь с таким email уже су��ествует");
          return;
        }
      }

      users[userIndex] = {
        ...users[userIndex],
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        website: formData.website,
        company: formData.company,
        avatar: avatar || users[userIndex].avatar,
        notifications,
        preferences,
      };

      localStorage.setItem("users", JSON.stringify(users));

      const updatedCurrentUser = {
        id: currentUser.id,
        name: formData.name,
        email: formData.email,
      };
      localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));

      addActivityLog("profile_update", "Профиль обновлен");
      setSuccess("Профиль успешно обновлён");

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

      if (users[userIndex].password !== formData.currentPassword) {
        setError("Неверный текущий пароль");
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError("Новые пароли не совпадают");
        return;
      }

      if (formData.newPassword.length < 6) {
        setError("Новый пароль должен содержать минимум 6 символов");
        return;
      }

      users[userIndex].password = formData.newPassword;
      localStorage.setItem("users", JSON.stringify(users));

      addActivityLog("password_change", "Пароль изменен");
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

      // Clean up user data
      localStorage.removeItem(`activityLog_${currentUser.id}`);
      localStorage.removeItem(`contracts_${currentUser.id}`);

      logout();
      navigate("/");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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

  const getActivityIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "login":
        return <User className="w-4 h-4" />;
      case "profile_update":
        return <Edit3 className="w-4 h-4" />;
      case "password_change":
        return <Lock className="w-4 h-4" />;
      case "contract_created":
        return <FileText className="w-4 h-4" />;
      case "security_change":
        return <Shield className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getAccountLevelColor = (level: DashboardStats["accountLevel"]) => {
    switch (level) {
      case "Bronze":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "Silver":
        return "text-gray-600 bg-gray-50 border-gray-200";
      case "Gold":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Platinum":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Face ID functions
  const handleFaceIDSetup = () => {
    setFaceIDMode("register");
    setShowFaceIDModal(true);
  };

  const handleFaceIDSuccess = () => {
    if (faceIDMode === "register") {
      setHasFaceID(true);
      addActivityLog("security_change", "Face ID настроен");
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
        "Вы уверены, что хотите отключи��ь Face ID? Это снизит безопасность вашего аккаунта.",
      )
    ) {
      const faces = JSON.parse(localStorage.getItem("faceDescriptors") || "[]");
      const filteredFaces = faces.filter(
        (face: any) => face.userId !== currentUser.id,
      );
      localStorage.setItem("faceDescriptors", JSON.stringify(filteredFaces));
      setHasFaceID(false);
      addActivityLog("security_change", "Face ID отключен");
      setSuccess("Face ID отключен");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Назад на главную</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-semibold text-gray-900">
                    Личный кабинет
                  </h1>
                  <p className="text-xs text-gray-500">
                    Добро пожаловать, {currentUser.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Connection Status */}
              <div className="flex items-center space-x-2 text-sm">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="hidden sm:inline text-green-600">
                      Онлайн
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="hidden sm:inline text-red-600">
                      Офлайн
                    </span>
                  </>
                )}
              </div>

              {/* Account Level Badge */}
              <Badge
                className={`${getAccountLevelColor(stats.accountLevel)} font-medium`}
              >
                <Award className="w-3 h-3 mr-1" />
                {stats.accountLevel}
              </Badge>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Status Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <XCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-none lg:inline-flex">
            <TabsTrigger
              value="dashboard"
              className="flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Панель</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Профиль</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Безопасность</span>
            </TabsTrigger>
            <TabsTrigger
              value="contracts"
              className="flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Договоры</span>
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Брони</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Настройки</span>
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="flex items-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Активность</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Всего договоров
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalContracts}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Активные проекты
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.activeProjects}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Завершено
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.completedProjects}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Общая сумма
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalSpent.toLocaleString("ru-RU")} ₽
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Summary */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Профиль пользователя</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-gray-100 flex-shrink-0">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <User className="w-10 h-10 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900">
                        {currentUser.name}
                      </h3>
                      <p className="text-gray-600">{currentUser.email}</p>
                      {formData.bio && (
                        <p className="text-sm text-gray-500 mt-2">
                          {formData.bio}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        {formData.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{formData.location}</span>
                          </div>
                        )}
                        {formData.company && (
                          <div className="flex items-center space-x-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{formData.company}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => setActiveTab("profile")}
                      variant="outline"
                      size="sm"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Редактировать
                    </Button>
                    <Button
                      onClick={() => setShowOrderForm(true)}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Новый заказ
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Безопасность</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Face ID</span>
                      <Badge variant={hasFaceID ? "default" : "secondary"}>
                        {hasFaceID ? "Активен" : "Не настроен"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Email уведомления
                      </span>
                      <Badge
                        variant={notifications.email ? "default" : "secondary"}
                      >
                        {notifications.email ? "Включены" : "Отключены"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Push уведомления
                      </span>
                      <Badge
                        variant={notifications.push ? "default" : "secondary"}
                      >
                        {notifications.push ? "Включены" : "Отключены"}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    onClick={() => setActiveTab("security")}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Настроить
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Последняя активность</span>
                  </div>
                  <Button
                    onClick={() => setActiveTab("activity")}
                    variant="ghost"
                    size="sm"
                  >
                    Показать всё
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activityLog.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                        {getActivityIcon(log.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {log.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString("ru-RU")}
                        </p>
                      </div>
                    </div>
                  ))}
                  {activityLog.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      Активность не найдена
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Avatar Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Фото профиля</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 mx-auto rounded-xl overflow-hidden border-4 border-gray-100 shadow-lg">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <User className="w-16 h-16 text-white" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Рекомендуемый размер: 400x400px</p>
                    <p>Максимальный размер: 5MB</p>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Form */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Основная информация</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Полное имя</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Телефон</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Местоположение</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Компания</Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Веб-сайт</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="website"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">О себе</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Расскажите о себе..."
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Сохраняем..." : "Сохранить изменения"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Face ID Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Scan className="w-5 h-5" />
                    <span>Face ID</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-medium text-gray-900">
                          Распознавание лица
                        </h5>
                        <p className="text-sm text-gray-600">
                          {hasFaceID
                            ? "Face ID настроен и активен"
                            : "Настройте Face ID для дополнительной безопасности"}
                        </p>
                      </div>
                      <Badge variant={hasFaceID ? "default" : "secondary"}>
                        {hasFaceID ? "Активен" : "Не настроен"}
                      </Badge>
                    </div>

                    {hasFaceID ? (
                      <Button
                        onClick={handleRemoveFaceID}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Отключить Face ID
                      </Button>
                    ) : (
                      <Button
                        onClick={handleFaceIDSetup}
                        size="sm"
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        <Scan className="w-4 h-4 mr-2" />
                        Настроить Face ID
                      </Button>
                    )}
                  </div>

                  {hasFaceID && (
                    <div className="text-xs text-gray-500 space-y-1 border-t pt-3">
                      <p>✓ Face ID запрашивается при входе в личный кабинет</p>
                      <p>✓ Биометрические данные хранятся локально</p>
                      <p>✓ Толь��о ваше лицо может получить доступ</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Password Change */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="w-5 h-5" />
                    <span>Смена пароля</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Текущий пароль</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Новый пароль</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="pl-10"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Подтвердите пароль
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Изменяем..." : "Изменить пароль"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-700">Опасная зона</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-red-700 mb-2">
                      Удалить аккаунт
                    </h5>
                    <p className="text-sm text-red-600 mb-4">
                      Удаление аккаунта приведёт к полному удалению всех ваших
                      данных. Это действие нельзя отменить.
                    </p>
                    <Button
                      onClick={handleDeleteAccount}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Удалить аккаунт
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Мои договоры
                </h3>
                <p className="text-gray-600">
                  Управление договорами и заказами
                </p>
              </div>
              <Button
                onClick={() => setShowOrderForm(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Заказать услугу
              </Button>
            </div>

            {loadingContracts ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Загружаем договоры...</p>
                </CardContent>
              </Card>
            ) : contracts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h5 className="text-xl font-semibold text-gray-900 mb-2">
                    У вас пока нет договоров
                  </h5>
                  <p className="text-gray-600 mb-6">
                    Закажите первую услугу и получите договор автоматически
                  </p>
                  <Button
                    onClick={() => setShowOrderForm(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Заказать услугу
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {contracts.map((contract) => (
                  <Card
                    key={contract.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h5 className="text-lg font-medium text-gray-900">
                              {contract.projectType}
                            </h5>
                            <Badge
                              variant="outline"
                              className={`${
                                contract.status === "active"
                                  ? "border-green-500 text-green-700 bg-green-50"
                                  : contract.status === "completed"
                                    ? "border-blue-500 text-blue-700 bg-blue-50"
                                    : contract.status === "cancelled"
                                      ? "border-red-500 text-red-700 bg-red-50"
                                      : "border-yellow-500 text-yellow-700 bg-yellow-50"
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
                          <p className="text-gray-600 mb-3">
                            {contract.projectDescription.length > 150
                              ? `${contract.projectDescription.substring(0, 150)}...`
                              : contract.projectDescription}
                          </p>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span>№ {contract.id}</span>
                            <span>
                              {new Date(contract.createdAt).toLocaleDateString(
                                "ru-RU",
                              )}
                            </span>
                            <span className="font-semibold text-purple-600">
                              {contract.price.toLocaleString("ru-RU")} ₽
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-6">
                          <Button
                            onClick={() =>
                              window.open(
                                `/api/contracts/${contract.id}`,
                                "_blank",
                              )
                            }
                            size="sm"
                            variant="outline"
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
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Скачать
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Мои брони
                </h3>
                <p className="text-gray-600">
                  Управление бронированием консультаций и встреч
                </p>
              </div>
              <Button
                onClick={() => setShowBookingForm(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Новая бронь
              </Button>
            </div>

            {loadingBookings ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Загружаем брони...</p>
                </CardContent>
              </Card>
            ) : bookings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h5 className="text-xl font-semibold text-gray-900 mb-2">
                    У вас пока нет броней
                  </h5>
                  <p className="text-gray-600 mb-6">
                    Забронируйте консультацию, чтобы обсудить ваш проект
                  </p>
                  <Button
                    onClick={() => setShowBookingForm(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Создать бронь
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {bookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h5 className="text-lg font-medium text-gray-900">
                              {booking.serviceType === "basic"
                                ? "BASIC пакет"
                                : booking.serviceType === "pro"
                                  ? "PRO пакет"
                                  : booking.serviceType === "max"
                                    ? "MAX пакет"
                                    : booking.serviceType === "consultation"
                                      ? "Консультация"
                                      : "Индивидуальный проект"}
                            </h5>
                            <Badge
                              variant="outline"
                              className={`${
                                booking.status === "confirmed"
                                  ? "border-green-500 text-green-700 bg-green-50"
                                  : booking.status === "completed"
                                    ? "border-blue-500 text-blue-700 bg-blue-50"
                                    : booking.status === "cancelled"
                                      ? "border-red-500 text-red-700 bg-red-50"
                                      : "border-yellow-500 text-yellow-700 bg-yellow-50"
                              }`}
                            >
                              {booking.status === "confirmed" && (
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                              )}
                              {booking.status === "pending" && (
                                <Clock className="w-3 h-3 mr-1" />
                              )}
                              {booking.status === "completed" && (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              )}
                              {booking.status === "cancelled" && (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              {booking.status === "confirmed"
                                ? "Подтверждена"
                                : booking.status === "completed"
                                  ? "Завершена"
                                  : booking.status === "cancelled"
                                    ? "Отменена"
                                    : "Ожидает подтверждения"}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {booking.serviceDescription.length > 150
                              ? `${booking.serviceDescription.substring(0, 150)}...`
                              : booking.serviceDescription}
                          </p>
                          <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(
                                  booking.preferredDate,
                                ).toLocaleDateString("ru-RU")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{booking.preferredTime}</span>
                            </div>
                            <span>№ {booking.id}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            Создано:{" "}
                            {new Date(booking.createdAt).toLocaleDateString(
                              "ru-RU",
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Уведомления</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email уведомления</p>
                      <p className="text-sm text-gray-600">
                        Получать уведомления на email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          email: checked,
                        }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push уведомления</p>
                      <p className="text-sm text-gray-600">
                        Уведомления в браузере
                      </p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, push: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS уведомления</p>
                      <p className="text-sm text-gray-600">
                        Получать SMS на телефон
                      </p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, sms: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="w-5 h-5" />
                    <span>Настройки интерфейса</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Тема оформления</Label>
                    <Select
                      value={preferences.theme}
                      onValueChange={(value: "light" | "dark" | "auto") =>
                        setPreferences((prev) => ({ ...prev, theme: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Светлая</SelectItem>
                        <SelectItem value="dark">Темная</SelectItem>
                        <SelectItem value="auto">Автоматически</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Язык интерфейса</Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(value) =>
                        setPreferences((prev) => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ru">Русский</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Часовой пояс</Label>
                    <Select
                      value={preferences.timezone}
                      onValueChange={(value) =>
                        setPreferences((prev) => ({ ...prev, timezone: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Moscow">
                          Москва (UTC+3)
                        </SelectItem>
                        <SelectItem value="Europe/Kiev">
                          Киев (UTC+2)
                        </SelectItem>
                        <SelectItem value="Asia/Almaty">
                          Алматы (UTC+6)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Settings */}
            <div className="flex justify-end">
              <Button
                onClick={handleProfileUpdate}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Сохранить настройки
              </Button>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>История активности</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLog.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Активность не найдена</p>
                    </div>
                  ) : (
                    activityLog.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 flex-shrink-0">
                          {getActivityIcon(log.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {log.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>
                              {new Date(log.timestamp).toLocaleString("ru-RU")}
                            </span>
                            {log.ip && <span>IP: {log.ip}</span>}
                            {log.device && (
                              <span>Устройство: {log.device}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <FaceIDModal
        isOpen={showFaceIDModal}
        onClose={() => setShowFaceIDModal(false)}
        mode={faceIDMode}
        onSuccess={handleFaceIDSuccess}
        onError={handleFaceIDError}
      />

      <ServiceOrderForm
        isOpen={showOrderForm}
        onClose={() => {
          setShowOrderForm(false);
          if (activeTab === "contracts" || activeTab === "dashboard") {
            loadContracts();
          }
        }}
      />

      <BookingForm
        isOpen={showBookingForm}
        onClose={() => {
          setShowBookingForm(false);
          if (activeTab === "bookings" || activeTab === "dashboard") {
            loadBookings();
          }
        }}
        onSuccess={() => {
          console.log("✅ Бронь успешно создана из Profile");
          if (activeTab === "bookings" || activeTab === "dashboard") {
            loadBookings();
          }
        }}
      />
    </div>
  );
}

export default function ProtectedProfile() {
  return (
    <FaceIDProtected requireFaceID={true}>
      <Profile />
    </FaceIDProtected>
  );
}
