# RUMI Backend

Backend de la plataforma educativa **RUMI**. Proporciona la API y lógica de negocio para la gestión de usuarios, cursos, lecciones, progreso y autenticación.

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
   ```

4. Inicia el servidor:
   ```bash
   npm start
   ```

## 📦 Scripts útiles

- `npm start` — Inicia el servidor en modo producción.
- `npm run dev` — Inicia el servidor en modo desarrollo (si usas nodemon).

## 🛠️ Estructura

- `/controllers` — Lógica de negocio y controladores de rutas.
- `/models` — Modelos de datos de Mongoose.
- `/routes` — Definición de rutas de la API.
- `/middleware` — Middlewares personalizados.
- `/config` — Configuración de la base de datos y otros.

## 🌐 Despliegue en Render/Railway

- Sube la carpeta `backend` como servicio.
- Configura las variables de entorno en el panel de la plataforma.
- Asegúrate de que el servidor escuche en `process.env.PORT`.

## 📚 Endpoints principales

- `/api/auth` — Autenticación y registro de usuarios
- `/api/courses` — Gestión de cursos y lecciones
- `/api/grades` — Calificaciones
- `/api/progress` — Progreso de los usuarios
- `/api/users` — Gestión de usuarios

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](../LICENSE) para más detalles.

---
**© 2024 Sebastian Mendoza Duitama. Todos los derechos reservados.** 