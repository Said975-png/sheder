import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "page" | "feature" | "plan" | "component";
  url?: string;
  action?: () => void;
}

interface SiteSearchProps {
  className?: string;
}

export function SiteSearch({ className }: SiteSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Данные для поиска
  const searchData: SearchResult[] = [
    {
      id: "home",
      title: "Главная страница",
      description: "Домашняя страница с информацией о ДЖАРВИС AI",
      type: "page",
      url: "/",
    },
    {
      id: "voice-commands",
      title: "Голосовые команды",
      description: "Управление сайтом с ��омощью голоса",
      type: "feature",
    },
    {
      id: "jarvis-interface",
      title: "Интерфейс ДЖАРВИС",
      description: "AI-помощник с голосовым управлением",
      type: "component",
    },
    {
      id: "plans-basic",
      title: "Базовый план",
      description: "Начальный тарифный план с основными функциями",
      type: "plan",
    },
    {
      id: "plans-pro",
      title: "PRO план",
      description: "Профессиональный план с расширенными возможностями",
      type: "plan",
    },
    {
      id: "plans-max",
      title: "MAX план",
      description: "Максимальный план с полным набором функций",
      type: "plan",
    },
    {
      id: "login",
      title: "Вход в систему",
      description: "Авторизация пользователя",
      type: "page",
      url: "/login",
    },
    {
      id: "signup",
      title: "Регистрация",
      description: "Создание нового аккаунта",
      type: "page",
      url: "/signup",
    },
    {
      id: "profile",
      title: "Про��иль пол��зователя",
      description: "Настройки и информация о пользователе",
      type: "page",
      url: "/profile",
    },
    {
      id: "cart",
      title: "Корзина",
      description: "Выбранные тарифные планы",
      type: "feature",
    },
    {
      id: "ai-features",
      title: "AI возможности",
      description: "Искусственный интеллект и автоматизация",
      type: "feature",
    },
    {
      id: "blockchain",
      title: "Blockchain интеграция",
      description: "Технологии блокчейн и криптографии",
      type: "feature",
    },
    {
      id: "stark-tech",
      title: "Stark Industries Technology",
      description: "Продвинутые технологии Stark Industries",
      type: "feature",
    },
  ];

  const handleSelectResult = useCallback((result: SearchResult) => {
    if (result.url) {
      window.location.href = result.url;
    } else if (result.action) {
      result.action();
    } else {
      // Скролл к соответствующей секции или выполнение специального действия
      switch (result.id) {
        case "voice-commands":
          // Активировать голосового помощника
          (
            document.querySelector(
              '[data-testid="voice-control"]',
            ) as HTMLElement
          )?.click();
          break;
        case "plans-basic":
        case "plans-pro":
        case "plans-max":
          // Скролл к секции с планами
          document
            .querySelector('[data-section="plans"]')
            ?.scrollIntoView({ behavior: "smooth" });
          break;
        case "cart":
          // Открыть корзину
          (
            document.querySelector('[data-testid="cart-button"]') as HTMLElement
          )?.click();
          break;
        default:
          // Скролл наверх для остальных случаев
          window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    setIsOpen(false);
    setQuery("");
  }, []);

  // Поиск по данным
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = searchData.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()),
    );

    setResults(filtered.slice(0, 6)); // Ограничивае�� до 6 результатов
    setSelectedIndex(0);
  }, [query]);

  // Обработка клавиш
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          handleSelectResult(results[selectedIndex]);
          break;
        case "Escape":
          setIsOpen(false);
          setQuery("");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelectResult]);

  // Фокус на input при открытии
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "page":
        return "text-cyan-400";
      case "feature":
        return "text-blue-400";
      case "plan":
        return "text-orange-400";
      case "component":
        return "text-purple-400";
      default:
        return "text-gray-400";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "page":
        return "Страница";
      case "feature":
        return "Функция";
      case "plan":
        return "Тариф";
      case "component":
        return "Компонент";
      default:
        return type;
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Кнопка поиска */}
      <Button
        onClick={() => setIsOpen(true)}
        className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-3 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base lg:text-lg font-bold stark-glow transition-all duration-300 hover:shadow-cyan-500/40 overflow-hidden w-full sm:w-auto max-w-full min-h-[48px] touch-manipulation"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <Search className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 mr-2 sm:mr-3 group-hover:animate-pulse flex-shrink-0" />
        <span className="relative z-10 truncate">Поиск по сайту</span>
      </Button>

      {/* Модальное окно поиска */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 bg-black/50 backdrop-blur-sm p-2 sm:p-4">
          <div className="relative w-full max-w-2xl mx-2 sm:mx-4">
            {/* Поисковая строка */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по сайту..."
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 text-base sm:text-lg bg-black/90 border-2 border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none backdrop-blur-sm min-h-[48px]"
              />
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Результаты поиска */}
            {results.length > 0 && (
              <div className="mt-2 bg-black/90 border border-cyan-400/30 rounded-lg backdrop-blur-sm overflow-hidden">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b border-cyan-400/10 last:border-b-0 transition-colors duration-200",
                      index === selectedIndex
                        ? "bg-cyan-400/20"
                        : "hover:bg-cyan-400/10",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-white mb-1">
                          {result.title}
                        </div>
                        <div className="text-sm text-gray-400">
                          {result.description}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span
                          className={cn(
                            "text-xs font-mono px-2 py-1 rounded",
                            getTypeColor(result.type),
                          )}
                        >
                          {getTypeLabel(result.type)}
                        </span>
                        {result.url && (
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Подсказки */}
            <div className="mt-4 text-sm text-gray-400 text-center space-x-4">
              <span>↑↓ навигация</span>
              <span>Enter выбор</span>
              <span>Esc закрыть</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
