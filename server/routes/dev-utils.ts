import { RequestHandler } from "express";
import { db } from "../database";

// Development utility to clear test data
export const handleClearDatabase: RequestHandler = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      success: false, 
      message: "Not allowed in production" 
    });
  }

  try {
    // Clear user sessions first (foreign key constraint)
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM user_sessions', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Clear users
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM users', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Reset auto-increment
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM sqlite_sequence WHERE name="users"', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM sqlite_sequence WHERE name="user_sessions"', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('✅ Database cleared for testing');
    res.json({ 
      success: true, 
      message: "Database cleared successfully" 
    });
  } catch (error) {
    console.error('Error clearing database:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error clearing database" 
    });
  }
};

// Get database stats
export const handleDatabaseStats: RequestHandler = async (req, res) => {
  try {
    const userCount = await new Promise<number>((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users', (err, row: { count: number }) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    const sessionCount = await new Promise<number>((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM user_sessions', (err, row: { count: number }) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    res.json({
      success: true,
      users: userCount,
      sessions: sessionCount
    });
  } catch (error) {
    console.error('Error getting database stats:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error getting database stats" 
    });
  }
};
