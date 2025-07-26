import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateContractRequest, CreateContractResponse } from "@shared/api";
import { useAuth } from "@/hooks/useAuth";
import {
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Globe,
  Smartphone,
  ShoppingCart,
  Users,
  Zap
} from "lucide-react";

interface ServiceOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const serviceTypes = [
  {
    value: "basic",
    label: "BASIC - Веб-сайт",
    icon: Globe,
    price: 2500000,
    description: "Красивый и функциональный сайт с современным дизайном",
    features: ["Уникальный дизайн", "Адаптивная верстка", "SEO оптимизация", "Техподдержка 3 мес"]
  },
  {
    value: "pro",
    label: "PRO - Веб-сайт",
    icon: Brain,
    price: 3500000,
    originalPrice: 4000000,
    description: "Насыщенный функционал с встроенным ИИ и многими возможностями",
    features: ["Все из Basic", "ИИ-чат бот", "Панель управления", "API интеграции", "Техподдержка 6 мес"],
    popular: true
  },
  {
    value: "max",
    label: "MAX - Веб-сайт",
    icon: Zap,
    price: 5500000,
    description: "Безграничные возможности с Джарвисом и инновационными функциями",
    features: ["Все из Pro", "Встроенный Джарвис", "3D элементы", "VR/AR интеграция", "Персональный менеджер"]
  }
];

export default function ServiceOrderForm({ isOpen, onClose }: ServiceOrderFormProps) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [contractId, setContractId] = useState("");
  const [contractUrl, setContractUrl] = useState("");

  const [formData, setFormData] = useState({
    projectType: "",
    projectDescription: "",
    clientName: currentUser?.name || "",
    clientEmail: currentUser?.email || "",
    estimatedPrice: 0
  });

  const handleServiceSelect = (serviceValue: string) => {
    const selectedService = serviceTypes.find(s => s.value === serviceValue);
    if (selectedService) {
      setFormData(prev => ({
        ...prev,
        projectType: selectedService.label,
        estimatedPrice: selectedService.price
      }));
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError("Необходимо войти в аккаунт для создания договора");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const request: CreateContractRequest = formData;

      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": currentUser.id
        },
        body: JSON.stringify(request)
      });

      const data: CreateContractResponse = await response.json();

      if (data.success && data.contractId && data.contractUrl) {
        setContractId(data.contractId);
        setContractUrl(data.contractUrl);
        setSuccess(true);
      } else {
        setError(data.error || "Ошибка при создании договора");
      }
    } catch (error) {
      console.error("Contract creation error:", error);
      setError("Произошла ошибка при создании договора");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadContract = () => {
    if (contractUrl) {
      window.open(contractUrl, '_blank');
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setError("");
    setContractId("");
    setContractUrl("");
    setFormData({
      projectType: "",
      projectDescription: "",
      clientName: currentUser?.name || "",
      clientEmail: currentUser?.email || "",
      estimatedPrice: 0
    });
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-xl border border-green-500/20">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Договор создан успешно!
            </h3>
            <p className="text-white/70 mb-6">
              Договор #{contractId} готов к просмотру и скачиванию
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleDownloadContract}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Открыть договор
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Закрыть
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-xl border border-blue-500/20 max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-400" />
            Заказать услугу и создать договор
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Selection */}
            <div className="space-y-3">
              <Label className="text-white/80">Выберите тип услуги</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {serviceTypes.map((service) => {
                  const Icon = service.icon;
                  const isSelected = formData.projectType === service.label;
                  return (
                    <div
                      key={service.value}
                      onClick={() => handleServiceSelect(service.value)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-500/50 bg-blue-500/10"
                          : "border-white/20 hover:border-white/40 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-5 h-5 text-blue-400" />
                        <span className="text-white font-medium">{service.label}</span>
                      </div>
                      <p className="text-white/60 text-sm mb-2">{service.description}</p>
                      <p className="text-blue-400 font-semibold">
                        от {service.price.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Client Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-white/80">
                  Ваше имя
                </Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleChange("clientName", e.target.value)}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  placeholder="Введите ваше полное имя"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail" className="text-white/80">
                  Email
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleChange("clientEmail", e.target.value)}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <Label htmlFor="projectDescription" className="text-white/80">
                Описание проекта
              </Label>
              <Textarea
                id="projectDescription"
                value={formData.projectDescription}
                onChange={(e) => handleChange("projectDescription", e.target.value)}
                required
                rows={4}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none"
                placeholder="Подробно опишите ваш проект: цели, функциональность, особые требования..."
              />
            </div>

            {/* Price */}
            {formData.estimatedPrice > 0 && (
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Предварительная стоимость:</span>
                  <span className="text-blue-400 font-bold text-lg">
                    {formData.estimatedPrice.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <p className="text-white/60 text-sm mt-1">
                  * Окончательная цена будет определена после детального анализа проекта
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || !formData.projectType || !formData.projectDescription}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Создаем договор...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Создать договор
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
