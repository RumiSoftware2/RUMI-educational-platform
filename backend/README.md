# RUMI Backend

Backend de la plataforma educativa **RUMI**. Proporciona la API y lógica de negocio para la gestión de usuarios, cursos, lecciones, progreso, autenticación, pagos y juegos educativos.

## 👨‍💻 Autor
**Desarrollado por:** Sebastian Mendoza Duitama  
**GitHub:** [@RumiSoftware2](https://github.com/RumiSoftware2/RUMI-educational-platform)  
**LinkedIn:** [Sebastian Mendoza Duitama](https://www.linkedin.com/in/sebastian-mendoza-duitama-694845203)  
**Fecha de creación:** 2024

## 🚀 Despliegue rápido

1. Clona el repositorio y entra a la carpeta `backend`:
   ```bash
   git clone https://github.com/RumiSoftware2/RUMI-educational-platform.git
   cd RUMI-educational-platform/backend
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` basado en `.env.example` y completa tus variables de entorno:
   ```env
   MONGODB_URI=...
   JWT_SECRET=...
   PORT=5000
   STRIPE_SECRET_KEY=...
   EMAIL_USER=...
   EMAIL_PASSWORD=...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   FRONTEND_URL=...
   ```

4. Inicia el servidor:
   ```bash
   npm start
   ```

## 📦 Scripts útiles

- `npm start` — Inicia el servidor en modo producción.
- `npm run dev` — Inicia el servidor en modo desarrollo (si usas nodemon).

## 🛠️ Estructura del proyecto

```
backend/
├── config/
│   ├── db.js          # Configuración de MongoDB
│   └── passport.js    # Configuración de Passport.js
├── controllers/
│   ├── authController.js      # Autenticación, registro, Google OAuth
│   ├── courseController.js    # Gestión de cursos y lecciones
│   ├── feedbackController.js  # Sistema de feedback entre docentes y estudiantes
│   ├── gameController.js      # Gestión de sesiones de juegos educativos
│   ├── gradeController.js     # Calificaciones y evaluaciones
│   ├── paymentController.js   # Pagos con Stripe
│   ├── progressController.js  # Seguimiento de progreso
│   ├── quizController.js      # Gestión de quizzes
│   └── userController.js      # Gestión de usuarios
├── middleware/
│   ├── authMiddleware.js      # Verificación de JWT
│   └── roleMiddleware.js      # Control de roles y permisos
├── models/
│   ├── Course.js             # Modelo de cursos
│   ├── FeedbackThread.js     # Hilos de feedback
│   ├── GameSession.js        # Sesiones de juegos
│   ├── Grade.js              # Calificaciones
│   ├── Payment.js            # Pagos
│   ├── Progress.js           # Progreso de estudiantes
│   ├── Quiz.js               # Quizzes
│   └── User.js               # Usuarios
├── routes/
│   ├── authRoutes.js         # Rutas de autenticación
│   ├── courseRoutes.js       # Rutas de cursos
│   ├── feedbackRoutes.js     # Rutas de feedback
│   ├── game.js               # Rutas de juegos
│   ├── gradeRoutes.js        # Rutas de calificaciones
│   ├── paymentRoutes.js      # Rutas de pagos
│   ├── progressRoutes.js     # Rutas de progreso
│   ├── protectedRoutes.js    # Rutas protegidas
│   ├── quizRoutes.js         # Rutas de quizzes
│   └── userRoutes.js         # Rutas de usuarios
└── services/
    ├── emailService.js       # Servicio de emails (Nodemailer)
    └── stripeService.js      # Servicio de pagos (Stripe)
```

## 🌐 Despliegue en Render/Railway

- Sube la carpeta `backend` como servicio.
- Configura las variables de entorno en el panel de la plataforma.
- Asegúrate de que el servidor escuche en `process.env.PORT`.

## 📚 Endpoints principales

### Autenticación (`/api/auth`)
- `POST /register` — Registro con verificación de email
- `POST /login` — Login con JWT
- `POST /verify-email` — Verificar código de email
- `POST /forgot-password` — Solicitar recuperación de contraseña
- `POST /reset-password` — Cambiar contraseña con código
- `POST /change-password` — Cambiar contraseña (usuario autenticado)
- `GET /google` — Login con Google OAuth
- `GET /google/callback` — Callback de Google OAuth

### Cursos (`/api/courses`)
- `POST /` — Crear curso (docentes)
- `GET /` — Listar cursos públicos
- `GET /:id` — Obtener curso por ID
- `PUT /:id` — Editar curso (docente propietario)
- `DELETE /:id` — Eliminar curso (docente propietario)
- `GET /mine` — Cursos del docente autenticado
- `GET /enrolled` — Cursos del estudiante inscrito
- `POST /:id/enroll` — Inscribirse a curso
- `PUT /:id/leave` — Abandonar curso
- `GET /:id/statistics` — Estadísticas del curso
- `GET /:id/students` — Estudiantes inscritos

### Pagos (`/api/payments`)
- `POST /create-intent` — Crear Payment Intent de Stripe
- `POST /` — Confirmar pago
- `GET /course/:courseId/status` — Estado de pago del curso
- `POST /teacher/stripe-account` — Crear cuenta Stripe para docente
- `GET /teacher/balance` — Balance del docente

### Juegos (`/api/games`)
- `POST /sessions` — Guardar sesión de juego
- `GET /stats` — Estadísticas del usuario
- `GET /sessions` — Todas las sesiones (admin)

### Quizzes (`/api/quizzes`)
- `POST /` — Crear quiz (docentes)
- `GET /` — Listar quizzes
- `GET /:id` — Obtener quiz por ID
- `PUT /:id` — Editar quiz
- `DELETE /:id` — Eliminar quiz

### Progreso (`/api/progress`)
- `GET /me` — Progreso del estudiante
- `GET /course/:courseId` — Progreso del curso (docente)
- `POST /lesson/:courseId/:lessonOrder` — Guardar progreso de lección

### Calificaciones (`/api/grades`)
- `POST /` — Crear calificación (docentes)
- `GET /my` — Calificaciones del estudiante
- `GET /course/:courseId` — Calificaciones del curso

### Feedback (`/api/feedback`)
- `GET /:courseId/:studentId` — Obtener hilo de feedback
- `POST /:courseId/:studentId` — Agregar mensaje al feedback

### Usuarios (`/api/users`)
- `GET /` — Listar usuarios (admin)
- `GET /:id` — Obtener usuario por ID
- `PUT /:id` — Actualizar usuario
- `DELETE /:id` — Eliminar usuario (admin)

## 🔧 Servicios integrados

### Stripe Service
- Creación de Payment Intents
- Distribución automática de pagos a docentes (87.1% docente, 10% plataforma, 2.9% Stripe)
- Creación de cuentas Connect para docentes
- Onboarding de docentes
- Gestión de balances

### Email Service
- Verificación de email con códigos de 6 dígitos
- Recuperación de contraseña
- Notificaciones de nuevas lecciones
- Templates HTML personalizados

### Autenticación
- JWT con expiración de 1 hora
- Google OAuth con Passport.js
- Verificación de email obligatoria
- Recuperación de contraseña por email
- Middleware de roles y permisos

## 🛡️ Seguridad

- Hash de contraseñas con bcrypt (salt rounds: 10)
- Validación de email con validator.js
- CORS configurado para desarrollo y producción
- Middleware de autenticación en rutas protegidas
- Control de roles (estudiante, docente, admin)
- Verificación de email antes del login

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](../LICENSE) para más detalles.

---
**© 2024 Sebastian Mendoza Duitama. Todos los derechos reservados.** 