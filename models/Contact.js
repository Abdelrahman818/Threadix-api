const db = require('../config/db');

class ContactModel {
  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM contacts ORDER BY createdAt DESC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM contacts WHERE id = ?', [id]);
    return rows[0];
  }

  static async find(query = {}) {
    // Basic implementation for find based on isRead or other simple fields
    let sql = 'SELECT * FROM contacts';
    const params = [];
    const keys = Object.keys(query);
    
    if (keys.length > 0) {
      sql += ' WHERE ' + keys.map(key => `${key} = ?`).join(' AND ');
      params.push(...Object.values(query));
    }
    
    sql += ' ORDER BY createdAt DESC';
    const [rows] = await db.execute(sql, params);
    return rows;
  }

  static async search(target) {
    const sql = `
      SELECT * FROM contacts 
      WHERE name LIKE ? 
      OR email LIKE ? 
      OR subj LIKE ? 
      OR phone LIKE ? 
      ORDER BY createdAt DESC
    `;
    const searchVal = `%${target}%`;
    const [rows] = await db.execute(sql, [searchVal, searchVal, searchVal, searchVal]);
    return rows;
  }

  static async create(contactData) {
    const { 
      name, email, subj, msg, phone, address, 
      isAdmin = false, isLoggedIn = false, isRead = false 
    } = contactData;

    const [result] = await db.execute(
      `INSERT INTO contacts (name, email, subj, msg, phone, address, isAdmin, isLoggedIn, isRead) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, subj, msg, phone, address, isAdmin, isLoggedIn, isRead]
    );
    return { id: result.insertId, ...contactData };
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), id];
    const [result] = await db.execute(`UPDATE contacts SET ${fields} WHERE id = ?`, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM contacts WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ContactModel;
