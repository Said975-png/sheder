import { RequestHandler } from "express";
import { ChatRequest, ChatResponse } from "@shared/api";

export const handleGroqChat: RequestHandler = async (req, res) => {
  try {
    const { messages }: ChatRequest = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      const response: ChatResponse = {
        success: false,
        error: "Необходимо предоставить сообщения для чата",
      };
      return res.status(400).json(response);
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      const response: ChatResponse = {
        success: false,
        error: "API ключ Groq не настроен",
      };
      return res.status(500).json(response);
    }

    // Используем одну из самых мощных доступных моделей Groq - llama-3.1-8b-instant
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // Быстрая и мощная модель
          messages: [
            {
              role: "system",
              content: `Ты - Пятница, умный ИИ-ассистент, вдохновленный персонажем из фильмов о Железном человеке. 
            Ты помогаешь пользователям с различными задачами, отвечаешь на вопросы и ведешь интересные беседы.
            Отвечай дружелюбно, но профессионально. Используй русский язык для общения.
            Ты можешь помочь с программированием, объ��снить концепции, дать советы и просто поболтать.`,
            },
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
          max_tokens: 1024,
          temperature: 0.7,
          top_p: 1,
          stream: false,
        }),
      },
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API error:", errorText);
      const response: ChatResponse = {
        success: false,
        error: `Ошибка API Groq: ${groqResponse.status}`,
      };
      return res.status(500).json(response);
    }

    const groqData = await groqResponse.json();

    if (!groqData.choices || groqData.choices.length === 0) {
      const response: ChatResponse = {
        success: false,
        error: "Получен некорректный ответ от Groq API",
      };
      return res.status(500).json(response);
    }

    const aiMessage = groqData.choices[0].message.content;

    const response: ChatResponse = {
      success: true,
      message: aiMessage,
    };

    res.json(response);
  } catch (error) {
    console.error("Groq chat error:", error);
    const response: ChatResponse = {
      success: false,
      error: "Внутренняя ошибка сервера",
    };
    res.status(500).json(response);
  }
};
