import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, Phone, User, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { OrderRequest, OrderResponse } from "@shared/api";

export default function OrderForm() {
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    description: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fullName && formData.phone && formData.description) {
      // Здесь можно добавить отправку данных на сервер
      console.log("Order submitted:", {
        items,
        formData,
        total: getTotalPrice()
      });
      setIsSubmitted(true);
      setTimeout(() => {
        clearCart();
        navigate("/");
      }, 3000);
    }
  };

  if (items.length === 0 && !isSubmitted) {
    return (
      <div className="min-h-screen theme-gradient theme-text flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Корзина пуста</h1>
          <p className="text-lg theme-text-muted mb-6">
            Добавьте товары в корзину для оформления заказа
          </p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link to="/">Вернуться на главную</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen theme-gradient theme-text flex items-center justify-center">
        <Card className="w-full max-w-md theme-card border border-green-500/30">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold theme-text mb-2">Заказ принят!</h2>
            <p className="theme-text-muted mb-4">
              Спасибо за ваш заказ. Мы свяжемся с вами в ближайшее время.
            </p>
            <p className="text-sm theme-text-muted">
              Перенаправление на главную страницу...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-gradient theme-text">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="theme-button-text hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться назад
          </Button>
          <h1 className="text-3xl font-bold">Оформление заказа</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Order Summary */}
          <Card className="theme-card border border-purple-500/30">
            <CardHeader>
              <CardTitle className="theme-text flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Ваш заказ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start p-4 theme-card-solid rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold theme-text">{item.name}</h3>
                      <p className="text-sm theme-text-muted mt-1">
                        {item.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold theme-text">
                        {item.price.toLocaleString()} сум
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold theme-text">Итого:</span>
                    <span className="text-xl font-bold text-purple-400">
                      {getTotalPrice().toLocaleString()} сум
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Form */}
          <Card className="theme-card border border-purple-500/30">
            <CardHeader>
              <CardTitle className="theme-text">Контактная информация</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="theme-label flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    ФИО
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Введите ваше полное имя"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="theme-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="theme-label flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Номер телефона
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+998 XX XXX XX XX"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="theme-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="theme-label flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Описание желаемого сайта
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Опишите детально, что вы хотите видеть на своем будущем сайте: дизайн, функционал, особые требования, цветовую гамму, структуру страниц и т.д."
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="theme-input resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 text-lg font-semibold"
                  disabled={!formData.fullName || !formData.phone || !formData.description}
                >
                  Отправить заказ
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
