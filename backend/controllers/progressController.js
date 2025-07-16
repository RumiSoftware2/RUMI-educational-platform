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

// Guardar progreso de una lección (quiz o visualización)
exports.saveLessonProgress = async (req, res) => {
  try {
    const { courseId, lessonOrder } = req.params;
    const { score, quizId, completed } = req.body;
    const userId = req.user.id;

    let progress = await Progress.findOne({ user: userId, course: courseId });
    if (!progress) {
      progress = new Progress({ user: userId, course: courseId });
    }

    // Guardar score de quiz o de visualización
    if (quizId) {
      progress.quizScores.set(quizId, score);
    } else {
      // Usar una clave especial para score por visualización
      progress.quizScores.set(`lesson-${lessonOrder}`, score);
    }

    // Marcar lección como completada si corresponde
    if (completed && !progress.completedLessons.includes(lessonOrder)) {
      progress.completedLessons.push(lessonOrder);
    }

    progress.lastAccessed = new Date();
    await progress.save();

    res.json({ message: 'Progreso guardado', progress });
  } catch (err) {
    res.status(500).json({ message: 'Error al guardar progreso', error: err.message });
  }
};
