// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('La variable MONGODB_URI no está definida en el archivo .env');
    }

    await mongoose.connect(uri);
    console.log('✅ Conexión a MongoDB exitosa');
  } catch (err) {
    console.error('🔴 Error al conectar a MongoDB:', err.message);
    process.exit(1); // Finaliza la app si falla la conexión
  }
};

module.exports = connectDB;

