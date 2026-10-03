import express from 'express';
import { body } from 'express-validator';
import { crearCliente, obtenerClientes, obtenerPerfilCliente, obtenerClientePorId, actualizarCliente, eliminarCliente } from '../controllers/cliente.controller.js';
import { validarCampos } from '../middlewares/validar-campos.js';
import { validarJWT } from '../middlewares/validar-jwt.js';

const router = express.Router();

router.post(
  '/',
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('correo').isEmail().withMessage('El correo no tiene un formato válido'),
    body('telefono').notEmpty().withMessage('El teléfono es obligatorio'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  validarCampos,
  crearCliente
);

router.get('/', obtenerClientes);
router.get('/perfil', validarJWT, obtenerPerfilCliente);
router.get('/:id', obtenerClientePorId);
router.put(
  '/:id',
  [
    body('nombre').optional().notEmpty().withMessage('El nombre no puede ir vacío'),
    body('apellido').optional().notEmpty().withMessage('El apellido no puede ir vacío'),
    body('correo').optional().isEmail().withMessage('El correo no tiene un formato válido'),
  ],
  validarCampos,
  actualizarCliente
);
router.delete('/:id', eliminarCliente);

export default router;
