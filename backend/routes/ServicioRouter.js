
import { Router } from 'express';

import {
  crearServicio,
  listarServicios,
  actualizarServicio,
  cambiarEstadoServicio,
  eliminarServicio,
  cargarServiciosIniciales
} from '../controllers/ServicioController.js';

const router = Router();

router.get('/', listarServicios);
router.post('/', crearServicio);
router.post('/cargar-iniciales', cargarServiciosIniciales);
router.put('/:id', actualizarServicio);
router.patch('/:id/estado', cambiarEstadoServicio);
router.delete('/:id', eliminarServicio);

export default router;