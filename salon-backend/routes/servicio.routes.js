import express from 'express';
import { body } from 'express-validator';
import { crearServicio, obtenerServicios, obtenerServicioPorId, actualizarServicio, eliminarServicio } from '../controllers/servicio.controller.js';
import { validarCampos } from '../middlewares/validar-campos.js';

const router = express.Router();

router.post(
  '/',
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('descripcion').notEmpty().withMessage('La descripción es obligatoria'),
    body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número válido'),
    body('duracion').isNumeric().withMessage('La duración debe ser un número'),
  ],
  validarCampos,
  crearServicio
);

router.get('/', obtenerServicios);
router.get('/:id', obtenerServicioPorId);
router.put(
  '/:id',
  [
    body('nombre').optional().notEmpty().withMessage('El nombre no puede ir vacío'),
    body('precio').optional().isFloat({ min: 0 }).withMessage('El precio debe ser un número válido'),
  ],
  validarCampos,
  actualizarServicio
);
router.delete('/:id', eliminarServicio);

export default router;
