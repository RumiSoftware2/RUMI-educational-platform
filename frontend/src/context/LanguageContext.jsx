import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation dictionary
const translations = {
  en: {
    // Navigation
    home: 'Home',
    courses: 'Courses',
    games: 'Games',
    profile: 'Profile',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    
    // Blackjack Game
    blackjack: 'Blackjack',
    educationalBlackjack: 'Educational Blackjack',
    blackjackPays: 'BLACKJACK PAYS 3 TO 2',
    dealerMustStand: 'Dealer must stand on soft 17',
    hit: 'Hit',
    stand: 'Stand',
    newSession: 'New Session',
    finishGame: 'Finish Game',
    dealer: 'Dealer',
    you: 'You',
    win: 'Win',
    lose: 'Lose',
    bust: 'Bust',
    tie: 'Tie',
    timeUp: 'Time up!',
    money: 'Money',
    bet: 'Bet',
    
    // Demographic Form
    age: 'Age',
    educationLevel: 'Education Level',
    primary: 'Primary',
    secondary: 'Secondary',
    highSchool: 'High School',
    university: 'University',
    postgraduate: 'Postgraduate',
    startGame: 'Start Game',
    enterAge: 'Enter your age',
    selectEducation: 'Select...',
    
    // Game Stats
    realTimeProbabilities: 'Real-time probabilities:',
    bustProbability: 'Bust probability',
    winProbability: 'Win probability',
    
    // Timer
    timeRemaining: 'Time remaining',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    submit: 'Submit',
    
    // Auth
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember me',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    resetPassword: 'Reset Password',
    verifyEmail: 'Verify Email',
    
    // Courses
    myCourses: 'My Courses',
    enroll: 'Enroll',
    enrolled: 'Enrolled',
    viewCourse: 'View Course',
    courseDetails: 'Course Details',
    lessons: 'Lessons',
    progress: 'Progress',
    completed: 'Completed',
    
    // Profile
    profileSettings: 'Profile Settings',
    changePassword: 'Change Password',
    personalInfo: 'Personal Information',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone',
    address: 'Address',
    updateProfile: 'Update Profile',
    
    // Games Menu
    mathGames: 'Math Games',
    chemistryGames: 'Chemistry Games',
    physicsGames: 'Physics Games',
    musicGames: 'Music Games',
    sudoku: 'Sudoku',
    comingSoon: 'Coming Soon',
    backToCategories: 'Back to Categories',
    
    // Admin
    adminPanel: 'Admin Panel',
    manageCourses: 'Manage Courses',
    manageUsers: 'Manage Users',
    statistics: 'Statistics',
    dashboard: 'Dashboard',
    
    // Messages
    welcome: 'Welcome',
    welcomeBack: 'Welcome back!',
    sessionExpired: 'Session expired. Please login again.',
    invalidCredentials: 'Invalid email or password.',
    registrationSuccess: 'Registration successful!',
    passwordResetSent: 'Password reset email sent.',
    emailVerified: 'Email verified successfully!',
    profileUpdated: 'Profile updated successfully!',
    courseEnrolled: 'Successfully enrolled in course!',
    gameSessionSaved: 'Game session saved!',
  },
  es: {
    // Navigation
    home: 'Inicio',
    courses: 'Cursos',
    games: 'Juegos',
    profile: 'Perfil',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    
    // Blackjack Game
    blackjack: 'Blackjack',
    educationalBlackjack: 'Blackjack Educativo',
    blackjackPays: 'BLACKJACK PAGA 3 A 2',
    dealerMustStand: 'Dealer debe plantarse en 17 suave',
    hit: 'Pedir Carta',
    stand: 'Plantarse',
    newSession: 'Nueva Sesión',
    finishGame: 'Finalizar Juego',
    dealer: 'Dealer',
    you: 'Tú',
    win: 'Ganaste',
    lose: 'Perdiste',
    bust: 'Perdiste, te pasaste',
    tie: 'Empate',
    timeUp: '¡Tiempo agotado!',
    money: 'Dinero',
    bet: 'Apuesta',
    
    // Demographic Form
    age: 'Edad',
    educationLevel: 'Último grado de estudio',
    primary: 'Primaria',
    secondary: 'Secundaria',
    highSchool: 'Preparatoria',
    university: 'Universidad',
    postgraduate: 'Posgrado',
    startGame: 'Comenzar Juego',
    enterAge: 'Ingresa tu edad',
    selectEducation: 'Selecciona...',
    
    // Game Stats
    realTimeProbabilities: 'Probabilidades en tiempo real:',
    bustProbability: 'Prob. de pasarse',
    winProbability: 'Prob. de ganar',
    
    // Timer
    timeRemaining: 'Tiempo restante',
    
    // Common
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    save: 'Guardar',
    edit: 'Editar',
    delete: 'Eliminar',
    confirm: 'Confirmar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    close: 'Cerrar',
    submit: 'Enviar',
    
    // Auth
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    rememberMe: 'Recordarme',
    signIn: 'Iniciar Sesión',
    signUp: 'Registrarse',
    resetPassword: 'Restablecer Contraseña',
    verifyEmail: 'Verificar Correo',
    
    // Courses
    myCourses: 'Mis Cursos',
    enroll: 'Inscribirse',
    enrolled: 'Inscrito',
    viewCourse: 'Ver Curso',
    courseDetails: 'Detalles del Curso',
    lessons: 'Lecciones',
    progress: 'Progreso',
    completed: 'Completado',
    
    // Profile
    profileSettings: 'Configuración del Perfil',
    changePassword: 'Cambiar Contraseña',
    personalInfo: 'Información Personal',
    firstName: 'Nombre',
    lastName: 'Apellido',
    phone: 'Teléfono',
    address: 'Dirección',
    updateProfile: 'Actualizar Perfil',
    
    // Games Menu
    mathGames: 'Juegos de Matemáticas',
    chemistryGames: 'Juegos de Química',
    physicsGames: 'Juegos de Física',
    musicGames: 'Juegos de Música',
    sudoku: 'Sudoku',
    comingSoon: 'Próximamente',
    backToCategories: 'Volver a categorías',
    
    // Admin
    adminPanel: 'Panel de Administración',
    manageCourses: 'Gestionar Cursos',
    manageUsers: 'Gestionar Usuarios',
    statistics: 'Estadísticas',
    dashboard: 'Panel Principal',
    
    // Messages
    welcome: 'Bienvenido',
    welcomeBack: '¡Bienvenido de vuelta!',
    sessionExpired: 'Sesión expirada. Por favor inicia sesión nuevamente.',
    invalidCredentials: 'Correo o contraseña inválidos.',
    registrationSuccess: '¡Registro exitoso!',
    passwordResetSent: 'Correo de restablecimiento enviado.',
    emailVerified: '¡Correo verificado exitosamente!',
    profileUpdated: '¡Perfil actualizado exitosamente!',
    courseEnrolled: '¡Inscripción exitosa en el curso!',
    gameSessionSaved: '¡Sesión de juego guardada!',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to Spanish
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'es';
  });

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'es' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 