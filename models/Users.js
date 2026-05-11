const db = require('../config/db');

class UsersModel {
  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async create(userData) {
    const { name, email, pwd, isAdmin = false, phone = null, address = null } = userData;
    const [result] = await db.execute(
      'INSERT INTO users (name, email, pwd, isAdmin, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, pwd, isAdmin, phone, address]
    );
    return { id: result.insertId, ...userData };
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), id];
    const [result] = await db.execute(`UPDATE users SET ${fields} WHERE id = ?`, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = UsersModel;
