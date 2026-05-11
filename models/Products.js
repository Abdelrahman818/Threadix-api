const db = require('../config/db');

class ProductsModel {
  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM products');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(productData) {
    const { title, desc, category, price, salePrice, stock = true, isFeatured = false, size = [], colors = [], images = [] } = productData;
    const [result] = await db.execute(
      'INSERT INTO products (title, `desc`, category, price, salePrice, stock, isFeatured, size, colors, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, desc, category, price, salePrice, stock, isFeatured, JSON.stringify(size), JSON.stringify(colors), JSON.stringify(images)]
    );
    return { id: result.insertId, ...productData };
  }

  static async update(id, updateData) {
    if (updateData.size) updateData.size = JSON.stringify(updateData.size);
    if (updateData.colors) updateData.colors = JSON.stringify(updateData.colors);
    if (updateData.images) updateData.images = JSON.stringify(updateData.images);

    const fields = Object.keys(updateData).map(key => `\`${key}\` = ?`).join(', ');
    const values = [...Object.values(updateData), id];
    const [result] = await db.execute(`UPDATE products SET ${fields} WHERE id = ?`, values);
    return result.affectedRows > 0;
  }

  static async countByCategory(category) {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM products WHERE category = ?', [category]);
    return rows[0].count;
  }

  static async findByCategory(category) {
    const [rows] = await db.execute('SELECT * FROM products WHERE category = ?', [category]);
    return rows;
  }

  static async findFeatured() {
    const [rows] = await db.execute('SELECT * FROM products WHERE isFeatured = 1');
    return rows;
  }

  static async search(target) {
    const query = `%${target}%`;
    const [rows] = await db.execute(
      'SELECT * FROM products WHERE title LIKE ? OR `desc` LIKE ? OR category LIKE ?',
      [query, query, query]
    );
    return rows;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ProductsModel;
