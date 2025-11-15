// 1. Importamos las dependencias
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // 👈 AÑADE ESTO
const connectDB = require('./config/db');
const passport = require('./config/passport');
const cron = require('node-cron');
const User = require('./models/User');
const feedbackRoutes = require('./routes/feedbackRoutes');

// 2. Configuramos dotenv
dotenv.config();

// 3. Conectamos a MongoDB
connectDB();

// 4. Creamos la aplicación Express
const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL || 'https://rumieducation.vercel.app'
];

// 5. Middleware para CORS
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// 6. Middleware para manejar JSON
app.use(express.json());

// 7. Configurar Passport
app.use(passport.initialize());

// 8. Importamos y usamos rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/protectedRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/grades', require('./routes/gradeRoutes'));
app.use('/api/feedback', feedbackRoutes);

// Cleanup diario a las 2:00 AM UTC
// cron.schedule('0 2 * * *', async () => {
//   const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
//   const result = await User.deleteMany({ emailVerified: false, createdAt: { $lt: cutoff } });
//   console.log(`[CLEANUP-CRON] Usuarios no verificados eliminados: ${result.deletedCount}`);
// });

// 9. Ruta básica de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// 10. Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
