const express = require('express');
const router = express.Router();
const {
  createGrade,
  getMyGrades,
  getGradesByCourse
} = require('../controllers/gradeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Ruta para que docentes o admin creen calificaciones
router.post('/', authMiddleware, roleMiddleware(['docente', 'admin']), createGrade);

// Ruta para que el estudiante vea sus propias calificaciones
router.get('/my', authMiddleware, getMyGrades);

// Ruta para ver calificaciones de un curso (docente o admin)
router.get('/course/:courseId', authMiddleware, roleMiddleware(['docente', 'admin']), getGradesByCourse);

module.exports = router;
