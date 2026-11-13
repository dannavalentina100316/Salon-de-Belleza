
import mongoose from 'mongoose';

export const conectarDB = async () => {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    throw new Error('Falta configurar MONGODB_URI en el archivo .env del backend.');
  }

  await mongoose.connect(uri);
  console.log('MongoDB Atlas conectado correctamente');
};