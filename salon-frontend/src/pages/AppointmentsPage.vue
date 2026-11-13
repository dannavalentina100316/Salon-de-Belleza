
<template>
  <div class="appointments-page">
    <section class="page-heading">
      <div>
        <span class="eyebrow">FLORA STUDIO · ORGANIZACIÓN</span>
        <h2>Agenda de citas</h2>
        <p>Organiza cada reserva y brinda una atención especial.</p>
      </div>

      <div class="heading-actions">
        <BaseButton
          variant="secondary"
          :disabled="generando"
          :loading="generando"
          @click="generarCitas"
        >
          {{ generando ? 'Generando citas...' : 'Generar 200 citas de prueba' }}
        </BaseButton>

        <BaseButton icon="＋" size="large" @click="abrirFormulario">Nueva cita</BaseButton>
      </div>
    </section>

    <p v-if="errorGeneral" class="error-message">{{ errorGeneral }}</p>
    <section class="summary-grid">
      <article class="summary-card">
        <span class="summary-icon">▦</span>
        <div>
          <p>Total de citas</p>
          <strong>{{ store.appointments.length }}</strong>
        </div>
      </article>

      <article class="summary-card">
        <span class="summary-icon cream">♡</span>
        <div>
          <p>Clientes registrados</p>
          <strong>{{ store.clients.length }}</strong>
        </div>
      </article>

      <article class="summary-card">
        <span class="summary-icon green">✿</span>
        <div>
          <p>Estilistas disponibles</p>
          <strong>{{ store.stylists.filter(e => e.activa !== false).length }}</strong>
        </div>
      </article>
    </section>

    <section class="agenda-card">
      <div class="agenda-heading">
        <div>
          <span class="eyebrow">PLANIFICACIÓN</span>
          <h3>Reservas del salón</h3>
        </div>

        <div class="filters">
          <input
            v-model="busquedaAgenda"
            type="search"
            placeholder="Buscar por nombre o cliente"
            aria-label="Buscar reservas por nombre o cliente"
          />
          <input v-model="fechaFiltro" type="date" aria-label="Filtrar por fecha" />
          <BaseButton variant="secondary" @click="fechaFiltro = ''">Todas</BaseButton>
        </div>
      </div>

      <BaseTable
        :columns="appointmentColumns"
        :rows="citasFiltradas"
        :loading="store.loading"
        :error="store.error"
        :empty-message="busquedaAgenda ? 'No hay reservas que coincidan con la búsqueda' : fechaFiltro ? 'No hay citas para esta fecha' : 'Tu agenda está esperando nuevas citas'"
        :empty-description="busquedaAgenda ? 'Prueba con otro nombre de cliente, estilista o servicio.' : fechaFiltro ? 'Selecciona otra fecha o pulsa “Todas”.' : 'Registra una reserva para comenzar a organizar tu jornada.'"
        actions-label="Actualizar estado"
      >
        <template #cell="{ row, column }">
          <span v-if="column.key === 'fecha'">{{ mostrarFecha(row.fecha) }}</span>
          <span v-else-if="column.key === 'horario'" class="time-badge">
            {{ row.horaInicio || '—' }}{{ row.horaFin ? ` - ${row.horaFin}` : '' }}
          </span>
          <span v-else-if="['cliente', 'servicio', 'estilista'].includes(column.key)">
            {{ nombreRelacionado(row[column.key]) }}
          </span>
          <span v-else-if="column.key === 'precio'">{{ mostrarPrecio(row.precio) }}</span>
          <span v-else-if="column.key === 'estado'" :class="['status-badge', `status-${row.estado || 'agendada'}`]">
            {{ etiquetaEstado(row.estado) }}
          </span>
        </template>

        <template #actions="{ row }">
          <div class="status-actions">
            <BaseButton
              v-if="row.estado === 'cancelada'"
              variant="success"
              size="small"
              @click="abrirFormulario(row)"
            >
              Reagendar
            </BaseButton>
            <span v-else-if="row.estado === 'completada'" class="closed-appointment">
              Cita cerrada
            </span>
            <select
              v-else
              class="status-select"
              :value="row.estado || 'agendada'"
              :disabled="citaActualizandoId === (row._id || row.id)"
              aria-label="Cambiar estado de cita"
              @change="cambiarEstadoCita(row, $event.target.value, $event.target)"
            >
              <option value="agendada">Agendada</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
              <option value="completada">Realizada</option>
            </select>
          </div>
        </template>

        <template #empty-action>
          <BaseButton variant="secondary" @click="abrirFormulario">
            Registrar primera cita
          </BaseButton>
        </template>
      </BaseTable>
    </section>

    <div v-if="mostrarFormulario" class="modal-backdrop">
      <section class="booking-modal">
        <BaseButton
          class="close-button"
          variant="ghost"
          size="small"
          aria-label="Cerrar"
          @click="cerrarFormulario"
        >
          ×
        </BaseButton>

        <span class="eyebrow">FLORA STUDIO · RESERVAS</span>
        <h3>{{ reagendandoCita ? 'Reagendar cita' : 'Agendar una cita' }}</h3>
        <p class="modal-description">
          {{ reagendandoCita
            ? 'Se creará una nueva reserva; la cita cancelada se conservará en el historial.'
            : 'Registra una nueva clienta o busca una que ya esté en el sistema.' }}
        </p>

        <form @submit.prevent="guardarCita">
          <div class="client-mode">
            <BaseButton
              type="button"
              variant="ghost"
              :class="{ selected: modoCliente === 'existente' }"
              @click="cambiarModoCliente('existente')"
            >
              Buscar clienta
            </BaseButton>

            <BaseButton
              type="button"
              variant="ghost"
              :class="{ selected: modoCliente === 'nueva' }"
              @click="cambiarModoCliente('nueva')"
            >
              Nueva clienta
            </BaseButton>
          </div>

          <template v-if="modoCliente === 'existente'">
            <label>
              Buscar por nombre, apellido o teléfono
              <input
                v-model="busquedaCliente"
                type="search"
                autocomplete="off"
                placeholder="Escribe para buscar..."
                @input="formulario.cliente = ''"
                required
              />
            </label>

            <div
              v-if="busquedaCliente.trim() && !formulario.cliente"
              class="search-results"
            >
              <BaseButton
                v-for="cliente in clientesEncontrados"
                :key="cliente._id || cliente.id"
                type="button"
                variant="ghost"
                size="small"
                class="search-result"
                @click="seleccionarCliente(cliente)"
              >
                <strong>{{ cliente.nombre }} {{ cliente.apellido || '' }}</strong>
                <small>{{ cliente.telefono || cliente.correo || '' }}</small>
              </BaseButton>

              <p v-if="!clientesEncontrados.length">
                No encontramos coincidencias. Puedes registrar una nueva clienta.
              </p>
            </div>

            <p v-if="formulario.cliente" class="selected-client">
              <span>✓</span> Clienta seleccionada: {{ busquedaCliente }}
              <BaseButton type="button" variant="ghost" size="small" @click="limpiarCliente">Cambiar</BaseButton>
            </p>
          </template>

          <template v-else>
            <div class="form-row">
              <label>
                Nombre
                <input v-model="nuevaClienta.nombre" required maxlength="60" />
              </label>

              <label>
                Apellido
                <input v-model="nuevaClienta.apellido" required maxlength="60" />
              </label>
            </div>

            <label>
              Teléfono
              <input
                v-model="nuevaClienta.telefono"
                type="tel"
                inputmode="numeric"
                maxlength="10"
                pattern="[0-9]{10}"
                placeholder="3001234567"
                required
                @input="normalizarTelefono"
              />
            </label>

            <label>
              Correo electrónico
              <input v-model.trim="nuevaClienta.correo" type="email" required />
            </label>

          </template>

          <label>
            Servicio
            <select
              v-model="formulario.servicio"
              required
              @change="cambiarServicio"
            >
              <option disabled value="">Selecciona un servicio</option>
              <option
                v-if="servicioSeleccionado?.activo === false"
                :value="formulario.servicio"
                disabled
              >
                {{ servicioSeleccionado.nombre }} (inactivo; selecciona otro)
              </option>
              <option
                v-for="servicio in store.services.filter(s => s.activo !== false)"
                :key="servicio._id || servicio.id"
                :value="servicio._id || servicio.id"
              >
                {{ servicio.nombre }} — {{ mostrarPrecio(servicio.precio) }}
              </option>
            </select>
          </label>

          <label>
            Fecha
            <input
              v-model="formulario.fecha"
              type="date"
              :min="fechaActual"
              required
              @change="cambiarFecha"
            />
          </label>

          <label>
            Estilista y horario
            <select
              v-model="formulario.estilista"
              required
              :disabled="!formulario.servicio || !formulario.fecha"
              @change="formulario.horaInicio = ''"
            >
              <option disabled value="">Selecciona una estilista</option>
              <option
                v-for="estilista in estilistasDelServicio"
                :key="estilista._id || estilista.id"
                :value="estilista._id || estilista.id"
              >
                {{ estilista.nombre }} ({{ estilista.horasDisponibles.length }} horarios disponibles · {{ estilista.horaInicio }}–{{ estilista.horaFin }})
              </option>
            </select>
          </label>

          <p
            v-if="formulario.servicio && formulario.fecha && !estilistasDelServicio.length"
            class="error-message"
          >
            No hay estilistas disponibles para ese servicio y fecha.
          </p>

          <div v-if="formulario.estilista" class="form-row">
            <label>
              Horarios disponibles (cada 15 minutos)
              <select v-model="formulario.horaInicio" required>
                <option disabled value="">Selecciona una hora disponible</option>
                <option
                  v-for="hora in horasDisponibles"
                  :key="hora"
                  :value="hora"
                >
                  {{ hora }}
                </option>
              </select>
            </label>
          </div>
          <p v-if="formulario.estilista && !horasDisponibles.length" class="help-text">
            No hay horarios disponibles. El servicio no cabe en la jornada o todos los horarios se cruzan con otras citas.
          </p>

          <div v-if="servicioSeleccionado" class="price-summary">
            <span>
              {{ servicioSeleccionado.duracion || 'Duración no definida' }}
              {{ servicioSeleccionado.duracion ? 'minutos' : '' }}
            </span>
            <strong>{{ mostrarPrecio(servicioSeleccionado.precio) }}</strong>
          </div>

          <p v-if="errorFormulario" class="error-message">
            {{ errorFormulario }}
          </p>

          <div class="form-actions">
            <BaseButton
              type="button"
              variant="secondary"
              @click="cerrarFormulario"
            >
              Cancelar
            </BaseButton>

            <BaseButton
              type="submit"
              :loading="guardando"
            >
              {{ guardando ? 'Guardando...' : 'Confirmar cita' }}
            </BaseButton>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useSalonStore } from '../stores/salon'
import api from '../services/api'
import { confirmAction } from '../services/feedback'
import BaseButton from '../components/BaseButton.vue'
import BaseTable from '../components/BaseTable.vue'

const store = useSalonStore()

const mostrarFormulario = ref(false)
const guardando = ref(false)
const generando = ref(false)
const errorFormulario = ref('')
const errorGeneral = ref('')
const fechaFiltro = ref('')
const busquedaAgenda = ref('')
const modoCliente = ref('existente')
const busquedaCliente = ref('')
const citaActualizandoId = ref('')
const reagendandoCita = ref(false)

const appointmentColumns = [
  { key: 'fecha', label: 'Fecha' },
  { key: 'horario', label: 'Horario' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'servicio', label: 'Servicio' },
  { key: 'estilista', label: 'Estilista' },
  { key: 'precio', label: 'Precio' },
  { key: 'estado', label: 'Estado' },
]

function fechaLocal() {
  const hoy = new Date()
  const anio = hoy.getFullYear()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

const fechaActual = fechaLocal()

const formulario = reactive({
  cliente: '',
  servicio: '',
  estilista: '',
  fecha: '',
  horaInicio: '',
})

const nuevaClienta = reactive({
  nombre: '',
  apellido: '',
  telefono: '',
  correo: '',
})

const servicioSeleccionado = computed(() =>
  store.services.find(
    servicio =>
      String(servicio._id || servicio.id) === String(formulario.servicio),
  ),
)

const clientesEncontrados = computed(() => {
  const termino = busquedaCliente.value.trim().toLowerCase()
  if (!termino) return []

  return store.clients
    .filter(cliente => {
      const texto = [
        cliente.nombre,
        cliente.apellido,
        cliente.telefono,
        cliente.correo,
      ].join(' ').toLowerCase()

      return texto.includes(termino)
    })
    .slice(0, 8)
})

const estilistasDelServicio = computed(() => {
  const servicioId = String(formulario.servicio)
  if (
    !servicioId ||
    !formulario.fecha ||
    !servicioSeleccionado.value ||
    servicioSeleccionado.value.activo === false
  ) return []

  return store.stylists.flatMap(estilista => {
    if (estilista.activa === false) return []

    const servicios = estilista.servicios
    if (!Array.isArray(servicios)) return []

    const realizaServicio = servicios.some(servicio =>
      String(
        typeof servicio === 'object'
          ? servicio._id || servicio.id
          : servicio,
      ) === servicioId,
    )

    if (!realizaServicio) return []

    const apertura = minutosDelDia(estilista.horaInicio)
    const cierre = minutosDelDia(estilista.horaFin)
    const duracion = Number(servicioSeleccionado.value.duracion)
    if (!Number.isFinite(apertura) || !Number.isFinite(cierre) || duracion <= 0) {
      return []
    }

    const idEstilista = String(estilista._id || estilista.id)
    const ocupadas = store.appointments
      .filter(cita => {
        const citaEstilista = cita.estilista?._id || cita.estilista?.id || cita.estilista
        return String(citaEstilista) === idEstilista
          && cita.fecha === formulario.fecha
          && ['agendada', 'confirmada'].includes(cita.estado || 'agendada')
      })
      .map(cita => ({
        inicio: minutosDelDia(cita.horaInicio),
        fin: minutosDelDia(cita.horaFin),
      }))

    const ahora = new Date()
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes()
    const horariosDisponibles = []
    for (let inicio = apertura; inicio + duracion <= cierre; inicio += 15) {
      const fin = inicio + duracion
      if (
        formulario.fecha === fechaActual
        && inicio <= horaActual
      ) {
        continue
      }
      if (ocupadas.some(cita => inicio < cita.fin && fin > cita.inicio)) continue
      horariosDisponibles.push(horaDesdeMinutos(inicio))
    }

    return horariosDisponibles.length
      ? [{ ...estilista, horasDisponibles: horariosDisponibles }]
      : []
  })
})

const horasDisponibles = computed(() => {
  const estilista = estilistasDelServicio.value.find(
    item => String(item._id || item.id) === String(formulario.estilista),
  )
  return estilista?.horasDisponibles || []
})

const citasFiltradas = computed(() => {
  const termino = busquedaAgenda.value.trim().toLocaleLowerCase()

  return [...store.appointments]
    .filter(cita => !fechaFiltro.value || cita.fecha === fechaFiltro.value)
    .filter(cita => {
      if (!termino) return true

      const datosBuscables = [
        nombreRelacionado(cita.cliente),
        nombreRelacionado(cita.estilista),
        nombreRelacionado(cita.servicio),
      ]

      return datosBuscables.some(dato =>
        dato.toLocaleLowerCase().includes(termino),
      )
    })
    .sort((a, b) => {
      const creadoA = new Date(
        a.createdAt || `${a.fecha || ''}T${a.horaInicio || '00:00'}`,
      ).getTime()
      const creadoB = new Date(
        b.createdAt || `${b.fecha || ''}T${b.horaInicio || '00:00'}`,
      ).getTime()
      return creadoB - creadoA
    })
})

function normalizarTelefono(event) {
  const telefono = event.target.value.replace(/\D/g, '').slice(0, 10)
  nuevaClienta.telefono = telefono
  event.target.value = telefono
}

function minutosDelDia(hora) {
  if (!/^\d{2}:\d{2}$/.test(hora || '')) return Number.NaN
  const [horas, minutos] = hora.split(':').map(Number)
  return horas * 60 + minutos
}

function horaDesdeMinutos(total) {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function cambiarServicio() {
  formulario.estilista = ''
  formulario.horaInicio = ''
}

function cambiarFecha() {
  formulario.estilista = ''
  formulario.horaInicio = ''
}

function etiquetaEstado(estado) {
  return ({
    agendada: 'Agendada',
    confirmada: 'Confirmada',
    cancelada: 'Cancelada',
    completada: 'Realizada',
  })[estado] || 'Agendada'
}

async function cambiarEstadoCita(cita, estado, controlEstado) {
  if (['cancelada', 'completada'].includes(cita.estado)) {
    errorGeneral.value = 'Las citas canceladas o realizadas no se pueden reabrir.'
    if (controlEstado) controlEstado.value = cita.estado
    return
  }

  const id = cita._id || cita.id
  if (estado === 'cancelada') {
    const confirmado = await confirmAction({
      title: '¿Cancelar esta cita?',
      message: 'La cita quedará cerrada y no podrá modificarse. Si necesitas otra fecha, podrás crear una nueva reserva.',
      confirmText: 'Cancelar cita',
    })
    if (!confirmado) {
      if (controlEstado) controlEstado.value = cita.estado || 'agendada'
      return
    }
  }

  citaActualizandoId.value = id
  errorGeneral.value = ''
  try {
    await store.updateAppointmentStatus(id, estado)
  } catch (error) {
    errorGeneral.value = error.message || 'No se pudo actualizar el estado de la cita.'
    try {
      await store.loadAll()
    } catch (refreshError) {
      errorGeneral.value += ` Tampoco se pudo actualizar la agenda: ${refreshError.message}`
    }
  } finally {
    citaActualizandoId.value = ''
  }
}

async function generarCitas() {
  if (generando.value) return

  const confirmado = await confirmAction({
  title: '¿Generar citas de prueba?',
  message: 'Se crearán hasta 200 citas de prueba en la base de datos. Esta acción agregará registros a la agenda.',
  confirmText: 'Generar citas',
  tone: 'warning',
  })

  if (!confirmado) return

  generando.value = true
  errorGeneral.value = ''

  try {
    await api.post('/citas/generar-prueba')
    await store.loadAll()
  } catch (error) {
    errorGeneral.value =
      error.response?.data?.mensaje ||
      error.response?.data?.message ||
      error.message ||
      'No se pudieron generar las citas. Comprueba que el backend esté encendido.'
  } finally {
    generando.value = false
  }
}

function abrirFormulario(cita = null) {
  errorFormulario.value = ''
  errorGeneral.value = ''
  reagendandoCita.value = Boolean(cita)
  modoCliente.value = 'existente'
  busquedaCliente.value = ''

  Object.assign(formulario, {
    cliente: cita
      ? cita.cliente?._id || cita.cliente?.id || cita.cliente || ''
      : '',
    servicio: cita
      ? cita.servicio?._id || cita.servicio?.id || cita.servicio || ''
      : '',
    estilista: '',
    fecha: '',
    horaInicio: '',
  })
  if (cita?.cliente && typeof cita.cliente === 'object') {
    busquedaCliente.value =
      `${cita.cliente.nombre || ''} ${cita.cliente.apellido || ''}`.trim()
  }

  Object.assign(nuevaClienta, {
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
  })

  mostrarFormulario.value = true
}

function cerrarFormulario() {
  mostrarFormulario.value = false
  errorFormulario.value = ''
}

function cambiarModoCliente(modo) {
  modoCliente.value = modo
  formulario.cliente = ''
  busquedaCliente.value = ''
  errorFormulario.value = ''
}

function seleccionarCliente(cliente) {
  formulario.cliente = cliente._id || cliente.id
  busquedaCliente.value =
    `${cliente.nombre} ${cliente.apellido || ''}`.trim()
}

function limpiarCliente() {
  formulario.cliente = ''
  busquedaCliente.value = ''
}

function nombreRelacionado(relacion) {
  if (relacion && typeof relacion === 'object') {
    return (
      `${relacion.nombre || ''} ${relacion.apellido || ''}`.trim() ||
      'Sin información'
    )
  }

  if (typeof relacion === 'string' && !/^[a-f\d]{24}$/i.test(relacion)) {
    return relacion
  }

  return 'Sin información'
}

function mostrarFecha(fecha) {
  if (!fecha) return '—'
  const partes = String(fecha).slice(0, 10).split('-')
  return partes.length === 3
    ? `${partes[2]}/${partes[1]}/${partes[0]}`
    : '—'
}

function mostrarPrecio(precio) {
  if (precio === undefined || precio === null || precio === '') return '—'

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(precio))
}

async function guardarCita() {
  errorFormulario.value = ''

  if (!formulario.servicio) {
    errorFormulario.value = 'Selecciona un servicio.'
    return
  }

  if (modoCliente.value === 'existente' && !formulario.cliente) {
    errorFormulario.value = 'Busca y selecciona una clienta de la lista.'
    return
  }

  if (!formulario.estilista || !formulario.fecha || !formulario.horaInicio) {
    errorFormulario.value = 'Completa la estilista, la fecha y la hora.'
    return
  }

  if (formulario.fecha < fechaActual) {
    errorFormulario.value = 'No puedes registrar una cita en una fecha pasada.'
    return
  }

  const horaActual = `${String(new Date().getHours()).padStart(2, '0')}:${String(
    new Date().getMinutes(),
  ).padStart(2, '0')}`

  if (
    formulario.fecha === fechaActual &&
    formulario.horaInicio <= horaActual
  ) {
    errorFormulario.value = 'Selecciona una hora futura.'
    return
  }

  if (
    !estilistasDelServicio.value.some(
      estilista =>
        String(estilista._id || estilista.id) ===
        String(formulario.estilista),
    )
  ) {
    errorFormulario.value =
      'La estilista seleccionada no está asignada a este servicio.'
    return
  }

  if (!horasDisponibles.value.includes(formulario.horaInicio)) {
    errorFormulario.value = 'Ese horario ya no está disponible. Selecciona otro.'
    return
  }

  guardando.value = true

  try {
    let clienteId = formulario.cliente

    if (modoCliente.value === 'nueva') {
      const datos = {
        nombre: nuevaClienta.nombre.trim(),
        apellido: nuevaClienta.apellido.trim(),
        telefono: nuevaClienta.telefono,
        correo: nuevaClienta.correo.trim().toLowerCase(),
      }

      if (!datos.nombre || !datos.apellido || !datos.correo) {
        throw new Error('Completa todos los datos de la nueva clienta.')
      }

      if (!/^\d{10}$/.test(datos.telefono)) {
        throw new Error('El teléfono debe tener exactamente 10 dígitos.')
      }

      const resultado = await store.createClient(datos)
      const respuestaCliente = resultado?.data || resultado

      clienteId =
        respuestaCliente?.cliente?._id ||
        respuestaCliente?.cliente?.id ||
        respuestaCliente?._id ||
        respuestaCliente?.id

      if (!clienteId) {
        await store.loadAll()

        const clienteEncontrado = store.clients.find(
          cliente =>
            cliente.correo?.toLowerCase() === datos.correo,
        )

        clienteId = clienteEncontrado?._id || clienteEncontrado?.id
      }

      if (!clienteId) {
        throw new Error(
          'No se pudo obtener el identificador de la clienta. Revisa la respuesta del backend antes de volver a registrarla.',
        )
      }
    }

    await store.createAppointment({
      cliente: clienteId,
      servicio: formulario.servicio,
      estilista: formulario.estilista,
      fecha: formulario.fecha,
      horaInicio: formulario.horaInicio,
    })

    cerrarFormulario()
    await store.loadAll()
  } catch (error) {
    errorFormulario.value =
      error.response?.data?.mensaje ||
      error.response?.data?.message ||
      error.message ||
      'No se pudo registrar la cita.'
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  store.loadAll().catch(() => {})
})
</script>

<style scoped>
.appointments-page {
  max-width: 1500px;
  margin: 0 auto;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 25px;
}

.heading-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.eyebrow {
  color: #a26778;
  font-size: 10px;
  letter-spacing: 1.7px;
  font-weight: 600;
}

.page-heading h2,
.booking-modal h3 {
  margin: 10px 0;
  color: #503a40;
  font-family: Georgia, serif;
  font-size: 30px;
  font-weight: normal;
}

.page-heading p,
.modal-description {
  color: #9b8589;
  font-size: 13px;
  line-height: 1.6;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 22px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 22px;
  border: 1px solid #f0e6e3;
  border-radius: 13px;
  background: #fffdfb;
}

.summary-icon {
  width: 45px;
  height: 45px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: #f8e7eb;
  color: #a35f77;
  font-size: 23px;
}

.summary-icon.cream {
  background: #f8efdf;
  color: #a78b5e;
}

.summary-icon.green {
  background: #e9eee3;
  color: #748363;
}

.summary-card p {
  margin: 0 0 7px;
  color: #927d82;
  font-size: 12px;
}

.summary-card strong {
  color: #503a40;
  font-family: Georgia, serif;
  font-size: 25px;
  font-weight: normal;
}

.agenda-card {
  overflow: hidden;
  border: 1px solid #f0e6e3;
  border-radius: 13px;
  background: #fffdfb;
}

.agenda-heading {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 1px solid #f2e9e6;
}

.agenda-heading h3 {
  margin: 8px 0 0;
  color: #503a40;
  font-family: Georgia, serif;
  font-size: 22px;
  font-weight: normal;
}

.filters {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filters input {
  max-width: 190px;
  padding: 10px;
  border: 1px solid #e9dddc;
  border-radius: 8px;
  background: white;
  color: #62464e;
  font: inherit;
  font-size: 12px;
}

.time-badge {
  padding: 6px 9px;
  border-radius: 6px;
  background: #f8e9e9;
  color: #82485b;
  font-size: 11px;
}

.status-badge {
  display: inline-block;
  padding: 6px 9px;
  border-radius: 20px;
  background: #f8f1e5;
  color: #8b6f3c;
  font-size: 11px;
}

.status-confirmada,
.status-completada {
  background: #e9f3e6;
  color: #476d46;
}

.status-cancelada {
  background: #f9e8e6;
  color: #a13e36;
}

.status-select {
  max-width: 150px;
  padding: 7px 8px;
  border: 1px solid #e9dddc;
  border-radius: 7px;
  background: #fffdfb;
  color: #62464e;
  font: inherit;
  font-size: 11px;
}

.status-select:disabled {
  cursor: wait;
  opacity: 0.6;
}

.status-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.closed-appointment {
  color: #9b8589;
  font-size: 11px;
}

.help-text {
  margin: 0;
  color: #9b8589;
  font-size: 11px;
}

.empty-state {
  min-height: 230px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #9b8589;
  text-align: center;
  font-size: 12px;
}

.empty-state strong {
  color: #62464e;
  font-size: 15px;
}

.empty-state p {
  margin: 0;
}

.empty-flower {
  color: #b27688;
  font-size: 35px;
}

.error-message {
  padding: 12px;
  border-radius: 8px;
  background: #fff0ed;
  color: #a13e36;
  font-size: 12px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  padding: 20px;
  display: grid;
  place-items: center;
  overflow-y: auto;
  background: #39262e75;
}

.booking-modal {
  position: relative;
  width: 100%;
  max-width: 520px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 30px;
  border: 1px solid #f0e2e1;
  border-radius: 16px;
  background: #fffdfb;
  box-shadow: 0 20px 70px #39262e25;
}

.booking-modal h3 {
  font-size: 27px;
}

.modal-description {
  margin-bottom: 22px;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 17px;
  border: 0;
  background: transparent;
  color: #947d82;
  cursor: pointer;
  font-size: 27px;
}

.booking-modal form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.booking-modal label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  color: #74565f;
  font-size: 12px;
}

.booking-modal input,
.booking-modal select,
.booking-modal textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 12px;
  border: 1px solid #e9dddc;
  border-radius: 8px;
  outline: none;
  background: white;
  color: #503a40;
  font: inherit;
  font-size: 13px;
}

.booking-modal input:focus,
.booking-modal select:focus,
.booking-modal textarea:focus {
  border-color: #b77c8e;
  box-shadow: 0 0 0 3px #b77c8e18;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 13px;
}

.price-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  border-radius: 8px;
  background: #f8eeed;
  color: #805061;
  font-size: 12px;
}

.price-summary strong {
  font-size: 15px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}

.client-mode {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 5px;
  border-radius: 10px;
  background: #f8eeed;
}

.client-mode button {
  padding: 11px 8px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #805061;
  cursor: pointer;
  font-size: 12px;
}

.client-mode button.selected {
  background: #fffdfb;
  box-shadow: 0 2px 8px #39262e10;
  font-weight: 600;
}

.search-results {
  display: flex;
  flex-direction: column;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #eadbdc;
  border-radius: 8px;
  background: #fffdfb;
}

.search-result {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  padding: 12px;
  border: 0;
  border-bottom: 1px solid #f0e6e3;
  background: transparent;
  color: #503a40;
  cursor: pointer;
  text-align: left;
}

.search-result:hover {
  background: #fcf2f3;
}

.search-result small,
.search-results > p {
  color: #9b8589;
  font-size: 12px;
}

.search-results > p {
  padding: 12px;
}

.selected-client {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  color: #476d46;
  font-size: 12px;
}

.selected-client .base-button {
  border: 0;
  text-decoration: underline;
}

@media (max-width: 750px) {
  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .heading-actions {
    width: 100%;
  }

  .page-heading h2 {
    font-size: 26px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .agenda-heading {
    align-items: flex-start;
    flex-direction: column;
    padding: 18px;
  }

  .filters {
    width: 100%;
    flex-wrap: wrap;
  }

  .filters input {
    flex: 1;
  }

  .booking-modal {
    padding: 25px 20px;
  }
}

@media (max-width: 420px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .heading-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>