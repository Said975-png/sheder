import { RequestHandler } from "express";

export const handleElevenLabsTTS: RequestHandler = async (req, res) => {
  const { text, voice_id } = req.body;

  if (!text || !voice_id) {
    return res.status(400).json({ error: "Text and voice_id are required" });
  }

  try {
    // Используем ваш реальный API ключ ElevenLabs
    const ELEVENLABS_API_KEY =
      process.env.ELEVENLABS_API_KEY ||
      "sk_e2c893aaca006de74fb3fc5bc4e605115e2e1b0dfc2f210f";

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
          text: `[RU] ${text}`,
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
      throw new Error(`ElevenLabs API error: ${response.status}`);
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
