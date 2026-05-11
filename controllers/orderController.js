const Orders = require('../models/Orders');
const Users = require('../models/Users');
const Products = require('../models/Products');
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
      } catch (err) {
        return res.status(401).json({ successful: false, msg: 'Unauthorized' });
      }
    }

    const orderData = { ...req.body };
    if (userId) orderData.userId = userId;

    const newOrder = await Orders.create(orderData);
    
    return res.status(201).json({
      successful: true,
      msg: 'Order created successfully',
      data: newOrder,
    });
  } catch (error) {
    return res.status(500).json({ successful: false, msg: error.message });
  }
}

/**
 * @method GET
 * @description This method gets all orders
 * @access Private (Admin only)
 */
async function getAllOrders(req, res) {
  try {
    const orders = await Orders.findAll();
    
    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      if (order.items) {
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        for (let item of items) {
          if (!item.name || !item.price) {
            const product = await Products.findById(item.productId);
            if (product) {
              item.name = item.name || product.title;
              item.price = item.price || product.salePrice || product.price;
            }
          }
        }
        order.items = items;
      }
      return order;
    }));

    return res.status(200).json({ successful: true, data: enrichedOrders });
  } catch (error) {
    return res.status(500).json({ successful: false, msg: error.message });
  }
}

/**
 * @method GET
 * @description This method gets orders for the logged-in user
 * @access Private (User)
 */
async function getUserOrders(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ successful: false, msg: 'Unauthorized' });

    const orders = await Orders.findByUserId(userId);

    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      if (order.items) {
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        for (let item of items) {
          if (!item.name || !item.price) {
            const product = await Products.findById(item.productId);
            if (product) {
              item.name = item.name || product.title;
              item.price = item.price || product.salePrice || product.price;
            }
          }
        }
        order.items = items;
      }
      return order;
    }));

    return res.status(200).json({ successful: true, data: enrichedOrders });
  } catch (error) {
    return res.status(500).json({ successful: false, msg: error.message });
  }
}

/**
 * @method GET
 * @description This method gets an order by id (primary key)
 * @access Public
 */
async function getOrderByOrderId(req, res) {
  try {
    const { orderId } = req.params; // This might be the primary key 'id' in SQL
    const order = await Orders.findById(orderId);

    if (order) {
      if (order.items) {
        order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        for (let item of order.items) {
          if (!item.name || !item.price) {
            const product = await Products.findById(item.productId);
            if (product) {
              item.name = item.name || product.title;
              item.price = item.price || product.salePrice || product.price;
            }
          }
        }
      }
      return res.status(200).json({ successful: true, data: order });
    }

    return res.status(404).json({ successful: false, msg: 'Order not found' });
  } catch (error) {
    return res.status(500).json({ successful: false, msg: error.message });
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
      return res.status(400).json({ successful: false, msg: 'No valid fields to update' });
    }

    const success = await Orders.updateStatus(id, updateData);
    if (!success) return res.status(404).json({ successful: false, msg: 'Order not found' });

    const updatedOrder = await Orders.findById(id);
    return res.status(200).json({ successful: true, msg: 'Order updated successfully', data: updatedOrder });
  } catch (error) {
    return res.status(500).json({ successful: false, msg: error.message });
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderByOrderId,
  updateOrder,
};
