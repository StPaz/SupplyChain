const express = require('express');

const dotenv = require('dotenv');
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const { Client } = require('pg');
const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});



// Middleware
app.use(express.json()); // For parsing JSON requests

// Simple route for testing
app.get('/', (req, res) => {
  res.send('Welcome to SupplyChain Connect API!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

client.connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Error connecting to database', err));
