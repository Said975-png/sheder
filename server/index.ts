import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleImageUpload, handleGenerateWebsite } from "./routes/upload";
import { handleRegister, handleLogin, handleLogout, handleGetCurrentUser } from "./routes/auth";
import { handleClearDatabase, handleDatabaseStats } from "./routes/dev-utils";
import "./database"; // Initialize database

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

  // Authentication routes
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/logout", handleLogout);
  app.get("/api/auth/me", handleGetCurrentUser);

  return app;
}
