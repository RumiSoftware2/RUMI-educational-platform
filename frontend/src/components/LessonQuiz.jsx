import { useEffect, useState } from 'react';
import { saveLessonProgress } from '../services/api';
import api from '../services/api';

export default function LessonQuiz({ quizId, courseId, lessonOrder, onComplete }) {
  // Si no hay quizId, mostrar mensaje
  if (!quizId) {
    return <div className="text-gray-500 text-center p-4">No hay quiz disponible para esta lección.</div>;
  }

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    api.get(`/quizzes/${quizId}`).then(res => setQuiz(res.data));
  }, [quizId]);

  // Reiniciar estado al cambiar de lección o quiz
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
  if (score !== null) return <div className="text-green-700 font-semibold text-center">{feedback}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-bold mb-2">{quiz.title}</h3>
      {quiz.questions.map((q, idx) => (
        <div key={idx} className="mb-4">
          <div className="font-semibold">{q.questionText}</div>
          <div className="flex flex-col gap-2 mt-2">
            {q.options.map(opt => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`q${idx}`}
                  value={opt}
                  checked={answers[idx] === opt}
                  onChange={() => handleChange(idx, opt)}
                  required
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Enviar Quiz
      </button>
      {feedback && <div className="mt-2 text-green-700">{feedback}</div>}
    </form>
  );
} 