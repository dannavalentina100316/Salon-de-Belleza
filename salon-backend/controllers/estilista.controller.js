import Estilista from '../models/Estilista.js';

export const crearEstilista = async (req, res) => {
  try {
    const { nombre, apellido, correo, telefono, especialidad, estado } = req.body;

    const estilistaExistente = await Estilista.findOne({ correo });
    if (estilistaExistente) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El correo de la estilista ya está registrado',
      });
    }

    const estilista = new Estilista({ nombre, apellido, correo, telefono, especialidad, estado });
    await estilista.save();

    return res.status(201).json({ ok: true, mensaje: 'Estilista creado correctamente', estilista });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al crear la estilista', error: error.message });
  }
};

export const obtenerEstilistas = async (req, res) => {
  try {
    const estilistas = await Estilista.find({ estado: true }).sort({ createdAt: -1 });
    return res.json({ ok: true, estilistas });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener las estilistas', error: error.message });
  }
};

export const obtenerEstilistaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const estilista = await Estilista.findById(id);

    if (!estilista) {
      return res.status(404).json({ ok: false, mensaje: 'Estilista no encontrada' });
    }

    return res.json({ ok: true, estilista });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener la estilista', error: error.message });
  }
};

export const actualizarEstilista = async (req, res) => {
  try {
    const { id } = req.params;
    const estilista = await Estilista.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!estilista) {
      return res.status(404).json({ ok: false, mensaje: 'Estilista no encontrada' });
    }

    return res.json({ ok: true, mensaje: 'Estilista actualizada correctamente', estilista });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al actualizar la estilista', error: error.message });
  }
};

export const eliminarEstilista = async (req, res) => {
  try {
    const { id } = req.params;
    const estilista = await Estilista.findByIdAndUpdate(id, { estado: false }, { new: true });

    if (!estilista) {
      return res.status(404).json({ ok: false, mensaje: 'Estilista no encontrada' });
    }

    return res.json({ ok: true, mensaje: 'Estilista eliminada correctamente', estilista });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al eliminar la estilista', error: error.message });
  }
};
