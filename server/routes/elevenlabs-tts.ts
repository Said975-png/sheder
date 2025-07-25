import { RequestHandler } from "express";

export const handleElevenLabsTTS: RequestHandler = async (req, res) => {
  const { text, voice_id } = req.body;

  if (!text || !voice_id) {
    return res.status(400).json({ error: "Text and voice_id are required" });
  }

  try {
    // Испо��ьзуем API ключ ElevenLabs из переменной окружения
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

    console.log("ElevenLabs TTS request:", { text, voice_id });
    console.log("API key present:", !!ELEVENLABS_API_KEY);

    if (!ELEVENLABS_API_KEY) {
      console.error("ElevenLabs API key not found in environment variables");
      return res
        .status(500)
        .json({ error: "ElevenLabs API key not configured" });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.2,
            similarity_boost: 0.9,
            style: 1.0,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API error: ${response.status}`, errorText);

      if (response.status === 404) {
        return res.status(404).json({
          error: "Voice not found. The specified voice ID may not exist or may not be available.",
          details: errorText
        });
      } else if (response.status === 401) {
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.detail?.status === "missing_permissions") {
            return res.status(401).json({
              error: "API key does not have text_to_speech permission. Please check your ElevenLabs subscription.",
              details: errorText
            });
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
        return res.status(401).json({
          error: "API key is invalid or expired.",
          details: errorText
        });
      } else if (response.status === 429) {
        return res.status(429).json({
          error: "Rate limit exceeded. Please try again later.",
          details: errorText
        });
      } else if (response.status === 500) {
        return res.status(500).json({
          error: "ElevenLabs server error. The service may be temporarily unavailable.",
          details: errorText
        });
      }

      return res.status(response.status).json({
        error: `ElevenLabs API error: ${response.status}`,
        details: errorText
      });
    }

    const audioBuffer = await response.arrayBuffer();

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.byteLength.toString(),
    });

    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error("ElevenLabs TTS error:", error);
    res.status(500).json({ error: "Failed to generate speech" });
  }
};
