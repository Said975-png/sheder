# Развертывание на Netlify

## Настройка переменных окружения

В админ-панели Netlify добавьте следующие переменные окружения:

1. Зайдите в Site Settings → Environment variables
2. Добавьте:
   - `GROQ_API_KEY` - ваш API ключ от Groq (получить на https://console.groq.com)
   - `JWT_SECRET` - секретная строка для JWT токенов
   - `SMTP_HOST` - хост SMTP сервера (например: smtp.gmail.com)
   - `SMTP_PORT` - порт SMTP (обычно 587)
   - `SMTP_USER` - email для отправки писем
   - `SMTP_PASS` - пароль приложения для email

## Команды деплоя

Netlify автоматически выполнит:

```bash
npm run build
```

Это включает:

- Сборку клиента (`npm run build:client`)
- Сборку сервера (`npm run build:server`)

## Структура маршрутов

- `/api/*` - API эндпоинты через Netlify Functions
- `/*` - SPA маршруты (возвращают index.html)

## Известные проблемы

1. **Чат показывает "ошибка сети"**:

   - Проверьте переменную `GROQ_API_KEY` в настройках Netlify
   - Убедитесь что API ключ активный

2. **Страница /admin не найдена**:

   - Проблема решена добавлением SPA fallback в netlify.toml

3. **API не работают**:
   - Проверьте что функции собираются без ошибок в деплой логах
   - Убедитесь что все зависимости указаны в external_node_modules
