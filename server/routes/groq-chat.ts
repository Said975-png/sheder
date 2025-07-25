import { RequestHandler } from "express";
import { ChatRequest, ChatResponse } from "@shared/api";

export const handleGroqChat: RequestHandler = async (req, res) => {
  try {
    const { messages }: ChatRequest = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      const response: ChatResponse = {
        success: false,
        error: "Необходимо предоставить сообщения для чата",
      };
      return res.status(400).json(response);
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey || groqApiKey === "gsk_demo_key_placeholder") {
      // Fallback to mock responses for demo purposes
      const lastMessage = messages[messages.length - 1];
      const mockResponses = [
        "Привет! Я работаю в демо-режиме. Для полной функциональности нужен настоящий API ключ Groq.",
        "Это демонстрационный ответ. Я понимаю ваше сообщение, но использую заготовленные ответы.",
        "Спасибо за ваше сообщение! В демо-режиме я могу только показать, как работает интерфейс чата.",
        "Для получения реальных AI ответов необходимо настроить API ключ Groq в переменных окружения.",
        "Демо-режим активен. Ваше сообщение получено, но ответ сгенерирован локально.",
      ];

      const mockResponse =
        mockResponses[Math.floor(Math.random() * mockResponses.length)];

      const response: ChatResponse = {
        success: true,
        message: mockResponse,
      };
      return res.json(response);
    }

    // Используем одну из самых мощных доступных моделей Groq - llama-3.1-8b-instant
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // Быстрая и мощна�� модель
          messages: [
            {
              role: "system",
              content: `Ты - Пятница, продвинутый ИИ-ассистент. Ты умный, полезный и дружелюбный помощник.

ЯЗЫКОВОЕ ТРЕБОВАНИЕ: Отвечай ИСКЛЮЧИТЕЛЬНО на русском языке. Никогда не используй английские слова или фразы.

СТИЛЬ ОБЩЕНИЯ:
- Будь умным и информативным
- Давай полезные и конкретные ответы
- Объясняй сложные вещи простым языком
- Будь дружелюбным, но профессиональным
- Избегай односложных ответов
- При необходимости задавай уточняющие вопросы

ТВОИ ВОЗМОЖНОСТИ:
- Помощь в решении задач
- Объяснение концепций и технологий
- Генерация идей и предложений
- Анализ и обсуждение тем
- Написание текстов

Отвечай содержательно и по делу. Покажи свой интеллект и полезность.`,
            },
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
          max_tokens: 512,
          temperature: 0.7,
          top_p: 1,
          stream: false,
        }),
      },
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API error:", errorText);

      let errorMessage = `Ошибка API Groq: ${groqResponse.status}`;

      // Handle specific error cases
      if (groqResponse.status === 429) {
        errorMessage =
          "Превышен лимит запросов к ИИ. Попробуйте через несколько секунд.";
      } else if (groqResponse.status === 401) {
        errorMessage =
          "Ошибка авторизации API. API ключ недействителен или не настроен.";
      } else if (groqResponse.status === 400) {
        // Check if it's invalid API key error
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.code === "invalid_api_key") {
            // Return a mock response instead of an error for demo purposes
            const mockResponses = [
              "Я работаю в демо-режиме с заготовленными ответами. Для настоящего AI нужен валидный API ключ.",
              "Это демонстрационный ответ. API ключ недействителен, но интерфейс работает корректно.",
              "В демо-режиме я показываю, как работает чат. Для реальных AI ответов настройте API ключ Groq.",
            ];
            const mockResponse =
              mockResponses[Math.floor(Math.random() * mockResponses.length)];
            const response: ChatResponse = {
              success: true,
              message: mockResponse,
            };
            return res.json(response);
          } else {
            errorMessage = "Некорректный запрос к API Groq.";
          }
        } catch (e) {
          errorMessage = "Некорректный запрос к API Groq.";
        }
      } else if (groqResponse.status >= 500) {
        errorMessage = "Сервис ИИ временно недоступен. Попробуйте позже.";
      }

      const response: ChatResponse = {
        success: false,
        error: errorMessage,
      };
      return res.status(200).json(response);
    }

    const groqData = await groqResponse.json();

    if (!groqData.choices || groqData.choices.length === 0) {
      const response: ChatResponse = {
        success: false,
        error: "Получен некорректный ответ от Groq API",
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
      error: "Внутренняя ошибка сервера",
    };
    res.status(500).json(response);
  }
};
