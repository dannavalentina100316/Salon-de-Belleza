import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import clienteRoutes from './routes/cliente.routes.js';
import estilistaRoutes from './routes/estilista.routes.js';
import servicioRoutes from './routes/servicio.routes.js';
import citaRoutes from './routes/cita.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3200;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API del salón de belleza activa',
    version: '1.0.0',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/estilistas', estilistaRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/citas', citaRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    msg: 'Error interno del servidor',
    error: err.message,
  });
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error(`No se pudo iniciar el servidor: ${error.message}`);
  process.exit(1);
});
