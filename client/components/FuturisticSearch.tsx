import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FuturisticSearch() {
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Анимация появления и контейнер */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Эффект частиц при фокусе */}
        {isFocused && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-70"></div>
            <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-bounce opacity-50"></div>
            <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-violet-400 rounded-full animate-pulse opacity-60"></div>
            <div className="absolute top-1/4 left-2/3 w-1 h-1 bg-indigo-400 rounded-full animate-ping opacity-50"></div>
          </div>
        )}

        {/* Основной контейнер поиска */}
        <div
          className={cn(
            "relative group transition-all duration-500 ease-out",
            isFocused ? "scale-105" : "scale-100",
          )}
        >
          {/* Неоновое свечение */}
          <div
            className={cn(
              "absolute -inset-1 rounded-full transition-all duration-500",
              isFocused
                ? "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-75 blur-sm"
                : "bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-cyan-500/30 opacity-30 blur-sm",
            )}
          ></div>

          {/* Glassmorphism контейнер */}
          <div
            className={cn(
              "relative flex items-center rounded-full backdrop-blur-xl border transition-all duration-500",
              "bg-black/20 dark:bg-white/5",
              isFocused
                ? "border-purple-400/50 shadow-lg shadow-purple-500/25"
                : "border-white/20 hover:border-purple-400/30",
            )}
          >
            {/* Иконка поиска */}
            <div className="pl-4 pr-2">
              <Search
                className={cn(
                  "w-3.5 h-3.5 transition-all duration-300",
                  isFocused
                    ? "text-purple-300 scale-105"
                    : "text-white/60 group-hover:text-purple-400",
                )}
              />
            </div>

            {/* Поле ввода */}
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Поиск по Вселенной..."
              className={cn(
                "flex-1 bg-transparent py-3 pr-5 text-white placeholder:text-white/50",
                "focus:outline-none focus:ring-0 focus:border-none focus:shadow-none",
                "focus:placeholder:text-purple-300/70",
                "font-semibold text-lg transition-all duration-300",
                "selection:bg-purple-500/30",
                "appearance-none border-none",
              )}
              style={{
                fontFamily: "Montserrat, sans-serif",
                boxShadow: "none",
                outline: "none",
              }}
            />

            {/* Дополнительное внутреннее свечение при фокусе */}
            {isFocused && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 pointer-events-none"></div>
            )}
          </div>

          {/* Дополнительные эффекты свечения */}
          {isFocused && (
            <>
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-lg animate-pulse"></div>
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 blur-2xl animate-pulse"></div>
            </>
          )}
        </div>

        {/* Подсказка под поиском */}
        <div
          className={cn(
            "mt-4 text-center transition-all duration-500",
            isFocused
              ? "opacity-100 translate-y-0"
              : "opacity-60 translate-y-1",
          )}
        >
          <p
            className="text-sm text-white/60 font-medium"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {isFocused
              ? "Введите запрос для поиска по бесконечным возможностям ИИ"
              : "Нажмите чтобы начать поиск"}
          </p>
        </div>
      </div>
    </div>
  );
}
