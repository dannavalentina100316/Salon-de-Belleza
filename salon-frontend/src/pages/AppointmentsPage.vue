
<template>
  <div class="appointments-page">
    <section class="page-heading">
      <div>
        <span class="eyebrow">FLORA STUDIO · ORGANIZACIÓN</span>
        <h2>Agenda de citas</h2>
        <p>Organiza cada reserva y brinda una atención especial.</p>
      </div>

      <div class="heading-actions">
        <button
          class="secondary-button"
          type="button"
          :disabled="generando"
          @click="generarCitas"
        >
          {{ generando ? 'Generando citas...' : 'Generar 200 citas de prueba' }}
        </button>

        <button class="primary-button" @click="abrirFormulario">
          ＋ Nueva cita
        </button>
      </div>
    </section>

    <p v-if="store.error" class="error-message">{{ store.error }}</p>
    <p v-if="errorGeneral" class="error-message">{{ errorGeneral }}</p>
    <p v-if="mensaje" class="success-message">{{ mensaje }}</p>

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
          <input v-model="fechaFiltro" type="date" aria-label="Filtrar por fecha" />
          <button class="clear-button" @click="fechaFiltro = ''">Todas</button>
        </div>
      </div>

      <div v-if="store.loading" class="empty-state">
        Cargando citas...
      </div>

      <div v-else-if="citasFiltradas.length" class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Horario</th>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Estilista</th>
              <th>Precio</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(cita, index) in citasFiltradas"
              :key="cita._id || cita.id || index"
            >
              <td>{{ mostrarFecha(cita.fecha) }}</td>
              <td>
                <span class="time-badge">
                  {{ cita.horaInicio || '—' }}{{ cita.horaFin ? ` - ${cita.horaFin}` : '' }}
                </span>
              </td>
              <td>{{ nombreRelacionado(cita.cliente) }}</td>
              <td>{{ nombreRelacionado(cita.servicio) }}</td>
              <td>{{ nombreRelacionado(cita.estilista) }}</td>
              <td>{{ mostrarPrecio(cita.precio) }}</td>
              <td>{{ cita.estado || 'agendada' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <span class="empty-flower">✿</span>
        <strong>
          {{ fechaFiltro ? 'No hay citas para esta fecha' : 'Tu agenda está esperando nuevas citas' }}
        </strong>
        <p>
          {{ fechaFiltro
            ? 'Selecciona otra fecha o pulsa “Todas”.'
            : 'Registra una reserva para comenzar a organizar tu jornada.' }}
        </p>
        <button class="secondary-button" @click="abrirFormulario">
          Registrar primera cita
        </button>
      </div>
    </section>

    <div v-if="mostrarFormulario" class="modal-backdrop">
      <section class="booking-modal">
        <button
          class="close-button"
          type="button"
          aria-label="Cerrar"
          @click="cerrarFormulario"
        >
          ×
        </button>

        <span class="eyebrow">FLORA STUDIO · RESERVAS</span>
        <h3>Agendar una cita</h3>
        <p class="modal-description">
          Registra una nueva clienta o busca una que ya esté en el sistema.
        </p>

        <form @submit.prevent="guardarCita">
          <div class="client-mode">
            <button
              type="button"
              :class="{ selected: modoCliente === 'existente' }"
              @click="cambiarModoCliente('existente')"
            >
              Buscar clienta
            </button>

            <button
              type="button"
              :class="{ selected: modoCliente === 'nueva' }"
              @click="cambiarModoCliente('nueva')"
            >
              Nueva clienta
            </button>
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
              <button
                v-for="cliente in clientesEncontrados"
                :key="cliente._id || cliente.id"
                type="button"
                class="search-result"
                @click="seleccionarCliente(cliente)"
              >
                <strong>{{ cliente.nombre }} {{ cliente.apellido || '' }}</strong>
                <small>{{ cliente.telefono || cliente.correo || '' }}</small>
              </button>

              <p v-if="!clientesEncontrados.length">
                No encontramos coincidencias. Puedes registrar una nueva clienta.
              </p>
            </div>

            <p v-if="formulario.cliente" class="selected-client">
              <span>✓</span> Clienta seleccionada: {{ busquedaCliente }}
              <button type="button" @click="limpiarCliente">Cambiar</button>
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

            <label>
              Contraseña para su cuenta
              <input
                v-model="nuevaClienta.password"
                type="password"
                minlength="6"
                autocomplete="new-password"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </label>

            <p class="modal-description">
              No utilices una contraseña personal tuya para registrar a la clienta.
            </p>
          </template>

          <label>
            Servicio
            <select
              v-model="formulario.servicio"
              required
              @change="formulario.estilista = ''"
            >
              <option disabled value="">Selecciona un servicio</option>
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
            Estilista
            <select v-model="formulario.estilista" required>
              <option disabled value="">Selecciona una estilista</option>
              <option
                v-for="estilista in estilistasDelServicio"
                :key="estilista._id || estilista.id"
                :value="estilista._id || estilista.id"
              >
                {{ estilista.nombre }} {{ estilista.apellido || '' }}
              </option>
            </select>
          </label>

          <p
            v-if="formulario.servicio && !estilistasDelServicio.length"
            class="error-message"
          >
            No hay estilistas asignadas a este servicio. Revisa los servicios de cada estilista.
          </p>

          <div class="form-row">
            <label>
              Fecha
              <input
                v-model="formulario.fecha"
                type="date"
                :min="fechaActual"
                required
              />
            </label>

            <label>
              Hora de inicio
              <input
                v-model="formulario.horaInicio"
                type="time"
                min="07:00"
                max="21:00"
                required
              />
            </label>
          </div>

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
            <button
              type="button"
              class="secondary-button"
              @click="cerrarFormulario"
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="primary-button"
              :disabled="guardando"
            >
              {{ guardando ? 'Guardando...' : 'Confirmar cita' }}
            </button>
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

const store = useSalonStore()

const mostrarFormulario = ref(false)
const guardando = ref(false)
const generando = ref(false)
const errorFormulario = ref('')
const errorGeneral = ref('')
const mensaje = ref('')
const fechaFiltro = ref('')
const modoCliente = ref('existente')
const busquedaCliente = ref('')

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
  password: '',
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
  if (!servicioId) return []

  return store.stylists.filter(estilista => {
    if (estilista.activa === false) return false

    const servicios = estilista.servicios
    if (!Array.isArray(servicios)) return false

    return servicios.some(servicio =>
      String(
        typeof servicio === 'object'
          ? servicio._id || servicio.id
          : servicio,
      ) === servicioId,
    )
  })
})

const citasFiltradas = computed(() =>
  [...store.appointments]
    .filter(cita => !fechaFiltro.value || cita.fecha === fechaFiltro.value)
    .sort((a, b) =>
      `${a.fecha || ''} ${a.horaInicio || ''}`.localeCompare(
        `${b.fecha || ''} ${b.horaInicio || ''}`,
      ),
    ),
)

function normalizarTelefono(event) {
  const telefono = event.target.value.replace(/\D/g, '').slice(0, 10)
  nuevaClienta.telefono = telefono
  event.target.value = telefono
}

async function generarCitas() {
  if (generando.value) return

  const confirmar = window.confirm(
    '¿Deseas generar las 200 citas de prueba en la base de datos? Esta acción puede crear registros de prueba.',
  )

  if (!confirmar) return

  generando.value = true
  errorGeneral.value = ''
  mensaje.value = ''

  try {
    const respuesta = await api.post('/citas/generar-prueba')
    await store.loadAll()

    mensaje.value =
      respuesta.data?.mensaje ||
      respuesta.data?.message ||
      'La solicitud terminó. Revisa el total de citas en la agenda.'
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

function abrirFormulario() {
  errorFormulario.value = ''
  errorGeneral.value = ''
  mensaje.value = ''
  modoCliente.value = 'existente'
  busquedaCliente.value = ''

  Object.assign(formulario, {
    cliente: '',
    servicio: '',
    estilista: '',
    fecha: '',
    horaInicio: '',
  })

  Object.assign(nuevaClienta, {
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    password: '',
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
  mensaje.value = ''

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

  guardando.value = true

  try {
    let clienteId = formulario.cliente

    if (modoCliente.value === 'nueva') {
      const datos = {
        nombre: nuevaClienta.nombre.trim(),
        apellido: nuevaClienta.apellido.trim(),
        telefono: nuevaClienta.telefono,
        correo: nuevaClienta.correo.trim().toLowerCase(),
        password: nuevaClienta.password,
      }

      if (!datos.nombre || !datos.apellido || !datos.correo) {
        throw new Error('Completa todos los datos de la nueva clienta.')
      }

      if (!/^\d{10}$/.test(datos.telefono)) {
        throw new Error('El teléfono debe tener exactamente 10 dígitos.')
      }

      if (datos.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.')
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
    mensaje.value = 'La cita se registró correctamente.'
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

.primary-button,
.secondary-button,
.clear-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
}

.primary-button {
  background: #82485b;
  color: white;
}

.primary-button:hover {
  background: #663748;
}

.primary-button:disabled,
.secondary-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.secondary-button,
.clear-button {
  border: 1px solid #eadbdc;
  background: #fffdfb;
  color: #805061;
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

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th {
  padding: 15px;
  background: #fcf7f5;
  color: #9c8288;
  font-size: 10px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  padding: 16px 15px;
  border-top: 1px solid #f3ebe8;
  color: #78666b;
  font-size: 12px;
  white-space: nowrap;
}

tbody tr:hover {
  background: #fffbf9;
}

.time-badge {
  padding: 6px 9px;
  border-radius: 6px;
  background: #f8e9e9;
  color: #82485b;
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

.success-message {
  margin: 15px 0;
  padding: 12px;
  border: 1px solid #d7e7d5;
  border-radius: 8px;
  background: #f0f8ed;
  color: #476d46;
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

.selected-client button {
  border: 0;
  background: transparent;
  color: #82485b;
  cursor: pointer;
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