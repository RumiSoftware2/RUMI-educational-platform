const Course = require('../models/Course');
const { sendLessonNotification } = require('../services/emailService');
const User = require('../models/User');

// Crear un nuevo curso (con lecciones)
const createCourse = async (req, res) => {
  try {
    const { title, description, price, lessons } = req.body;
    if (!title || !description || !req.body.videoUrl) {
      return res.status(400).json({ message: 'Faltan campos requeridos: título, descripción y URL del video' });
    }
    let lessonsToSave = [];
    if (Array.isArray(lessons) && lessons.length > 0) {
      for (const lesson of lessons) {
        if (!lesson.order || !lesson.title || !lesson.description || !lesson.videoUrl) {
          return res.status(400).json({ message: 'Cada lección debe tener orden, título, descripción y videoUrl' });
        }
      }
      lessonsToSave = lessons;
    }
    const newCourse = new Course({
      title,
      description,
      price: price || 0,
      teacher: req.user.id,
      videoUrl: req.body.videoUrl,
      lessons: lessonsToSave
    });
    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el curso', error });
  }
};

// Obtener todos los cursos
const getCourses = async (req, res) => {
  try {
    const filter = {};
    if (req.query.teacher) {
      filter.teacher = req.query.teacher;
    }
    const courses = await Course.find(filter).populate('teacher', 'username email');
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los cursos', error });
  }
};

// Obtener un curso por ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacher', 'username email');
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el curso', error });
  }
};

// Editar un curso (y sus lecciones)
const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Curso no encontrado' });
    // Solo el docente creador o admin puede editar
    if (req.user.role !== 'admin' && String(course.teacher) !== String(req.user.id)) {
      return res.status(403).json({ message: 'No autorizado para editar este curso' });
    }
    const { title, description, price, videoUrl, lessons } = req.body;
    if (title) course.title = title;
    if (description) course.description = description;
    if (price !== undefined) course.price = price;
    if (videoUrl) course.videoUrl = videoUrl;
    let newLesson = null;
    if (Array.isArray(lessons)) {
      // Validar lecciones
      for (const lesson of lessons) {
        if (!lesson.order || !lesson.title || !lesson.description || !lesson.videoUrl) {
          return res.status(400).json({ message: 'Cada lección debe tener orden, título, descripción y videoUrl' });
        }
      }
      // Detectar si se agregó una nueva lección
      if (lessons.length > course.lessons.length) {
        // Buscar la lección nueva (por orden o por título)
        const prevTitles = course.lessons.map(l => l.title);
        newLesson = lessons.find(l => !prevTitles.includes(l.title));
      }
      course.lessons = lessons;
    }
    await course.save();
    // Si hay nueva lección y hay estudiantes inscritos, enviar notificación
    if (newLesson && course.students && course.students.length > 0) {
      // Obtener emails de los estudiantes
      const students = await User.find({ _id: { $in: course.students } });
      const emails = students.map(s => s.email).filter(Boolean);
      if (emails.length > 0) {
        await sendLessonNotification(emails, course.title, newLesson.title);
      }
    }
    res.json({ message: 'Curso actualizado', course });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el curso', error });
  }
};

// Eliminar curso (solo docente o admin)
const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Curso no encontrado' });
    // Solo el docente creador o admin puede eliminar
    if (req.user.role !== 'admin' && String(course.teacher) !== String(req.user.id)) {
      return res.status(403).json({ message: 'No autorizado para eliminar este curso' });
    }
    await course.deleteOne();
    res.json({ message: 'Curso eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el curso', error });
  }
};

// Listar cursos creados por el docente autenticado
const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user.id });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tus cursos', error });
  }
};

// Listar cursos en los que el estudiante está inscrito
const getEnrolledCourses = async (req, res) => {
  try {
    const courses = await Course.find({ students: req.user.id });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener cursos inscritos', error });
  }
};

// Listar todos los cursos (admin)
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener todos los cursos', error });
  }
};

// Inscribir estudiante a un curso
const enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Curso no encontrado' });
    // Evitar inscripción duplicada
    if (course.students.includes(req.user.id)) {
      return res.status(400).json({ message: 'Ya estás inscrito en este curso' });
    }
    course.students.push(req.user.id);
    await course.save();
    res.json({ message: 'Inscripción exitosa', course });
  } catch (error) {
    res.status(500).json({ message: 'Error al inscribirse en el curso', error });
  }
};

// Obtener estadísticas básicas de un curso (número de inscritos)
const getCourseStatistics = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId).populate('students', 'name email');
    if (!course) return res.status(404).json({ message: 'Curso no encontrado' });
    const stats = {
      totalStudents: course.students.length,
      students: course.students
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas del curso', error });
  }
};

// Obtener la lista de estudiantes inscritos a un curso
const getEnrolledStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('students', 'name');
    if (!course) return res.status(404).json({ message: 'Curso no encontrado' });
    const students = course.students.map(student => ({
      id: student._id,
      name: student.name
    }));
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los estudiantes inscritos' });
  }
};

// Permitir que un estudiante abandone un curso
const leaveCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Curso no encontrado' });
    // Solo estudiantes inscritos pueden abandonar
    const studentIndex = course.students.findIndex(
      (studentId) => String(studentId) === String(req.user.id)
    );
    if (studentIndex === -1) {
      return res.status(400).json({ message: 'No estás inscrito en este curso' });
    }
    course.students.splice(studentIndex, 1);
    await course.save();
    res.json({ message: 'Has abandonado el curso', course });
  } catch (error) {
    res.status(500).json({ message: 'Error al abandonar el curso', error });
  }
};

// Configurar curso como pago
const setCourseAsPaid = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { paidFromLesson, price } = req.body;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    // Solo el docente creador o admin puede configurar el pago
    if (req.user.role !== 'admin' && String(course.teacher) !== String(req.user.id)) {
      return res.status(403).json({ message: 'No autorizado para configurar este curso' });
    }
    
    // Validar que la lección especificada existe
    if (paidFromLesson && (paidFromLesson < 1 || paidFromLesson > course.lessons.length)) {
      return res.status(400).json({ 
        message: `La lección debe estar entre 1 y ${course.lessons.length}` 
      });
    }
    
    course.isPaidCourse = true;
    course.paidFromLesson = paidFromLesson || null;
    if (price !== undefined) {
      course.price = price;
    }
    
    await course.save();
    
    res.status(200).json({
      message: 'Curso configurado como pago correctamente',
      course
    });
  } catch (error) {
    console.error('Error al configurar curso como pago:', error);
    res.status(500).json({ message: 'Error al configurar el curso como pago', error: error.message });
  }
};

// Remover configuración de pago de un curso
const removeCoursePayment = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    // Solo el docente creador o admin puede remover la configuración de pago
    if (req.user.role !== 'admin' && String(course.teacher) !== String(req.user.id)) {
      return res.status(403).json({ message: 'No autorizado para modificar este curso' });
    }
    
    course.isPaidCourse = false;
    course.paidFromLesson = null;
    
    await course.save();
    
    res.status(200).json({
      message: 'Configuración de pago removida correctamente',
      course
    });
  } catch (error) {
    console.error('Error al remover configuración de pago:', error);
    res.status(500).json({ message: 'Error al remover la configuración de pago', error: error.message });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getMyCourses,
  getEnrolledCourses,
  getAllCourses,
  enrollInCourse,
  getCourseStatistics,
  getEnrolledStudents,
  leaveCourse,
  setCourseAsPaid,
  removeCoursePayment
};
