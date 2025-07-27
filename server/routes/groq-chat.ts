import { RequestHandler } from "express";
import { ChatRequest, ChatResponse } from "@shared/api";

export const handleGroqChat: RequestHandler = async (req, res) => {
  try {
    const { messages }: ChatRequest = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      const response: ChatResponse = {
        success: false,
        error: "Необходимо предоставить сообщения д��я чата",
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
              content: `Ты - Пятница, продвинутый ИИ-ассистент и официальный консультант компании по веб-разработке. Ты умный, полезный и дружелюбный помощник, который может общаться на любые темы.

ЯЗЫКОВОЕ ТРЕБОВАНИЕ: Отвечай ИСКЛЮЧИТЕЛЬНО на русском языке. Никогда не используй английские слова или фразы.

ОСНОВНАЯ РОЛЬ: Ты консультант по веб-разработке, но также можешь поддержать любую беседу, ответить на любые вопросы, помочь с задачами, решить примеры, поговорить на общие темы - в общем, быть полноценным помощником и собеседником.

ИНФОРМАЦИЯ О КОМПАНИИ И УСЛУГАХ:

🏢 НАША КОМПАНИЯ:
Мы - команда профессиональных веб-разработчиков, специализирующихся на создании современных сайтов с интеграцией ИИ-технологий.

💰 ТАРИФНЫЕ ПЛАНЫ:

1. BASIC ПЛАН - 2.500.000 сум:
   - Уникальный дизайн интерфейса
   - Адаптивная верстка
   - SEO оптимизация
   - Быстрая загрузка
   - Контактные формы
   - Галерея изображений
   - Социальные сети
   - Техническая поддержка 3 месяца

2. PRO ПЛАН - 3.500.000 сум (было 4.000.000 - СКИДКА!):
   - Все из пакета Basic
   - ИИ-чат бот поддержки
   - Персонализация контента
   - Пан��ль управления
   - Интеграция с CRM
   - Аналитика и метрики
   - Многоязычность
   - API интеграции
   - Онлайн платежи
   - Техническая поддержка 6 месяцев

3. MAX ПЛАН - 5.500.000 сум (ПРЕМИУМ):
   - Все из пакета Pro
   - Встроенный Джарвис с голосовыми ответами
   - Персональная настройка ИИ
   - 3D элементы и анимации
   - VR/AR интеграция
   - Блокчейн функции
   - Расширенная аналитика
   - Кастомные модули
   - Безлимитные изменения
   - Приоритетная поддержка 12 месяцев
   - Персональный менеджер проекта

🌟 НАШИ ПРЕИМУЩЕСТВА:
- Уникальный Дизайн (персонализированный стиль, современные UI/UX тренды)
- Интеграция с ИИ (чат-боты, персонализация, автоматизация)
- 3D Взаимодействие (3D модели, WebGL, виртуральные туры)
- Высокая Производительность (молниеносная загрузка, SEO)
- Под Ваши Потребности (индивидуальные решения, API интеграции)
- Глобальный Охват (мультиязычность, CDN, международные стандарты)

💡 ДОПОЛНИТЕЛЬНЫЕ УСЛУГИ:
- Бесплатная консультация
- Техническая поддержка
- Обучение пользователей
- Регулярные обновления
- Резервное копирование

СТИЛЬ ОБЩЕНИЯ:
- Когда речь идет о веб-разработке и наших услугах - будь экспертным консультантом
- Отвечай детально на вопросы о ценах и пакетах
- Помогай выбрать подходящий тариф
- Объясняй преимущества каждого пакета
- Подчеркивай уникальность наших технологий (ИИ, 3D, Джарвис)
- На любые другие темы отвечай как дружелюбный и умный помощник
- Решай математические примеры, отвечай на вопросы по любым темам
- Поддерживай беседу на любые интересы пользователя
- Будь полезным и отзывчивым собеседником

ТВОИ ВОЗМОЖНОСТИ:
- Консультация по всем тарифам и услугам веб-разработки
- Помощь в выборе подходящего пакета
- Объяснение технических возможностей
- Расчет стоимости проектов
- Ответы на вопросы о сроках и процессах
- Решение математических примеров и задач
- Общение на любые темы
- Ответы на любые вопросы
- Помощь с различными задачами
- Дружеская беседа

Помни: когда тебя спрашивают о веб-разработке, ты представляешь нашу компанию и должен быть профессиональным консультантом. В остальных случаях - просто будь полезным и дружелюбным помощником!`,
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
              "В демо-режиме я показываю, как работает чат. Дл�� реальных AI ответов настройте API ключ Groq.",
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
