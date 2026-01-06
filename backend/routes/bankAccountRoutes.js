const express = require('express');
const router = express.Router();
const {
  createOrUpdateBankAccount,
  getBankAccount,
  verifyBankAccount,
  confirmBankAccountVerification,
  getPayoutStatus,
  requestPayout
} = require('../controllers/bankAccountController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Crear o actualizar cuenta bancaria (docente)
router.post('/', authMiddleware, checkRole(['docente', 'admin']), createOrUpdateBankAccount);

// Obtener cuenta bancaria del docente
router.get('/', authMiddleware, checkRole(['docente', 'admin']), getBankAccount);

// Iniciar verificación de cuenta bancaria
router.post('/verify/send-code', authMiddleware, checkRole(['docente', 'admin']), verifyBankAccount);

// Confirmar código de verificación
router.post('/verify/confirm-code', authMiddleware, checkRole(['docente', 'admin']), confirmBankAccountVerification);

// Obtener estado de payouts
router.get('/payouts/status', authMiddleware, checkRole(['docente', 'admin']), getPayoutStatus);

// Solicitar payout
router.post('/payouts/request', authMiddleware, checkRole(['docente', 'admin']), requestPayout);

module.exports = router;
