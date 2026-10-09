
<template>
  <div class="directory-page">
    <section class="page-heading">
      <div>
        <span class="eyebrow">FLORA STUDIO · ADMINISTRACIÓN</span>
        <h2>{{ configuracion.titulo }}</h2>
        <p>{{ configuracion.descripcion }}</p>
      </div>

      <button class="primary-button" @click="abrirFormulario">
        + Nuevo registro
      </button>
    </section>

    <p v-if="store.error" class="error-message">{{ store.error }}</p>
    <p v-if="mensaje" class="success-message">{{ mensaje }}</p>

    <section class="directory-card">
      <div class="directory-toolbar">
        <div class="tabs">
          <RouterLink to="/clientes">Clientes</RouterLink>
          <RouterLink to="/estilistas">Estilistas</RouterLink>
          <RouterLink to="/servicios">Servicios</RouterLink>
        </div>

        <input
          v-model="busqueda"
          type="search"
          placeholder="Buscar registros..."
          aria-label="Buscar registros"
        />
      </div>

      <div v-if="store.loading" class="empty-state">
        Cargando información...
      </div>

      <div v-else-if="registrosFiltrados.length" class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th v-for="columna in configuracion.columnas" :key="columna.key">
                {{ columna.label }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="registro in registrosFiltrados"
                :key="registro._id || registro.id">
              <td v-for="columna in configuracion.columnas" :key="columna.key">
                <template v-if="columna.key === 'estado'">
                  <span :class="['status', estaActivo(registro) ? 'active' : 'inactive']">
                    {{ estaActivo(registro) ? 'Activo' : 'Inactivo' }}
                  </span>
                </template>

                <template v-else-if="columna.key === 'servicios'">
                  {{ nombresServicios(registro.servicios) }}
                </template>

                <template v-else-if="columna.key === 'precio'">
                  {{ mostrarPrecio(registro.precio) }}
                </template>

                <template v-else>
                  {{ valorColumna(registro, columna.key) }}
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <span class="empty-flower">✿</span>
        <strong>No hay registros para mostrar</strong>
        <p>Prueba otra búsqueda o agrega un nuevo registro.</p>
        <button class="secondary-button" @click="abrirFormulario">
          Crear registro
        </button>
      </div>
    </section>


<div v-if="mostrarFormulario" class="modal-backdrop">      <section class="directory-modal">
        <button class="close-button" type="button" @click="cerrarFormulario">×</button>

        <span class="eyebrow">FLORA STUDIO · REGISTROS</span>
        <h3>{{ configuracion.formularioTitulo }}</h3>
        <p class="modal-description">{{ configuracion.descripcionFormulario }}</p>

        <form @submit.prevent="guardarRegistro">
          <!-- FORMULARIO DE CLIENTE -->
          <template v-if="tipo === 'clientes'">
            <div class="form-row">
              <label>
                Nombre
                <input v-model.trim="formulario.nombre" required maxlength="60" />
              </label>

              <label>
                Apellido
                <input v-model.trim="formulario.apellido" required maxlength="60" />
              </label>
            </div>

            
            <label>
              Teléfono
              
<input
  v-model="formulario.telefono"
  type="tel"
  inputmode="numeric"
  maxlength="10"
  pattern="[0-9]{10}"
  placeholder="3001234567"
  required
  @input="normalizarTelefono"
/>            </label>

            <label>
              Correo electrónico
              <input v-model.trim="formulario.correo" type="email" required />
            </label>

            <label>
              Contraseña de la cuenta
              <input
                v-model="formulario.password"
                type="password"
                minlength="6"
                autocomplete="new-password"
                required
              />
            </label>
          </template>

          <!-- FORMULARIO DE ESTILISTA -->
          <template v-else-if="tipo === 'estilistas'">
            <div class="form-row">
              <label>
                Nombre
                <input v-model.trim="formulario.nombre" required maxlength="60" />
              </label>

              <label>
                Apellido
                <input v-model.trim="formulario.apellido" required maxlength="60" />
              </label>
            </div>

            <label>
              Cargo o especialidad
              <select v-model="formulario.cargo" required>
                <option disabled value="">Selecciona un cargo</option>
                <option v-for="cargo in cargos" :key="cargo" :value="cargo">
                  {{ cargo }}
                </option>
              </select>
            </label>

            <label>
              Teléfono
<input
  v-model="formulario.telefono"
  type="tel"
  inputmode="numeric"
  maxlength="10"
  pattern="[0-9]{10}"
  placeholder="3001234567"
  required
  @input="normalizarTelefono"
/>            </label>

            <label>
              Correo electrónico
              <input v-model.trim="formulario.correo" type="email" required />
            </label>

            <div class="section-label">
              <strong>Servicios que puede realizar</strong>
              <p>Selecciona todos los que correspondan.</p>
            </div>

            <div v-if="store.services.length" class="service-options">
              <label v-for="servicio in store.services.filter(s => s.activo !== false)"
                     :key="servicio._id || servicio.id"
                     class="service-option">
                <input
                  type="checkbox"
                  :value="servicio._id || servicio.id"
                  v-model="formulario.servicios"
                />
                <span>{{ servicio.nombre }}</span>
                <small>{{ mostrarPrecio(servicio.precio) }}</small>
              </label>
            </div>

            <p v-else class="help-text">
              Primero registra los servicios del salón para poder asignarlos.
            </p>

            <div class="section-label">
              <strong>Horario de trabajo</strong>
              <p>Define la hora de inicio y finalización de la jornada.</p>
            </div>

            <div class="form-row">
              <label>
                Entrada
                <input v-model="formulario.horaInicio" type="time" required />
              </label>

              <label>
                Salida
                <input v-model="formulario.horaFin" type="time" required />
              </label>
            </div>

            <label class="checkbox-line">
              <input v-model="formulario.activa" type="checkbox" />
              Estilista activa y disponible para nuevas reservas
            </label>
          </template>

          <!-- FORMULARIO DE SERVICIO -->
          <template v-else>
            <label>
              Nombre del servicio
              <input v-model.trim="formulario.nombre" required maxlength="100" />
            </label>

            <label>
              <textarea
  v-model.trim="formulario.descripcion"
  rows="3"
  placeholder="Describe brevemente el servicio..."
></textarea>
</label>

            <div class="form-row">
              <label>
                Precio (COP)
                <input
                  v-model.number="formulario.precio"
                  type="number"
                  min="0"
                  step="1000"
                  required
                />
              </label>

              <label>
                Duración (minutos)
                <input
                  v-model.number="formulario.duracion"
                  type="number"
                  min="1"
                  step="5"
                  required
                />
              </label>
            </div>

            <label class="checkbox-line">
              <input v-model="formulario.activo" type="checkbox" />
              Servicio disponible para reservas
            </label>
          </template>

          <p v-if="errorFormulario" class="error-message">
            {{ errorFormulario }}
          </p>

          <div class="form-actions">
            <button type="button" class="secondary-button" @click="cerrarFormulario">
              Cancelar
            </button>

            <button type="submit" class="primary-button" :disabled="guardando">
              {{ guardando ? 'Guardando...' : 'Guardar registro' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useSalonStore } from '../stores/salon'

const props = defineProps({
  tipo: {
    type: String,
    required: true,
  },
})

const store = useSalonStore()

const busqueda = ref('')
const mostrarFormulario = ref(false)
const guardando = ref(false)
const errorFormulario = ref('')
const mensaje = ref('')

const cargos = [
  'Estilista capilar',
  'Colorista',
  'Manicurista',
  'Pedicurista',
  'Maquilladora profesional',
  'Especialista en tratamientos capilares',
  'Especialista en cejas y pestañas',
]

const formulario = reactive({})

const configuraciones = {
  clientes: {
    titulo: 'Clientes',
    descripcion: 'Consulta y registra las personas que visitan el salón.',
    formularioTitulo: 'Nueva clienta',
    descripcionFormulario: 'Registra sus datos de contacto y de cuenta.',
    columnas: [
      { key: 'nombreCompleto', label: 'Nombre' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'correo', label: 'Correo electrónico' },
    ],
  },

  estilistas: {
    titulo: 'Equipo profesional',
    descripcion: 'Administra el equipo, sus especialidades y horarios.',
    formularioTitulo: 'Nueva estilista',
    descripcionFormulario: 'Completa su información profesional y disponibilidad.',
    columnas: [
      { key: 'nombreCompleto', label: 'Nombre' },
      { key: 'cargo', label: 'Cargo' },
      { key: 'servicios', label: 'Servicios asignados' },
      { key: 'horario', label: 'Horario' },
      { key: 'estado', label: 'Estado' },
    ],
  },

  servicios: {
    titulo: 'Servicios',
    descripcion: 'Define los tratamientos, precios y duración de cada servicio.',
    formularioTitulo: 'Nuevo servicio',
    descripcionFormulario: 'Establece el precio y el tiempo necesario para atender.',
    columnas: [
      { key: 'nombre', label: 'Servicio' },
      { key: 'descripcion', label: 'Descripción' },
      { key: 'precio', label: 'Precio' },
      { key: 'duracion', label: 'Duración (min)' },
      { key: 'estado', label: 'Estado' },
    ],
  },
}

const configuracion = computed(() =>
  configuraciones[props.tipo] || configuraciones.clientes,
)

const registros = computed(() => {
  if (props.tipo === 'clientes') return store.clients
  if (props.tipo === 'estilistas') return store.stylists
  return store.services
})

const registrosFiltrados = computed(() => {
  const termino = busqueda.value.trim().toLowerCase()

  if (!termino) return registros.value

  return registros.value.filter(registro => {
    const texto = [
      registro.nombre,
      registro.apellido,
      registro.telefono,
      registro.correo,
      registro.cargo,
      registro.descripcion,
    ].join(' ').toLowerCase()

    return texto.includes(termino)
  })
})

function limpiarFormulario() {
  Object.keys(formulario).forEach(clave => delete formulario[clave])

  if (props.tipo === 'clientes') {
    Object.assign(formulario, {
      nombre: '',
      apellido: '',
      telefono: '',
      correo: '',
      password: '',
    })
  } else if (props.tipo === 'estilistas') {
    Object.assign(formulario, {
      nombre: '',
      apellido: '',
      cargo: '',
      telefono: '',
      correo: '',
      servicios: [],
      horaInicio: '09:00',
      horaFin: '18:00',
      activa: true,
    })
  } else {
    Object.assign(formulario, {
      nombre: '',
      descripcion: '',
      precio: 0,
      duracion: 30,
      activo: true,
    })
  }
}

function abrirFormulario() {
  errorFormulario.value = ''
  mensaje.value = ''
  limpiarFormulario()
  mostrarFormulario.value = true
}

function cerrarFormulario() {
  mostrarFormulario.value = false
  errorFormulario.value = ''
}

function estaActivo(registro) {
  return props.tipo === 'estilistas'
    ? registro.activa !== false
    : registro.activo !== false
}

function nombresServicios(servicios) {
  if (!Array.isArray(servicios) || !servicios.length) return 'Sin servicios asignados'

  return servicios.map(servicio => {
    if (typeof servicio === 'object') return servicio.nombre || 'Servicio'
    const encontrado = store.services.find(
      elemento => String(elemento._id || elemento.id) === String(servicio),
    )
    return encontrado?.nombre || 'Servicio'
  }).join(', ')
}

function valorColumna(registro, clave) {
  if (clave === 'nombreCompleto') {
    return `${registro.nombre || ''} ${registro.apellido || ''}`.trim() || '—'
  }

  if (clave === 'horario') {
    return `${registro.horaInicio || '—'} - ${registro.horaFin || '—'}`
  }

  return registro[clave] ?? '—'
}

function mostrarPrecio(precio) {
  if (precio === undefined || precio === null || precio === '') return '—'

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(precio))
}



function normalizarTelefono(event) {
  const telefono = event.target.value
    .replace(/\D/g, '')
    .slice(0, 10)

  formulario.telefono = telefono
  event.target.value = telefono
}

async function guardarRegistro() {
  errorFormulario.value = ''
  mensaje.value = ''

  if (!formulario.nombre?.trim()) {
    errorFormulario.value = 'El nombre es obligatorio.'
    return
  }
  
if (
  props.tipo === 'clientes' ||
  props.tipo === 'estilistas'
) {
  if (!/^\d{10}$/.test(formulario.telefono || '')) {
    errorFormulario.value =
      'El teléfono debe contener exactamente 10 dígitos numéricos.'
    return
  }
}

  if (props.tipo === 'clientes') {
    if (
      !formulario.apellido?.trim() ||
      !formulario.telefono?.trim() ||
      !formulario.correo?.trim()
    ) {
      errorFormulario.value = 'Completa todos los datos de la clienta.'
      return
    }

    if (formulario.password.length < 6) {
      errorFormulario.value = 'La contraseña debe tener al menos 6 caracteres.'
      return
    }
  }

  if (props.tipo === 'estilistas') {
    if (!formulario.cargo) {
      errorFormulario.value = 'Selecciona el cargo de la estilista.'
      return
    }

    if (!formulario.servicios.length) {
      errorFormulario.value = 'Asigna al menos un servicio a la estilista.'
      return
    }

    if (formulario.horaInicio >= formulario.horaFin) {
      errorFormulario.value = 'La hora de salida debe ser posterior a la de entrada.'
      return
    }
  }

  if (props.tipo === 'servicios') {
    if (!formulario.descripcion?.trim()) {
      errorFormulario.value = 'Escribe una descripción para el servicio.'
      return
    }

    if (!Number.isFinite(formulario.precio) || formulario.precio < 0) {
      errorFormulario.value = 'Ingresa un precio válido.'
      return
    }

    if (!Number.isFinite(formulario.duracion) || formulario.duracion <= 0) {
      errorFormulario.value = 'La duración debe ser mayor que cero.'
      return
    }
  }

  guardando.value = true

  try {
    if (props.tipo === 'clientes') {
      await store.createClient({
        nombre: formulario.nombre.trim(),
        apellido: formulario.apellido.trim(),
        telefono: formulario.telefono.trim(),
        correo: formulario.correo.trim().toLowerCase(),
        password: formulario.password,
      })
    } else if (props.tipo === 'estilistas') {
      await store.createStylist({
        nombre: formulario.nombre.trim(),
        apellido: formulario.apellido.trim(),
        cargo: formulario.cargo,
        telefono: formulario.telefono.trim(),
        correo: formulario.correo.trim().toLowerCase(),
        servicios: [...formulario.servicios],
        horaInicio: formulario.horaInicio,
        horaFin: formulario.horaFin,
        activa: formulario.activa,
      })
    } else {
      await store.createService({
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim(),
        precio: formulario.precio,
        duracion: formulario.duracion,
        activo: formulario.activo,
      })
    }

    cerrarFormulario()
    mensaje.value = 'Registro guardado correctamente.'
    await store.loadAll()
  } catch (error) {
    errorFormulario.value = error.message || 'No se pudo guardar el registro.'
  } finally {
    guardando.value = false
  }
}

watch(() => props.tipo, () => {
  busqueda.value = ''
  cerrarFormulario()
})

onMounted(() => {
  store.loadAll().catch(() => {})
})
</script>

<style scoped>
.directory-page {
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

.eyebrow {
  color: #a26778;
  font-size: 10px;
  letter-spacing: 1.7px;
  font-weight: 600;
}

.page-heading h2,
.directory-modal h3 {
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
.secondary-button {
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

.primary-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.secondary-button {
  border: 1px solid #eadbdc;
  background: #fffdfb;
  color: #805061;
}

.directory-card {
  overflow: hidden;
  border: 1px solid #f0e6e3;
  border-radius: 13px;
  background: #fffdfb;
}

.directory-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
  padding: 18px 22px;
  border-bottom: 1px solid #f2e9e6;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tabs a {
  padding: 10px 13px;
  border-radius: 7px;
  color: #805061;
  font-size: 12px;
  text-decoration: none;
}

.tabs a.router-link-active {
  background: #f8e9e9;
  font-weight: 600;
}

.directory-toolbar > input {
  width: 260px;
  max-width: 100%;
  padding: 11px 13px;
  border: 1px solid #e9dddc;
  border-radius: 8px;
  outline: none;
  color: #503a40;
}

.directory-toolbar > input:focus {
  border-color: #b77c8e;
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
  vertical-align: middle;
}

.status {
  display: inline-block;
  padding: 6px 9px;
  border-radius: 20px;
  font-size: 11px;
}

.status.active {
  background: #e9f3e6;
  color: #476d46;
}

.status.inactive {
  background: #f9e8e6;
  color: #a13e36;
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

.directory-modal {
  position: relative;
  width: 100%;
  max-width: 560px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 30px;
  border: 1px solid #f0e2e1;
  border-radius: 16px;
  background: #fffdfb;
  box-shadow: 0 20px 70px #39262e25;
}

.directory-modal h3 {
  font-size: 27px;
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

.directory-modal form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.directory-modal label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  color: #74565f;
  font-size: 12px;
}

.directory-modal input:not([type="checkbox"]),
.directory-modal select,
.directory-modal textarea {
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

.directory-modal input:focus,
.directory-modal select:focus,
.directory-modal textarea:focus {
  border-color: #b77c8e;
  box-shadow: 0 0 0 3px #b77c8e18;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 13px;
}

.section-label {
  margin-top: 5px;
  color: #62464e;
  font-size: 12px;
}

.section-label p,
.help-text {
  margin: 6px 0;
  color: #9b8589;
  font-size: 11px;
}

.service-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid #f0e6e3;
  border-radius: 9px;
  background: #fcf7f5;
}

.directory-modal .service-option {
  display: grid;
  grid-template-columns: 18px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-bottom: 1px solid #f0e6e3;
}

.service-option input[type="checkbox"],
.checkbox-line input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #82485b;
}

.service-option small {
  color: #9b8589;
}

.directory-modal .checkbox-line {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
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
  border-radius: 8px;
  background: #f0f8ed;
  color: #476d46;
  font-size: 12px;
}

@media (max-width: 650px) {
  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-heading h2 {
    font-size: 26px;
  }

  .directory-toolbar {
    align-items: stretch;
    flex-direction: column;
    padding: 16px;
  }

  .directory-toolbar > input {
    width: 100%;
  }

  .directory-modal {
    padding: 25px 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>