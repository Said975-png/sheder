import { useCallback } from "react";
import { useJarvisSpeech } from "@/components/JarvisSpeech";

export function useJarvisVoiceCommands() {
  const { speak, speakCommand, speakResponse, speakAlert, stop, isSpeaking } = useJarvisSpeech();

  // Безопасная обертка для всех речевых функций
  const safeSpeak = useCallback(async (speakFn: () => Promise<void>, fallbackText?: string) => {
    try {
      await speakFn();
    } catch (error) {
      console.warn('Speech command failed:', error);
      if (fallbackText) {
        console.log('Fallback:', fallbackText);
      }
    }
  }, []);

  // Системные ответы с обработкой ошибок
  const speakSystemsOperational = useCallback(async () => {
    try {
      await speakResponse("Все системы функционируют нормально, сэр");
    } catch (error) {
      console.warn('speakSystemsOperational failed:', error);
    }
  }, [speakResponse]);

  const speakWelcomeBack = useCallback(async () => {
    await safeSpeak(() => speakResponse("Добро пожаловать обратно, сэр. Рад вас видеть"), "Добро пожаловать обратно");
  }, [speakResponse, safeSpeak]);

  const speakGoodMorning = useCallback(async () => {
    await safeSpeak(() => speakResponse("Доброе утро, сэр. Надеюсь, у вас будет продукт��вный день"), "Доброе утро");
  }, [speakResponse, safeSpeak]);

  const speakIAmHere = useCallback(async () => {
    await safeSpeak(() => speakResponse("Я здесь и готов к работе, сэр"), "Я здесь");
  }, [speakResponse, safeSpeak]);

  const speakThankYou = useCallback(async () => {
    await speakResponse("Всегда пожалуйста, сэр. Рад быть полезным");
  }, [speakResponse]);

  const speakShutdown = useCallback(async () => {
    await speakCommand("Отключаю голосовое управление. До свидания, сэр");
  }, [speakCommand]);

  const speakAuthenticJarvis = useCallback(async () => {
    await speakResponse("Джарвис к вашим услугам, сэр. Как дела?");
  }, [speakResponse]);

  const speakHowAreYou = useCallback(async () => {
    await speakResponse("У меня все в порядке, сэр. Все системы работают стабильно");
  }, [speakResponse]);

  // Диагностика систем
  const speakSystemDiagnostics = useCallback(async () => {
    await speakCommand("Запускаю полную диагностику всех систем");
    
    // Пауза для эффекта
    setTimeout(async () => {
      await speakResponse("Диагностика завершена. Все системы функционируют в оптимальном режиме");
    }, 3000);
  }, [speakCommand, speakResponse]);

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
  const speakPlanAdded = useCallback(async (planName: string) => {
    await speakResponse(`План "${planName}" добавлен в корзину, сэр`);
  }, [speakResponse]);

  const speakCartCleared = useCallback(async () => {
    await speakResponse("Корзина очищена, сэр");
  }, [speakResponse]);

  // Команды навигации
  const speakNavigating = useCallback(async (destination: string) => {
    await speakCommand(`Перехожу к разделу "${destination}", сэр`);
  }, [speakCommand]);

  const speakError = useCallback(async (errorMessage: string) => {
    await speakAlert(`Внимание, сэр. ${errorMessage}`);
  }, [speakAlert]);

  // Общая функция для произвольного текста
  const speakCustom = useCallback(async (text: string, type: 'command' | 'response' | 'alert' = 'response') => {
    switch (type) {
      case 'command':
        await speakCommand(text);
        break;
      case 'alert':
        await speakAlert(text);
        break;
      default:
        await speakResponse(text);
    }
  }, [speakCommand, speakResponse, speakAlert]);

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

    // Команды лаборатории
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
