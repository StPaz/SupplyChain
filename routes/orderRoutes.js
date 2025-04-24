const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const pool = require('../db'); 


router.post('/orders', authenticate, authorizeRoles('Buyer'), async (req, res) => {
  const { product, quantity, price } = req.body;

  // Input validation
  if (!product || !quantity || !price) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Insert the order into the database
    const result = await pool.query(
        'INSERT INTO orders (buyer_id, product, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
        [req.user.userId, product, quantity, price]
      );

      const order = result.rows[0];  // The newly inserted order

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        id: order.id,
        product: order.product,
        quantity: order.quantity,
        price: order.price,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error placing order' });
  }
});

router.get('/orders', authenticate, authorizeRoles('Manufacturer'), async (req, res) => {
    try {
        // Fetch all orders from the database (you could filter based on status or other criteria if needed)
        const result = await pool.query('SELECT * FROM orders WHERE status = $1', ['Pending']);

        const orders = result.rows;  // All pending orders

        if (orders.length === 0) {
        return res.status(404).json({ message: 'No pending orders found' });
        }

        res.status(200).json({ orders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching orders' });
    }
  });

// PUT /orders/:id - For Manufacturers to update order status (e.g., mark as completed)
router.put('/orders/:id', authenticate, authorizeRoles('Manufacturer'), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    if (!status || !['Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Valid statuses are "Completed" or "Cancelled"' });
    }
  
    try {
      // Update the order status
      const result = await pool.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, id]
      );
  
      const order = result.rows[0];
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      res.status(200).json({
        message: 'Order status updated successfully',
        order: {
          id: order.id,
          product: order.product,
          quantity: order.quantity,
          price: order.price,
          status: order.status,
          created_at: order.created_at,
          updated_at: order.updated_at,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating order status' });
    }
  });
  

module.exports = router;
