import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // В режиме разработки показываем предупреждение вместо ошибки
    if (process.env.NODE_ENV === "development") {
      console.warn("useTheme must be used within a ThemeProvider");
      return { theme: "dark" as Theme, toggleTheme: () => {} };
    }
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // Загружаем сохраненную тему из localStorage
    try {
      const savedTheme = localStorage.getItem("theme") as Theme;
      if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.warn("Failed to load theme from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    // Сохраняем тему в localStorage и применяем к документу
    try {
      localStorage.setItem("theme", theme);
      if (document.documentElement) {
        document.documentElement.setAttribute("data-theme", theme);
      }
    } catch (error) {
      console.warn("Failed to save theme:", error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
