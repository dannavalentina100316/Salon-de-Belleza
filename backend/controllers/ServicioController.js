
import Servicio from '../models/Servicio.js';

// Servicios iniciales
const serviciosIniciales = [
  { nombre: 'Corte de cabello', descripcion: 'Corte de cabello', precio: 25000, duracion: 30 },
  { nombre: 'Cepillado', descripcion: 'Cepillado de cabello', precio: 20000, duracion: 30 },
  { nombre: 'Planchado', descripcion: 'Planchado de cabello', precio: 25000, duracion: 30 },
  { nombre: 'Peinado', descripcion: 'Peinado especial', precio: 40000, duracion: 45 },
  { nombre: 'Tinte', descripcion: 'Coloración de cabello', precio: 80000, duracion: 120 },
  { nombre: 'Mechas', descripcion: 'Aplicación de mechas', precio: 120000, duracion: 180 },
  { nombre: 'Balayage', descripcion: 'Técnica de coloración balayage', precio: 180000, duracion: 240 },
  { nombre: 'Decoloración', descripcion: 'Decoloración de cabello', precio: 90000, duracion: 120 },
  { nombre: 'Hidratación capilar', descripcion: 'Tratamiento hidratante', precio: 45000, duracion: 45 },
  { nombre: 'Keratina', descripcion: 'Tratamiento de keratina', precio: 150000, duracion: 180 },
  { nombre: 'Alisado', descripcion: 'Tratamiento alisador', precio: 120000, duracion: 150 },
  { nombre: 'Botox capilar', descripcion: 'Tratamiento de botox capilar', precio: 100000, duracion: 120 },
  { nombre: 'Manicure', descripcion: 'Cuidado de uñas de manos', precio: 20000, duracion: 30 },
  { nombre: 'Pedicure', descripcion: 'Cuidado de uñas de pies', precio: 25000, duracion: 45 },
  { nombre: 'Semipermanente', descripcion: 'Esmaltado semipermanente', precio: 35000, duracion: 60 },
  { nombre: 'Uñas acrílicas', descripcion: 'Aplicación de uñas acrílicas', precio: 80000, duracion: 120 },
  { nombre: 'Retiro de uñas', descripcion: 'Retiro de uñas artificiales', precio: 20000, duracion: 30 },
  { nombre: 'Diseño de uñas', descripcion: 'Decoración de uñas', precio: 15000, duracion: 30 },
  { nombre: 'Maquillaje social', descripcion: 'Maquillaje para eventos', precio: 80000, duracion: 60 },
  { nombre: 'Maquillaje de noche', descripcion: 'Maquillaje para eventos nocturnos', precio: 100000, duracion: 75 },
  { nombre: 'Diseño de cejas', descripcion: 'Diseño y perfilado de cejas', precio: 15000, duracion: 20 },
  { nombre: 'Depilación de cejas', descripcion: 'Depilación de cejas', precio: 12000, duracion: 15 },
  { nombre: 'Pestañas pelo a pelo', descripcion: 'Extensiones de pestañas', precio: 90000, duracion: 120 },
  { nombre: 'Lifting de pestañas', descripcion: 'Elevación de pestañas', precio: 50000, duracion: 60 },
  { nombre: 'Limpieza facial', descripcion: 'Limpieza básica del rostro', precio: 60000, duracion: 60 },
  { nombre: 'Tratamiento facial', descripcion: 'Tratamiento para el rostro', precio: 80000, duracion: 75 },
  { nombre: 'Depilación facial', descripcion: 'Depilación del rostro', precio: 25000, duracion: 30 },
  { nombre: 'Masaje relajante', descripcion: 'Masaje corporal relajante', precio: 70000, duracion: 60 },
  { nombre: 'Tratamiento corporal', descripcion: 'Cuidado y tratamiento corporal', precio: 90000, duracion: 90 },
  { nombre: 'Peinado para eventos', descripcion: 'Peinado para ocasiones especiales', precio: 70000, duracion: 90 }
];

// Crear un servicio
export const crearServicio = async (req, res) => {
  try {
    const servicio = new Servicio(req.body);
    await servicio.save();

    res.status(201).json(servicio);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear el servicio' });
  }
};

// Listar todos los servicios
export const listarServicios = async (req, res) => {
  try {
    const servicios = await Servicio.find().sort({ nombre: 1 });
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar los servicios' });
  }
};

// Cargar los servicios iniciales sin duplicar nombres exactos
export const cargarServiciosIniciales = async (req, res) => {
  try {
    for (const datos of serviciosIniciales) {
      await Servicio.updateOne(
        { nombre: datos.nombre },
        { $setOnInsert: datos },
        { upsert: true }
      );
    }

    res.json({ mensaje: 'Servicios iniciales cargados' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cargar los servicios' });
  }
};

// Editar un servicio
export const actualizarServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    res.json(servicio);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar el servicio' });
  }
};

// Activar o desactivar un servicio
export const cambiarEstadoServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id);

    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    servicio.activo = !servicio.activo;
    await servicio.save();

    res.json(servicio);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al cambiar el estado' });
  }
};

// Eliminar un servicio desactivándolo
export const eliminarServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id);

    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    servicio.activo = false;
    await servicio.save();

    res.json({ mensaje: 'Servicio desactivado correctamente' });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al desactivar el servicio' });
  }
};