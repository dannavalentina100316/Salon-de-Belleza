import express from 'express';
import { body } from 'express-validator';
import { crearEstilista, obtenerEstilistas, obtenerEstilistaPorId, actualizarEstilista, eliminarEstilista } from '../controllers/estilista.controller.js';
import { validarCampos } from '../middlewares/validar-campos.js';

const router = express.Router();

router.post(
  '/',
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('correo').isEmail().withMessage('El correo no tiene un formato válido'),
    body('telefono').notEmpty().withMessage('El teléfono es obligatorio'),
    body('especialidad').notEmpty().withMessage('La especialidad es obligatoria'),
  ],
  validarCampos,
  crearEstilista
);

router.get('/', obtenerEstilistas);
router.get('/:id', obtenerEstilistaPorId);
router.put(
  '/:id',
  [
    body('nombre').optional().notEmpty().withMessage('El nombre no puede ir vacío'),
    body('apellido').optional().notEmpty().withMessage('El apellido no puede ir vacío'),
    body('correo').optional().isEmail().withMessage('El correo no tiene un formato válido'),
  ],
  validarCampos,
  actualizarEstilista
);
router.delete('/:id', eliminarEstilista);

export default router;
