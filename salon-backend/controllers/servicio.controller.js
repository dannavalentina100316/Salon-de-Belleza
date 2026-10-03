import Servicio from '../models/Servicio.js';

export const crearServicio = async (req, res) => {
  try {
    const { nombre, descripcion, precio, duracion, estado } = req.body;

    const servicio = new Servicio({ nombre, descripcion, precio, duracion, estado });
    await servicio.save();

    return res.status(201).json({ ok: true, mensaje: 'Servicio creado correctamente', servicio });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al crear el servicio', error: error.message });
  }
};

export const obtenerServicios = async (req, res) => {
  try {
    const servicios = await Servicio.find({ estado: true }).sort({ createdAt: -1 });
    return res.json({ ok: true, servicios });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener los servicios', error: error.message });
  }
};

export const obtenerServicioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.findById(id);

    if (!servicio) {
      return res.status(404).json({ ok: false, mensaje: 'Servicio no encontrado' });
    }

    return res.json({ ok: true, servicio });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener el servicio', error: error.message });
  }
};

export const actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!servicio) {
      return res.status(404).json({ ok: false, mensaje: 'Servicio no encontrado' });
    }

    return res.json({ ok: true, mensaje: 'Servicio actualizado correctamente', servicio });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al actualizar el servicio', error: error.message });
  }
};

export const eliminarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.findByIdAndUpdate(id, { estado: false }, { new: true });

    if (!servicio) {
      return res.status(404).json({ ok: false, mensaje: 'Servicio no encontrado' });
    }

    return res.json({ ok: true, mensaje: 'Servicio eliminado correctamente', servicio });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al eliminar el servicio', error: error.message });
  }
};
