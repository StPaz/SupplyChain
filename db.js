// db.js
const { Pool } = require('pg');

// Set up connection to PostgreSQL database
const pool = new Pool({
  user: 'marko',    
  host: 'localhost',        
  database: 'supply_chain', 
  password: 'pass', 
  port: 5432,
});

module.exports = pool;
