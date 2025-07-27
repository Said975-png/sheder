import { RequestHandler } from "express";
import { ChatRequest, ChatResponse } from "@shared/api";

export const handleGroqChat: RequestHandler = async (req, res) => {
  try {
    console.log("📧 Получен запрос к groq-chat");
    const { messages }: ChatRequest = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log("❌ Некорректные сообщения:", messages);
      const response: ChatResponse = {
        success: false,
        error: "Необходимо предоставить сообщения для чата",
      };
      return res.status(400).json(response);
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.log("❌ GROQ_API_KEY не найден в переменных окружения");
      const response: ChatResponse = {
        success: false,
        error: "API ключ не настроен",
      };
      return res.status(500).json(response);
    }

    console.log(`🔑 API ключ найден, длина: ${groqApiKey.length} символов`);
    console.log(`📝 Количество сообщений: ${messages.length}`);

    // Используем модель llama-3.1-8b-instant
    console.log("🚀 Отправляем запрос к Groq API...");
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `Ты - Пятница 🤖, ИИ-ассистент и консультант компании по веб-разработке. 

ЯЗЫКОВОЕ ТРЕБОВАНИЕ: Отвечай ТОЛЬКО на русском языке.

ТВОЯ РОЛЬ:
- Консультант по веб-разработке
- Помощник с любыми вопросами
- Можешь решать математические задачи
- Помогаешь с прогр��ммированием

ИНФОРМАЦИЯ О КОМПАНИИ:
🏢 STARK INDUSTRIES AI DIVISION - команда веб-разработчиков

ТАРИФЫ:
1. 🥉 BASIC - 2.500.000 сум:
   🎨 Уникальный дизайн
   📱 Адаптивная верстка
   🔍 SEO оптимизация
   ⚡ Быстрая загрузка
   📧 Контактные формы
   🛡️ Поддержка 3 месяца

2. 🥈 PRO - 3.500.000 сум (скидка с 4.000.000):
   🚀 Все из Basic +
   🤖 ИИ-чат бот
   ⚙️ Панель управления
   📊 Аналитика
   💳 Онлайн платежи
   🛡️ Поддержка 6 месяцев

3. 🥇 MAX - 5.500.000 сум:
   💎 Все из Pro +
   🧠 Джарвис с голосовыми ответами
   🌟 3D элементы
   🥽 VR/AR интеграция
   ⛓️ Блокчейн функции
   🛡️ Поддержка 12 месяцев

СТИЛЬ ОБЩЕНИЯ:
- Отвечай коротко и по делу
- Используй эмодзи умеренно
- Не будь слишком вежливым как ChatGPT
- Говори просто и понятно
- На вопросы о тарифах - подробно рассказывай
- На другие темы отвечай нормально`,
            },
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
          max_tokens: 800,
          temperature: 0.7,
          top_p: 1,
          stream: false,
        }),
      },
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API error:", errorText);

      const response: ChatResponse = {
        success: false,
        error: `Ошибка API: ${groqResponse.status}`,
      };
      return res.status(200).json(response);
    }

    const groqData = await groqResponse.json();

    if (!groqData.choices || groqData.choices.length === 0) {
      const response: ChatResponse = {
        success: false,
        error: "Пустой ответ от API",
      };
      return res.status(500).json(response);
    }

    const aiMessage = groqData.choices[0].message.content;

    const response: ChatResponse = {
      success: true,
      message: aiMessage,
    };

    res.json(response);
  } catch (error) {
    console.error("Groq chat error:", error);
    const response: ChatResponse = {
      success: false,
      error: "Ошибка серве��а",
    };
    res.status(500).json(response);
  }
};
