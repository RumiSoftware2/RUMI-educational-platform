const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createPayment,
  getUserPayments,
  checkPaymentStatus,
  getCoursePaymentStats
} = require('../controllers/paymentController');

// Crear un pago
router.post('/', authMiddleware, createPayment);

// Obtener pagos del usuario
router.get('/user', authMiddleware, getUserPayments);

// Verificar estado de pago para un curso
router.get('/course/:courseId/status', authMiddleware, checkPaymentStatus);

// Obtener estadísticas de pagos de un curso (solo para docentes)
router.get('/course/:courseId/stats', authMiddleware, getCoursePaymentStats);

module.exports = router; 