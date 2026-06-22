// backend/routes/forumRoutes.js
const express = require('express');
const router = express.Router();
const forumCtrl = require('../controllers/forumController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// GET /api/forum/messages
router.get('/messages', forumCtrl.getMessages);

// GET /api/forum/question
router.get('/question', forumCtrl.getQuestionOfDay);

// DELETE /api/forum/messages/:id (admin only)
router.delete('/messages/:id', authMiddleware, checkRole(['admin']), forumCtrl.deleteMessage);

module.exports = router;
