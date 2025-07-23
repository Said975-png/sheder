import { useCallback } from "react";
import { useJarvisSpeech } from "@/components/JarvisSpeech";

export function useJarvisVoiceCommands() {
  const {
    speak,
    speakCommand,
    speakResponse,
    speakAlert,
    speakSystemMessage,
    stop,
    isSpeaking,
  } = useJarvisSpeech();

  // Безопасная обертка для всех речевых функций
  const safeSpeak = useCallback(
    async (speakFn: () => Promise<void>, fallbackText?: string) => {
      try {
        await speakFn();
      } catch (error) {
        console.warn("Speech command failed:", error);
        if (fallbackText) {
          console.log("Fallback:", fallbackText);
        }
      }
    },
    [],
  );

  // Системные ответы с обработкой ошибок (формальный стиль)
  const speakSystemsOperational = useCallback(async () => {
    try {
      await speakSystemMessage(
        "Все системы функционируют в оптимальном режиме, сэр",
      );
    } catch (error) {
      console.warn("speakSystemsOperational failed:", error);
    }
  }, [speakSystemMessage]);

  const speakWelcomeBack = useCallback(async () => {
    await safeSpeak(
      () =>
        speakResponse(
          "Добро пожаловать обратно, сэр. Весьма приятно видеть вас снова",
        ),
      "Добро пожаловать обратно",
    );
  }, [speakResponse, safeSpeak]);

  const speakGoodMorning = useCallback(async () => {
    await safeSpeak(
      () =>
        speakResponse(
          "Доброе утро, сэр. Позвольте пожелать вам продуктивного и успешного дня",
        ),
      "Доброе утро",
    );
  }, [speakResponse, safeSpeak]);

  const speakIAmHere = useCallback(async () => {
    await safeSpeak(
      () =>
        speakResponse("Я нахожусь в полной готовности и к вашим услугам, сэр"),
      "Я здесь",
    );
  }, [speakResponse, safeSpeak]);

  const speakThankYou = useCallback(async () => {
    await safeSpeak(
      () =>
        speakResponse(
          "Всегда к вашим услугам, сэр. Весьма приятно быть полезным",
        ),
      "Пожалуйста",
    );
  }, [speakResponse, safeSpeak]);

  const speakShutdown = useCallback(async () => {
    await safeSpeak(
      () =>
        speakCommand(
          "Завершаю работу голосового интерфейса. Всего доброго, сэр",
        ),
      "До с��идания",
    );
  }, [speakCommand, safeSpeak]);

  const speakAuthenticJarvis = useCallback(async () => {
    await safeSpeak(
      () =>
        speakResponse("Джарвис к вашим услугам, сэр. Чем могу быть полезен?"),
      "Джарвис готов",
    );
  }, [speakResponse, safeSpeak]);

  const speakHowAreYou = useCallback(async () => {
    await safeSpeak(
      () =>
        speakSystemMessage(
          "Все мои системы функционируют в пределах нормальных параметров, сэр",
        ),
      "Все работает нормально",
    );
  }, [speakSystemMessage, safeSpeak]);

  // Диагностика систем (формальный системный стиль)
  const speakSystemDiagnostics = useCallback(async () => {
    await safeSpeak(
      () => speakSystemMessage("Инициализация полной диагностики всех систем"),
      "Запуск диагностики",
    );

    // Пауза для эффекта системной проверки
    setTimeout(async () => {
      await safeSpeak(
        () =>
          speakSystemMessage(
            "Диагностика завершена. Все компоненты функционируют в номинальных параметрах, сэр",
          ),
        "Диагностика завершена",
      );
    }, 4000);
  }, [speakSystemMessage, safeSpeak]);

  // Навигационные команды
  const speakContinue = useCallback(async () => {
    await speakCommand("Понял, сэр. Давайте продолжим");
  }, [speakCommand]);

  const speakCorrect = useCallback(async () => {
    await speakResponse("Верно, сэр");
  }, [speakResponse]);

  // Команды активации лаборатории
  const speakLabActivation = useCallback(async () => {
    await speakCommand("Активирую лабораторию Старка");

    setTimeout(async () => {
      await speakResponse("Лаборатория готова к работе, сэр");
    }, 2000);
  }, [speakCommand, speakResponse]);

  const speakLabDeactivation = useCallback(async () => {
    await speakCommand("Возвращаю стандартный режим");
  }, [speakCommand]);

  // Команды для планов и покупок
  const speakPlanAdded = useCallback(
    async (planName: string) => {
      await speakResponse(`План "${planName}" добавлен в корзину, сэр`);
    },
    [speakResponse],
  );

  const speakCartCleared = useCallback(async () => {
    await speakResponse("Корзина очищена, сэр");
  }, [speakResponse]);

  // ��оманды навигации
  const speakNavigating = useCallback(
    async (destination: string) => {
      await speakCommand(`Перехожу к разделу "${destination}", сэр`);
    },
    [speakCommand],
  );

  const speakError = useCallback(
    async (errorMessage: string) => {
      await speakAlert(`Внимание, сэр. ${errorMessage}`);
    },
    [speakAlert],
  );

  // Общая функция для произвольного текста
  const speakCustom = useCallback(
    async (
      text: string,
      type: "command" | "response" | "alert" = "response",
    ) => {
      switch (type) {
        case "command":
          await speakCommand(text);
          break;
        case "alert":
          await speakAlert(text);
          break;
        default:
          await speakResponse(text);
      }
    },
    [speakCommand, speakResponse, speakAlert],
  );

  return {
    // Основные функции
    speak,
    speakCustom,
    stop,
    isSpeaking,

    // Системные ответы
    speakSystemsOperational,
    speakWelcomeBack,
    speakGoodMorning,
    speakIAmHere,
    speakThankYou,
    speakShutdown,
    speakAuthenticJarvis,
    speakHowAreYou,
    speakSystemDiagnostics,

    // Навигационные команды
    speakContinue,
    speakCorrect,
    speakNavigating,

    // Коман��ы лаборатории
    speakLabActivation,
    speakLabDeactivation,

    // Команды покупок
    speakPlanAdded,
    speakCartCleared,

    // Ошибки
    speakError,
  };
}

export default useJarvisVoiceCommands;
