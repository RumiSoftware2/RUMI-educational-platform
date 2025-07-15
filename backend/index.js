// 1. Importamos las dependencias
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // 👈 AÑADE ESTO
const connectDB = require('./config/db');

// 2. Configuramos dotenv
dotenv.config();

// 3. Conectamos a MongoDB
connectDB();

// 4. Creamos la aplicación Express
const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://rumieducation.vercel.app'
];

// 5. Middleware para CORS
app.use(cors({
  origin: allowedOrigins
}));

// 6. Middleware para manejar JSON
app.use(express.json());

// 7. Importamos y usamos rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/protectedRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/grades', require('./routes/gradeRoutes'));

// 8. Ruta básica de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// 9. Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
