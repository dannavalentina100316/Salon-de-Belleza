
import mongoose from 'mongoose';
import Cita from '../models/Cita.js';
import Cliente from '../models/Cliente.js';
import Estilista from '../models/Estilista.js';
import Servicio from '../models/Servicio.js';
import bcrypt from 'bcryptjs';


// Registrar una cita
export const crearCita = async (req, res) => {
  try {
    const {
      cliente,
      estilista,
      servicio,
      fecha,
      horaInicio
    } = req.body;

    // Verificar que se hayan enviado los datos
    if (!cliente || !estilista || !servicio || !fecha || !horaInicio) {
      return res.status(400).json({
        mensaje: 'Completa todos los datos de la cita'
      });
    }

    // Validar los identificadores
    const ids = [cliente, estilista, servicio];

    if (!ids.every(id => mongoose.isValidObjectId(id))) {
      return res.status(400).json({
        mensaje: 'Uno de los identificadores no es válido'
      });
    }

    // Validar el formato de la fecha y la hora
    const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;
    const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;

    const fechaValida = new Date(`${fecha}T12:00:00`);

    if (
      !formatoFecha.test(fecha) ||
      fechaValida.toISOString().slice(0, 10) !== fecha ||
      !formatoHora.test(horaInicio)
    ) {
      return res.status(400).json({
        mensaje: 'La fecha o la hora no tienen un formato válido'
      });
    }

    // Buscar los registros en la base de datos
    const [clienteExiste, estilistaExiste, servicioExiste] =
      await Promise.all([
        Cliente.findById(cliente),
        Estilista.findOne({ _id: estilista, activa: true }),
        Servicio.findOne({ _id: servicio, activo: true })
      ]);

    if (!clienteExiste) {
      return res.status(404).json({
        mensaje: 'La clienta no está registrada'
      });
    }

    if (!estilistaExiste) {
      return res.status(404).json({
        mensaje: 'La estilista no existe o está inactiva'
      });
    }

    if (!servicioExiste) {
      return res.status(404).json({
        mensaje: 'El servicio no existe o está inactivo'
      });
    }

    // Verificar que la estilista realice ese servicio
    const puedeRealizarlo = estilistaExiste.servicios.some(
      id => id.toString() === servicio
    );

    if (!puedeRealizarlo) {
      return res.status(400).json({
        mensaje: 'Esta estilista no realiza el servicio seleccionado'
      });
    }

    // Calcular la hora de finalización
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const inicioMinutos = horas * 60 + minutos;
    const finMinutos = inicioMinutos + servicioExiste.duracion;

    if (finMinutos > 24 * 60) {
      return res.status(400).json({
        mensaje: 'La cita no puede terminar después de medianoche'
      });
    }

    const horaFin =
      `${String(Math.floor(finMinutos / 60)).padStart(2, '0')}:` +
      `${String(finMinutos % 60).padStart(2, '0')}`;

    // Comprobar el horario de trabajo
    if (
      horaInicio < estilistaExiste.horaInicio ||
      horaFin > estilistaExiste.horaFin
    ) {
      return res.status(400).json({
        mensaje: 'La cita queda fuera del horario de la estilista'
      });
    }

    // Evitar citas en fechas pasadas
    const hoy = new Date();
    const fechaHoy =
      `${hoy.getFullYear()}-` +
      `${String(hoy.getMonth() + 1).padStart(2, '0')}-` +
      `${String(hoy.getDate()).padStart(2, '0')}`;

    const horaActual =
      `${String(hoy.getHours()).padStart(2, '0')}:` +
      `${String(hoy.getMinutes()).padStart(2, '0')}`;

    if (fecha < fechaHoy || (fecha === fechaHoy && horaInicio <= horaActual)) {
      return res.status(400).json({
        mensaje: 'Selecciona una fecha y hora futuras'
      });
    }

    // Comprobar si la estilista ya tiene una cita en ese intervalo
    const citaCruzada = await Cita.findOne({
      estilista,
      fecha,
      estado: { $in: ['agendada', 'confirmada'] },
      horaInicio: { $lt: horaFin },
      horaFin: { $gt: horaInicio }
    });

    if (citaCruzada) {
      return res.status(409).json({
        mensaje: 'La estilista ya tiene una cita en ese horario'
      });
    }

    // Guardar la cita y el precio actual del servicio
    const cita = await Cita.create({
      cliente,
      estilista,
      servicio,
      fecha,
      horaInicio,
      horaFin,
      precio: servicioExiste.precio
    });

    return res.status(201).json({
      mensaje: 'Cita registrada correctamente',
      cita
    });
  } catch (error) {
    console.error('Error al registrar cita:', error.message);

    return res.status(500).json({
      mensaje: 'Error al registrar la cita'
    });
  }
};

// Consultar las citas del salón
export const listarCitas = async (req, res) => {
  try {
    const citas = await Cita.find()
      .populate('cliente', 'nombre telefono')
      .populate('estilista', 'nombre telefono')
      .populate('servicio', 'nombre duracion')
      .sort({ fecha: 1, horaInicio: 1 });

    return res.status(200).json(citas);
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error al consultar las citas'
    });
  }
};

export const generarCitasPrueba = async (req, res) => {
  const LIMITE = 200;
  const DIAS = 30;
  const LOTE = 'flora-studio-pruebas-200-v1';

  try {
    // Evita generar el mismo lote más de una vez.
    const loteExistente = await Cita.exists({
      lotePruebaId: LOTE,
    });

    if (loteExistente) {
      return res.status(409).json({
        mensaje:
          'El lote de 200 citas de prueba ya existe. No se generó otro.',
      });
    }

    const estilistas = await Estilista.find({ activa: true });
    const servicios = await Servicio.find({ activo: true });

    if (!estilistas.length || !servicios.length) {
      return res.status(400).json({
        mensaje:
          'Primero debes registrar al menos una estilista activa y un servicio activo.',
      });
    }

    // Cada estilista debe tener un horario válido y servicios asignados.
    const personalDisponible = estilistas.filter((estilista) => {
      return (
        estilista.horaInicio &&
        estilista.horaFin &&
        estilista.horaInicio < estilista.horaFin &&
        Array.isArray(estilista.servicios) &&
        estilista.servicios.length > 0
      );
    });

    if (!personalDisponible.length) {
      return res.status(400).json({
        mensaje:
          'No hay estilistas con horarios válidos y servicios asignados.',
      });
    }

    const serviciosDisponibles = servicios.filter((servicio) => {
      return (
        Number.isFinite(Number(servicio.duracion)) &&
        Number(servicio.duracion) > 0 &&
        Number.isFinite(Number(servicio.precio)) &&
        Number(servicio.precio) >= 0
      );
    });

    if (!serviciosDisponibles.length) {
      return res.status(400).json({
        mensaje: 'No hay servicios con precio y duración válidos.',
      });
    }

    // Fechas locales, desde mañana hasta los próximos 30 días.
    const fechas = [];

    for (let i = 1; i <= DIAS; i++) {
      const fecha = new Date();
      fecha.setHours(12, 0, 0, 0);
      fecha.setDate(fecha.getDate() + i);

      const yyyy = fecha.getFullYear();
      const mm = String(fecha.getMonth() + 1).padStart(2, '0');
      const dd = String(fecha.getDate()).padStart(2, '0');

      fechas.push(`${yyyy}-${mm}-${dd}`);
    }

    const primeraFecha = fechas[0];
    const ultimaFecha = fechas[fechas.length - 1];

    // Consultamos las citas que ya ocupan horarios.
    const citasExistentes = await Cita.find({
      fecha: { $gte: primeraFecha, $lte: ultimaFecha },
      estado: { $in: ['agendada', 'confirmada'] },
    }).select('cliente estilista fecha horaInicio horaFin');

    const agenda = new Map();

    const claveAgenda = (estilistaId, fecha) =>
      `${estilistaId}-${fecha}`;

    const seCruza = (inicioA, finA, inicioB, finB) =>
      inicioA < finB && finA > inicioB;

    for (const cita of citasExistentes) {
      const clave = claveAgenda(cita.estilista.toString(), cita.fecha);

      if (!agenda.has(clave)) agenda.set(clave, []);

      agenda.get(clave).push({
        inicio: cita.horaInicio,
        fin: cita.horaFin,
      });
    }

    const minutos = (hora) => {
      const [h, m] = hora.split(':').map(Number);
      return h * 60 + m;
    };

    const formatoHora = (total) => {
      const h = Math.floor(total / 60);
      const m = total % 60;

      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const citasNuevas = [];
    let indiceCliente = 1;
    let indiceServicio = 0;

    // Repartimos las citas entre fechas y estilistas.
    for (const fecha of fechas) {
      for (const estilista of personalDisponible) {
        if (citasNuevas.length >= LIMITE) break;

        const serviciosDeEstilista = serviciosDisponibles.filter(
          (servicio) =>
            estilista.servicios.some(
              (id) => id.toString() === servicio._id.toString(),
            ),
        );

        if (!serviciosDeEstilista.length) continue;

        const clave = claveAgenda(estilista._id.toString(), fecha);

        if (!agenda.has(clave)) agenda.set(clave, []);

        const ocupados = agenda.get(clave);
        const apertura = minutos(estilista.horaInicio);
        const cierre = minutos(estilista.horaFin);

        // Se avanza en bloques de 15 minutos.
        for (
          let inicio = apertura;
          inicio < cierre && citasNuevas.length < LIMITE;
          inicio += 15
        ) {
          const servicio =
            serviciosDeEstilista[
              indiceServicio % serviciosDeEstilista.length
            ];

          indiceServicio++;

          const duracion = Number(servicio.duracion);
          const fin = inicio + duracion;

          if (fin > cierre) continue;

          const horaInicio = formatoHora(inicio);
          const horaFin = formatoHora(fin);

          const conflicto = ocupados.some((cita) =>
            seCruza(
              horaInicio,
              horaFin,
              cita.inicio,
              cita.fin,
            ),
          );

          if (conflicto) continue;

          // Cliente de prueba único por cita.
          const numero = String(indiceCliente).padStart(3, '0');
          const correo = `prueba.flora.${numero}@example.com`;
          const password = await bcrypt.hash(
            `FloraPrueba-${numero}-2026`,
            10,
          );

          let cliente = await Cliente.findOne({ correo });

          if (!cliente) {
            cliente = await Cliente.create({
              nombre: 'Cliente',
              apellido: `Prueba ${numero}`,
              correo,
              telefono: `300${String(indiceCliente).padStart(7, '0')}`,
              password,
            });
          }

          citasNuevas.push({
            cliente: cliente._id,
            estilista: estilista._id,
            servicio: servicio._id,
            fecha,
            horaInicio,
            horaFin,
            precio: Number(servicio.precio),
            estado: 'agendada',
            esPrueba: true,
            lotePruebaId: LOTE,
          });

          // Reservamos inmediatamente el espacio en memoria.
          ocupados.push({
            inicio: horaInicio,
            fin: horaFin,
          });

          indiceCliente++;
        }
      }
    }

    if (!citasNuevas.length) {
      return res.status(400).json({
        mensaje:
          'No se encontraron espacios disponibles. Revisa los horarios y servicios de las estilistas.',
        creadas: 0,
        solicitadas: LIMITE,
      });
    }

    // Inserta las citas como un lote en MongoDB.
    await Cita.insertMany(citasNuevas, { ordered: true });

    return res.status(201).json({
      mensaje:
        citasNuevas.length === LIMITE
          ? 'Se generaron las 200 citas de prueba correctamente.'
          : 'Se generaron citas, pero no hubo capacidad suficiente para completar las 200.',
      solicitadas: LIMITE,
      creadas: citasNuevas.length,
      faltantes: LIMITE - citasNuevas.length,
      clientesDePrueba: indiceCliente - 1,
      desde: primeraFecha,
      hasta: ultimaFecha,
    });
  } catch (error) {
    console.error('Error al generar citas de prueba:', error);

    return res.status(500).json({
      mensaje: 'No se pudieron generar las citas de prueba.',
      error: error.message,
    });
  }
};