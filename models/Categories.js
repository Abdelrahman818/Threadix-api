const db = require('../config/db');

class CategoriesModel {
  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM categories');
    return rows;
  }

  static async create(categoryData) {
    const { name, imgUrl = null, isActive = true } = categoryData;
    const [result] = await db.execute(
      'INSERT INTO categories (name, imgUrl, isActive) VALUES (?, ?, ?)',
      [name, imgUrl, isActive]
    );
    return { id: result.insertId, ...categoryData };
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), id];
    const [result] = await db.execute(`UPDATE categories SET ${fields} WHERE id = ?`, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = CategoriesModel;
