// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Interceptor: añade token si existe
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Cursos en los que el estudiante está inscrito
export const getEnrolledCourses = () => api.get('/courses/enrolled');

// Cursos creados por el docente
export const getMyCourses = () => api.get('/courses/mine');

// Todos los cursos (admin)
export const getAllCourses = () => api.get('/courses/all');

// Estadísticas de un curso
export const getCourseStatistics = (courseId) => api.get(`/courses/${courseId}/statistics`);

// Inscribir estudiante a un curso
export const enrollInCourse = (courseId) => api.post(`/courses/${courseId}/enroll`);

export default api;
