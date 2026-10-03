import bcrypt from 'bcryptjs';
import Cliente from '../models/Cliente.js';
import { generarJWT } from '../helpers/generar-jwt.js';

export const registrarCliente = async (req, res) => {
  try {
    const { nombre, apellido, correo, telefono, password } = req.body;

    const clienteExistente = await Cliente.findOne({ correo });
    if (clienteExistente) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El correo ya está registrado',
      });
    }

    const salt = bcrypt.genSaltSync();
    const passwordHash = bcrypt.hashSync(password, salt);

    const cliente = new Cliente({
      nombre,
      apellido,
      correo,
      telefono,
      password: passwordHash,
    });

    await cliente.save();

    const token = generarJWT(cliente._id);

    return res.status(201).json({
      ok: true,
      mensaje: 'Cliente registrado correctamente',
      token,
      cliente: {
        _id: cliente._id,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        correo: cliente.correo,
        telefono: cliente.telefono,
        estado: cliente.estado,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Error al registrar el cliente',
      error: error.message,
    });
  }
};

export const loginCliente = async (req, res) => {
  try {
    const { correo, password } = req.body;

    const cliente = await Cliente.findOne({ correo });

    if (!cliente) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas',
      });
    }

    const passwordValida = bcrypt.compareSync(password, cliente.password);
    if (!passwordValida) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas',
      });
    }

    const token = generarJWT(cliente._id);

    return res.json({
      ok: true,
      mensaje: 'Inicio de sesión correcto',
      token,
      cliente: {
        _id: cliente._id,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        correo: cliente.correo,
        telefono: cliente.telefono,
        estado: cliente.estado,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Error al iniciar sesión',
      error: error.message,
    });
  }
};
