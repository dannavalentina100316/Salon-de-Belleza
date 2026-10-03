import express from 'express';
import { body } from 'express-validator';
import { crearCita, obtenerCitas, obtenerCitaPorId, actualizarCita, cancelarCita } from '../controllers/cita.controller.js';
import { validarCampos } from '../middlewares/validar-campos.js';

const router = express.Router();

router.post(
  '/',
  [
    body('cliente').notEmpty().withMessage('El cliente es obligatorio'),
    body('estilista').notEmpty().withMessage('La estilista es obligatoria'),
    body('servicio').notEmpty().withMessage('El servicio es obligatorio'),
    body('fecha').notEmpty().withMessage('La fecha es obligatoria'),
    body('hora').notEmpty().withMessage('La hora es obligatoria'),
  ],
  validarCampos,
  crearCita
);

router.get('/', obtenerCitas);
router.get('/:id', obtenerCitaPorId);
router.put(
  '/:id',
  [
    body('fecha').optional().notEmpty().withMessage('La fecha no puede ir vacía'),
    body('hora').optional().notEmpty().withMessage('La hora no puede ir vacía'),
  ],
  validarCampos,
  actualizarCita
);
router.delete('/:id', cancelarCita);

export default router;
