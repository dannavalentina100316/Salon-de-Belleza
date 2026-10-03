import mongoose from 'mongoose';

const CitaSchema = new mongoose.Schema(
  {
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
      required: [true, 'El cliente es obligatorio'],
    },
    estilista: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estilista',
      required: [true, 'La estilista es obligatoria'],
    },
    servicio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Servicio',
      required: [true, 'El servicio es obligatorio'],
    },
    fecha: {
      type: String,
      required: [true, 'La fecha es obligatoria'],
    },
    hora: {
      type: String,
      required: [true, 'La hora es obligatoria'],
    },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmada', 'cancelada'],
      default: 'pendiente',
    },
    observaciones: {
      type: String,
      default: '',
      trim: true,
    },
    fechaCreacion: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Cita', CitaSchema);
