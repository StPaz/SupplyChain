const express = require('express');
const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const router = express.Router();

const dotenv = require('dotenv');
// Load environment variables
dotenv.config();

const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

//client.connect();

router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  // Validate input
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await client.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
      [email, passwordHash, role]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
   // Handle database connection or query error
    if (err.code === 'ECONNREFUSED') {
      // Database connection issue
      return res.status(500).json({ message: 'Error connecting to the database' });
    }
    res.status(500).json({ message: 'Error registering user' });
  }
});

module.exports = router;
