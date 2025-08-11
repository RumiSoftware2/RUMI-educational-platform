# RUMI - Plataforma Educativa

## 📋 Descripción
RUMI es una plataforma educativa innovadora que transforma el aprendizaje pasivo de YouTube en una experiencia educativa activa, interactiva y medible. Permite a docentes crear cursos estructurados basados en videos de YouTube, incorporar evaluaciones interactivas y juegos educativos, mientras que los estudiantes pueden seguir su progreso de aprendizaje de manera gamificada.

## 👨‍💻 Autor
**Desarrollado por:** Sebastian Mendoza Duitama  
**GitHub:** [@RumiSoftware2](https://github.com/RumiSoftware2/RUMI-educational-platform)  
**LinkedIn:** [Sebastian Mendoza Duitama](https://www.linkedin.com/in/sebastian-mendoza-duitama-694845203)  
**Fecha de creación:** 2024

## 🚀 Características principales
- ✅ Autenticación JWT segura y Google OAuth
- ✅ Control de roles (Estudiante, Docente, Admin)
- ✅ Gestión de cursos, lecciones y estadísticas
- ✅ Integración con videos de YouTube
- ✅ Sistema de quizzes interactivos
- ✅ Juegos educativos: Blackjack (probabilidad) y Sudoku
- ✅ Seguimiento de progreso y analytics
- ✅ Pagos seguros con Stripe (distribución automática a docentes)
- ✅ Onboarding de docentes para pagos
- ✅ Recuperación y cambio de contraseña por email
- ✅ Notificaciones automáticas por email
- ✅ Interfaz moderna con React y Tailwind CSS

## 🏗️ Arquitectura y Tecnologías
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React, Vite, Tailwind CSS
- **Autenticación:** JWT, Google OAuth, Passport.js
- **Pagos:** Stripe (Stripe Connect para docentes)
- **Email:** Nodemailer (verificación, recuperación, notificaciones)
- **Testing:** Vitest, Testing Library
- **Despliegue:** Vercel (frontend), Render (backend), MongoDB Atlas

## 📦 Instalación y uso rápido

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Variables de entorno
- Copia `.env.example` a `.env` en cada carpeta y configura:
  - **Backend:** `MONGODB_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `EMAIL_USER`, `EMAIL_PASSWORD`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FRONTEND_URL`
  - **Frontend:** `VITE_API_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`

## 🧩 Módulos y funcionalidades destacadas

### Juegos Educativos
- **Blackjack:** Probabilidad condicional, estadísticas de usuario
- **Sudoku:** Lógica y validación, niveles de dificultad

### Pagos y Monetización
- **Stripe Connect:** Pagos automáticos a docentes (87.1% para el docente, 10% plataforma, 2.9% Stripe)
- **Onboarding docente:** Configuración guiada desde el frontend
- **Botón de pago:** Integrado en cursos premium, reembolso 30 días

### Autenticación y Seguridad
- **Registro y login con verificación de email**
- **Login con Google OAuth**
- **Recuperación y cambio de contraseña por email**
- **Roles y permisos protegidos por middleware**

### Notificaciones y Emails
- **Verificación de cuenta**
- **Recuperación de contraseña**
- **Notificación de nuevas lecciones**

### Gestión de Cursos y Progreso
- **Creación, edición e inscripción a cursos**
- **Lecciones con videos de YouTube**
- **Quizzes interactivos y calificaciones**
- **Estadísticas de avance y rendimiento**

## 🌐 Despliegue
- **Frontend:** Vercel/Netlify (configura `VITE_API_URL`)
- **Backend:** Render/Railway (configura variables de entorno)
- **Base de datos:** MongoDB Atlas

## 🛡️ Seguridad
- Hash de contraseñas con bcrypt
- Autenticación JWT y Google OAuth
- Validación de roles y permisos
- CORS configurado

## 🧪 Testing
- Vitest + Testing Library para frontend y backend

## 🤝 Contribuciones
Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## 📄 Licencia
Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---
**© 2024 Sebastian Mendoza Duitama. Todos los derechos reservados.** 