
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
    <p v-if="errorAccionEstilista" class="error-message">{{ errorAccionEstilista }}</p>
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
              <th>Detalle y acciones</th>
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
              <td class="row-actions">
                <button type="button" class="table-action" @click="abrirDetalle(registro, $event)">
                  Ver detalle
                </button>
                <button
                  v-if="tipo === 'servicios'"
                  type="button"
                  class="table-action"
                  @click="editarServicio(registro)"
                >
                  Editar
                </button>
                <template v-if="tipo === 'estilistas'">
                <button type="button" class="table-action" @click="editarEstilista(registro)">
                  Editar
                </button>
                <button
                  type="button"
                  class="table-action"
                  :disabled="accionandoEstilista === (registro._id || registro.id)"
                  @click="alternarEstadoEstilista(registro)"
                >
                  {{ registro.activa === false ? 'Activar' : 'Desactivar' }}
                </button>
                <button
                  type="button"
                  class="table-action danger-action"
                  :disabled="accionandoEstilista === (registro._id || registro.id)"
                  @click="eliminarEstilista(registro)"
                >
                  Eliminar
                </button>
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
        <h3>
          {{ estilistaEditandoId
            ? 'Editar estilista'
            : servicioEditandoId
              ? 'Editar servicio'
              : configuracion.formularioTitulo }}
        </h3>
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
            <label>
              Nombre completo
              <input v-model.trim="formulario.nombre" required maxlength="80" />
            </label>

            <label>
              Teléfono (opcional)
              <input
                v-model="formulario.telefono"
                type="tel"
                inputmode="numeric"
                maxlength="10"
                placeholder="3001234567"
                @input="normalizarTelefono"
              />
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
              Descripción del servicio
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
              {{ guardando
                ? 'Guardando...'
                : estilistaEditandoId || servicioEditandoId
                  ? 'Guardar cambios'
                  : 'Guardar registro' }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="registroDetalle" class="modal-backdrop" @click.self="cerrarDetalle">
      <section
        ref="dialogoDetalle"
        class="directory-modal detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        tabindex="-1"
        @keydown.esc="cerrarDetalle"
        @keydown.tab="mantenerFocoDetalle"
      >
        <button class="close-button" type="button" aria-label="Cerrar detalle" @click="cerrarDetalle">×</button>
        <span class="eyebrow">DETALLE DEL REGISTRO</span>
        <h3 id="detail-title">{{ tituloDetalle }}</h3>
        <dl class="detail-list">
          <div v-for="columna in configuracion.columnas" :key="columna.key">
            <dt>{{ columna.label }}</dt>
            <dd>{{ valorDetalle(registroDetalle, columna) }}</dd>
          </div>
        </dl>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useSalonStore } from '../stores/salon'
import {
  esContrasenaValida,
  esCorreoValido,
  esHorarioValido,
  esNumeroNoNegativo,
  esNumeroPositivo,
  esTelefonoValido,
  esTextoObligatorio,
  normalizarTelefono as normalizarValorTelefono,
} from '../utils/validation'

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
const errorAccionEstilista = ref('')
const mensaje = ref('')
const registroDetalle = ref(null)
const dialogoDetalle = ref(null)
const botonDetalleAnterior = ref(null)
const estilistaEditandoId = ref('')
const servicioEditandoId = ref('')
const accionandoEstilista = ref('')

let temporizadorMensaje
watch(mensaje, texto => {
  clearTimeout(temporizadorMensaje)
  if (texto) {
    temporizadorMensaje = setTimeout(() => {
      mensaje.value = ''
    }, 4000)
  }
})
onBeforeUnmount(() => clearTimeout(temporizadorMensaje))

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
      { key: 'nombre', label: 'Nombre' },
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

const tituloDetalle = computed(() => {
  if (!registroDetalle.value) return ''
  return valorColumna(registroDetalle.value, 'nombreCompleto')
    || registroDetalle.value.nombre
    || configuracion.value.titulo
})

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
      telefono: '',
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
  estilistaEditandoId.value = ''
  servicioEditandoId.value = ''
  limpiarFormulario()
  mostrarFormulario.value = true
}

function editarEstilista(estilista) {
  errorFormulario.value = ''
  mensaje.value = ''
  estilistaEditandoId.value = estilista._id || estilista.id
  Object.assign(formulario, {
    nombre: estilista.nombre || '',
    telefono: estilista.telefono || '',
    servicios: (estilista.servicios || []).map(servicio =>
      typeof servicio === 'object' ? servicio._id || servicio.id : servicio,
    ),
    horaInicio: estilista.horaInicio || '09:00',
    horaFin: estilista.horaFin || '18:00',
    activa: estilista.activa !== false,
  })
  mostrarFormulario.value = true
}

function editarServicio(servicio) {
  errorFormulario.value = ''
  mensaje.value = ''
  estilistaEditandoId.value = ''
  servicioEditandoId.value = servicio._id || servicio.id
  Object.assign(formulario, {
    nombre: servicio.nombre || '',
    descripcion: servicio.descripcion || '',
    precio: Number(servicio.precio),
    duracion: Number(servicio.duracion),
    activo: servicio.activo !== false,
  })
  mostrarFormulario.value = true
}

async function alternarEstadoEstilista(estilista) {
  const id = estilista._id || estilista.id
  accionandoEstilista.value = id
  errorAccionEstilista.value = ''

  try {
    await store.toggleStylistStatus(id)
    mensaje.value = `${estilista.nombre} ahora está ${estilista.activa === false ? 'activa' : 'inactiva'}.`
  } catch (error) {
    errorAccionEstilista.value = error.message || 'No se pudo cambiar el estado.'
  } finally {
    accionandoEstilista.value = ''
  }
}

async function eliminarEstilista(estilista) {
  const id = estilista._id || estilista.id
  if (!window.confirm(`¿Eliminar a ${estilista.nombre}? No se podrá eliminar mientras tenga citas futuras; las citas anteriores conservarán su registro, pero ya no mostrarán su nombre.`)) {
    return
  }

  accionandoEstilista.value = id
  errorAccionEstilista.value = ''

  try {
    await store.deleteStylist(id)
    mensaje.value = `${estilista.nombre} fue eliminada.`
  } catch (error) {
    errorAccionEstilista.value = error.message || 'No se pudo eliminar la estilista.'
  } finally {
    accionandoEstilista.value = ''
  }
}

function cerrarFormulario() {
  mostrarFormulario.value = false
  errorFormulario.value = ''
  estilistaEditandoId.value = ''
  servicioEditandoId.value = ''
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

function valorDetalle(registro, columna) {
  if (columna.key === 'estado') {
    return estaActivo(registro) ? 'Activo' : 'Inactivo'
  }
  if (columna.key === 'servicios') {
    return nombresServicios(registro.servicios)
  }
  if (columna.key === 'precio') {
    return mostrarPrecio(registro.precio)
  }
  return valorColumna(registro, columna.key)
}

async function abrirDetalle(registro, event) {
  botonDetalleAnterior.value = event.currentTarget
  registroDetalle.value = registro
  await nextTick()
  dialogoDetalle.value?.focus()
}

function cerrarDetalle() {
  registroDetalle.value = null
  nextTick(() => botonDetalleAnterior.value?.focus())
}

function mantenerFocoDetalle(event) {
  const elementos = dialogoDetalle.value?.querySelectorAll(
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
  )
  if (!elementos?.length) return

  const primero = elementos[0]
  const ultimo = elementos[elementos.length - 1]
  if (event.shiftKey && document.activeElement === primero) {
    event.preventDefault()
    ultimo.focus()
  } else if (!event.shiftKey && document.activeElement === ultimo) {
    event.preventDefault()
    primero.focus()
  }
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
  const telefono = normalizarValorTelefono(event.target.value)

  formulario.telefono = telefono
  event.target.value = telefono
}

async function guardarRegistro() {
  errorFormulario.value = ''
  mensaje.value = ''

  if (!esTextoObligatorio(formulario.nombre)) {
    errorFormulario.value = 'El nombre es obligatorio.'
    return
  }
  
if (props.tipo === 'clientes') {
  if (!esTelefonoValido(formulario.telefono)) {
    errorFormulario.value =
      'El teléfono debe contener exactamente 10 dígitos numéricos.'
    return
  }
}

  if (props.tipo === 'clientes') {
    if (
      !esTextoObligatorio(formulario.apellido) ||
      !esTextoObligatorio(formulario.telefono) ||
      !esTextoObligatorio(formulario.correo)
    ) {
      errorFormulario.value = 'Completa todos los datos de la clienta.'
      return
    }

    if (!esCorreoValido(formulario.correo)) {
      errorFormulario.value = 'Ingresa un correo electrónico válido.'
      return
    }

    if (!esContrasenaValida(formulario.password)) {
      errorFormulario.value = 'La contraseña debe tener al menos 6 caracteres.'
      return
    }
  }

  if (props.tipo === 'estilistas') {
    if (!formulario.servicios.length) {
      errorFormulario.value = 'Asigna al menos un servicio a la estilista.'
      return
    }

    if (formulario.telefono && !esTelefonoValido(formulario.telefono)) {
      errorFormulario.value = 'El teléfono debe contener exactamente 10 dígitos.'
      return
    }

    if (!esHorarioValido(formulario.horaInicio, formulario.horaFin)) {
      errorFormulario.value = 'La hora de salida debe ser posterior a la de entrada.'
      return
    }
  }

  if (props.tipo === 'servicios') {
    if (!esTextoObligatorio(formulario.descripcion)) {
      errorFormulario.value = 'Escribe una descripción para el servicio.'
      return
    }

    if (!esNumeroNoNegativo(formulario.precio)) {
      errorFormulario.value = 'Ingresa un precio válido.'
      return
    }

    if (!esNumeroPositivo(formulario.duracion)) {
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
      const datosEstilista = {
        nombre: formulario.nombre.trim(),
        telefono: formulario.telefono.trim(),
        servicios: [...formulario.servicios],
        horaInicio: formulario.horaInicio,
        horaFin: formulario.horaFin,
        activa: formulario.activa,
      }
      if (estilistaEditandoId.value) {
        await store.updateStylist(estilistaEditandoId.value, datosEstilista)
      } else {
        await store.createStylist(datosEstilista)
      }
    } else {
      const datosServicio = {
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim(),
        precio: formulario.precio,
        duracion: formulario.duracion,
        activo: formulario.activo,
      }
      if (servicioEditandoId.value) {
        await store.updateService(servicioEditandoId.value, datosServicio)
      } else {
        await store.createService(datosServicio)
      }
    }

    const servicioActualizado = Boolean(servicioEditandoId.value)
    cerrarFormulario()
    mensaje.value = servicioActualizado
      ? 'Servicio actualizado correctamente.'
      : 'Registro guardado correctamente.'
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
  font-size: 14px;
  letter-spacing: 0;
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
  font-size: 14px;
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
  font-size: 14px;
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

.row-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}

.table-action {
  padding: 6px 8px;
  border: 1px solid #eadbdc;
  border-radius: 6px;
  background: #fffdfb;
  color: #805061;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
}

.table-action:disabled {
  cursor: wait;
  opacity: 0.6;
}

.danger-action {
  border-color: #f0d4cf;
  color: #a13e36;
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
  font-size: 14px;
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
  font-size: 13px;
  letter-spacing: 0;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  padding: 16px 15px;
  border-top: 1px solid #f3ebe8;
  color: #78666b;
  font-size: 14px;
  vertical-align: middle;
}

.status {
  display: inline-block;
  padding: 6px 9px;
  border-radius: 20px;
  font-size: 13px;
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
  font-size: 14px;
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

.detail-modal {
  max-width: 680px;
}

.detail-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 24px 0 0;
}

.detail-list > div {
  min-width: 0;
  padding: 14px;
  border: 1px solid #f0e6e3;
  border-radius: 8px;
  background: #fcf7f5;
}

.detail-list dt {
  margin-bottom: 7px;
  color: #62464e;
  font-size: 14px;
  font-weight: 600;
}

.detail-list dd {
  margin: 0;
  color: #49373b;
  font-size: 17px;
  line-height: 1.5;
  overflow-wrap: anywhere;
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
  font-size: 14px;
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
  font-size: 16px;
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
  font-size: 14px;
}

.section-label p,
.help-text {
  margin: 6px 0;
  color: #9b8589;
  font-size: 13px;
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
  font-size: 14px;
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
  font-size: 14px;
}

.success-message {
  margin: 15px 0;
  padding: 12px;
  border-radius: 8px;
  background: #f0f8ed;
  color: #476d46;
  font-size: 14px;
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

  .detail-list {
    grid-template-columns: 1fr;
  }
}
</style>
