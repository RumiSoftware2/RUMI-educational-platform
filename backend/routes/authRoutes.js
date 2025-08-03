const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  verifyEmail, 
  resendVerificationCode,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyPasswordResetCode,
  googleAuth,
  googleCallback,
  verifyGoogleToken
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para registrar usuarios
router.post('/register', register);

// Ruta para iniciar sesión
router.post('/login', login);

// Rutas para verificación de email
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);

// Rutas para recuperación de contraseña
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-reset-code', verifyPasswordResetCode);

// Ruta para cambiar contraseña (requiere autenticación)
router.post('/change-password', authMiddleware, changePassword);

// Rutas para Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.post('/google/verify', verifyGoogleToken);

module.exports = router;
