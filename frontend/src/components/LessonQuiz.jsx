import { useEffect, useState } from 'react';
import { saveLessonProgress } from '../services/api';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import logo1 from '../assets/logo1zeus.png';
import logo2 from '../assets/logo2zeus.png';
import logo3 from '../assets/logo3zeus.png';

const LOGOS = [logo1, logo2, logo3];
const COLORS = ['#2ca6e0', '#ffd700', '#0a2342', '#34d399', '#f59e42'];

export default function LessonQuiz({ quizId, courseId, lessonOrder, onComplete }) {
  if (!quizId) {
    return <div className="text-gray-500 text-center p-4">No hay quiz disponible para esta lección.</div>;
  }

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [logoIdx] = useState(Math.floor(Math.random() * LOGOS.length));

  useEffect(() => {
    api.get(`/quizzes/${quizId}`).then(res => setQuiz(res.data));
  }, [quizId]);

  useEffect(() => {
    setAnswers({});
    setScore(null);
    setFeedback('');
  }, [quizId, lessonOrder, courseId]);

  const handleChange = (qIdx, value) => {
    setAnswers({ ...answers, [qIdx]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quiz) return;
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correct++;
    });
    const scoreValue = Math.round((correct / quiz.questions.length) * 100);
    setScore(scoreValue);

    try {
      await saveLessonProgress(courseId, lessonOrder, { score: scoreValue, quizId, completed: true });
      setFeedback(`¡Progreso guardado! Puntuación: ${scoreValue}`);
      if (onComplete) onComplete(scoreValue);
    } catch {
      setFeedback('Error al guardar el progreso');
    }
  };

  if (!quiz) return <div>Cargando quiz...</div>;
  if (score !== null) return (
    <motion.div
      className="text-green-700 font-semibold text-center flex flex-col items-center gap-2 animate-fade-in"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <img src={LOGOS[logoIdx]} alt="logo decorativo" className="w-16 h-16 mx-auto mb-2 animate-pulse" />
      <span className="text-2xl font-bold">{feedback}</span>
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6 bg-gradient-to-br from-blue-50 via-yellow-50 to-green-50 rounded-2xl shadow-xl p-6 border border-blue-100 relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.5 }}
      >
        <img src={LOGOS[logoIdx]} alt="logo decorativo" className="w-14 h-14 absolute -top-7 left-1/2 -translate-x-1/2 rounded-full shadow-lg border-2 border-blue-200 bg-white animate-bounce" />
        <h3 className="text-lg font-bold mb-2 text-center text-blue-900 drop-shadow animate-fade-in">{quiz.title}</h3>
        {quiz.questions.map((q, idx) => (
          <motion.div key={idx} className="mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * idx }}>
            <div className="font-semibold text-blue-800 mb-2">{q.questionText}</div>
            <div className="flex flex-col gap-2 mt-2">
              {q.options.map((opt, oidx) => (
                <motion.label
                  key={opt}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition-all duration-200 shadow-sm
                    ${answers[idx] === opt ? 'bg-gradient-to-r from-green-200 to-blue-100 border-blue-400 scale-105 ring-2 ring-blue-300' : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300'}
                  `}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    name={`q${idx}`}
                    value={opt}
                    checked={answers[idx] === opt}
                    onChange={() => handleChange(idx, opt)}
                    required
                    className="accent-blue-600 w-4 h-4"
                  />
                  <span className="text-gray-800 text-base">{opt}</span>
                </motion.label>
              ))}
            </div>
          </motion.div>
        ))}
        <motion.button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-green-400 text-white px-6 py-2 rounded-xl font-bold text-lg shadow-lg hover:from-green-500 hover:to-blue-700 transition-all duration-300 w-full mt-4 animate-fade-in"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          Enviar Quiz
        </motion.button>
        {feedback && <div className="mt-2 text-green-700 animate-fade-in text-center">{feedback}</div>}
      </motion.form>
    </AnimatePresence>
  );
} 