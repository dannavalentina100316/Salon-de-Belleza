
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

import { conectarDB } from './database/Conexion.js';

import CitaRouter from './routes/CitaRouter.js';
import ClienteRouter from './routes/ClienteRouter.js';
import EstilistaRouter from './routes/EstilistaRouter.js';
import ServicioRouter from './routes/ServicioRouter.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(async (req, res, next) => {
  try {
    await conectarDB();
    next();
  } catch (error) {
    console.error('No se pudo conectar con MongoDB:', error.message);
    res.status(503).json({
      mensaje: 'No se pudo conectar con la base de datos. Revisa la configuración del servidor.',
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API del Salón de Belleza funcionando correctamente'
  });
});

// Rutas de la aplicación

app.use('/api/citas', CitaRouter);
app.use('/api/clientes', ClienteRouter);
app.use('/api/estilistas', EstilistaRouter);
app.use('/api/servicios', ServicioRouter);

const rutaArchivoActual = fileURLToPath(import.meta.url);
const ejecutadoDirectamente = process.argv[1]
  && resolve(process.argv[1]) === rutaArchivoActual;

if (ejecutadoDirectamente) {
  const PORT = process.env.PORT || 3000;

  conectarDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Servidor funcionando en http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error('No se pudo iniciar el servidor:', error.message);
      process.exitCode = 1;
    });
}

export default app;