
import { Router } from 'express';

import {
  crearEstilista,
  listarEstilistas,
  actualizarEstilista,
  cambiarEstadoEstilista,
  eliminarEstilista
} from '../controllers/EstilistaController.js';

const router = Router();

router.get('/', listarEstilistas);
router.post('/', crearEstilista);
router.put('/:id', actualizarEstilista);
router.patch('/:id/estado', cambiarEstadoEstilista);
router.delete('/:id', eliminarEstilista);

export default router;