import { RequestHandler } from "express";
import {
  BookingData,
  CreateBookingRequest,
  CreateBookingResponse,
  GetBookingsResponse,
  UpdateBookingRequest,
  UpdateBookingResponse,
} from "@shared/api";
import * as fs from "fs";
import * as path from "path";

// Путь к файлу с данными о бронях
const BOOKINGS_DIR = path.join(process.cwd(), "data", "bookings");
const BOOKINGS_FILE = path.join(BOOKINGS_DIR, "bookings.json");

// Убедимся, что директория существует
if (!fs.existsSync(BOOKINGS_DIR)) {
  fs.mkdirSync(BOOKINGS_DIR, { recursive: true });
}

// Утилиты для работы с данными брони
const loadBookings = (): BookingData[] => {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, "utf-8");
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Error loading bookings:", error);
    return [];
  }
};

const saveBookings = (bookings: BookingData[]): void => {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (error) {
    console.error("Error saving bookings:", error);
  }
};

const generateBookingId = (): string => {
  return `BOOK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// API обработчики

// Создание новой брони
export const createBooking: RequestHandler = async (req, res) => {
  try {
    console.log("📅 Получен запрос на создание брони");
    const userId = (req.headers["user-id"] as string) || "anonymous";
    const bookingData: CreateBookingRequest = req.body;

    // Валидация данных
    if (
      !bookingData.serviceType ||
      !bookingData.clientName ||
      !bookingData.clientEmail ||
      !bookingData.clientPhone ||
      !bookingData.preferredDate ||
      !bookingData.preferredTime
    ) {
      const response: CreateBookingResponse = {
        success: false,
        error: "Заполните все обязательные поля",
      };
      return res.status(400).json(response);
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.clientEmail)) {
      const response: CreateBookingResponse = {
        success: false,
        error: "Некорректный email адрес",
      };
      return res.status(400).json(response);
    }

    // Валидация телефона
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(bookingData.clientPhone)) {
      const response: CreateBookingResponse = {
        success: false,
        error: "Некорректный номер телефона",
      };
      return res.status(400).json(response);
    }

    // Валидация даты
    const preferredDate = new Date(bookingData.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (preferredDate < today) {
      const response: CreateBookingResponse = {
        success: false,
        error: "Дата брони не может быть в прошлом",
      };
      return res.status(400).json(response);
    }

    // Создание брони
    const bookingId = generateBookingId();
    const now = new Date().toISOString();

    const newBooking: BookingData = {
      id: bookingId,
      userId,
      clientName: bookingData.clientName,
      clientEmail: bookingData.clientEmail,
      clientPhone: bookingData.clientPhone,
      serviceType: bookingData.serviceType,
      serviceDescription: bookingData.serviceDescription,
      preferredDate: bookingData.preferredDate,
      preferredTime: bookingData.preferredTime,
      notes: bookingData.notes || "",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    // Загружаем существующие брони и добавляем новую
    const bookings = loadBookings();
    bookings.push(newBooking);
    saveBookings(bookings);

    console.log(`✅ Бронь создана: ${bookingId}`);

    const response: CreateBookingResponse = {
      success: true,
      message: "Бронь успешно создана! Мы свяжемся с вами в ближайшее время.",
      bookingId,
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Ошибка создания брони:", error);
    const response: CreateBookingResponse = {
      success: false,
      error: "Ошибка сервера при создании брони",
    };
    res.status(500).json(response);
  }
};

// Получение броней пользователя
export const getUserBookings: RequestHandler = async (req, res) => {
  try {
    console.log("📋 Получен запрос на получение броней пользователя");
    const userId = req.headers["user-id"] as string;

    if (!userId || userId === "anonymous") {
      const response: GetBookingsResponse = {
        success: false,
        error: "Необходима авторизация",
      };
      return res.status(401).json(response);
    }

    const allBookings = loadBookings();
    const userBookings = allBookings.filter(
      (booking) => booking.userId === userId,
    );

    // Сортируем по дате создания (новые сначала)
    userBookings.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    console.log(
      `📋 Найдено ${userBookings.length} броней для пользователя ${userId}`,
    );

    const response: GetBookingsResponse = {
      success: true,
      bookings: userBookings,
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Ошибка получения броней:", error);
    const response: GetBookingsResponse = {
      success: false,
      error: "Ошибка сервера при получении броней",
    };
    res.status(500).json(response);
  }
};

// Получение всех броней (для админа)
export const getAllBookings: RequestHandler = async (req, res) => {
  try {
    console.log("🔐 Получен запрос на получение всех броней (админ)");

    const allBookings = loadBookings();

    // Сортируем по дате создания (новые сначала)
    allBookings.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    console.log(`📋 Найдено ${allBookings.length} броней всего`);

    const response: GetBookingsResponse = {
      success: true,
      bookings: allBookings,
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Ошибка получения всех броней:", error);
    const response: GetBookingsResponse = {
      success: false,
      error: "Ошибка сервера при получении броней",
    };
    res.status(500).json(response);
  }
};

// Обновление статуса брони
export const updateBooking: RequestHandler = async (req, res) => {
  try {
    console.log("📝 Получен запрос на обновление брони");
    const { bookingId } = req.params;
    const updateData: UpdateBookingRequest = req.body;

    if (!bookingId) {
      const response: UpdateBookingResponse = {
        success: false,
        error: "ID брони не указан",
      };
      return res.status(400).json(response);
    }

    const bookings = loadBookings();
    const bookingIndex = bookings.findIndex(
      (booking) => booking.id === bookingId,
    );

    if (bookingIndex === -1) {
      const response: UpdateBookingResponse = {
        success: false,
        error: "Бронь не найдена",
      };
      return res.status(404).json(response);
    }

    // Обновляем бронь
    const booking = bookings[bookingIndex];
    if (updateData.status) booking.status = updateData.status;
    if (updateData.preferredDate)
      booking.preferredDate = updateData.preferredDate;
    if (updateData.preferredTime)
      booking.preferredTime = updateData.preferredTime;
    if (updateData.notes !== undefined) booking.notes = updateData.notes;
    booking.updatedAt = new Date().toISOString();

    bookings[bookingIndex] = booking;
    saveBookings(bookings);

    console.log(`✅ Бронь обновлена: ${bookingId}`);

    const response: UpdateBookingResponse = {
      success: true,
      message: "Бронь успешно обновлена",
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Ошибка обновления брони:", error);
    const response: UpdateBookingResponse = {
      success: false,
      error: "Ошибка сервера при обновлении брони",
    };
    res.status(500).json(response);
  }
};

// Удаление брони
export const deleteBooking: RequestHandler = async (req, res) => {
  try {
    console.log("🗑️ Получен запрос на удаление брони");
    const { bookingId } = req.params;
    const userId = req.headers["user-id"] as string;

    if (!bookingId) {
      const response: UpdateBookingResponse = {
        success: false,
        error: "ID брони не указан",
      };
      return res.status(400).json(response);
    }

    const bookings = loadBookings();
    const bookingIndex = bookings.findIndex(
      (booking) => booking.id === bookingId,
    );

    if (bookingIndex === -1) {
      const response: UpdateBookingResponse = {
        success: false,
        error: "Бронь не найдена",
      };
      return res.status(404).json(response);
    }

    const booking = bookings[bookingIndex];

    // Проверяем права доступа (пользователь может удалять только свои брони)
    if (userId !== "admin" && booking.userId !== userId) {
      const response: UpdateBookingResponse = {
        success: false,
        error: "Нет прав для удаления этой брони",
      };
      return res.status(403).json(response);
    }

    // Удаляем бронь
    bookings.splice(bookingIndex, 1);
    saveBookings(bookings);

    console.log(`🗑️ Бронь удалена: ${bookingId}`);

    const response: UpdateBookingResponse = {
      success: true,
      message: "Бронь успешно удалена",
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Ошибка удаления брони:", error);
    const response: UpdateBookingResponse = {
      success: false,
      error: "Ошибка сервера при удалении брони",
    };
    res.status(500).json(response);
  }
};
