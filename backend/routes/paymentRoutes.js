const express = require('express');
const router = express.Router();
const {
  createPayment,
  confirmPayment,
  getStudentPayments,
  getCoursePayments,
  getPaymentStatus,
  hasStudentPaid,
  getTeacherEarnings,
  refundPayment
} = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Crear un pago para un curso (estudiante)
router.post('/courses/:courseId/pay', authMiddleware, checkRole(['estudiante']), createPayment);

// Confirmar pago (webhook del banco)
router.post('/:paymentId/confirm', confirmPayment);

// Obtener historial de pagos del estudiante
router.get('/student/history', authMiddleware, checkRole(['estudiante']), getStudentPayments);

// Obtener pagos de un curso específico (docente)
router.get('/course/:courseId', authMiddleware, checkRole(['docente', 'admin']), getCoursePayments);

// Obtener estado de un pago
router.get('/:paymentId/status', authMiddleware, getPaymentStatus);

// Verificar si un estudiante ha pagado un curso
router.get('/courses/:courseId/has-paid', authMiddleware, checkRole(['estudiante']), hasStudentPaid);

// Obtener ingresos del docente
router.get('/teacher/earnings', authMiddleware, checkRole(['docente']), getTeacherEarnings);

// Reembolsar un pago
router.post('/:paymentId/refund', authMiddleware, checkRole(['docente', 'admin']), refundPayment);

module.exports = router;
