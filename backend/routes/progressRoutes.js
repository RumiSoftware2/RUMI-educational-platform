// routes/progressRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getOwnProgress,
  getCourseProgress,
  getAllProgress,
  getStudentProgressInCourse,
  saveLessonProgress
} = require('../controllers/progressController');

router.get('/me', authMiddleware, getOwnProgress); // estudiante obtiene su propio progreso
router.get('/course/:courseId', authMiddleware, getCourseProgress); // docente ve progreso de su curso
router.get('/', authMiddleware, getAllProgress); // admin ve todos los progresos
router.get('/course/:courseId/student/:studentId', authMiddleware, getStudentProgressInCourse); // progreso específico
router.post('/lesson/:courseId/:lessonOrder', authMiddleware, saveLessonProgress); // guardar progreso

module.exports = router;
