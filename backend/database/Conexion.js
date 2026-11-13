
import mongoose from 'mongoose';

let conexionEnCurso;

export const conectarDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    throw new Error('Falta configurar MONGODB_URI en el archivo .env del backend.');
  }

  if (!conexionEnCurso) {
    conexionEnCurso = mongoose.connect(uri)
      .then((conexion) => {
        console.log('MongoDB Atlas conectado correctamente');
        return conexion;
      })
      .catch((error) => {
        conexionEnCurso = undefined;
        throw error;
      });
  }

  return conexionEnCurso;
};