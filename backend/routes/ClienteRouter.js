import { Router } from 'express';
import {
  crearCliente,
  actualizarCliente,
  listarClientes,
  buscarCliente
} from '../controllers/ClienteController.js';

const router = Router();

router.post('/', crearCliente);
router.put('/:id', actualizarCliente);
router.get('/', listarClientes);
router.get('/:id', buscarCliente);

export default router;