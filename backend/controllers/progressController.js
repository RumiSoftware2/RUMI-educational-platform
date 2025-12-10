// controllers/progressController.js
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const User = require('../models/User');

// Obtener progreso propio del estudiante
exports.getOwnProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await Progress.find({ user: userId }).populate('course');
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tu progreso', details: err.message });
  }
};

// Obtener progreso de todos los estudiantes en un curso (solo docentes/admin)
exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Verificar permisos
    if (req.user.role !== 'docente' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const progress = await Progress.find({ course: courseId }).populate('user');
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

// Obtener progreso de un estudiante específico en un curso
exports.getStudentProgressInCourse = async (req, res) => {
  const { courseId, studentId } = req.params;
  try {
    const progress = await Progress.findOne({ course: courseId, user: studentId });
    if (!progress) return res.status(404).json({ error: 'No hay progreso registrado' });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener progreso individual' });
  }
};

// Guardar progreso de una lección (quiz o visualización)
exports.saveLessonProgress = async (req, res) => {
  try {
    const { courseId, lessonOrder } = req.params;
    const { score, quizId, completed } = req.body;
    const userId = req.user.id;

    // Verificar acceso para cursos de pago: si el curso requiere pago y el usuario
    // no está inscrito y no es docente/admin, negar el guardado de progreso.
    try {
      const course = await Course.findById(courseId);
      if (course && course.isPaidCourse) {
        const paidFrom = course.paidFromLesson || 1;
        const isEnrolled = Array.isArray(course.students) && course.students.map(s => String(s)).includes(String(userId));
        const isTeacherOrAdmin = req.user && (req.user.role === 'docente' || req.user.role === 'admin');

        // Normalizar index: si lessonOrder es 0-based, convertir a número humano +1
        const lessonNumber = Number(lessonOrder) + 1;
        if (!isEnrolled && !isTeacherOrAdmin && lessonNumber >= Number(paidFrom)) {
          return res.status(403).json({ message: 'Acceso restringido: este contenido requiere pago' });
        }
      }
    } catch (chkErr) {
      console.error('Error verificando acceso al curso:', chkErr);
      // continuar — si ocurre error en la comprobación, no permitir guardar por seguridad
      return res.status(500).json({ message: 'Error verificando acceso al curso', error: chkErr.message });
    }

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
