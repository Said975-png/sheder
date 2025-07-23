import { useJarvisSpeech } from "./JarvisSpeech";

// Утилита для добавления пауз в речь (согласно промпту о "небольших смысловых паузах")
export function addJarvisPauses(text: string): string {
  // Добавляем небольшие паузы после ключевых слов для элегантности
  return (
    text
      // Паузы после обращения
      .replace(/сэр([,.])/g, "сэр...$1")
      // Паузы после вводных слов
      .replace(/(Позвольте|Разрешите|Весьма|Всегда)(\s+)/g, "$1...$2")
      // Паузы перед важными частями предложения
      .replace(/(\.\s+)([А-ЯЁ])/g, "$1...$2")
      // Паузы после системных терминов
      .replace(/(системы|диагностика|функционируют)(\s+)/g, "$1...$2")
      // Паузы для подчеркивания важности
      .replace(/(готов|завершен|оптимальн)/g, "$1...")
  );
}

// Hook для речи с паузами согласно промпту
export function useJarvisSpeechWithPauses() {
  const {
    speak,
    speakCommand,
    speakResponse,
    speakAlert,
    speakSystemMessage,
    stop,
    isSpeaking,
  } = useJarvisSpeech();

  const speakWithPauses = async (
    text: string,
    type: "command" | "response" | "alert" | "system" = "response",
  ) => {
    const textWithPauses = addJarvisPauses(text);

    switch (type) {
      case "command":
        return await speakCommand(textWithPauses);
      case "alert":
        return await speakAlert(textWithPauses);
      case "system":
        return await speakSystemMessage(textWithPauses);
      default:
        return await speakResponse(textWithPauses);
    }
  };

  return {
    speak: speakWithPauses,
    speakCommand: (text: string) => speakWithPauses(text, "command"),
    speakResponse: (text: string) => speakWithPauses(text, "response"),
    speakAlert: (text: string) => speakWithPauses(text, "alert"),
    speakSystemMessage: (text: string) => speakWithPauses(text, "system"),
    stop,
    isSpeaking,
    addPauses: addJarvisPauses,
  };
}

export default useJarvisSpeechWithPauses;
