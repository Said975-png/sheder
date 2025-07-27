import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  Package,
} from "lucide-react";
import { CreateBookingRequest, CreateBookingResponse } from "@shared/api";
import { useAuth } from "@/hooks/useAuth";

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BookingForm({
  isOpen,
  onClose,
  onSuccess,
}: BookingFormProps) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    serviceType: "",
    serviceDescription: "",
    clientName: currentUser?.name || "",
    clientEmail: currentUser?.email || "",
    clientPhone: "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Варианты услуг
  const serviceTypes = [
    { value: "basic", label: "BASIC - 2.500.000 сум" },
    { value: "pro", label: "PRO - 3.500.000 сум" },
    { value: "max", label: "MAX - 5.500.000 сум" },
    { value: "consultation", label: "Консультация" },
    { value: "custom", label: "Индивидуальный проект" },
  ];

  // Варианты времени
  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Валидация на клиенте
      if (
        !formData.serviceType ||
        !formData.clientName ||
        !formData.clientEmail ||
        !formData.clientPhone ||
        !formData.preferredDate ||
        !formData.preferredTime
      ) {
        setError("Пожалуйста, заполните все обязательные поля");
        setLoading(false);
        return;
      }

      const requestData: CreateBookingRequest = {
        serviceType: formData.serviceType,
        serviceDescription: formData.serviceDescription,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        notes: formData.notes,
      };

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Добавляем user-id если пользователь авторизован
      if (currentUser) {
        headers["user-id"] = currentUser.id;
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers,
        body: JSON.stringify(requestData),
      });

      const data: CreateBookingResponse = await response.json();

      if (data.success) {
        setSuccess(true);
        console.log("✅ Бронь успешно создана:", data.bookingId);

        // Сбрасываем форму после успешного создания
        setTimeout(() => {
          setFormData({
            serviceType: "",
            serviceDescription: "",
            clientName: currentUser?.name || "",
            clientEmail: currentUser?.email || "",
            clientPhone: "",
            preferredDate: "",
            preferredTime: "",
            notes: "",
          });
          setSuccess(false);
          onSuccess?.();
          onClose();
        }, 2000);
      } else {
        setError(data.error || "Ошибка при создании брони");
      }
    } catch (error) {
      console.error("❌ Ошибка создания брони:", error);
      setError("Ошибка сети. Попробуйте еще раз.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      serviceType: "",
      serviceDescription: "",
      clientName: currentUser?.name || "",
      clientEmail: currentUser?.email || "",
      clientPhone: "",
      preferredDate: "",
      preferredTime: "",
      notes: "",
    });
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Получаем минимальную дату (завтра)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-gray-900">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span>Бронь создана!</span>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ваша бронь успешно создана!
            </h3>
            <p className="text-gray-600 mb-4">
              Мы свяжемся с вами в ближайшее время для подтверждения деталей.
            </p>
            <p className="text-sm text-gray-500">
              Вы можете просмотреть свои брони в личном кабинете.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-gray-900">
            <Calendar className="w-6 h-6 text-purple-600" />
            <span>Забронировать консультацию</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Тип услуги */}
          <div className="space-y-2">
            <Label htmlFor="serviceType" className="text-gray-900 font-medium">
              Тип услуги <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) =>
                handleSelectChange("serviceType", value)
              }
            >
              <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                <Package className="w-4 h-4 mr-2 text-gray-500" />
                <SelectValue
                  placeholder="Выберите тип услуги"
                  className="text-gray-900"
                />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                {serviceTypes.map((service) => (
                  <SelectItem
                    key={service.value}
                    value={service.value}
                    className="text-gray-900 hover:bg-gray-100"
                  >
                    {service.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Описание проекта */}
          <div className="space-y-2">
            <Label
              htmlFor="serviceDescription"
              className="text-gray-900 font-medium"
            >
              Описание проекта <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="serviceDescription"
              name="serviceDescription"
              value={formData.serviceDescription}
              onChange={handleChange}
              placeholder="Опишите ваш проект, требования и пожелания..."
              rows={3}
              required
              className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-500"
            />
          </div>

          {/* Контактная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-gray-900 font-medium">
                Ваше имя <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  className="pl-10 bg-white text-gray-900 border-gray-300 placeholder:text-gray-500"
                  placeholder="Введите ваше имя"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="clientPhone"
                className="text-gray-900 font-medium"
              >
                Телефон <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="clientPhone"
                  name="clientPhone"
                  type="tel"
                  value={formData.clientPhone}
                  onChange={handleChange}
                  className="pl-10 bg-white text-gray-900 border-gray-300 placeholder:text-gray-500"
                  placeholder="+998 90 123 45 67"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientEmail" className="text-gray-900 font-medium">
              Email <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="clientEmail"
                name="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={handleChange}
                className="pl-10 bg-white text-gray-900 border-gray-300 placeholder:text-gray-500"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          {/* Дата и время */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="preferredDate"
                className="text-gray-900 font-medium"
              >
                Предпочитаемая дата <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="preferredDate"
                  name="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  className="pl-10 bg-white text-gray-900 border-gray-300"
                  min={getMinDate()}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="preferredTime"
                className="text-gray-900 font-medium"
              >
                Предпочитаемое время <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.preferredTime}
                onValueChange={(value) =>
                  handleSelectChange("preferredTime", value)
                }
              >
                <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <SelectValue
                    placeholder="Выберите время"
                    className="text-gray-900"
                  />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  {timeSlots.map((time) => (
                    <SelectItem
                      key={time}
                      value={time}
                      className="text-gray-900 hover:bg-gray-100"
                    >
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Дополнительные заметки */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-900 font-medium">
              Дополнительные заметки
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="pl-10 bg-white text-gray-900 border-gray-300 placeholder:text-gray-500"
                placeholder="Любые дополнительные пожелания или вопросы..."
                rows={3}
              />
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Создаем бронь...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Забронировать
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
