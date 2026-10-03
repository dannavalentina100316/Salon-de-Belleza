import express from 'express';
import { body } from 'express-validator';
import { registrarCliente, loginCliente } from '../controllers/auth.controller.js';
import { validarCampos } from '../middlewares/validar-campos.js';

const router = express.Router();

router.post(
  '/registro',
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('correo').isEmail().withMessage('El correo no tiene un formato válido'),
    body('telefono').notEmpty().withMessage('El teléfono es obligatorio'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  validarCampos,
  registrarCliente
);

router.post(
  '/login',
  [
    body('correo').isEmail().withMessage('El correo no tiene un formato válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  ],
  validarCampos,
  loginCliente
);

export default router;
