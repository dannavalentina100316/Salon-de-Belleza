
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { conectarDB } from './database/Conexion.js';


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

const iniciarServidor = async () => {
  await conectarDB();

  app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
  });
};

iniciarServidor();