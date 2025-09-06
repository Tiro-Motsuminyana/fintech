const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL
      );
    `);

    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        merchant VARCHAR(255) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        date DATE NOT NULL,
        status VARCHAR(50) NOT NULL,
        recurring BOOLEAN DEFAULT false,
        flagged BOOLEAN DEFAULT false,
        notes TEXT
      );
    `);

    // Create demo user
    const email = 'user@example.com';
    const name = 'Demo User';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const res = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    let userId;
    if (res.rows.length === 0) {
      const userResult = await client.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
        [name, email, hashedPassword]
      );
      userId = userResult.rows[0].id;
    } else {
      userId = res.rows[0].id;
    }

    // Seed transactions for the demo user
    const transactions = [
      { merchant: 'Netflix', amount: -15.49, date: '2024-05-01', status: 'settled', recurring: true, flagged: false, notes: 'Monthly subscription' },
      { merchant: 'Amazon', amount: -150.00, date: '2024-05-10', status: 'pending', recurring: false, flagged: true, notes: 'Waiting for refund' },
      { merchant: 'Salary', amount: 3000.00, date: '2024-05-15', status: 'settled', recurring: true, flagged: false, notes: 'Paycheck' },
    ];

    for (const tx of transactions) {
      await client.query(
        'INSERT INTO transactions (user_id, merchant, amount, date, status, recurring, flagged, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [userId, tx.merchant, tx.amount, tx.date, tx.status, tx.recurring, tx.flagged, tx.notes]
      );
    }

    await client.query('COMMIT');
    console.log('Database seeded successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
  } finally {
    client.release();
  }
}

seed().catch(console.error);