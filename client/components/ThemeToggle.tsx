import { Moon, Sun, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "h-8 w-8 relative overflow-hidden transition-all duration-300 rounded-full",
        "hover:bg-cyan-400/20 hover:shadow-md hover:shadow-cyan-400/30 border border-cyan-400/20 bg-black/40",
        "group",
      )}
      aria-label="Переключить тему"
    >
      {/* Фоновый эффект */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Иконка */}
      <div className="relative z-10">
        {theme === "light" ? (
          <Moon
            className={cn(
              "h-4 w-4 text-cyan-400 transition-all duration-300",
              "group-hover:scale-110 group-hover:text-cyan-300",
            )}
          />
        ) : (
          <Sun
            className={cn(
              "h-4 w-4 text-yellow-400 transition-all duration-300",
              "group-hover:scale-110 group-hover:text-yellow-300 group-hover:animate-pulse",
            )}
          />
        )}
      </div>

      {/* Энергетическое кольцо при hover */}
      <div className="absolute inset-0 rounded-full border border-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>

      {/* Угловые индикаторы */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-cyan-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-cyan-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-cyan-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-cyan-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </Button>
  );
}
