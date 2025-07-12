const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz
} = require('../controllers/quizController');

// Rutas de quizzes con control de roles
router.get('/', authMiddleware, getQuizzes); // Ver todos los quizzes (todos los roles)
router.get('/:id', authMiddleware, getQuizById); // Ver uno por ID

router.post(
  '/',
  authMiddleware,
  authorizeRoles('docente', 'admin'),
  createQuiz
);

router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('docente', 'admin'),
  updateQuiz
);

router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  deleteQuiz
);

module.exports = router;
