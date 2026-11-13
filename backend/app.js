
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { conectarDB } from './database/Conexion.js';
import Estilista from './models/Estilista.js';


import CitaRouter from './routes/CitaRouter.js';
import ClienteRouter from './routes/ClienteRouter.js';
import EstilistaRouter from './routes/EstilistaRouter.js';
import ServicioRouter from './routes/ServicioRouter.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 3000;

const eliminarIndiceCorreoObsoleto = async () => {
  const indexes = await Estilista.collection.indexes();
  const legacyEmailIndex = indexes.find(index =>
    index.unique === true
    && Object.keys(index.key).length === 1
    && index.key.correo === 1,
  );

  if (legacyEmailIndex) {
    await Estilista.collection.dropIndex(legacyEmailIndex.name);
    console.log('Índice único obsoleto de correo eliminado de estilistas');
  }
};

const iniciarServidor = async () => {
  await conectarDB();
  await eliminarIndiceCorreoObsoleto();

  app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
  });
};

iniciarServidor().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error.message);
  process.exitCode = 1;
});