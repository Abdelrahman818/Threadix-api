const Orders = require('../models/Orders');
const Users = require('../models/Users');
const jwt = require('jsonwebtoken');

/**
 * @method POST
 * @description This method creates a new order
 * @access Public
 */
async function createOrder(req, res) {
  try {
    const token = req.cookies?.token;
    let userId = null;

    if (token) {
      try {
        const payload = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
        userId = payload.id;
        console.log('createOrder - User is logged in, userId:', userId);
      } catch (err) {
        console.log('createOrder - Token verification failed:', err.message);
        return res.status(401).json({
          successful: false,
          msg: 'Unauthorized',
        });
      }
    } else {
      console.log('createOrder - No token provided, order will be created without userId');
    }

    const orderData = { ...req.body };
    if (userId) {
      orderData.userId = userId;
      console.log('createOrder - Adding userId to orderData');
    }

    const newOrder = new Orders(orderData);
    await newOrder.save();
    console.log('createOrder - Order saved:', newOrder._id, 'with userId:', newOrder.userId);
    
    return res.status(201).json({
      successful: true,
      msg: 'Order created successfully',
      data: newOrder,
    });
  } catch (error) {
    console.error('createOrder - Error:', error.message);
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

/**
 * @method GET
 * @description This method gets all orders
 * @access Private (Admin only)
 */
async function getAllOrders(req, res) {
  try {
    const orders = await Orders.find().sort({ createdAt: -1 });
    return res.status(200).json({
      successful: true,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

/**
 * @method GET
 * @description This method gets orders for the logged-in user
 * @access Private (User)
 */
async function getUserOrders(req, res) {
  try {
    // Get userId from req.userId (set by authorizingUser middleware)
    const userId = req.userId;
    
    console.log('getUserOrders called - userId:', userId);

    if (!userId) {
      console.log('No userId found in request');
      return res.status(401).json({
        successful: false,
        msg: 'Unauthorized',
      });
    }

    // First, try to find orders by userId
    console.log('Searching for orders with userId:', userId);
    let orders = await Orders.find({ userId }).sort({ createdAt: -1 });
    console.log('Found orders by userId:', orders.length);

    // If no orders found by userId, try to find by user's email (for backwards compatibility)
    if (orders.length === 0) {
      console.log('No orders found by userId, trying to search by email');
      try {
        const user = await Users.findById(userId);
        if (user && user.email) {
          console.log('Found user email:', user.email);
          orders = await Orders.find({ email: user.email }).sort({ createdAt: -1 });
          console.log('Found orders by email:', orders.length);
          
          // Update these orders with userId for future searches
          if (orders.length > 0) {
            console.log('Updating orders with userId for future queries');
            await Orders.updateMany(
              { email: user.email, userId: { $exists: false } },
              { userId: userId }
            );
          }
        }
      } catch (emailError) {
        console.error('Error searching by email:', emailError);
      }
    }

    return res.status(200).json({
      successful: true,
      data: orders,
    });
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

/**
 * @method GET
 * @description This method gets an order by orderId (for tracking)
 * @access Public
 */
async function getOrderByOrderId(req, res) {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({
        successful: false,
        msg: 'Order ID is required',
      });
    }

    const order = await Orders.findOne({ orderId: parseInt(orderId) });

    if (!order) {
      return res.status(404).json({
        successful: false,
        msg: 'Order not found',
      });
    }

    return res.status(200).json({
      successful: true,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

/**
 * @method PATCH
 * @description This method updates an order's status
 * @access Private (Admin only)
 */
async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        successful: false,
        msg: 'No valid fields to update',
      });
    }

    const order = await Orders.findByIdAndUpdate(id, updateData, { new: true });

    if (!order) {
      return res.status(404).json({
        successful: false,
        msg: 'Order not found',
      });
    }

    return res.status(200).json({
      successful: true,
      msg: 'Order updated successfully',
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderByOrderId,
  updateOrder,
};
