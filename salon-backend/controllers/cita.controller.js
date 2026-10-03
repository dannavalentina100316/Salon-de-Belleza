import Cita from '../models/Cita.js';
import Cliente from '../models/Cliente.js';
import Estilista from '../models/Estilista.js';
import Servicio from '../models/Servicio.js';

export const crearCita = async (req, res) => {
  try {
    const { cliente, estilista, servicio, fecha, hora, observaciones } = req.body;

    const [clienteExiste, estilistaExiste, servicioExiste] = await Promise.all([
      Cliente.findById(cliente),
      Estilista.findById(estilista),
      Servicio.findById(servicio),
    ]);

    if (!clienteExiste) {
      return res.status(404).json({ ok: false, mensaje: 'El cliente no existe' });
    }

    if (!estilistaExiste) {
      return res.status(404).json({ ok: false, mensaje: 'La estilista no existe' });
    }

    if (!servicioExiste) {
      return res.status(404).json({ ok: false, mensaje: 'El servicio no existe' });
    }

    const citaDuplicada = await Cita.findOne({
      estilista,
      fecha,
      hora,
      estado: { $ne: 'cancelada' },
    });

    if (citaDuplicada) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La estilista no está disponible en ese horario',
      });
    }

    const cita = new Cita({
      cliente,
      estilista,
      servicio,
      fecha,
      hora,
      observaciones: observaciones || '',
    });

    await cita.save();

    return res.status(201).json({
      ok: true,
      mensaje: 'Cita creada correctamente',
      cita,
    });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al crear la cita', error: error.message });
  }
};

export const obtenerCitas = async (req, res) => {
  try {
    const citas = await Cita.find()
      .populate('cliente', 'nombre apellido correo telefono')
      .populate('estilista', 'nombre apellido especialidad')
      .populate('servicio', 'nombre descripcion precio duracion')
      .sort({ createdAt: -1 });

    return res.json({ ok: true, citas });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener las citas', error: error.message });
  }
};

export const obtenerCitaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await Cita.findById(id)
      .populate('cliente', 'nombre apellido correo telefono')
      .populate('estilista', 'nombre apellido especialidad')
      .populate('servicio', 'nombre descripcion precio duracion');

    if (!cita) {
      return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada' });
    }

    return res.json({ ok: true, cita });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener la cita', error: error.message });
  }
};

export const actualizarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { cliente, estilista, servicio, fecha, hora, observaciones, estado } = req.body;

    const citaActual = await Cita.findById(id);
    if (!citaActual) {
      return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada' });
    }

    const nuevaFecha = fecha || citaActual.fecha;
    const nuevaHora = hora || citaActual.hora;
    const nuevoEstilista = estilista || citaActual.estilista;

    const citaDuplicada = await Cita.findOne({
      _id: { $ne: id },
      estilista: nuevoEstilista,
      fecha: nuevaFecha,
      hora: nuevaHora,
      estado: { $ne: 'cancelada' },
    });

    if (citaDuplicada) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La estilista no está disponible en ese horario',
      });
    }

    const citaActualizada = await Cita.findByIdAndUpdate(
      id,
      { cliente, estilista, servicio, fecha, hora, observaciones, estado },
      { new: true, runValidators: true }
    );

    return res.json({ ok: true, mensaje: 'Cita actualizada correctamente', cita: citaActualizada });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al actualizar la cita', error: error.message });
  }
};

export const cancelarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await Cita.findByIdAndUpdate(
      id,
      { estado: 'cancelada' },
      { new: true }
    );

    if (!cita) {
      return res.status(404).json({ ok: false, mensaje: 'Cita no encontrada' });
    }

    return res.json({ ok: true, mensaje: 'Cita cancelada correctamente', cita });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: 'Error al cancelar la cita', error: error.message });
  }
};
