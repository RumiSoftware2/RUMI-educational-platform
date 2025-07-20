const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const feedbackController = require('../controllers/feedbackController');

// Obtener el chat de feedback
router.get('/course/:courseId/student/:studentId', authMiddleware, feedbackController.getThread);
// Enviar un mensaje al chat
router.post('/course/:courseId/student/:studentId', authMiddleware, feedbackController.addMessage);

module.exports = router; 