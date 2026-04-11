const db = require('../config/db.js');

// ─── GET ALL PAYMENTS ─────────────────────────────────────────────────────────
const getPayments = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.name as parent_name, u.email as parent_email, c.name as category_name
      FROM payments p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.due_date DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error('[getPayments]', error);
    res.status(500).json({ message: "Error al obtener pagos", error: error.message });
  }
};

// ─── GET PAYMENTS BY USER ─────────────────────────────────────────────────────
const getPaymentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db.query(`
      SELECT * FROM payments 
      WHERE user_id = ? 
      ORDER BY due_date DESC
    `, [userId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('[getPaymentsByUser]', error);
    res.status(500).json({ message: "Error al obtener pagos del usuario", error: error.message });
  }
};

// ─── CREATE PAYMENT (DUE) ─────────────────────────────────────────────────────
const createPayment = async (req, res) => {
  try {
    const { user_id, amount, description, due_date, category_id } = req.body;

    if (!user_id || !amount || !description || !due_date) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const [result] = await db.query(
      `INSERT INTO payments (user_id, amount, description, due_date, status, category_id)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [user_id, amount, description, due_date, category_id || null]
    );

    res.status(201).json({ id: result.insertId, message: "Cargo generado exitosamente" });
  } catch (error) {
    console.error('[createPayment]', error);
    res.status(500).json({ message: "Error al generar cargo", error: error.message });
  }
};

// ─── UPDATE PAYMENT STATUS (MARK AS PAID) ─────────────────────────────────────
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_method, paid_at } = req.body;

    const [existing] = await db.query('SELECT id FROM payments WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: "Pago no encontrado" });

    // paid_at might be NOW() if not provided
    const paidAtValue = status === 'paid' ? (paid_at || new Date()) : null;

    await db.query(
      `UPDATE payments SET status = ?, payment_method = ?, paid_at = ?
       WHERE id = ?`,
      [status, payment_method || null, paidAtValue, id]
    );

    res.status(200).json({ message: "Pago actualizado correctamente" });
  } catch (error) {
    console.error('[updatePaymentStatus]', error);
    res.status(500).json({ message: "Error al actualizar pago", error: error.message });
  }
};

// ─── DELETE PAYMENT ───────────────────────────────────────────────────────────
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM payments WHERE id = ?', [id]);
    res.status(200).json({ message: "Pago eliminado correctamente" });
  } catch (error) {
    console.error('[deletePayment]', error);
    res.status(500).json({ message: "Error al eliminar pago", error: error.message });
  }
};

// ─── REPORT PAYMENT (BY PARENT) ───────────────────────────────────────────────
const reportPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body;
    let receipt_url = null;

    if (req.file) {
      receipt_url = `/uploads/images/${req.file.filename}`;
    }

    if (!payment_method) {
      return res.status(400).json({ message: "El método de pago es obligatorio" });
    }

    const [existing] = await db.query('SELECT id FROM payments WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: "Pago no encontrado" });

    // Update with receipt and method, set status to 'validating'
    await db.query(
      `UPDATE payments SET payment_method = ?, receipt_url = ?, status = 'validating'
       WHERE id = ?`,
      [payment_method, receipt_url, id]
    );

    res.status(200).json({ message: "Pago reportado exitosamente. En espera de validación." });
  } catch (error) {
    console.error('[reportPayment]', error);
    res.status(500).json({ message: "Error al reportar pago", error: error.message });
  }
};

module.exports = {
  getPayments,
  getPaymentsByUser,
  createPayment,
  updatePaymentStatus,
  deletePayment,
  reportPayment
};
