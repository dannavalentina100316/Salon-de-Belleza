import { Router } from 'express';
import {
  listarCitas,
  crearCita,
  actualizarEstadoCita,
  generarCitasPrueba
} from '../controllers/CitaController.js';

const router = Router();

router.get('/', listarCitas);
router.post('/', crearCita);
router.patch('/:id/estado', actualizarEstadoCita);
router.post('/generar-prueba', generarCitasPrueba);

export default router;