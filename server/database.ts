import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.db');

// Create and initialize database
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('✅ Users table ready');
    }
  });

  // Create user_sessions table for JWT tokens
  db.run(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('Error creating sessions table:', err);
    } else {
      console.log('✅ Sessions table ready');
    }
  });
}

// User interface
export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithPassword extends User {
  password: string;
}

// Database helper functions
export const dbQueries = {
  // Get user by email
  getUserByEmail: (email: string): Promise<UserWithPassword | null> => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row: UserWithPassword) => {
          if (err) reject(err);
          else resolve(row || null);
        }
      );
    });
  },

  // Get user by ID
  getUserById: (id: number): Promise<User | null> => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?',
        [id],
        (err, row: User) => {
          if (err) reject(err);
          else resolve(row || null);
        }
      );
    });
  },

  // Create new user
  createUser: (email: string, hashedPassword: string, name: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [email, hashedPassword, name],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  // Save session token
  saveSession: (userId: number, token: string, expiresAt: Date): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt.toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  // Delete session token
  deleteSession: (token: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM user_sessions WHERE token = ?',
        [token],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  // Check if session exists and is valid
  isValidSession: (token: string): Promise<number | null> => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT user_id FROM user_sessions WHERE token = ? AND expires_at > datetime("now")',
        [token],
        (err, row: { user_id: number }) => {
          if (err) reject(err);
          else resolve(row?.user_id || null);
        }
      );
    });
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
