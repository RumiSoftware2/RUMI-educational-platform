// models/Quiz.js

const mongoose = require('mongoose');

// Sub-esquema para preguntas
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }], // Opciones posibles
  correctAnswer: { type: String, required: true } // Respuesta correcta
});

// Esquema principal de Quiz
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  questions: [questionSchema], // Lista de preguntas
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('Quiz', quizSchema);
