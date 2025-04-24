const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const pool = require('../db');

router.post('/bids', authenticate, authorizeRoles('Manufacturer'), async (req, res) => {
  const { order_id, bid_amount } = req.body;

  // Validate input
  if (!order_id || !bid_amount || bid_amount <= 0) {
    return res.status(400).json({ message: 'Invalid bid data' });
  }

  try {
    // Check if order exists and belongs to a Buyer
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [order_id]);
    if (!orderResult.rows.length) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Place the bid
    const result = await pool.query(
      'INSERT INTO bids (order_id, manufacturer_id, bid_amount) VALUES ($1, $2, $3) RETURNING *',
      [order_id, req.user.userId, bid_amount]
    );

    res.status(201).json({ bid: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error placing bid' });
  }
});

module.exports = router;
