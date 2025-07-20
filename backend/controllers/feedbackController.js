const FeedbackThread = require('../models/FeedbackThread');

exports.getThread = async (req, res) => {
  const { courseId, studentId } = req.params;
  try {
    let thread = await FeedbackThread.findOne({ course: courseId, student: studentId });
    if (!thread) {
      thread = await FeedbackThread.create({ course: courseId, student: studentId, messages: [] });
    }
    res.json(thread.messages);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el chat de feedback' });
  }
};

exports.addMessage = async (req, res) => {
  const { courseId, studentId } = req.params;
  const { text } = req.body;
  const sender = req.user.role;
  if (!text) return res.status(400).json({ error: 'Mensaje vacío' });

  try {
    let thread = await FeedbackThread.findOne({ course: courseId, student: studentId });
    if (!thread) {
      thread = await FeedbackThread.create({ course: courseId, student: studentId, messages: [] });
    }
    thread.messages.push({ sender, text });
    await thread.save();
    res.json(thread.messages);
  } catch (err) {
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
}; 