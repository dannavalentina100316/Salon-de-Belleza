
import mongoose from 'mongoose';
import { cargarServiciosIniciales } from '../controllers/ServicioController.js';


const servicioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  duracion: {
    type: Number,
    required: true,
    min: 1
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Servicio', servicioSchema);