import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI no configurada. Agrégala al archivo .env para conectar MongoDB Atlas.');
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB conectado correctamente');
  } catch (error) {
    console.error('❌ Error al conectar MongoDB:', error.message);
    throw new Error('No se pudo conectar a MongoDB Atlas. Revisa la URI y la configuración de acceso.');
  }
};
