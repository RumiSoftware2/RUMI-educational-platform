// controllers/progressController.js
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const User = require('../models/User');

// Estudiante ve su progreso
exports.getOwnProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.id }).populate('course');
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tu progreso' });
  }
};

// Docente ve el progreso de su curso
exports.getCourseProgress = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

    if (req.user.role !== 'docente' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const progress = await Progress.find({ course: course._id }).populate('user');
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener progreso del curso' });
  }
};

// Admin ve todos los progresos
exports.getAllProgress = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'No autorizado' });

  try {
    const progress = await Progress.find().populate('user').populate('course');
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener todos los progresos' });
  }
};
