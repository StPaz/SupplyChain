const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const pool = require('../db');  // Import the pool from db.js
const router = express.Router();

const dotenv = require('dotenv');
// Load environment variables
dotenv.config();

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
    const result = await pool.query(
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

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }
  
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
  
      // Check if user exists and password matches
      if (!user || !await bcrypt.compare(password, user.password_hash)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Generate JWT token
      console.log(process.env.JWT_SECRET);
      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.status(200).json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error logging in' });
    }
  });

router.get('/profile', authenticate, authorizeRoles('Buyer', 'Manufacturer'), (req, res) => {
  res.status(200).json({ message: 'Profile data' });
});

module.exports = router;
