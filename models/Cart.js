const db = require('../config/db');

class CartModel {
  static async findByUserId(userId) {
    const [rows] = await db.execute('SELECT * FROM carts WHERE userId = ?', [userId]);
    return rows[0];
  }

  static async createOrUpdate(userId, items) {
    const existing = await this.findByUserId(userId);
    if (existing) {
      await db.execute('UPDATE carts SET items = ? WHERE userId = ?', [JSON.stringify(items), userId]);
      return { userId, items };
    } else {
      await db.execute('INSERT INTO carts (userId, items) VALUES (?, ?)', [userId, JSON.stringify(items)]);
      return { userId, items };
    }
  }

  static async delete(userId) {
    const [result] = await db.execute('DELETE FROM carts WHERE userId = ?', [userId]);
    return result.affectedRows > 0;
  }
}

module.exports = CartModel;
