const express = require('express');
const dotenv = require('dotenv');
const app = express();
const PORT = process.env.PORT || 5000;

// Load environment variables
dotenv.config();

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
