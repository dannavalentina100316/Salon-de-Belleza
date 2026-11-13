
import bcryptjs from 'bcryptjs';
import Cliente from '../models/Cliente.js';

// Registrar un cliente
export const crearCliente = async (req, res) => {
  try {
    const { nombre, apellido, correo, telefono, password } = req.body;

    if (!nombre || !apellido || !correo || !telefono) {
      return res.status(400).json({
        mensaje: 'Todos los campos son obligatorios'
      });
    }

    if (password !== undefined && (typeof password !== 'string' || password.length < 6)) {
      return res.status(400).json({
        mensaje: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const correoExiste = await Cliente.findOne({
      correo: correo.trim().toLowerCase()
    });

    if (correoExiste) {
      return res.status(400).json({
        mensaje: 'Este correo ya está registrado'
      });
    }

    const cliente = new Cliente({
      nombre,
      apellido,
      correo: correo.trim().toLowerCase(),
      telefono
    });

    if (password) {
      cliente.password = await bcryptjs.hash(password, 10);
    }

    await cliente.save();

    const clienteRespuesta = cliente.toObject();
    delete clienteRespuesta.password;

    return res.status(201).json({
      mensaje: 'Cliente registrado correctamente',
      cliente: clienteRespuesta
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        mensaje: 'Este correo ya está registrado'
      });
    }

    return res.status(500).json({
      mensaje: 'Error al registrar el cliente',
      error: error.message
    });
  }
};

export const actualizarCliente = async (req, res) => {
  try {
    const { nombre, apellido, correo, telefono } = req.body;

    if (!nombre?.trim() || !apellido?.trim() || !correo?.trim() || !telefono?.trim()) {
      return res.status(400).json({
        mensaje: 'Completa todos los datos del cliente.'
      });
    }

    const correoNormalizado = correo.trim().toLowerCase();
    const correoExiste = await Cliente.findOne({
      correo: correoNormalizado,
      _id: { $ne: req.params.id }
    });

    if (correoExiste) {
      return res.status(400).json({
        mensaje: 'Este correo ya está registrado'
      });
    }

    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: correoNormalizado,
        telefono: telefono.trim()
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!cliente) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado'
      });
    }

    return res.status(200).json(cliente);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        mensaje: 'Este correo ya está registrado'
      });
    }

    return res.status(400).json({
      mensaje: 'No se pudo actualizar el cliente',
      error: error.message
    });
  }
};

// Consultar todos los clientes
export const listarClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find()
      .select('-password')
      .sort({ nombre: 1 });

    return res.status(200).json(clientes);
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error al consultar los clientes',
      error: error.message
    });
  }
};

// Buscar un cliente por su ID
export const buscarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id)
      .select('-password');

    if (!cliente) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado'
      });
    }

    return res.status(200).json(cliente);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'No se pudo buscar el cliente',
      error: error.message
    });
  }
};