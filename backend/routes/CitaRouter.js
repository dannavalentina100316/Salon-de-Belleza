import { Router } from 'express';
import {
  listarCitas,
  crearCita,
  generarCitasPrueba
} from '../controllers/CitaController.js';

const router = Router();

router.get('/', listarCitas);
router.post('/', crearCita);
router.post('/generar-prueba', generarCitasPrueba);

export default router;