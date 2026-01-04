const Users = require('../models/Users');
const Orders = require('../models/Orders');
const Products = require('../models/Products');

/**
 * @method GET
 * @description Get overall dashboard statistics
 * @access Private (Admin only)
 */
async function getDashboardStats(req, res) {
  try {
    const totalUsers = await Users.countDocuments();
    const totalOrders = await Orders.countDocuments();
    const totalProducts = await Products.countDocuments();

    // Calculate total revenue from orders with paymentStatus: 'paid'
    const paidOrders = await Orders.find({
      paymentStatus: 'paid'
    });

    const totalRevenue = paidOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

    // Get latest 5 orders
    const latestOrders = await Orders.find()
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      successful: true,
      data: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue,
        latestOrders
      }
    });

  } catch (error) {
    return res.status(500).json({
      successful: false,
      msg: error.message,
    });
  }
}

module.exports = {
  getDashboardStats,
};
