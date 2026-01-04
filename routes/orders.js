const express = require('express');
const router = express.Router();

const orderValidation = require('../middleware/orderValidation');
const { verifyAdmin, authorizingUser } = require('../middleware/verifyUser');
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderByOrderId,
  updateOrder,
} = require('../controllers/orderController.js');

// Create new order
router.post('/', orderValidation, createOrder);

// Get user orders (Logged-in user) - must come before root route
router.get('/my-orders', authorizingUser, getUserOrders);

// Get order by orderId (for tracking - public) - must come before root route
router.get('/track/:orderId', getOrderByOrderId);

// Get all orders (Admin only)
router.get('/', verifyAdmin, getAllOrders);

// Update order status (Admin only)
router.patch('/:id', verifyAdmin, updateOrder);

module.exports = router;
