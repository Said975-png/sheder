import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleImageUpload, handleGenerateWebsite } from "./routes/upload";
import { handleSendOrder } from "./routes/orders";

import { handleGroqChat } from "./routes/groq-chat";
import {
  createContract,
  getUserContracts,
  getContract,
} from "./routes/contracts";
import {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBooking,
  deleteBooking,
} from "./routes/bookings";

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

  // Groq chat route
  app.post("/api/groq-chat", handleGroqChat);

  // Contracts routes
  app.post("/api/contracts", createContract);
  app.get("/api/contracts", getUserContracts);
  app.get("/api/contracts/:contractId", getContract);

  // Bookings routes
  app.post("/api/bookings", createBooking);
  app.get("/api/bookings", getUserBookings);
  app.get("/api/bookings/all", getAllBookings);
  app.put("/api/bookings/:bookingId", updateBooking);
  app.delete("/api/bookings/:bookingId", deleteBooking);

  return app;
}
