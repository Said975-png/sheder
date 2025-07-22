import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleImageUpload, handleGenerateWebsite } from "./routes/upload";
import { handleSendOrder } from "./routes/orders";
import { handleElevenLabsTTS } from "./routes/elevenlabs-tts";

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

  return app;
}
