
import mongoose from 'mongoose';

const estilistaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  telefono: {
    type: String,
    trim: true
  },
  servicios: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Servicio',
    required: true
  }],
  horaInicio: {
    type: String,
    required: true
  },
  horaFin: {
    type: String,
    required: true
  },
  activa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Estilista', estilistaSchema);