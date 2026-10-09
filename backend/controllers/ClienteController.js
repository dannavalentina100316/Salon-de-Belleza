
import bcryptjs from 'bcryptjs';
import Cliente from '../models/Cliente.js';

// Registrar un cliente
export const crearCliente = async (req, res) => {
  try {
    const { nombre, apellido, correo, telefono, password } = req.body;

    if (!nombre || !apellido || !correo || !telefono || !password) {
      return res.status(400).json({
        mensaje: 'Todos los campos son obligatorios'
      });
    }

    if (password.length < 6) {
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

    const passwordEncriptada = await bcryptjs.hash(password, 10);

    const cliente = new Cliente({
      nombre,
      apellido,
      correo: correo.trim().toLowerCase(),
      telefono,
      password: passwordEncriptada
    });

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