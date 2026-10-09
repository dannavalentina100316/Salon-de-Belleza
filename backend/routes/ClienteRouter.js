import { Router } from 'express';
import {
  crearCliente,
  listarClientes,
  buscarCliente
} from '../controllers/ClienteController.js';

const router = Router();

router.post('/', crearCliente);
router.get('/', listarClientes);
router.get('/:id', buscarCliente);

export default router;