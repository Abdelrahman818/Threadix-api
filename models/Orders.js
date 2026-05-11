const db = require('../config/db');

class OrdersModel {
  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM orders ORDER BY createdAt DESC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM orders WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByUserId(userId) {
    const [rows] = await db.execute('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC', [userId]);
    return rows;
  }

  static async create(orderData) {
    const { userId, name, email, phone, items, totalPrice, shippingPrice = 0, paymentMethod, paymentStatus = 'unpaid', orderStatus = 'pending', address, note = null } = orderData;
    const [result] = await db.execute(
      'INSERT INTO orders (userId, name, email, phone, items, totalPrice, shippingPrice, paymentMethod, paymentStatus, orderStatus, address, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, email, phone, JSON.stringify(items), totalPrice, shippingPrice, paymentMethod, paymentStatus, orderStatus, address, note]
    );
    return { id: result.insertId, ...orderData };
  }

  static async updateStatus(id, statusData) {
    const fields = Object.keys(statusData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(statusData), id];
    const [result] = await db.execute(`UPDATE orders SET ${fields} WHERE id = ?`, values);
    return result.affectedRows > 0;
  }
}

module.exports = OrdersModel;
