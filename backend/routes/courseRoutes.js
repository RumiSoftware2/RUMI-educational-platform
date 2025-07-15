const express = require('express');
const router = express.Router();
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getMyCourses,
  getEnrolledCourses,
  getAllCourses,
  enrollInCourse,
  getCourseStatistics,
  getEnrolledStudents
} = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Crear curso (solo docentes y admins)
router.post('/', authMiddleware, checkRole(['docente', 'admin']), createCourse);

// Obtener todos los cursos (público)
router.get('/', getCourses);

// Listar cursos creados por el docente autenticado
router.get('/mine', authMiddleware, checkRole(['docente']), getMyCourses);

// Listar cursos en los que el estudiante está inscrito
router.get('/enrolled', authMiddleware, checkRole(['estudiante']), getEnrolledCourses);

// Listar todos los cursos (admin)
router.get('/all', authMiddleware, checkRole(['admin']), getAllCourses);

// Inscribir estudiante a un curso
router.post('/:id/enroll', authMiddleware, checkRole(['estudiante']), enrollInCourse);

// Obtener estadísticas de un curso (docente o admin)
router.get('/:id/statistics', authMiddleware, checkRole(['docente', 'admin']), getCourseStatistics);

// Actualizar curso (solo docentes y admins)
router.put('/:id', authMiddleware, checkRole(['docente', 'admin']), updateCourse);

// Eliminar curso (solo docentes y admins)
router.delete('/:id', authMiddleware, checkRole(['docente', 'admin']), deleteCourse);

// Obtener curso por ID (público)
router.get('/:id', getCourseById);

// Obtener la lista de estudiantes inscritos a un curso (público)
router.get('/:id/students', getEnrolledStudents);

module.exports = router;

