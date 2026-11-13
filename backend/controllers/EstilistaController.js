
import mongoose from 'mongoose';
import Estilista from '../models/Estilista.js';
import Servicio from '../models/Servicio.js';
import Cita from '../models/Cita.js';

function fechaLocalISO() {
  const hoy = new Date();
  return [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, '0'),
    String(hoy.getDate()).padStart(2, '0'),
  ].join('-');
}

// Crear un estilista
export const crearEstilista = async (req, res) => {
  try {
    const { nombre, telefono, servicios, horaInicio, horaFin, activa } = req.body;

    if (!nombre?.trim() || !horaInicio || !horaFin) {
      return res.status(400).json({
        mensaje: 'Completa el nombre y el horario de la estilista.',
      });
    }

    if (!Array.isArray(servicios) || servicios.length === 0) {
      return res.status(400).json({
        mensaje: 'Selecciona al menos un servicio para la estilista.',
      });
    }

    if (servicios.some(id => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({
        mensaje: 'Uno o más servicios seleccionados no tienen un identificador válido. Actualiza la página e inténtalo de nuevo.',
      });
    }

    const serviciosExistentes = await Servicio.countDocuments({
      _id: { $in: servicios },
    });

    if (serviciosExistentes !== new Set(servicios.map(String)).size) {
      return res.status(400).json({
        mensaje: 'Uno o más servicios seleccionados ya no existen. Actualiza la página y vuelve a seleccionarlos.',
      });
    }

    const estilista = new Estilista({
      nombre: nombre.trim(),
      telefono: telefono?.trim() || undefined,
      servicios,
      horaInicio,
      horaFin,
      activa,
    });
    await estilista.save();

    res.status(201).json(estilista);
  } catch (error) {
    console.error('Error al crear estilista:', error);
    const mensaje = error.name === 'ValidationError'
      ? Object.values(error.errors).map(errorCampo => errorCampo.message).join(' ')
      : 'No se pudo guardar la estilista. Revisa la conexión con la base de datos e inténtalo de nuevo.';
    res.status(400).json({ mensaje });
  }
};

// Mostrar todos los estilistas
export const listarEstilistas = async (req, res) => {
  try {
    const estilistas = await Estilista.find().populate('servicios');
    res.json(estilistas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar estilistas' });
  }
};

// Editar un estilista
export const actualizarEstilista = async (req, res) => {
  try {
    const actual = await Estilista.findById(req.params.id);

    if (!actual) {
      return res.status(404).json({ mensaje: 'Estilista no encontrado' });
    }

    const horaInicio = req.body.horaInicio ?? actual.horaInicio;
    const horaFin = req.body.horaFin ?? actual.horaFin;
    const servicios = req.body.servicios ?? actual.servicios;
    const citasPendientes = await Cita.find({
      estilista: actual._id,
      fecha: { $gte: fechaLocalISO() },
      estado: { $in: ['agendada', 'confirmada'] },
    }).select('servicio horaInicio horaFin fecha');

    const serviciosIds = new Set(servicios.map(id => id.toString()));
    const citaIncompatible = citasPendientes.find(cita =>
      !serviciosIds.has(cita.servicio.toString())
      || cita.horaInicio < horaInicio
      || cita.horaFin > horaFin,
    );

    if (citaIncompatible) {
      return res.status(409).json({
        mensaje: 'No se puede cambiar el horario o los servicios: la estilista tiene citas futuras que dependen de esos datos.',
      });
    }

    actual.set(req.body);
    const estilista = await actual.save();
    res.json(estilista);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar estilista' });
  }
};

// Activar o desactivar un estilista
export const cambiarEstadoEstilista = async (req, res) => {
  try {
    const estilista = await Estilista.findById(req.params.id);

    if (!estilista) {
      return res.status(404).json({ mensaje: 'Estilista no encontrado' });
    }

    estilista.activa = !estilista.activa;
    await estilista.save();

    res.json(estilista);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al cambiar estado' });
  }
};

// Eliminar un estilista
export const eliminarEstilista = async (req, res) => {
  try {
    const estilista = await Estilista.findById(req.params.id);

    if (!estilista) {
      return res.status(404).json({ mensaje: 'Estilista no encontrado' });
    }

    const citaPendiente = await Cita.exists({
      estilista: estilista._id,
      fecha: { $gte: fechaLocalISO() },
      estado: { $in: ['agendada', 'confirmada'] },
    });

    if (citaPendiente) {
      return res.status(409).json({
        mensaje: 'No se puede eliminar porque tiene citas futuras agendadas o confirmadas. Desactívala o resuelve primero sus citas.',
      });
    }

    await estilista.deleteOne();
    res.json({ mensaje: 'Estilista eliminado' });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al eliminar estilista' });
  }
};