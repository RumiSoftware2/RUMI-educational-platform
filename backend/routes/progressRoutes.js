// routes/progressRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getOwnProgress,
  getCourseProgress,
  getAllProgress
} = require('../controllers/progressController');

router.get('/me', authMiddleware, getOwnProgress); // estudiante
router.get('/course/:courseId', authMiddleware, getCourseProgress); // docente
router.get('/', authMiddleware, getAllProgress); // admin

module.exports = router;
