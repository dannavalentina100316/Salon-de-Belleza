import mongoose from 'mongoose';

const ServicioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser menor a 0'],
    },
    duracion: {
      type: Number,
      required: [true, 'La duración es obligatoria'],
      min: [15, 'La duración mínima es de 15 minutos'],
    },
    estado: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Servicio', ServicioSchema);
