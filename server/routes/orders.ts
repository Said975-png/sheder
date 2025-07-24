import { RequestHandler } from "express";
import nodemailer from "nodemailer";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

interface OrderData {
  items: OrderItem[];
  formData: {
    fullName: string;
    phone: string;
    description: string;
    referenceUrl?: string;
  };
  total: number;
}

// Создаем транспортер для отправки email
const createTransporter = () => {
  // Используем Gmail SMTP для отправки
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "temp-email@gmail.com",
      pass: process.env.EMAIL_PASS || "temp-app-password",
    },
  });
};

// Создаем HTML шаблон для email
const createOrderEmailTemplate = (orderData: OrderData): string => {
  const { items, formData, total } = orderData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Новый заказ - Jarvis AI</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .order-item { background: white; margin: 10px 0; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; }
        .total { font-size: 18px; font-weight: bold; color: #667eea; text-align: right; margin-top: 20px; }
        .customer-info { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .label { font-weight: bold; color: #555; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Новый заказ - Jarvis AI</h1>
          <p>Получен новый заказ на разработку сайта</p>
        </div>
        
        <div class="content">
          <h2>👤 Информация о клиенте</h2>
          <div class="customer-info">
            <p><span class="label">ФИО:</span> ${formData.fullName}</p>
            <p><span class="label">Телефон:</span> ${formData.phone}</p>
          </div>
          
          <h2>📝 Описание желаемого сайта</h2>
          <div class="customer-info">
            <p>${formData.description}</p>
          </div>

          ${
            formData.referenceUrl
              ? `
          <h2>🌐 Ссылка на образец сайта</h2>
          <div class="customer-info">
            <p><a href="${formData.referenceUrl}" target="_blank" style="color: #667eea; text-decoration: none;">${formData.referenceUrl}</a></p>
          </div>
          `
              : ""
          }
          
          <h2>🛒 Заказанные услуги</h2>
          ${items
            .map(
              (item) => `
            <div class="order-item">
              <h3>${item.name}</h3>
              <p>${item.description}</p>
              <p><strong>Цена: ${item.price.toLocaleString()} сум</strong></p>
            </div>
          `,
            )
            .join("")}
          
          <div class="total">
            Общая стоимость: ${total.toLocaleString()} сум
          </div>
          
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            Дата заказа: ${new Date().toLocaleString("ru-RU")}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const handleSendOrder: RequestHandler = async (req, res) => {
  try {
    const orderData: OrderData = req.body;

    // Валидация данных
    if (!orderData.items || !orderData.formData || !orderData.total) {
      return res.status(400).json({
        success: false,
        message: "Неполные данные заказа",
      });
    }

    const { fullName, phone, description, referenceUrl } = orderData.formData;
    if (!fullName || !phone || !description) {
      return res.status(400).json({
        success: false,
        message: "Необходимо заполнить все обязательные поля",
      });
    }

    // Логируем заказ в консоль для отладки
    console.log("=== НОВЫЙ ЗАКАЗ ===");
    console.log("Клиент:", { fullName, phone });
    console.log("Общая стоимость:", orderData.total.toLocaleString(), "сум");
    console.log(
      "Услуги:",
      orderData.items.map((item) => item.name),
    );
    console.log("Описание:", description.substring(0, 100) + "...");
    console.log("==================");

    // Проверяем, настроен ли email
    const emailConfigured =
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      process.env.EMAIL_USER !== "temp-email@gmail.com" &&
      process.env.EMAIL_PASS !== "temp-app-password";

    if (emailConfigured) {
      try {
        // Создаем транспортер
        const transporter = createTransporter();

        // Настройки email
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: "saidaurum@gmail.com",
          subject: `🚀 Новый заказ от ${fullName} - ${orderData.total.toLocaleString()} сум`,
          html: createOrderEmailTemplate(orderData),
          text: `
Новый заказ от ${fullName}
Телефон: ${phone}
Описание: ${description}
${referenceUrl ? `Ссылка на образец: ${referenceUrl}` : ""}
Общая стоимость: ${orderData.total.toLocaleString()} сум

Заказанные услуги:
${orderData.items.map((item) => `- ${item.name}: ${item.price.toLocaleString()} сум`).join("\n")}
          `,
        };

        // Отправляем email
        await transporter.sendMail(mailOptions);
        console.log("✅ Email успешно отправлен на saidaurum@gmail.com");
      } catch (emailError) {
        console.error("❌ Ошибка отправки email:", emailError);
        // Продолжаем выполнение даже если email не отправился
      }
    } else {
      console.log("📧 Email не настроен, заказ сохранен только в логах");
    }

    // Всегда возвращаем успех, даже если email не отправился
    res.json({
      success: true,
      message: "Заказ успешно получен и обрабатывается",
    });
  } catch (error) {
    console.error("❌ Общая ошибка при обработке заказа:", error);

    res.status(500).json({
      success: false,
      message: "Ошибка сервера при обработке заказа",
    });
  }
};
