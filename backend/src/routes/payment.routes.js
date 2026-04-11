const express = require('express');
const { 
  getPayments, 
  getPaymentsByUser, 
  createPayment, 
  updatePaymentStatus, 
  deletePayment,
  reportPayment
} = require('../controllers/payment.controller.js');
const { upload } = require('../middlewares/uploadMiddleware.js');

const router = express.Router();

router.get('/',           getPayments);
router.get('/user/:userId', getPaymentsByUser);
router.post('/',          createPayment);
router.post('/:id/report', upload.single('receipt'), reportPayment);
router.put('/:id',        updatePaymentStatus);
router.delete('/:id',     deletePayment);

module.exports = router;
