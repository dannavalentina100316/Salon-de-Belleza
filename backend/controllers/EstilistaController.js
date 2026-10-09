
import Estilista from '../models/Estilista.js';

// Crear un estilista
export const crearEstilista = async (req, res) => {
  try {
    const estilista = new Estilista(req.body);
    await estilista.save();

    res.status(201).json(estilista);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear estilista' });
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
    const estilista = await Estilista.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!estilista) {
      return res.status(404).json({ mensaje: 'Estilista no encontrado' });
    }

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
    const estilista = await Estilista.findByIdAndDelete(req.params.id);

    if (!estilista) {
      return res.status(404).json({ mensaje: 'Estilista no encontrado' });
    }

    res.json({ mensaje: 'Estilista eliminado' });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al eliminar estilista' });
  }
};