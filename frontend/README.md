# RUMI - Frontend

## 📋 Descripción
Este es el frontend de la plataforma educativa **RUMI**, desarrollado con React, Vite y Tailwind CSS. Permite a los usuarios interactuar con los cursos, lecciones en video, quizzes, juegos educativos y gestionar su progreso de aprendizaje de manera interactiva y gamificada.

## 👨‍💻 Autor
**Desarrollado por:** Sebastian Mendoza Duitama  
**GitHub:** [@RumiSoftware2](https://github.com/RumiSoftware2/RUMI-educational-platform)  
**LinkedIn:** [Sebastian Mendoza Duitama](https://www.linkedin.com/in/sebastian-mendoza-duitama-694845203)  
**Fecha de creación:** 2024

## 🛠️ Tecnologías
- **Framework:** React 19 + Vite
- **Estilos:** Tailwind CSS 4.1.8
- **Consumo de API:** Axios
- **Autenticación:** JWT + Google OAuth
- **Pagos:** Stripe (React Stripe.js)
- **Animaciones:** Framer Motion
- **Testing:** Vitest + Testing Library
- **Routing:** React Router DOM 6.30.1

## 🚀 Instalación y uso

1. Clona el repositorio y entra a la carpeta `frontend`:
   ```bash
   git clone https://github.com/RumiSoftware2/RUMI-educational-platform.git
   cd RUMI-educational-platform/frontend
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` basado en `.env.example` y configura las variables:
   ```env
   VITE_API_URL=https://tu-backend-deploy.com
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. Inicia la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```

## 🏗️ Estructura del proyecto

```
frontend/src/
├── components/
│   ├── AppLayout.jsx              # Layout principal de la aplicación
│   ├── ChangePasswordModal.jsx    # Modal para cambiar contraseña
│   ├── CourseCard.jsx             # Tarjeta de curso
│   ├── CourseList.jsx             # Lista de cursos
│   ├── CourseSearchBar.jsx        # Barra de búsqueda de cursos
│   ├── EnrollButton.jsx           # Botón de inscripción
│   ├── EnrolledStudentsList.jsx   # Lista de estudiantes inscritos
│   ├── GoogleAuthButton.jsx       # Botón de autenticación Google
│   ├── Header.jsx                 # Header principal
│   ├── HeaderEnterprise.jsx       # Header para versión enterprise
│   ├── LanguageSwitcher.jsx       # Selector de idioma
│   ├── LessonQuiz.jsx             # Componente de quiz
│   ├── PaymentButton.jsx          # Botón de pago con Stripe
│   ├── PaymentConfigModal.jsx     # Modal de configuración de pagos
│   ├── PaymentStats.jsx           # Estadísticas de pagos
│   ├── ProtectedRoute.jsx         # Ruta protegida
│   ├── ScrollToTop.jsx            # Scroll automático al top
│   ├── Sidebar.jsx                # Barra lateral
│   ├── TeacherStripeSetup.jsx     # Configuración de Stripe para docentes
│   └── games/
│       ├── CountdownTimer.jsx     # Timer para juegos
│       ├── DemographicForm.jsx    # Formulario demográfico
│       ├── GameStatsBar.jsx       # Barra de estadísticas de juego
│       └── SessionAnalysis.jsx    # Análisis de sesión
├── context/
│   ├── AuthContext.jsx            # Contexto de autenticación
│   └── LanguageContext.jsx        # Contexto de idioma
├── pages/
│   ├── AdminCourses.jsx           # Gestión de cursos (admin)
│   ├── AdminPage.jsx              # Panel de administrador
│   ├── CourseDetail.jsx           # Detalle de curso
│   ├── CourseForm.jsx             # Formulario de curso
│   ├── Courses.jsx                # Lista de cursos
│   ├── CourseStatistics.jsx       # Estadísticas de curso
│   ├── EmailVerification.jsx      # Verificación de email
│   ├── enterprise/
│   │   ├── EnterpriseLogin.jsx    # Login enterprise
│   │   └── EnterpriseRumi.jsx     # Versión enterprise
│   ├── ForgotPassword.jsx         # Recuperación de contraseña
│   ├── games/
│   │   ├── Blackjack.jsx          # Juego de Blackjack educativo
│   │   ├── Card.jsx               # Componente de carta
│   │   ├── GameMenu.jsx           # Menú de juegos
│   │   └── Sudoku.jsx             # Juego de Sudoku
│   ├── Home.jsx                   # Página principal
│   ├── Login.jsx                  # Página de login
│   ├── MyCourses.jsx              # Mis cursos
│   ├── PaymentSuccess.jsx         # Página de éxito de pago
│   ├── PersonRumi.jsx             # Página personal
│   ├── Profile.jsx                # Perfil de usuario
│   ├── ProfileChangeName.jsx      # Cambio de nombre
│   ├── Register.jsx               # Registro
│   ├── ResetPassword.jsx          # Reset de contraseña
│   ├── StudentCourseDetail.jsx    # Detalle de curso para estudiantes
│   ├── StudentCourses.jsx         # Cursos de estudiante
│   ├── StudentStatistics.jsx      # Estadísticas de estudiante
│   ├── TeacherCourses.jsx         # Cursos de docente
│   └── VerifyResetCode.jsx        # Verificación de código de reset
├── services/
│   └── api.js                     # Configuración de Axios
└── test/
    └── setup.js                   # Configuración de tests
```

## 🎮 Juegos Educativos

### Blackjack - Probabilidad Condicional
- **Objetivo:** Aprender probabilidad condicional
- **Características:**
  - Cálculo de probabilidades en tiempo real
  - Estadísticas de usuario (edad, educación)
  - Timer de 15 minutos
  - Seguimiento de ganancias/pérdidas
  - Análisis de sesión

### Sudoku
- **Objetivo:** Desarrollar lógica y pensamiento crítico
- **Características:**
  - 3 niveles de dificultad (Fácil, Medio, Difícil)
  - Validación automática
  - Teclado numérico personalizado
  - Detección de errores en tiempo real

## 💳 Sistema de Pagos

### Integración con Stripe
- **PaymentButton:** Botón de pago integrado en cursos premium
- **TeacherStripeSetup:** Configuración de cuenta Stripe para docentes
- **PaymentConfigModal:** Configuración avanzada de pagos
- **PaymentStats:** Estadísticas de pagos y ganancias

### Características
- Distribución automática: 87.1% docente, 10% plataforma, 2.9% Stripe
- Onboarding guiado para docentes
- Reembolso disponible en 30 días
- Modo de prueba integrado

## 🔐 Autenticación y Seguridad

### Funcionalidades
- **Login/Registro:** Con verificación de email
- **Google OAuth:** Login con cuenta de Google
- **Recuperación de contraseña:** Por email con códigos
- **Cambio de contraseña:** Para usuarios autenticados
- **Verificación de email:** Obligatoria antes del login

### Componentes
- `GoogleAuthButton`: Botón de login con Google
- `ChangePasswordModal`: Modal para cambiar contraseña
- `ProtectedRoute`: Rutas protegidas por rol
- `EmailVerification`: Verificación de email

## 📊 Gestión de Cursos

### Para Docentes
- **CourseForm:** Creación y edición de cursos
- **TeacherCourses:** Gestión de cursos propios
- **CourseStatistics:** Estadísticas detalladas
- **EnrolledStudentsList:** Lista de estudiantes inscritos

### Para Estudiantes
- **CourseList:** Exploración de cursos
- **CourseSearchBar:** Búsqueda avanzada
- **StudentCourseDetail:** Vista detallada de curso
- **StudentStatistics:** Estadísticas personales

### Componentes Reutilizables
- `CourseCard`: Tarjeta de curso con información
- `EnrollButton`: Botón de inscripción
- `LessonQuiz`: Componente de quiz interactivo

## 🎨 UI/UX

### Diseño
- **Tailwind CSS:** Estilos modernos y responsive
- **Framer Motion:** Animaciones fluidas
- **Gradientes:** Diseño atractivo con colores RUMI
- **Responsive:** Adaptable a móviles y desktop

### Componentes de UI
- **Header/Sidebar:** Navegación principal
- **LanguageSwitcher:** Cambio de idioma
- **ScrollToTop:** Navegación mejorada
- **AppLayout:** Layout consistente

## 🌐 Despliegue en Vercel/Netlify

1. Sube la carpeta `frontend` como proyecto
2. Configura las variables de entorno:
   - `VITE_API_URL`: URL del backend desplegado
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Clave pública de Stripe
3. El build se realiza automáticamente
4. La app queda disponible en la web

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 📄 Licencia
Este proyecto está bajo la Licencia MIT. Ver [LICENSE](../LICENSE) para más detalles.

---
**© 2024 Sebastian Mendoza Duitama. Todos los derechos reservados.**
