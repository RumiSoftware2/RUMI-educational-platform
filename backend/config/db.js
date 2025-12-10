// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('La variable MONGODB_URI no está definida en el archivo .env');
    }

    // Conectar con un timeout de selección de servidor corto para fallar rápido en deploys
    await mongoose.connect(uri, {
      // Reduce el tiempo que Mongoose espera para encontrar un servidor (ms)
      serverSelectionTimeoutMS: 5000,
      // Opciones recomendadas
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conexión a MongoDB exitosa');
  } catch (err) {
    console.error('🔴 Error al conectar a MongoDB:', err.message);
    // Salir con código 1 para que la plataforma (Render) pueda reiniciar el servicio.
    process.exit(1);
  }
};

module.exports = connectDB;

