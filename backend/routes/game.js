const express = require('express');
const router = express.Router();
const { startSession, getUserStats, getAllStats } = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Iniciar y guardar resultados de juego
router.post('/sessions', authMiddleware, startSession);

// Obtener estadísticas propias
outer.get('/sessions/me', authMiddleware, getUserStats);

// Admin: ver todas las sesiones
router.get('/sessions', authMiddleware, checkRole(['admin']), getAllStats);

module.exports = router;

// backend/server.js (fragmento de integración de rutas)
const gamesRouter = require('./routes/games');
app.use('/api/games', gamesRouter);
