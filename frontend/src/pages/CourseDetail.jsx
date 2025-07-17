import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import EnrolledStudentsList from '../components/EnrolledStudentsList';
import { saveLessonProgress } from '../services/api';
import LessonQuiz from '../components/LessonQuiz';
import { createQuiz } from '../services/api';

// Función para convertir cualquier URL de YouTube a formato embed
function toYoutubeEmbed(url) {
  if (!url) return '';
  // Caso 1: Formato largo
  let match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([\w-]+)/);
  if (match) {
    const videoId = match[1];
    const listMatch = url.match(/[?&]list=([\w-]+)/);
    return `https://www.youtube.com/embed/${videoId}` + (listMatch ? `?list=${listMatch[1]}` : '');
  }
  // Caso 2: Formato corto (compartir)
  match = url.match(/(?:https?:\/\/)?youtu\.be\/([\w-]+)/);
  if (match) {
    const videoId = match[1];
    // Si hay parámetros extra, los puedes conservar si quieres
    const params = url.split('?')[1];
    return `https://www.youtube.com/embed/${videoId}` + (params ? `?${params}` : '');
  }
  // Si no es YouTube, devolver la URL original
  return url;
}

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lessons, setLessons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [lessonForm, setLessonForm] = useState({ order: 1, title: '', description: '', videoUrl: '' });
  const [message, setMessage] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [showStudentView, setShowStudentView] = useState(null); // index of lesson to show as student
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  // Mover hooks aquí
  const [videoWatched, setVideoWatched] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [quizForm, setQuizForm] = useState({ title: '', questions: [] });
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({ questionText: '', options: ['', ''], correctAnswer: '' });
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [editCourseForm, setEditCourseForm] = useState({ title: '', videoUrl: '', description: '' });
  const [editCourseLoading, setEditCourseLoading] = useState(false);
  const [editCourseMsg, setEditCourseMsg] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data);
        setLessons(res.data.lessons || []);
      } catch (err) {
        setError('Error al cargar el curso');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (showForm && editingIndex === null) {
      setLessonForm(form => ({ ...form, order: lessons.length + 1 }));
    }
  }, [showForm, lessons.length, editingIndex]);

  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      try {
        const res = await api.get(`/courses/${id}/students`);
        setEnrolledStudents(res.data);
      } catch (err) {
        setEnrolledStudents([]);
      }
    };
    fetchEnrolledStudents();
  }, [id]);

  useEffect(() => {
    if (course && showEditCourse) {
      setEditCourseForm({
        title: course.title || '',
        videoUrl: course.videoUrl || '',
        description: course.description || '',
      });
    }
  }, [course, showEditCourse]);

  const isOwner = user && (
    user.role === 'admin' ||
    user.id === (course?.teacher?._id || course?.teacher)
  );

  const handleLessonChange = (e) => {
    setLessonForm({ ...lessonForm, [e.target.name]: e.target.value });
  };

  // Funciones para manejar el quiz
  const handleQuizInputChange = (e) => {
    setQuizForm({ ...quizForm, [e.target.name]: e.target.value });
  };
  const handleQuestionInputChange = (e, idx) => {
    const opts = [...currentQuestion.options];
    if (e.target.name === 'options') opts[idx] = e.target.value;
    setCurrentQuestion({ ...currentQuestion, options: opts });
  };
  const handleAddOption = () => {
    setCurrentQuestion({ ...currentQuestion, options: [...currentQuestion.options, ''] });
  };
  const handleAddQuestion = () => {
    if (!currentQuestion.questionText || !currentQuestion.correctAnswer || currentQuestion.options.length < 2) return;
    setQuizForm({ ...quizForm, questions: [...quizForm.questions, { ...currentQuestion }] });
    setCurrentQuestion({ questionText: '', options: ['', ''], correctAnswer: '' });
  };
  const handleRemoveQuestion = (idx) => {
    setQuizForm({ ...quizForm, questions: quizForm.questions.filter((_, i) => i !== idx) });
  };

  // Crear o actualizar lección
  const handleAddOrUpdateLesson = async (e) => {
    e.preventDefault();
    setMessage(editingIndex === null ? 'Guardando lección...' : 'Actualizando lección...');
    let updatedLessons;
    let quizId = null;
    // Si hay quiz, créalo primero
    if (showQuizForm && quizForm.title && quizForm.questions.length > 0) {
      try {
        const quizRes = await createQuiz({
          title: quizForm.title,
          questions: quizForm.questions,
          courseId: id
        });
        quizId = quizRes.data._id;
      } catch (err) {
        setMessage('Error al crear el quiz');
        return;
      }
    }
    // Transformar el videoUrl a embed antes de guardar
    const embedUrl = toYoutubeEmbed(lessonForm.videoUrl);
    if (editingIndex === null) {
      // Crear nueva lección
      updatedLessons = [
        ...lessons,
        { ...lessonForm, order: lessons.length + 1, videoUrl: embedUrl, quiz: quizId }
      ];
    } else {
      // Actualizar lección existente
      updatedLessons = lessons.map((l, idx) =>
        idx === editingIndex
          ? { ...lessonForm, order: l.order, videoUrl: embedUrl, quiz: quizId || l.quiz }
          : l
      );
    }
    try {
      await api.put(`/courses/${id}`, { lessons: updatedLessons });
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data);
      setLessons(res.data.lessons || []);
      setMessage(editingIndex === null ? 'Lección agregada correctamente' : 'Lección actualizada correctamente');
      setShowForm(false);
      setLessonForm({ order: lessons.length + 2, title: '', description: '', videoUrl: '' });
      setEditingIndex(null);
      setQuizForm({ title: '', questions: [] });
      setShowQuizForm(false);
      setCurrentQuestion({ questionText: '', options: ['', ''], correctAnswer: '' });
    } catch (err) {
      setMessage('Error al guardar la lección');
    }
  };

  // Editar lección
  const handleEditLesson = (idx) => {
    setLessonForm({ ...lessons[idx] });
    setShowForm(true);
    setEditingIndex(idx);
  };

  // Eliminar lección y reordenar
  const handleDeleteLesson = async (idx) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta lección?')) return;
    const updatedLessons = lessons.filter((_, i) => i !== idx).map((l, i) => ({ ...l, order: i + 1 }));
    try {
      await api.put(`/courses/${id}`, { lessons: updatedLessons });
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data);
      setLessons(res.data.lessons || []);
      setMessage('Lección eliminada correctamente');
      setShowForm(false);
      setEditingIndex(null);
      setLessonForm({ order: updatedLessons.length + 1, title: '', description: '', videoUrl: '' });
    } catch (err) {
      setMessage('Error al eliminar la lección');
    }
  };

  // Abrir vista de estudiante
  const handleOpenStudentView = (idx) => {
    setShowStudentView(idx);
  };

  // Cerrar vista de estudiante
  const handleCloseStudentView = () => {
    setShowStudentView(null);
  };

  // Función para actualizar la info general del curso
  const handleEditCourseChange = (e) => {
    setEditCourseForm({ ...editCourseForm, [e.target.name]: e.target.value });
  };
  const handleEditCourseSubmit = async (e) => {
    e.preventDefault();
    setEditCourseLoading(true);
    setEditCourseMsg('');
    try {
      // Transformar la URL a formato embed si es de YouTube
      const embedUrl = toYoutubeEmbed(editCourseForm.videoUrl);
      await api.put(`/courses/${id}`, {
        ...editCourseForm,
        videoUrl: embedUrl,
      });
      // Refrescar datos
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data);
      setEditCourseMsg('Información actualizada correctamente');
      setShowEditCourse(false);
    } catch (err) {
      setEditCourseMsg('Error al actualizar el curso');
    } finally {
      setEditCourseLoading(false);
    }
  };

  const mainVideoUrl = course?.videoUrl;

  if (loading) return <p className="p-4">Cargando curso...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!course) return <p className="p-4">Curso no encontrado.</p>;

  // Vista de estudiante para una lección
  if (showStudentView !== null && lessons[showStudentView]) {
    const lesson = lessons[showStudentView];
    // Elimina los hooks de aquí, ya están arriba
    // const [videoWatched, setVideoWatched] = useState(false);
    // const [progressMsg, setProgressMsg] = useState('');
    // Handler para guardar progreso por visualización
    const handleVideoEnded = async () => {
      try {
        await saveLessonProgress(id, lesson.order, { score: 100, completed: true });
        setProgressMsg('¡Progreso guardado! Puntuación: 100');
        setVideoWatched(true);
      } catch (err) {
        setProgressMsg('Error al guardar el progreso');
      }
    };

    return (
      <div className="p-6 max-w-2xl mx-auto">
        <button className="mb-4 text-blue-600 underline" onClick={handleCloseStudentView}>← Volver</button>
        <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
        <div className="aspect-video mb-4">
          <iframe
            src={lesson.videoUrl}
            title={lesson.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded"
            onLoad={() => {
              // Aquí podrías integrar lógica para detectar porcentaje visto usando la API de YouTube
            }}
            onEnded={handleVideoEnded}
          />
        </div>
        <p className="mb-4 text-gray-700">{lesson.description}</p>
        {progressMsg && <div className="mb-4 text-green-700 font-semibold text-center">{progressMsg}</div>}
        <div className="mt-6 p-4 border rounded bg-gray-50 text-gray-500 text-center">
          {/* Siempre renderizar LessonQuiz, dejar que el propio componente decida si hay quiz o no */}
          <LessonQuiz
            quizId={lesson.quiz}
            courseId={id}
            lessonOrder={lesson.order}
            onComplete={(score) => setProgressMsg(`¡Progreso guardado! Puntuación: ${score}`)}
          />
          {!lesson.quiz && videoWatched && <span>¡Has completado la lección!</span>}
        </div>
      </div>
    );
  }

  // Componente para mostrar el número de la lección de forma grande y estilizada
  function LessonNumber({ number }) {
    return (
      <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-700 text-white text-4xl font-extrabold rounded-full shadow-lg border-4 border-white">
        {number}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">{course.title}</h1>
      {/* Botón y formulario de edición de info general */}
      {isOwner && !showEditCourse && (
        <div className="flex justify-end mb-2">
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-yellow-600 shadow"
            onClick={() => setShowEditCourse(true)}
          >
            Editar información del curso
          </button>
        </div>
      )}
      {isOwner && showEditCourse && (
        <form
          onSubmit={handleEditCourseSubmit}
          className="mb-6 border-2 border-yellow-200 bg-yellow-50 rounded-xl p-6 shadow-md"
        >
          <h3 className="text-lg font-bold mb-2 text-yellow-800">Editar información general del curso</h3>
          <input
            type="text"
            name="title"
            placeholder="Título del curso"
            value={editCourseForm.title}
            onChange={handleEditCourseChange}
            className="w-full mb-3 p-3 border-2 border-yellow-200 rounded-xl focus:outline-none focus:border-yellow-400 text-lg shadow-sm"
            required
          />
          <input
            type="text"
            name="videoUrl"
            placeholder="URL del video principal"
            value={editCourseForm.videoUrl}
            onChange={handleEditCourseChange}
            className="w-full mb-3 p-3 border-2 border-yellow-200 rounded-xl focus:outline-none focus:border-yellow-400 text-lg shadow-sm"
            required
          />
          <textarea
            name="description"
            placeholder="Descripción del curso"
            value={editCourseForm.description}
            onChange={handleEditCourseChange}
            className="w-full mb-3 p-3 border-2 border-yellow-200 rounded-xl focus:outline-none focus:border-yellow-400 text-lg shadow-sm"
            required
            rows={3}
          ></textarea>
          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50"
              disabled={editCourseLoading}
            >
              {editCourseLoading ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-400"
              onClick={() => setShowEditCourse(false)}
            >
              Cancelar
            </button>
          </div>
          {editCourseMsg && <div className={`mt-2 text-center font-semibold ${editCourseMsg.startsWith('Error') ? 'text-red-600' : 'text-green-700'}`}>{editCourseMsg}</div>}
        </form>
      )}
      <div className="flex flex-row gap-8">
        <div className="w-1/3">
          <EnrolledStudentsList students={enrolledStudents} />
        </div>
        <div className="flex-1">
          <div className="aspect-video mb-4">
            {mainVideoUrl ? (
              <iframe
                src={mainVideoUrl}
                title={course.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded text-gray-500">
                Sin video principal
              </div>
            )}
          </div>
          <p className="mb-8 text-lg text-center text-gray-700">{course.description}</p>

          {/* Sección de lecciones */}
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold mb-4 text-green-700 border-b-2 border-green-200 pb-2">Lecciones del curso</h2>
            {isOwner && lessons.length === 0 && !showForm && (
              <div className="flex flex-col items-center my-8">
                <p className="mb-4 text-gray-600">Aún no hay lecciones en este curso.</p>
                <button
                  className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 shadow"
                  onClick={() => { setShowForm(true); setEditingIndex(null); }}
                >
                  Crear primera lección
                </button>
              </div>
            )}
            {isOwner && lessons.length > 0 && !showForm && (
              <div className="flex flex-col items-center my-8">
                <button
                  className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 shadow"
                  onClick={() => { setShowForm(true); setEditingIndex(null); }}
                >
                  Agregar otra lección
                </button>
              </div>
            )}
            {isOwner && showForm && (
              <>
                <div className="mb-8 border-2 border-green-200 bg-green-50 rounded-xl p-6 shadow-md">
                  <h3 className="text-lg font-bold mb-2 text-green-800">{editingIndex === null ? 'Crear lección' : `Editar lección #${lessonForm.order}`}</h3>
                  <form onSubmit={handleAddOrUpdateLesson} className="flex flex-col gap-3">
                    <input
                      type="text"
                      name="title"
                      placeholder="Título"
                      value={lessonForm.title}
                      onChange={handleLessonChange}
                      className="p-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500"
                      required
                    />
                    <input
                      type="text"
                      name="videoUrl"
                      placeholder="URL del video"
                      value={lessonForm.videoUrl}
                      onChange={handleLessonChange}
                      className="p-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500"
                      required
                    />
                    <textarea
                      name="description"
                      placeholder="Descripción de la lección"
                      value={lessonForm.description}
                      onChange={handleLessonChange}
                      className="p-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500"
                      required
                      rows={2}
                    ></textarea>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl font-bold transition text-white bg-green-600 hover:bg-green-700"
                    >
                      {editingIndex === null ? 'Crear lección' : 'Actualizar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingIndex(null); setLessonForm({ order: lessons.length + 1, title: '', description: '', videoUrl: '' }); }}
                      className="text-sm text-gray-600 hover:underline mt-2"
                    >
                      Cancelar
                    </button>
                  </form>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl font-bold transition text-white bg-yellow-500 hover:bg-yellow-600 mt-2"
                  onClick={() => setShowQuizForm((v) => !v)}
                >
                  {showQuizForm ? 'Ocultar Quiz' : 'Agregar Quiz'}
                </button>
                {showQuizForm && (
                  <div className="mt-4 border-2 border-yellow-200 bg-yellow-50 rounded-xl p-4 shadow-md">
                    <h4 className="text-lg font-bold mb-2 text-yellow-800">Crear Quiz para la lección</h4>
                    <input
                      type="text"
                      name="title"
                      placeholder="Título del quiz"
                      value={quizForm.title}
                      onChange={handleQuizInputChange}
                      className="p-2 border-2 border-yellow-300 rounded-lg w-full mb-2"
                    />
                    <div className="mb-2">
                      <input
                        type="text"
                        placeholder="Pregunta"
                        value={currentQuestion.questionText}
                        onChange={e => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                        className="p-2 border border-yellow-300 rounded-lg w-full mb-2"
                      />
                      {currentQuestion.options.map((opt, idx) => (
                        <input
                          key={idx}
                          type="text"
                          placeholder={`Opción ${idx + 1}`}
                          value={opt}
                          onChange={e => handleQuestionInputChange(e, idx)}
                          name="options"
                          className="p-2 border border-yellow-200 rounded-lg w-full mb-1"
                        />
                      ))}
                      <button type="button" className="text-sm text-blue-600 hover:underline" onClick={handleAddOption}>+ Agregar opción</button>
                      <input
                        type="text"
                        placeholder="Respuesta correcta"
                        value={currentQuestion.correctAnswer}
                        onChange={e => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                        className="p-2 border border-yellow-300 rounded-lg w-full mt-2"
                      />
                      <button type="button" className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" onClick={handleAddQuestion}>Agregar pregunta</button>
                    </div>
                    <div className="mt-2">
                      {quizForm.questions.map((q, idx) => (
                        <div key={idx} className="mb-2 p-2 bg-white rounded shadow flex justify-between items-center">
                          <span>{q.questionText}</span>
                          <button type="button" className="text-red-500 ml-2" onClick={() => handleRemoveQuestion(idx)}>Eliminar</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="grid gap-6">
              {lessons
                .sort((a, b) => a.order - b.order)
                .map((lesson, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <LessonNumber number={lesson.order} />
                      <div>
                        <span className="font-bold text-lg text-green-800">{lesson.title}</span>
                        <span className="block text-gray-600 mt-1">{lesson.description}</span>
                      </div>
                      {isOwner && (
                        <div className="flex gap-2 ml-auto">
                          <button
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                            onClick={() => handleEditLesson(idx)}
                          >
                            Editar
                          </button>
                          <button
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                            onClick={() => handleOpenStudentView(idx)}
                          >
                            Abrir
                          </button>
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            onClick={() => handleDeleteLesson(idx)}
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                      {!isOwner && (
                        <div className="flex gap-2 ml-auto">
                          <button
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                            onClick={() => handleOpenStudentView(idx)}
                          >
                            Abrir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          {message && <div className="mt-4 text-green-700 font-semibold text-center">{message}</div>}
        </div>
      </div>
    </div>
  );
}
