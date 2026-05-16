const express = require('express');
const { 
  getPayments, 
  getPaymentsByUser, 
  createPayment, 
  createBulkPayments,
  updatePaymentStatus, 
  deletePayment,
  reportPayment
} = require('../controllers/payment.controller.js');
const { upload } = require('../middlewares/uploadMiddleware.js');

const router = express.Router();

router.get('/',           getPayments);
router.get('/user/:userId', getPaymentsByUser);
router.post('/',          createPayment);
router.post('/bulk',      createBulkPayments);
router.post('/:id/report', (req, res, next) => {
  upload.single('receipt')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: "Error al subir comprobante", error: err.message });
    }
    next();
  });
}, reportPayment);
router.put('/:id',        updatePaymentStatus);
router.delete('/:id',     deletePayment);

module.exports = router;
