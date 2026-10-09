
import mongoose from 'mongoose';

const citaSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
  },
  estilista: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Estilista',
    required: true,
  },
  servicio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Servicio',
    required: true,
  },
  fecha: {
    type: String,
    required: true,
  },
  horaInicio: {
    type: String,
    required: true,
  },
  horaFin: {
    type: String,
    required: true,
  },
  precio: {
    type: Number,
    required: true,
    min: 0,
  },
  estado: {
    type: String,
    enum: ['agendada', 'confirmada', 'cancelada', 'completada'],
    default: 'agendada',
  },

  // Identificación de citas generadas para pruebas
  esPrueba: {
    type: Boolean,
    default: false,
  },
  lotePruebaId: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Cita', citaSchema);