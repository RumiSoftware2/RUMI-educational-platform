const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.post('/create-transaction', authMiddleware, paymentController.createTransaction);
router.post('/confirm', authMiddleware, paymentController.confirmPayment);
router.get('/user', authMiddleware, paymentController.getUserPayments);
router.get('/course/:courseId/status', authMiddleware, paymentController.checkPaymentStatus);
router.get('/course/:courseId/stats', authMiddleware, paymentController.getCoursePaymentStats);
// Teacher payout endpoints
router.post('/teacher/payout-account', authMiddleware, paymentController.createTeacherPayoutAccount);
router.get('/teacher/balance', authMiddleware, paymentController.getTeacherBalance);
// Admin endpoints to list payout banks/accounts
router.get('/payouts/banks', authMiddleware, checkRole(['admin']), paymentController.getPayoutBanks);
router.get('/payouts/accounts', authMiddleware, checkRole(['admin']), paymentController.getPayoutAccounts);
// Webhook (sin autenticación, verificar origin)
router.post('/webhook', paymentController.handleWompiWebhook);

module.exports = router;
