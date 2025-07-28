import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Users,
  TrendingUp,
  Activity,
  Filter,
  Search,
  Download,
  Edit,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  BookingData,
  GetBookingsResponse,
  UpdateBookingRequest,
} from "@shared/api";
import { Input } from "@/components/ui/input";

interface AdminStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

export default function Admin() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [stats, setStats] = useState<AdminStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
  });

  // Загрузка всех броней
  const loadAllBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/bookings/all", {
        headers: {
          "user-id": "admin", // Специальный ID для админа
        },
      });

      if (response.ok) {
        const data: GetBookingsResponse = await response.json();
        if (data.success && data.bookings) {
          setBookings(data.bookings);
          setFilteredBookings(data.bookings);
          updateStats(data.bookings);
        } else {
          setError(data.error || "Ошибка загрузки броней");
        }
      } else {
        setError("Ошибка сервера при загрузке броней");
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
      setError("Ошибка сети при загрузке броней");
    } finally {
      setLoading(false);
    }
  };

  // Обновление статистики
  const updateStats = (bookingsList: BookingData[]) => {
    const stats: AdminStats = {
      totalBookings: bookingsList.length,
      pendingBookings: bookingsList.filter((b) => b.status === "pending")
        .length,
      confirmedBookings: bookingsList.filter((b) => b.status === "confirmed")
        .length,
      completedBookings: bookingsList.filter((b) => b.status === "completed")
        .length,
      cancelledBookings: bookingsList.filter((b) => b.status === "cancelled")
        .length,
    };
    setStats(stats);
  };

  // Обновление статуса брони
  const updateBookingStatus = async (
    bookingId: string,
    status: BookingData["status"],
  ) => {
    try {
      const updateData: UpdateBookingRequest = {
        bookingId,
        status,
      };

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "user-id": "admin",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuccess("Статус брони обновлен");
          loadAllBookings(); // Перезагружаем данные
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setError(data.error || "Ошибка обновления статуса");
        }
      } else {
        setError("Ошибка сервера при обновлении статуса");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      setError("Ошибка сети при обновлении статуса");
    }
  };

  // Фильтрация броней
  const filterBookings = () => {
    let filtered = [...bookings];

    // Фильтр по поиску
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.clientEmail
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.serviceDescription
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Фильтр по статусу
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Фильтр по типу услуги
    if (serviceFilter !== "all") {
      filtered = filtered.filter(
        (booking) => booking.serviceType === serviceFilter,
      );
    }

    setFilteredBookings(filtered);
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    loadAllBookings();
  }, []);

  // Применение фильтров при изменении параметров
  useEffect(() => {
    filterBookings();
  }, [searchTerm, statusFilter, serviceFilter, bookings]);

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Получение цвета статуса
  const getStatusColor = (status: BookingData["status"]) => {
    switch (status) {
      case "confirmed":
        return "border-green-500 text-green-700 bg-green-50";
      case "completed":
        return "border-blue-500 text-blue-700 bg-blue-50";
      case "cancelled":
        return "border-red-500 text-red-700 bg-red-50";
      default:
        return "border-yellow-500 text-yellow-700 bg-yellow-50";
    }
  };

  // Получение назван��я статуса
  const getStatusName = (status: BookingData["status"]) => {
    switch (status) {
      case "confirmed":
        return "Подтверждена";
      case "completed":
        return "Завершена";
      case "cancelled":
        return "Отменена";
      default:
        return "Ожидает";
    }
  };

  // Получение названия сервиса
  const getServiceName = (serviceType: string) => {
    switch (serviceType) {
      case "basic":
        return "BASIC пакет";
      case "pro":
        return "PRO пакет";
      case "max":
        return "MAX пакет";
      case "consultation":
        return "Консультация";
      default:
        return "Индивидуальный проект";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>Назад на главную</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">Админ панель</h1>
                  <p className="text-xs text-gray-500">Управление бронями</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge className="bg-red-100 text-red-800 border-red-200">
                <Shield className="w-3 h-3 mr-1" />
                Администратор
              </Badge>
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
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-none lg:inline-flex">
            <TabsTrigger
              value="overview"
              className="flex items-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>Обзор</span>
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Все брони</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Всего броней
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalBookings}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Ожидают
                      </p>
                      <p className="text-3xl font-bold text-yellow-600">
                        {stats.pendingBookings}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Подтверждены
                      </p>
                      <p className="text-3xl font-bold text-green-600">
                        {stats.confirmedBookings}
                      </p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Завершены
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {stats.completedBookings}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Отменены
                      </p>
                      <p className="text-3xl font-bold text-red-600">
                        {stats.cancelledBookings}
                      </p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Последние брони</span>
                  </div>
                  <Button
                    onClick={() => setActiveTab("bookings")}
                    variant="outline"
                    size="sm"
                  >
                    Показать все
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Загружаем брони...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Брони не найдены</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className="font-medium text-gray-900">
                              {getServiceName(booking.serviceType)}
                            </h5>
                            <Badge
                              variant="outline"
                              className={getStatusColor(booking.status)}
                            >
                              {getStatusName(booking.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {booking.clientName} • {booking.clientEmail}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(booking.preferredDate)} в{" "}
                            {booking.preferredTime}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Поиск по имени, email или ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="pending">Ожидают</SelectItem>
                      <SelectItem value="confirmed">Подтверждены</SelectItem>
                      <SelectItem value="completed">Завершены</SelectItem>
                      <SelectItem value="cancelled">Отменены</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={serviceFilter}
                    onValueChange={setServiceFilter}
                  >
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Тип услуги" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все услуги</SelectItem>
                      <SelectItem value="basic">BASIC</SelectItem>
                      <SelectItem value="pro">PRO</SelectItem>
                      <SelectItem value="max">MAX</SelectItem>
                      <SelectItem value="consultation">Консультация</SelectItem>
                      <SelectItem value="custom">Индивидуальный</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={loadAllBookings}
                    variant="outline"
                    size="default"
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                    />
                    Обновить
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bookings List */}
            {loading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">З��гружаем брони...</p>
                </CardContent>
              </Card>
            ) : filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h5 className="text-xl font-semibold text-gray-900 mb-2">
                    Брони не найдены
                  </h5>
                  <p className="text-gray-600">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    serviceFilter !== "all"
                      ? "Попробуйте изменить фильтры поиска"
                      : "Пока не было создано ни одной брони"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredBookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="hover:shadow-md transition-shadow bg-white border-gray-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h5 className="text-lg font-medium text-gray-900">
                              {getServiceName(booking.serviceType)}
                            </h5>
                            <Badge
                              variant="outline"
                              className={getStatusColor(booking.status)}
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
                              {getStatusName(booking.status)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h6 className="font-medium text-gray-900 mb-2">
                                Контактная информация
                              </h6>
                              <div className="space-y-1 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-500" />
                                  <span>{booking.clientName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-gray-500" />
                                  <span>{booking.clientEmail}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-500" />
                                  <span>{booking.clientPhone}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h6 className="font-medium text-gray-900 mb-2">
                                Детали встречи
                              </h6>
                              <div className="space-y-1 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span>
                                    {formatDate(booking.preferredDate)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span>{booking.preferredTime}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span>№ {booking.id}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h6 className="font-medium text-gray-900 mb-2">
                              Описание проекта
                            </h6>
                            <p className="text-sm text-gray-700">
                              {booking.serviceDescription}
                            </p>
                            {booking.notes && (
                              <>
                                <h6 className="font-medium text-gray-900 mb-1 mt-3">
                                  Дополнительные заметки
                                </h6>
                                <p className="text-sm text-gray-700">
                                  {booking.notes}
                                </p>
                              </>
                            )}
                          </div>

                          <div className="text-xs text-gray-500">
                            Создано:{" "}
                            {new Date(booking.createdAt).toLocaleString(
                              "ru-RU",
                            )}{" "}
                            • Обновлено:{" "}
                            {new Date(booking.updatedAt).toLocaleString(
                              "ru-RU",
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-6">
                          <Select
                            value={booking.status}
                            onValueChange={(value: BookingData["status"]) =>
                              updateBookingStatus(booking.id, value)
                            }
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Ожидает</SelectItem>
                              <SelectItem value="confirmed">
                                Подтвердить
                              </SelectItem>
                              <SelectItem value="completed">
                                Завершить
                              </SelectItem>
                              <SelectItem value="cancelled">
                                Отменить
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
