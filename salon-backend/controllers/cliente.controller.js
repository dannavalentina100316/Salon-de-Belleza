import bcrypt from 'bcryptjs';
import Cliente from '../models/Cliente.js';

export const obtenerPerfilCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.usuario.uid).select('-password');

    if (!cliente) {
      return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    }

    return res.json({ ok: true, cliente });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener el perfil del cliente',
      error: error.message,
    });
  }
};

export const crearCliente = async (req, res) => {
  try {
    const { nombre, apellido, correo, telefono, password, estado } = req.body;

    const existeCliente = await Cliente.findOne({ correo });
    if (existeCliente) {
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
      estado,
    });

    await cliente.save();

    return res.status(201).json({
      ok: true,
      mensaje: 'Cliente creado correctamente',
      cliente,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Error al crear el cliente',
      error: error.message,
    });
  }
};

export const obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find({ estado: true }).sort({ createdAt: -1 });

    return res.json({
      ok: true,
      clientes,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener los clientes',
      error: error.message,
    });
  }
};

export const obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findById(id);

    if (!cliente) {
      return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    }

    return res.json({ ok: true, cliente });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener el cliente', error: error.message });
  }
};

export const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, ...resto } = req.body;

    const datosActualizacion = { ...resto };

    if (password) {
      const salt = bcrypt.genSaltSync();
      datosActualizacion.password = bcrypt.hashSync(password, salt);
    }

    const cliente = await Cliente.findByIdAndUpdate(id, datosActualizacion, {
      new: true,
      runValidators: true,
    });

    if (!cliente) {
      return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    }

    return res.json({ ok: true, mensaje: 'Cliente actualizado correctamente', cliente });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al actualizar el cliente', error: error.message });
  }
};

export const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByIdAndUpdate(id, { estado: false }, { new: true });

    if (!cliente) {
      return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    }

    return res.json({ ok: true, mensaje: 'Cliente eliminado correctamente', cliente });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al eliminar el cliente', error: error.message });
  }
};
