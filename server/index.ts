import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleImageUpload, handleGenerateWebsite } from "./routes/upload";
import { handleSendOrder } from "./routes/orders";
import { handleElevenLabsTTS } from "./routes/elevenlabs-tts";
import { handleGroqChat } from "./routes/groq-chat";
import {
  createContract,
  getUserContracts,
  getContract,
} from "./routes/contracts";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Upload and generation routes
  app.post("/api/upload", handleImageUpload);
  app.get("/api/generated/:imageId", handleGenerateWebsite);

  // Orders route
  app.post("/api/orders", handleSendOrder);

  // ElevenLabs TTS route
  app.post("/api/elevenlabs-tts", handleElevenLabsTTS);

  // Groq chat route
  app.post("/api/groq-chat", handleGroqChat);

  // Contracts routes
  app.post("/api/contracts", createContract);
  app.get("/api/contracts", getUserContracts);
  app.get("/api/contracts/:contractId", getContract);

  return app;
}
