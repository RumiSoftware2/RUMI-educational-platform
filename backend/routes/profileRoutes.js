const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Rutas privadas (Docente)
router.get('/me', verifyToken, profileController.getOwnProfile);
router.put('/me', verifyToken, checkRole(['docente']), profileController.upsertOwnProfile);

// Ruta pública
router.get('/public/:slug', profileController.getProfileBySlug);

module.exports = router;
