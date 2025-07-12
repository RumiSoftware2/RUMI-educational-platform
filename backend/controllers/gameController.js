// backend/controllers/gameController.js
const GameSession = require('../models/GameSession');

// Iniciar y guardar resultados de una partida
const startSession = async (req, res) => {
  try {
    const { game, stats } = req.body;
    if (!game || !stats) {
      return res.status(400).json({ message: 'Faltan datos del juego' });
    }

    const session = new GameSession({
      user: req.user.id,
      game,
      stats
    });
    const saved = await session.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating game session', error);
    res.status(500).json({ message: 'Error al guardar la sesión de juego' });
  }
};

// Obtener estadísticas de usuario (agrupadas)
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await GameSession.find({ user: userId });
    // Agrupar por juego
    const statsByGame = {};
    sessions.forEach(sess => {
      if (!statsByGame[sess.game]) statsByGame[sess.game] = [];
      statsByGame[sess.game].push(sess.stats);
    });
    res.json(statsByGame);
  } catch (error) {
    console.error('Error fetching user stats', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de usuario' });
  }
};

// (Admin) Obtener todas las estadísticas
const getAllStats = async (req, res) => {
  try {
    const sessions = await GameSession.find().populate('user', 'username email');
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching all stats', error);
    res.status(500).json({ message: 'Error al obtener estadísticas globales' });
  }
};

module.exports = { startSession, getUserStats, getAllStats };
