const Grade = require('../models/Grade');

// Crear una calificación (solo docente o admin)
exports.createGrade = async (req, res) => {
  try {
    const { student, course, quiz, score, feedback } = req.body;

    const grade = new Grade({
      student,
      course,
      quiz,
      score,
      feedback,
      gradedBy: req.user.id
    });

    await grade.save();
    res.status(201).json(grade);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la calificación' });
  }
};

// Ver calificaciones del estudiante autenticado
exports.getMyGrades = async (req, res) => {
  try {
    const grades = await Grade.find({ student: req.user.id }).populate('course quiz');
    res.json(grades);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener calificaciones' });
  }
};

// Ver calificaciones por curso (solo docentes o admin)
exports.getGradesByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const grades = await Grade.find({ course: courseId }).populate('student quiz');
    res.json(grades);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener calificaciones del curso' });
  }
};
