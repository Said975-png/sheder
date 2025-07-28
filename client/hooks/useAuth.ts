import { useState, useEffect } from "react";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем localStorage при загрузке
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem("currentUser");
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("currentUser");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Слушаем изменения в localStorage (для синхронизации между вкладками)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "currentUser") {
        if (e.newValue) {
          try {
            setCurrentUser(JSON.parse(e.newValue));
          } catch (error) {
            console.error("Error parsing user data:", error);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  const refreshUser = () => {
    try {
      const userData = localStorage.getItem("currentUser");
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      setCurrentUser(null);
    }
  };

  return {
    currentUser,
    loading,
    logout,
    refreshUser,
    isAuthenticated: !!currentUser,
  };
}
