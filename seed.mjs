import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('data.sqlite', { verbose: console.log });

function seed() {
  try {
    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);

    // Create transactions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'completed',
        flagged BOOLEAN NOT NULL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // Seed demo user
    const email = 'user@example.com';
    const password = 'password123';
    const hashedPassword = bcrypt.hashSync(password, 10);

    const checkUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!checkUser) {
      const insertUser = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
      const info = insertUser.run(email, hashedPassword);
      console.log(`Seeded user: ${email}`, info);

      const userId = info.lastInsertRowid;

      // Seed sample transactions for the demo user
      const transactions = [
        { amount: -50.0, date: '2024-07-01', description: 'Groceries' },
        { amount: 2000.0, date: '2024-07-05', description: 'Paycheck' },
        { amount: -15.0, date: '2024-07-10', description: 'Coffee', flagged: true },
        { amount: -100.0, date: '2024-07-15', description: 'Dinner', status: 'pending' },
      ];

      const insertTransaction = db.prepare('INSERT INTO transactions (user_id, amount, date, description, status, flagged) VALUES (?, ?, ?, ?, ?, ?)');
      for (const t of transactions) {
        insertTransaction.run(userId, t.amount, t.date, t.description, t.status || 'completed', t.flagged ? 1 : 0);
      }
      console.log('Seeded sample transactions.');
    } else {
      console.log('Demo user already exists.');
    }

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    db.close();
  }
}

seed();