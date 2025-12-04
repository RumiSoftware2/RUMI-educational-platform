const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create-transaction', authMiddleware, paymentController.createTransaction);
router.post('/confirm', authMiddleware, paymentController.confirmPayment);
router.get('/user', authMiddleware, paymentController.getUserPayments);
router.get('/course/:courseId/status', authMiddleware, paymentController.checkPaymentStatus);
router.get('/course/:courseId/stats', authMiddleware, paymentController.getCoursePaymentStats);
// teacher payout endpoints would be added here later

module.exports = router;
