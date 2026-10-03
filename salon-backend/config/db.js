import mongoose from 'mongoose';

let connectionPromise;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI no configurada. Agrégala al archivo .env para conectar MongoDB Atlas.');
  }

  connectionPromise = mongoose.connect(mongoUri)
    .then(() => {
      console.log('MongoDB conectado correctamente');
      return mongoose;
    })
    .catch((error) => {
      connectionPromise = undefined;
      console.error('Error al conectar MongoDB:', error.message);
      throw new Error('No se pudo conectar a MongoDB Atlas. Revisa la URI y la configuración de acceso.');
    });

  return connectionPromise;
};
