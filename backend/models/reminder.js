const pool = require('../config/db');

class Reminder {
  static async create(reminderData) {
    const [result] = await pool.query(
      `INSERT INTO recordatorios SET ?`, 
      reminderData
    );
    return result.insertId;
  }

  static async findByUser(userId) {
    const [rows] = await pool.query(
      `SELECT * FROM recordatorios WHERE id_usuario = ? AND estado = 'activo'`,
      [userId]
    );
    return rows;
  }

  static async update(id, reminderData) {
    const [result] = await pool.query(
      `UPDATE recordatorios SET ? WHERE id_recordatorio = ?`,
      [reminderData, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.query(
      `DELETE FROM recordatorios WHERE id_recordatorio = ?`,
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = Reminder;