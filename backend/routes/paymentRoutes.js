const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createPaymentIntent,
  createPayment,
  getUserPayments,
  checkPaymentStatus,
  getCoursePaymentStats,
  createTeacherStripeAccount,
  getTeacherBalance
} = require('../controllers/paymentController');

// Crear Payment Intent para Stripe
router.post('/create-intent', authMiddleware, createPaymentIntent);

// Crear un pago
router.post('/', authMiddleware, createPayment);

// Obtener pagos del usuario
router.get('/user', authMiddleware, getUserPayments);

// Verificar estado de pago para un curso
router.get('/course/:courseId/status', authMiddleware, checkPaymentStatus);

// Obtener estadísticas de pagos de un curso (solo para docentes)
router.get('/course/:courseId/stats', authMiddleware, getCoursePaymentStats);

// Crear cuenta de Stripe para docente
router.post('/teacher/stripe-account', authMiddleware, createTeacherStripeAccount);

// Obtener balance del docente
router.get('/teacher/balance', authMiddleware, getTeacherBalance);

module.exports = router; 