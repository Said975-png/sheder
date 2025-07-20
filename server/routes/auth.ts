import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { dbQueries } from "../database";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
const JWT_EXPIRES_IN = "7d";

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
});

const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Пароль обя��ателен"),
});

// Response interfaces
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    email: string;
    name: string;
  };
  token?: string;
}

// Registration endpoint
export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await dbQueries.getUserByEmail(email);
    if (existingUser) {
      const response: AuthResponse = {
        success: false,
        message: "Пользователь с таким email уже существует"
      };
      return res.status(400).json(response);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
    let userId: number;
    try {
      userId = await dbQueries.createUser(email, hashedPassword, name);
    } catch (dbError: any) {
      console.error('Database error during user creation:', dbError);

      // Handle SQLite unique constraint violation
      if (dbError.code === 'SQLITE_CONSTRAINT_UNIQUE' || dbError.message?.includes('UNIQUE constraint failed')) {
        const response: AuthResponse = {
          success: false,
          message: "Пользователь с таким email уже существует"
        };
        return res.status(400).json(response);
      }

      throw dbError; // Re-throw other database errors
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Save session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await dbQueries.saveSession(userId, token, expiresAt);

    const response: AuthResponse = {
      success: true,
      message: "Регистрация прошла успешно",
      user: {
        id: userId,
        email,
        name
      },
      token
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      const response: AuthResponse = {
        success: false,
        message: error.errors[0].message
      };
      return res.status(400).json(response);
    }

    const response: AuthResponse = {
      success: false,
      message: "Ошибка при регистрации"
    };
    res.status(500).json(response);
  }
};

// Login endpoint
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Get user by email
    const user = await dbQueries.getUserByEmail(email);
    if (!user) {
      const response: AuthResponse = {
        success: false,
        message: "Неверный email или пароль"
      };
      return res.status(401).json(response);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const response: AuthResponse = {
        success: false,
        message: "Неверный email или пароль"
      };
      return res.status(401).json(response);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Save session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await dbQueries.saveSession(user.id, token, expiresAt);

    const response: AuthResponse = {
      success: true,
      message: "Вход вып��лнен успешно",
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      const response: AuthResponse = {
        success: false,
        message: error.errors[0].message
      };
      return res.status(400).json(response);
    }

    const response: AuthResponse = {
      success: false,
      message: "Ошибка при входе"
    };
    res.status(500).json(response);
  }
};

// Logout endpoint
export const handleLogout: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      await dbQueries.deleteSession(token);
    }

    const response: AuthResponse = {
      success: true,
      message: "Выход выполнен успешно"
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Logout error:', error);
    
    const response: AuthResponse = {
      success: false,
      message: "Ошибка при выходе"
    };
    res.status(500).json(response);
  }
};

// Get current user endpoint
export const handleGetCurrentUser: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      const response: AuthResponse = {
        success: false,
        message: "Токен не найден"
      };
      return res.status(401).json(response);
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      const response: AuthResponse = {
        success: false,
        message: "Недействительный токен"
      };
      return res.status(401).json(response);
    }

    // Check if session exists in database
    const userId = await dbQueries.isValidSession(token);
    if (!userId) {
      const response: AuthResponse = {
        success: false,
        message: "Сессия истекла"
      };
      return res.status(401).json(response);
    }

    // Get user details
    const user = await dbQueries.getUserById(userId);
    if (!user) {
      const response: AuthResponse = {
        success: false,
        message: "Пользователь не найден"
      };
      return res.status(404).json(response);
    }

    const response: AuthResponse = {
      success: true,
      message: "Пользователь найден",
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get current user error:', error);
    
    const response: AuthResponse = {
      success: false,
      message: "Ошибка при получении данных пользователя"
    };
    res.status(500).json(response);
  }
};
