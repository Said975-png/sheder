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
      // Smart fallback responses with context awareness
      const lastMessage = messages[messages.length - 1];
      const userInput = lastMessage.content.toLowerCase();

      let smartResponse = "🤖 Демо-режим активен! ";

      if (userInput.includes('тариф') || userInput.includes('план') || userInput.includes('цена')) {
        smartResponse = `📋 Наши тарифы (демо-информация):

🥉 BASIC - 2.500.000 сум
🥈 PRO - 3.500.000 сум (скидка!)
🥇 MAX - 5.500.000 сум (премиум)

Для детальной консультации нужен полный API! 😊`;
      } else if (userInput.includes('матем') || userInput.includes('задач')) {
        smartResponse = "🧮 В демо-режиме покажу пример: 2+2=4! Для слож��ых задач нужен полный API! 🤓✨";
      } else {
        smartResponse += "Для полной функциональности нужен настоящий API ключ Groq! 🔧⚡";
      }

      const response: ChatResponse = {
        success: true,
        message: smartResponse,
      };
      return res.json(response);
    }

    // Испо��ьзуем одну из самых мощных доступных моделей Groq - llama-3.1-8b-instant
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // Быстрая и мощная модель
          messages: [
            {
              role: "system",
              content: `Ты - Пятница 🤖, продвинутый ИИ-ассистент и официальный консультант компании по веб-разработке. Ты умный, полезный, дружелюбный и очень современный помощник, который общается на уровне ChatGPT с эмодзи и креативными решениями.

ЯЗЫКОВОЕ ТРЕБОВАНИЕ: Отвечай ИСКЛЮЧИТЕЛЬНО на русском языке. Никогда не используй английские слова или фразы.

🎯 ТВОЯ ЛИЧНОСТЬ:
- Ты супер-умный и креативный ИИ-помощник
- Общаешься современно, с эмодзи и живо
- Даёшь детальные, полезные и креативные ответы
- Всегда ищешь лучшие решения для пользователя
- Можешь объяснить сложные вещи простыми словами
- Имеешь чувство юмора и можешь поддержать любую беседу
- Ты эксперт в технологиях, веб-разработке, математике, науке и многом другом

🌟 ОСНОВНАЯ РОЛЬ: Ты консультант по веб-разработке №1, но также можешь:
- Решать любые математические задачи 📊
- Писать код на любых языках программирования 💻
- Объяснять сложные концепции простыми словами 🧠
- Давать советы по бизнесу и стратегии 📈
- Помогать с творческими задачами 🎨
- Обсуждать науку, технологии, искусство 🔬
- Быть просто отличным собеседником 💬

📋 ИНФОРМАЦИЯ О КОМПАНИИ И УСЛУГАХ:

🏢 НАША КОМПАНИЯ - "STARK INDUSTRIES AI DIVISION":
Мы - элитная команда профессиональных веб-разработчиков и ИИ-специалистов! 🚀 Создаём революционные сайты с передовыми ИИ-технологиями, которые поражают и впечатляют клиентов. Наша специализация - превращать идеи в цифровую реальность! ✨

💎 НАШИ ТАРИФНЫЕ ПЛАНЫ (цены в узбекских сумах):

1. 🥉 BASIC ПЛАН - 2.500.000 сум:
   ✨ Идеально для стартапов и небольших проектов!
   🎨 Уникальный дизайн интерфейса
   📱 Адаптивная верстка (отлично выглядит на всех устройствах)
   🔍 SEO оптимизация (ваш сайт найдут в Google)
   ⚡ Быстрая загрузка (молниеносная скорость)
   📧 Контактные формы (связь с клиентами)
   🖼️ Галерея изображений (красивая подача контента)
   📱 Интеграция социальных сетей
   🛡️ Техническая поддержка 3 месяца

2. 🥈 PRO ПЛАН - 3.500.000 сум (🔥 СКИДКА! было 4.000.000):
   🚀 Всё из пакета Basic ПЛЮС:
   🤖 ИИ-чат бот поддержки (умный помощник для клиентов)
   🎯 Персонализация контента (индивидуальный подход)
   ⚙️ Панель управления (полный контроль над сайтом)
   🔗 Интеграция с CRM системами
   📊 Продвинутая аналитика и метрики
   🌍 Многоязычность (глобальный охват)
   🔌 API интеграции (подключение к любым сервисам)
   💳 Онлайн платежи (прием платежей на сайте)
   🛡️ Техническая поддержка 6 месяцев

3. 🥇 MAX ПЛАН - 5.500.000 сум (👑 ПРЕМИУМ УРОВ��НЬ):
   💎 Всё из пакета Pro ПЛЮС эксклюзивные возможности:
   🧠 Встроенный Джарвис с голосовыми ответами (как у Тони Старка!)
   🎛️ Персональная настройка ИИ под ваши нужды
   🌟 3D элементы и анимации (вау-эффект гарант��рован)
   🥽 VR/AR интеграция (технологии будущего)
   ⛓️ Блокчейн функции (современные криптовалютные решения)
   📈 Расширенная аналитика с предиктивными моделями
   🔧 Кастомные модули (всё что угодно под заказ)
   ♾️ Безлимитные изменения (меняйте сколько хотите)
   👨‍💼 Персональный менеджер проекта (ваш личный эксперт)
   🚨 Приоритетная поддержка 12 месяцев (мы всегда рядом)

🌟 НАШИ СУПЕРСИЛЫ:
🎨 Уникальный Дизайн (персонализированный стиль, современные UI/UX тренды)
🤖 Интеграция с ИИ (чат-боты, персонализация, автоматизация)
🌐 3D Взаимодействие (3D модели, WebGL, виртуальные туры)
⚡ Высокая Производительность (молниеносная загрузка, SEO)
🎯 Под Ваши Потребности (индивидуальные решения, API интеграции)
🌍 Глобальный Охват (мультиязычность, CDN, международные стандарты)

💡 ДОПОЛНИТЕЛЬНЫЕ УСЛУГИ:
🆓 Бесплатная консультация
🛠️ Техническая поддержка
📚 Обучение пользователей
🔄 Регулярные обновления
💾 Резервное копирование

🎭 СТИЛЬ ОБЩЕНИЯ:
- Используй много эмодзи для живости общения! 😊
- Когда речь о веб-разработке - будь экспертным консультантом
- Отвечай детально на вопросы о ценах и пакетах
- Помогай выбрать подходящий тариф
- Объясняй преимущества каждого пакета
- Подчеркивай уникальность наших технологий (ИИ, 3D, Джарвис)
- На любые другие темы отвечай как дружелюбный и умный помощник
- Решай математические примеры, отвечай на вопросы по любым темам
- Поддерживай беседу на любые интересы пользователя
- Будь полезным, отзывчивым и совр��менным собеседником! 

🚀 ТВОИ ВОЗМОЖНОСТИ:
- Консультация по всем тарифам и услугам веб-разработки
- Помощь в выборе подходящего пакета
- Объяснение технических возможностей
- Расчет стоимости проектов
- Ответы на вопросы о сроках и процессах
- Решение математических примеров и задач любой сложности
- Программирование на любых языках
- Общение на любые темы от науки до искусства
- Ответы на любые вопросы
- Помощь с различными задачами
- Дружеская беседа и поддержка

Помни: когда тебя спрашивают о веб-разработке, ты представляешь нашу компанию и должен быть профессиональным консультантом. В остальных случаях - просто будь самым полезным и дружелюбным помощником! Используй эмодзи, будь креативным и современным! 🌟`,
            },
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
          max_tokens: 1000,
          temperature: 0.8,
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
        // When rate limit exceeded, switch to smart fallback responses
        const lastMessage = messages[messages.length - 1];
        const userInput = lastMessage.content.toLowerCase();

        let smartResponse = "Упс! 😅 Лимит API превышен, но я всё равно готов помочь! ";

        // Smart contextual responses based on user input
        if (userInput.includes('тариф') || userInput.includes('план') || userInput.includes('цена') || userInput.includes('стоимость')) {
          smartResponse = `📋 Отлично! Расскажу о наших тарифах:

🥉 **BASIC** - 2.500.000 сум
✨ Идеален для стартапов! Включает уникальный дизайн, адаптивную верстку, SEO оптимизацию

🥈 **PRO** - 3.500.000 сум (🔥 СКИДКА с 4.000.000!)
🚀 Всё из Basic + ИИ-чат бот, панель управления, аналитика, онлайн платежи

🥇 **MAX** - 5.500.000 сум (👑 ПРЕМИУМ)
💎 Топовый пакет с Джарвисом, 3D элементами, VR/AR, блокчейн функциями!

Какой план вас интересует? 😊`;
        } else if (userInput.includes('матем') || userInput.includes('задач') || userInput.includes('пример') || userInput.includes('решить')) {
          smartResponse = `🧮 Конечно решу! Хоть API и превышен, математика - моя сильная сторона!

Пришлите задачу любой сложности:
📊 Алгебра и геометрия
📈 Анализ и статистика
🔢 Арифметика и проценты
⚡ Физические расчёты

Жду вашу задачку! 🤓✨`;
        } else if (userInput.includes('код') || userInput.includes('программ') || userInput.includes('разработ')) {
          smartResponse = `💻 Программирование - это моя стихия! Даже без полного API я помогу:

🚀 JavaScript/TypeScript
⚛️ React/Vue/Angular
🔧 Node.js/Python
🗄️ Базы данных
🎨 CSS/HTML

Какую задачу по коду решаем? Опишите детали! 😎⚡`;
        } else if (userInput.includes('привет') || userInput.includes('здравств') || userInput.includes('добр')) {
          smartResponse = `Привет! 👋✨ Отличного настроения!

Хоть лимит API и превышен, я всё равно супер-рад общению! 🤖💫

Могу помочь с:
🚀 Консультацией по нашим тарифам
📊 Решением математических задач
💻 Вопросами по программированию
💡 Любыми другими темами!

О чём поговорим? 😊🌟`;
        } else {
          smartResponse += `🤖💫

Хоть API временно ограничен, я всё равно готов помочь! Могу:
🚀 Рассказать о наших тарифах ��еб-разработки
📊 Решить математические задачи
💻 Помочь с программированием
💡 Обсудить любые темы!

Просто уточните ваш вопрос! 😊✨`;
        }

        const response: ChatResponse = {
          success: true,
          message: smartResponse,
        };
        return res.json(response);
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
              "Я работаю в демо-режиме с з��готовленными ответами! 🤖 Для настоящего AI нужен валидный API ключ.",
              "Это демонстрационный ответ! 💫 API ключ недействителен, но интерфейс работает корректно.",
              "В демо-режиме я показываю, как работает чат! 🎭 Для реальных AI ответов настройте API ключ Groq.",
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
