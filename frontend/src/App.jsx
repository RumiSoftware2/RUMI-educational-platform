// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import EmailVerification from './pages/EmailVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import ProfileChangeName from './pages/ProfileChangeName';
import Courses from './pages/Courses';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPage from './pages/AdminPage';
import Home from './pages/Home';
import PersonRumi from './pages/PersonRumi';
import EnterpriseRumi from './pages/EnterpriseRumi';
import EnterpriseLogin from './pages/enterprise/EnterpriseLogin';
import CourseForm from './pages/CourseForm';
import MyCourses from './pages/MyCourses';
import GameMenu from './pages/games/GameMenu';
import Blackjack from './pages/games/Blackjack';
import StudentCourses from './pages/StudentCourses';
import TeacherCourses from './pages/TeacherCourses';
import AdminCourses from './pages/AdminCourses';
import CourseStatistics from './pages/CourseStatistics';
import AppLayout from './components/AppLayout';
import CourseDetail from './pages/CourseDetail';
import ScrollToTop from './components/ScrollToTop';
import StudentStatistics from './pages/StudentStatistics';
import StudentCourseDetail from './pages/StudentCourseDetail';
import VerifyResetCode from './pages/VerifyResetCode';
import Sudoku from './pages/games/Sudoku';
import { LanguageProvider } from './context/LanguageContext';


function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppLayout>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-reset-code" element={<VerifyResetCode />} />
            <Route path="/" element={<Home />} />
            <Route path="/person-rumi" element={<PersonRumi />} />
            <Route path="/enterprise-rumi" element={<EnterpriseRumi />} />
            <Route path="/enterprise/login" element={<EnterpriseLogin />} />
             
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/change-name"
              element={
                <ProtectedRoute>
                  <ProfileChangeName />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/my-courses"
              element={
              <ProtectedRoute>
                <MyCourses />
              </ProtectedRoute>
              }/> 
              
            <Route
              path="/courses"
              element={<Courses />}
            />
           <Route
              path="/games"
              element={<GameMenu />}
            />
            <Route
              path="/games/blackjack"
              element={<Blackjack />}
            />
            <Route path="/games/sudoku" element={<Sudoku />} />



            <Route
              path="/courses/new"
              element={
                <ProtectedRoute requiredRoles={['admin', 'docente']}>
                  <CourseForm />
                </ProtectedRoute>
              }
            />

            {/* Rutas por rol, por ejemplo admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses"
              element={
                <ProtectedRoute requiredRoles={['estudiante']}>
                  <StudentCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/courses"
              element={
                <ProtectedRoute requiredRoles={['docente']}>
                  <TeacherCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <AdminCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:id/statistics"
              element={
                <ProtectedRoute requiredRoles={['docente', 'admin']}>
                  <CourseStatistics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:id/students/:studentId/statistics"
              element={
                <ProtectedRoute requiredRoles={['docente', 'estudiante']}>
                  <StudentStatistics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:id"
              element={
                <ProtectedRoute requiredRoles={['docente', 'admin']}>
                  <CourseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/course/:id"
              element={
                <ProtectedRoute requiredRoles={['estudiante']}>
                  <StudentCourseDetail />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;


