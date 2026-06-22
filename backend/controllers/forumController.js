// backend/controllers/forumController.js
const ForumMessage = require('../models/ForumMessage');

exports.getMessages = async (req, res) => {
  try {
    const docs = await ForumMessage.find({}).sort({ createdAt: -1 }).limit(100).lean();
    // devolver en orden ascendente (antiguos -> recientes)
    res.json(docs.reverse());
  } catch (err) {
    console.error('Error getMessages', err);
    res.status(500).json({ message: 'Error al obtener mensajes' });
  }
};

exports.getQuestionOfDay = async (req, res) => {
  try {
    const q = await ForumMessage.findOne({ type: 'question_of_day' }).sort({ createdAt: -1 }).lean();
    if (!q) return res.json({ question: null });
    res.json({ question: q.content });
  } catch (err) {
    console.error('Error getQuestionOfDay', err);
    res.status(500).json({ message: 'Error al obtener pregunta del día' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const id = req.params.id;
    await ForumMessage.findByIdAndDelete(id);
    res.json({ message: 'Eliminado' });
  } catch (err) {
    console.error('Error deleteMessage', err);
    res.status(500).json({ message: 'Error al eliminar mensaje' });
  }
};
