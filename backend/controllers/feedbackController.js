const FeedbackThread = require('../models/FeedbackThread');
const User = require('../models/User');
const Course = require('../models/Course');

exports.getThread = async (req, res) => {
  const { courseId, studentId } = req.params;
  try {
    let thread = await FeedbackThread.findOne({ course: courseId, student: studentId });
    if (!thread) {
      thread = await FeedbackThread.create({ course: courseId, student: studentId, messages: [] });
    }
    // Obtener info del estudiante
    const student = await User.findById(studentId).select('name username email');
    // Obtener info del docente (teacher) del curso
    const course = await Course.findById(courseId).populate('teacher', 'name username email');
    res.json({
      messages: thread.messages,
      student,
      teacher: course.teacher
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el chat de feedback' });
  }
};

exports.addMessage = async (req, res) => {
  const { courseId, studentId } = req.params;
  const { text, lessonOrder } = req.body;
  const sender = req.user.role;
  if (!text) return res.status(400).json({ error: 'Mensaje vacío' });

  try {
    let thread = await FeedbackThread.findOne({ course: courseId, student: studentId });
    if (!thread) {
      thread = await FeedbackThread.create({ course: courseId, student: studentId, messages: [] });
    }
    thread.messages.push({ sender, text, lessonOrder });
    await thread.save();
    res.json(thread.messages);
  } catch (err) {
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
}; 