// routes/progressRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getOwnProgress,
  getCourseProgress,
  getAllProgress,
  saveLessonProgress
} = require('../controllers/progressController');

router.get('/me', authMiddleware, getOwnProgress); // estudiante
router.get('/course/:courseId', authMiddleware, getCourseProgress); // docente
router.get('/', authMiddleware, getAllProgress); // admin
router.get('/course/:courseId/student/:studentId', authMiddleware, require('../controllers/progressController').getStudentProgressInCourse);
// Guardar progreso de una lección (quiz o visualización)
router.post('/lesson/:courseId/:lessonOrder', authMiddleware, saveLessonProgress);

module.exports = router;
