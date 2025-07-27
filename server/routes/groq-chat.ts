import { RequestHandler } from "express";
import { ChatRequest, ChatResponse } from "@shared/api";

// Smart contextual response generator
function generateSmartResponse(userInput: string, context: string): string {
  const input = userInput.toLowerCase();
  
  if (input.includes('тариф') || input.includes('план') || input.includes('цена') || input.includes('стоимость')) {
    return `📋 ${context} Расскажу о наших тарифах:

🥉 **BASIC ПЛАН** - 2.500.000 сум
✨ Идеально для стартапов! Включает:
🎨 Уникальный дизайн
📱 Адаптивная верстка  
🔍 SEO оптимизация
⚡ Быстрая загрузка

🥈 **PRO ПЛАН** - 3.500.000 сум (🔥 СКИДКА с 4.000.000!)
🚀 Всё из Basic + дополнительно:
🤖 ИИ-чат бот поддержки
⚙️ Панель управления
📊 Аналитика и метрики
💳 Онлайн платежи

🥇 **MAX ПЛАН** - 5.500.000 сум (👑 ПРЕМИУМ)
💎 Топовый пакет включает всё + эксклюзив:
🧠 Встроенный Джарвис с голосовыми ответами
🌟 3D элементы и анимации
🥽 VR/AR интеграция
⛓️ Блокчейн функции

Какой план вас интересует? 😊✨`;
  }
  
  if (input.includes('матем') || input.includes('задач') || input.includes('пример') || input.includes('решить') || input.includes('вычисл')) {
    return `🧮 ${context} Математика - моя сильная сторона! 

Готов решить задачи любой сложности:
📊 Алгебра и геометрия
📈 Математический анализ
📉 Статистика и теория вероятностей
🔢 Арифметика и проценты
⚡ Физические расчёты
🎯 Логические задачи

Присылайте вашу задачу - решу быстро и подробно! 🤓✨

Пример: "Найти производную функции f(x) = x² + 3x + 2"
Ответ: f'(x) = 2x + 3 📝`;
  }
  
  if (input.includes('код') || input.includes('программ') || input.includes('разработ') || input.includes('веб') || input.includes('сайт')) {
    return `💻 ${context} Программирование - это моя стихия! 

Помогу с любыми языками и технологиями:
🚀 JavaScript/TypeScript  
⚛️ React/Vue/Angular
🔧 Node.js/Python/PHP
🗄️ Базы данных (SQL/NoSQL)
🎨 CSS/HTML/TailwindCSS
☁️ Деплой и DevOps

Опишите вашу задачу по коду подробнее! 😎⚡

Пример: "Как создать React компонент с состоянием?"`;
  }
  
  if (input.includes('джарвис') || input.includes('jarvis') || input.includes('голос') || input.includes('ии') || input.includes('искусственный интеллект')) {
    return `🧠 ${context} Джарвис - наша гордость! 

В MAX пакете вы получите:
🎤 Г��лосовое управление сайтом
🗣️ Голосовые ответы пользователям  
🤖 Персональная настройка ИИ
⚡ Мгновенные умные реакции
🎯 Интеграция с любыми системами

Это как иметь Тони Старка в команде! 😎✨`;
  }
  
  if (input.includes('привет') || input.includes('здравств') || input.includes('добр') || input.includes('hi') || input.includes('hello')) {
    return `Привет! 👋✨ ${context}

Отличного настроения! Я супер-рад нашему общению! 🤖💫

Готов помочь с:
🚀 Консультацией по веб-разработке
📋 Выбором тарифного плана  
📊 Решением математических задач
💻 Вопросами по программированию
🧠 Любыми другими темами!

О чём поговорим? 😊🌟`;
  }
  
  if (input.includes('спасибо') || input.includes('благодар') || input.includes('thank')) {
    return `😊 ${context} Всегда пожалуйста! 

Очень рад был помочь! 🌟 Если ещё вопросы появятся - обраща��тесь в любое время! 

Удачи в ваших проектах! 🚀✨`;
  }
  
  // Default smart response
  return `🤖 ${context}

Готов помочь с любыми вопросами! Могу:
🚀 Консультировать по нашим тарифам веб-разработки
📊 Решать математические задачи любой сложности
💻 Помогать с программированием
🧠 Обсуждать технологии и науку
💡 Поддержать беседу на любые темы

Просто уточните ваш вопрос подробнее! 😊✨`;
}

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
      const smartResponse = generateSmartResponse(lastMessage.content, "🎭 Демо-режим активен!");

      const response: ChatResponse = {
        success: true,
        message: smartResponse,
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
- Помог��ть с творческими задачами 🎨
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

3. 🥇 MAX ПЛАН - 5.500.000 сум (👑 ПРЕМИУМ УРОВЕНЬ):
   💎 Всё из пакета Pro ПЛЮС эксклюзивные возм��жности:
   🧠 Встроенный Джарвис с голосовыми ответами (как у Тони Старка!)
   🎛️ Персональная настройка ИИ под ваши нужды
   🌟 3D элементы и анимации (вау-эффект гарантирован)
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
- Будь полезным, отзывчивым и современным собеседником! 

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

Помни: когда тебя спрашивают о веб-разработке, ты представляешь нашу компанию и должен быть профессиональным консультантом. В остальных случаях - просто будь самым полезным и дружелюбным помощником! Испол��зуй эмодзи, будь креативным и современным! 🌟`,
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

      // Handle specific error cases with smart fallbacks
      if (groqResponse.status === 429) {
        // When rate limit exceeded, switch to smart fallback responses
        const lastMessage = messages[messages.length - 1];
        const smartResponse = generateSmartResponse(lastMessage.content, "😅 Лимит API превышен, но я всё равно готов помочь!");
        
        const response: ChatResponse = {
          success: true,
          message: smartResponse,
        };
        return res.json(response);
      } else if (groqResponse.status === 401) {
        const lastMessage = messages[messages.length - 1];
        const smartResponse = generateSmartResponse(lastMessage.content, "🔐 Ошибка авторизации API, но я всё равно ��твечу!");
        
        const response: ChatResponse = {
          success: true,
          message: smartResponse,
        };
        return res.json(response);
      } else if (groqResponse.status === 400) {
        // Check if it's invalid API key error
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.code === "invalid_api_key") {
            // Smart fallback when API key is invalid
            const lastMessage = messages[messages.length - 1];
            const smartResponse = generateSmartResponse(lastMessage.content, "🔑 API ключ недействителен, но я всё равно помогу!");
            
            const response: ChatResponse = {
              success: true,
              message: smartResponse,
            };
            return res.json(response);
          }
        } catch (e) {
          // Ignore parsing errors
        }
        
        const lastMessage = messages[messages.length - 1];
        const smartResponse = generateSmartResponse(lastMessage.content, "⚠️ Проблема с запросом к API, но я готов помочь!");
        
        const response: ChatResponse = {
          success: true,
          message: smartResponse,
        };
        return res.json(response);
      } else if (groqResponse.status >= 500) {
        const lastMessage = messages[messages.length - 1];
        const smartResponse = generateSmartResponse(lastMessage.content, "🔧 Сервис ИИ временно недоступен, но я отвечу!");
        
        const response: ChatResponse = {
          success: true,
          message: smartResponse,
        };
        return res.json(response);
      }

      // Fallback for any other error
      const lastMessage = messages[messages.length - 1];
      const smartResponse = generateSmartResponse(lastMessage.content, "🤖 Технические неполадки, но я всё равно помогу!");
      
      const response: ChatResponse = {
        success: true,
        message: smartResponse,
      };
      return res.json(response);
    }

    const groqData = await groqResponse.json();

    if (!groqData.choices || groqData.choices.length === 0) {
      const lastMessage = messages[messages.length - 1];
      const smartResponse = generateSmartResponse(lastMessage.content, "🔄 Некорректный ответ от API, но я готов помочь!");
      
      const response: ChatResponse = {
        success: true,
        message: smartResponse,
      };
      return res.json(response);
    }

    const aiMessage = groqData.choices[0].message.content;

    const response: ChatResponse = {
      success: true,
      message: aiMessage,
    };

    res.json(response);
  } catch (error) {
    console.error("Groq chat error:", error);
    
    // Even on server errors, provide smart fallback
    try {
      const { messages }: ChatRequest = req.body;
      if (messages && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        const smartResponse = generateSmartResponse(lastMessage.content, "⚡ Внутренняя ошибка сервера, но я всё равно отвечу!");
        
        const response: ChatResponse = {
          success: true,
          message: smartResponse,
        };
        return res.json(response);
      }
    } catch (fallbackError) {
      // Ignore fallback errors
    }
    
    const response: ChatResponse = {
      success: false,
      error: "Внутренняя ошибка сервера",
    };
    res.status(500).json(response);
  }
};
