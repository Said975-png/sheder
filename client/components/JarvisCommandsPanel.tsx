import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Mic, Bot, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface JarvisCommandsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JarvisCommandsPanel({
  isOpen,
  onClose,
}: JarvisCommandsPanelProps) {
  const commands = [
    {
      category: "Основные команды",
      items: [
        {
          command: "Джарвис ты тут",
          description: "Проверка присутствия и активация",
        },
        {
          command: "Спасибо",
          description: "Благодарность с голосовым ответом",
        },
        { command: "Привет", description: "Приветствие" },
        { command: "Здравствуй", description: "Приветствие" },
        { command: "Благодарю", description: "Выражение благодарности" },
        { command: "Помощь", description: "Запрос помощи" },
      ],
    },
    {
      category: "Управление 3D моделью",
      items: [
        {
          command: "Джарвис смени модель",
          description: "Переключение на новую 3D модель",
        },
        {
          command: "Верни модель",
          description: "Возврат к предыдущей модели",
        },
      ],
    },
    {
      category: "Навигация по сайту",
      items: [
        { command: "Покажи прайс лист", description: "Переход к разделу цен" },
        { command: "Прайс", description: "Переход к разделу цен" },
        { command: "Цены", description: "Переход к разделу цен" },
        {
          command: "Покажи наши преимущества",
          description: "Показать преимущества компании",
        },
        {
          command: "Преимущества",
          description: "Показать преимущества компании",
        },
        { command: "Открой чат", description: "Переход в чат с ИИ Пятницей" },
        { command: "Чат", description: "Переход в чат с ИИ Пятницей" },
      ],
    },
    {
      category: "Режим Старка",
      items: [
        {
          command: "Джарвис полный доступ",
          description: "Активация режима лаборатории Старка",
        },
        {
          command: "Полный доступ",
          description: "Активация режима лаборатории Старка",
        },
        { command: "Отмени", description: "Отключение режима Старка" },
        { command: "Отменить", description: "Отключение режима Старка" },
        { command: "Выключи", description: "Отключение режима Старка" },
      ],
    },
    {
      category: "Чат с ИИ",
      items: [
        {
          command: "Пятница [ваш вопрос]",
          description: "Отправка сообщения ИИ Пятнице",
        },
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6">
      <Card className="w-full max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto bg-black/90 border-cyan-400/30 shadow-2xl shadow-cyan-400/20">
        <CardHeader className="border-b border-cyan-400/30 bg-black/60 backdrop-blur-md">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center gap-3">
              <Bot className="w-5 sm:w-6 h-5 sm:h-6 text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-white font-mono text-lg sm:text-xl">
                  Команды голосового Джарвиса
                </span>
                <span className="text-xs sm:text-sm text-cyan-400/70">
                  Произнесите любую из этих команд после активации микрофона
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 sm:p-3 rounded-full hover:bg-cyan-400/20 hover:shadow-md hover:shadow-cyan-400/30 transition-all duration-300 border border-cyan-400/20 bg-black/40 min-h-[44px] touch-manipulation"
            >
              <X className="w-4 h-4 text-cyan-400" />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {/* Инструкция по использованию */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-cyan-400/5 border border-cyan-400/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">
                Как использовать:
              </span>
            </div>
            <ol className="text-sm text-white/80 space-y-1 ml-4">
              <li>1. Нажмите на кнопку с микрофоном в интерфейсе</li>
              <li>2. Дождитесь активации (красная кнопка микрофона)</li>
              <li>3. Произнесите команду четко и громко</li>
              <li>4. Дождитесь ответа Джарвиса</li>
            </ol>
          </div>

          {/* Список команд по категориям */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {commands.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-3">
                <h3 className="text-lg font-semibold text-cyan-400 border-b border-cyan-400/20 pb-2">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="group p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-cyan-400/30 rounded-lg transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <Volume2 className="w-4 h-4 text-cyan-400/60 mt-0.5 group-hover:text-cyan-400 transition-colors" />
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm group-hover:text-cyan-100 transition-colors">
                            "{item.command}"
                          </div>
                          <div className="text-white/60 text-xs mt-1">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Дополнительные советы */}
          <div className="mt-6 p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-lg">
            <div className="text-sm text-yellow-200/90">
              <div className="font-medium mb-2">💡 Советы:</div>
              <ul className="space-y-1 text-xs">
                <li>• Говорите четко и не слишком быстро</li>
                <li>• Избегайте шумного окружения для лучшего распознавания</li>
                <li>• Некоторые команды работают без слова "Джарвис"</li>
                <li>
                  • При проблемах скажите "Джарвис отключись" и попробуйте снова
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
