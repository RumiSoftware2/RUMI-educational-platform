// controllers/quizController.js

const Quiz = require('../models/Quiz');

// Crear un nuevo quiz
const createQuiz = async (req, res) => {
  try {
    const { title, questions, courseId } = req.body;
    const newQuiz = new Quiz({
      title,
      questions,
      courseId,
      createdBy: req.user._id // Asignar el creador (docente o admin)
    });
    await newQuiz.save();
    res.status(201).json(newQuiz);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear el quiz', error: err.message });
  }
};

// Obtener todos los quizzes
const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener quizzes', error: err.message });
  }
};

// Obtener un quiz por ID
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz no encontrado' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el quiz', error: err.message });
  }
};

// Actualizar un quiz
const updateQuiz = async (req, res) => {
  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedQuiz) return res.status(404).json({ message: 'Quiz no encontrado' });
    res.json(updatedQuiz);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el quiz', error: err.message });
  }
};

// Eliminar un quiz
const deleteQuiz = async (req, res) => {
  try {
    const deletedQuiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!deletedQuiz) return res.status(404).json({ message: 'Quiz no encontrado' });
    res.json({ message: 'Quiz eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el quiz', error: err.message });
  }
};

module.exports = {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz
};
