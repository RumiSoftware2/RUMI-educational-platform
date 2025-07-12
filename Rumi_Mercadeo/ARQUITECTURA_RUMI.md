# DIAGRAMA DE ARQUITECTURA - RUMI

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Páginas   │  │ Componentes │  │   Context   │            │
│  │             │  │             │  │             │            │
│  │ • Home      │  │ • Header    │  │ • Auth      │            │
│  │ • Login     │  │ • CourseCard│  │ • User      │            │
│  │ • Register  │  │ • Quiz      │  │ • Progress  │            │
│  │ • Courses   │  │ • Games     │  │             │            │
│  │ • Profile   │  │ • Forms     │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│           │               │               │                   │
│           └───────────────┼───────────────┘                   │
│                           │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Services Layer                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │    API      │  │   Auth      │  │   Utils     │     │   │
│  │  │  (Axios)    │  │  Service    │  │  Service    │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS/API Calls
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Express Server                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │   CORS      │  │   JSON      │  │   Auth      │     │   │
│  │  │ Middleware  │  │ Parser      │  │ Middleware  │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     Routes Layer                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │   Auth      │  │   Courses   │  │   Quizzes   │     │   │
│  │  │   Routes    │  │   Routes    │  │   Routes    │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │   Users     │  │   Progress  │  │    Games    │     │   │
│  │  │   Routes    │  │   Routes    │  │   Routes    │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Controllers Layer                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │   Auth      │  │   Course    │  │   Quiz      │     │   │
│  │  │ Controller  │  │ Controller  │  │ Controller  │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │   User      │  │   Progress  │  │    Game     │     │   │
│  │  │ Controller  │  │ Controller  │  │ Controller  │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Middleware Layer                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │   Auth      │  │    Role     │  │ Validation  │     │   │
│  │  │ Middleware  │  │ Middleware  │  │ Middleware  │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Database Operations
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │    Users    │  │   Courses   │  │   Quizzes   │            │
│  │             │  │             │  │             │            │
│  │ • _id       │  │ • _id       │  │ • _id       │            │
│  │ • name      │  │ • title     │  │ • title     │            │
│  │ • email     │  │ • desc      │  │ • questions │            │
│  │ • password  │  │ • teacher   │  │ • courseId  │            │
│  │ • role      │  │ • lessons   │  │ • createdBy │            │
│  │ • progress  │  │ • students  │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Progress  │  │    Games    │  │   Grades    │            │
│  │             │  │             │  │             │            │
│  │ • _id       │  │ • _id       │  │ • _id       │            │
│  │ • user      │  │ • user      │  │ • user      │            │
│  │ • course    │  │ • game      │  │ • course    │            │
│  │ • completed │  │ • stats     │  │ • quiz      │            │
│  │ • scores    │  │ • createdAt │  │ • score     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

### 1. Autenticación
```
Usuario → Frontend → API Call → Auth Controller → User Model → JWT Token → Frontend Storage
```

### 2. Creación de Curso
```
Docente → Course Form → API Call → Course Controller → Course Model → MongoDB → Response
```

### 3. Inscripción a Curso
```
Estudiante → Course List → API Call → Course Controller → Update Course → MongoDB → Response
```

### 4. Juego Educativo
```
Usuario → Game Component → API Call → Game Controller → GameSession Model → MongoDB → Stats
```

## 🔐 Seguridad

### Autenticación
- **JWT Tokens**: Manejo de sesiones
- **bcrypt**: Hash de contraseñas
- **Middleware**: Validación de tokens

### Autorización
- **Role-based Access**: estudiante/docente/admin
- **Route Protection**: Middleware por roles
- **Resource Ownership**: Validación de propiedad

### Validación
- **Input Validation**: Sanitización de datos
- **CORS**: Configuración de orígenes
- **Error Handling**: Manejo de errores estructurado

## 📊 Escalabilidad

### Actual (Vertical)
- Single Node.js instance
- MongoDB single instance
- Static file serving

### Propuesta (Horizontal)
- Load Balancer (Nginx)
- Multiple Node.js instances
- MongoDB cluster
- Redis cache
- CDN for assets

## 🚀 Deployment

### Desarrollo
- Frontend: Vite dev server (localhost:5173)
- Backend: Express server (localhost:3000)
- Database: MongoDB local/Atlas

### Producción
- Frontend: Static build + CDN
- Backend: Docker containers + Load balancer
- Database: MongoDB Atlas cluster
- Monitoring: Application insights 