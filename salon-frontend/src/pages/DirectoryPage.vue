
<template>
  <div class="directory-page">
    <section class="page-heading">
      <div>
        <span class="eyebrow">FLORA STUDIO · ADMINISTRACIÓN</span>
        <h2>{{ configuracion.titulo }}</h2>
        <p>{{ configuracion.descripcion }}</p>
      </div>

        <BaseButton icon="＋" @click="abrirFormulario">Nuevo registro</BaseButton>
    </section>

    <p v-if="errorAccionEstilista" class="error-message">{{ errorAccionEstilista }}</p>
    <p v-if="mensaje" class="success-message">{{ mensaje }}</p>

    <section class="directory-card">
      <div class="directory-toolbar">
        <div class="tabs">
          <RouterLink to="/clientes">Clientes</RouterLink>
          <RouterLink to="/estilistas">Estilistas</RouterLink>
          <RouterLink to="/servicios">Servicios</RouterLink>
        </div>

      </div>

      <BaseTable
        v-model="busqueda"
        :columns="configuracion.columnas"
        :rows="registros"
        :loading="store.loading"
        :error="store.error"
        :searchable="true"
        search-placeholder="Buscar registros..."
        :empty-description="`Agrega el primer registro de ${configuracion.titulo.toLowerCase()}.`"
      >
        <template #cell="{ row, column, value }">
          <span
            v-if="column.key === 'estado'"
            :class="['status', estaActivo(row) ? 'active' : 'inactive']"
          >
            {{ estaActivo(row) ? 'Activo' : 'Inactivo' }}
          </span>
          <template v-else-if="column.key === 'precio'">
            {{ mostrarPrecio(row.precio) }}
          </template>
          <template v-else>
            {{ value ?? valorColumna(row, column.key) }}
          </template>
        </template>

        <template #actions="{ row }">
          <div class="row-actions" :class="{ 'stylist-actions': tipo === 'estilistas' }">
            <BaseButton
              v-if="tipo === 'clientes'"
              variant="secondary"
              size="small"
              @click="editarCliente(row)"
            >
              Editar
            </BaseButton>
            <BaseButton
              v-else-if="tipo === 'servicios'"
              variant="secondary"
              size="small"
              @click="editarServicio(row)"
            >
              Editar
            </BaseButton>
            <template v-else>
              <BaseButton variant="secondary" size="small" @click="editarEstilista(row)">
                Editar
              </BaseButton>
              <BaseButton
                variant="danger"
                size="small"
                :disabled="accionandoEstilista === (row._id || row.id)"
                @click="eliminarEstilista(row)"
              >
                Eliminar
              </BaseButton>
              <BaseButton
                variant="secondary"
                size="small"
                :disabled="accionandoEstilista === (row._id || row.id)"
                @click="alternarEstadoEstilista(row)"
              >
                {{ row.activa === false ? 'Activar horario' : 'Desactivar horario' }}
              </BaseButton>
              <BaseButton variant="secondary" size="small" @click="verServiciosEstilista(row)">
                Ver servicios
              </BaseButton>
            </template>
          </div>
        </template>

        <template #empty-action>
          <BaseButton variant="secondary" @click="abrirFormulario">
            Crear registro
          </BaseButton>
        </template>
      </BaseTable>
    </section>


    <div v-if="mostrarFormulario" class="modal-backdrop">
      <section class="directory-modal">
        <BaseButton
          class="close-button"
          variant="ghost"
          size="small"
          aria-label="Cerrar formulario"
          @click="cerrarFormulario"
        >
          ×
        </BaseButton>

        <span class="eyebrow">FLORA STUDIO · REGISTROS</span>
        <h3>
          {{ clienteEditandoId || estilistaEditandoId || servicioEditandoId
            ? `Editar ${tipo === 'clientes' ? 'cliente' : tipo === 'estilistas' ? 'estilista' : 'servicio'}`
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
              <textarea
  v-model.trim="formulario.descripcion"
  rows="3"
  placeholder="Describe brevemente el servicio..."
></textarea>
</label>

            <div class="form-row">
              <label>
                Precio (pesos colombianos, COP)
                <input
                  v-model.number="formulario.precio"
                  type="number"
                  min="0"
                  step="1"
                  required
                />
              </label>

              <label>
                Duración (minutos)
                <input
                  v-model.number="formulario.duracion"
                  type="number"
                  min="1"
                  step="1"
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
            <BaseButton variant="secondary" @click="cerrarFormulario">
              Cancelar
            </BaseButton>

            <BaseButton type="submit" :loading="guardando">
              {{ guardando ? 'Guardando...' : (clienteEditandoId || estilistaEditandoId || servicioEditandoId) ? 'Guardar cambios' : 'Guardar registro' }}
            </BaseButton>
          </div>
        </form>
      </section>
    </div>

    <div v-if="estilistaServicios" class="modal-backdrop" @click.self="estilistaServicios = null">
      <section class="directory-modal services-modal" role="dialog" aria-modal="true">
        <BaseButton
          class="close-button"
          variant="ghost"
          size="small"
          aria-label="Cerrar servicios"
          @click="estilistaServicios = null"
        >
          ×
        </BaseButton>
        <span class="eyebrow">FLORA STUDIO · EQUIPO</span>
        <h3>Servicios de {{ estilistaServicios.nombre }}</h3>
        <p class="modal-description">Servicios que ofrece esta estilista.</p>
        <ul v-if="serviciosEstilistaSeleccionada.length" class="stylist-service-list">
          <li v-for="servicio in serviciosEstilistaSeleccionada" :key="servicio._id || servicio.id">
            <div>
              <strong>{{ servicio.nombre }}</strong>
              <p>{{ servicio.descripcion || 'Sin descripción' }}</p>
            </div>
            <span>{{ mostrarPrecio(servicio.precio) }}</span>
          </li>
        </ul>
        <p v-else class="empty-state">Esta estilista no tiene servicios asignados.</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useSalonStore } from '../stores/salon'
import { confirmAction, notify } from '../services/feedback'
import BaseButton from '../components/BaseButton.vue'
import BaseTable from '../components/BaseTable.vue'

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
const clienteEditandoId = ref('')
const estilistaEditandoId = ref('')
const servicioEditandoId = ref('')
const accionandoEstilista = ref('')
const estilistaServicios = ref(null)

const formulario = reactive({})

const serviciosEstilistaSeleccionada = computed(() => {
  const serviciosAsignados = estilistaServicios.value?.servicios || []
  return serviciosAsignados.map(servicio => {
    if (typeof servicio === 'object') return servicio
    return store.services.find(
      item => String(item._id || item.id) === String(servicio),
    )
  }).filter(Boolean)
})

const configuraciones = {
  clientes: {
    titulo: 'Clientes',
    descripcion: 'Consulta y registra las personas que visitan el salón.',
    formularioTitulo: 'Nueva clienta',
    descripcionFormulario: 'Registra sus datos de contacto.',
    columnas: [
      {
        key: 'nombreCompleto',
        label: 'Nombre',
        value: registro => `${registro.nombre || ''} ${registro.apellido || ''}`.trim(),
      },
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
      {
        key: 'horario',
        label: 'Horario',
        value: registro => `${registro.horaInicio || '—'} - ${registro.horaFin || '—'}`,
      },
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

function limpiarFormulario() {
  Object.keys(formulario).forEach(clave => delete formulario[clave])

  if (props.tipo === 'clientes') {
    Object.assign(formulario, {
      nombre: '',
      apellido: '',
      telefono: '',
      correo: '',
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
  clienteEditandoId.value = ''
  estilistaEditandoId.value = ''
  servicioEditandoId.value = ''
  limpiarFormulario()
  mostrarFormulario.value = true
}

function editarCliente(cliente) {
  errorFormulario.value = ''
  mensaje.value = ''
  clienteEditandoId.value = cliente._id || cliente.id
  estilistaEditandoId.value = ''
  servicioEditandoId.value = ''
  limpiarFormulario()
  Object.assign(formulario, {
    nombre: cliente.nombre || '',
    apellido: cliente.apellido || '',
    telefono: cliente.telefono || '',
    correo: cliente.correo || '',
  })
  mostrarFormulario.value = true
}

function editarEstilista(estilista) {
  errorFormulario.value = ''
  mensaje.value = ''
  clienteEditandoId.value = ''
  estilistaEditandoId.value = estilista._id || estilista.id
  servicioEditandoId.value = ''
  limpiarFormulario()
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
  clienteEditandoId.value = ''
  estilistaEditandoId.value = ''
  servicioEditandoId.value = servicio._id || servicio.id
  limpiarFormulario()
  Object.assign(formulario, {
    nombre: servicio.nombre || '',
    descripcion: servicio.descripcion || '',
    precio: Number(servicio.precio) || 0,
    duracion: Number(servicio.duracion) || 30,
    activo: servicio.activo !== false,
  })
  mostrarFormulario.value = true
}

function verServiciosEstilista(estilista) {
  estilistaServicios.value = estilista
}

async function alternarEstadoEstilista(estilista) {
  const activar = estilista.activa === false
  if (!activar) {
    const confirmado = await confirmAction({
      title: '¿Desactivar el horario?',
      message: `El horario de ${estilista.nombre} dejará de estar disponible para nuevas reservas. Podrás activarlo nuevamente después.`,
      confirmText: 'Desactivar horario',
    })
    if (!confirmado) return
  }

  const id = estilista._id || estilista.id
  accionandoEstilista.value = id
  errorAccionEstilista.value = ''

  try {
    await store.toggleStylistStatus(id)
    mensaje.value = `${estilista.nombre} ahora está ${estilista.activa === false ? 'activa' : 'inactiva'}.`
    notify(mensaje.value, 'success')
  } catch (error) {
    errorAccionEstilista.value = error.message || 'No se pudo cambiar el estado.'
    notify(errorAccionEstilista.value, 'error')
  } finally {
    accionandoEstilista.value = ''
  }
}

async function eliminarEstilista(estilista) {
  const id = estilista._id || estilista.id
  const confirmado = await confirmAction({
    title: `¿Eliminar a ${estilista.nombre}?`,
    message: 'No se podrá eliminar mientras tenga citas futuras. Las citas anteriores conservarán su registro, pero dejarán de mostrar su nombre.',
    confirmText: 'Eliminar estilista',
  })
  if (!confirmado) return

  accionandoEstilista.value = id
  errorAccionEstilista.value = ''

  try {
    await store.deleteStylist(id)
    mensaje.value = `${estilista.nombre} fue eliminada.`
    notify(mensaje.value, 'success')
  } catch (error) {
    errorAccionEstilista.value = error.message || 'No se pudo eliminar la estilista.'
    notify(errorAccionEstilista.value, 'error')
  } finally {
    accionandoEstilista.value = ''
  }
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
  
if (props.tipo === 'clientes') {
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

  }

  if (props.tipo === 'estilistas') {
    if (!formulario.servicios.length) {
      errorFormulario.value = 'Asigna al menos un servicio a la estilista.'
      return
    }

    if (formulario.telefono && !/^\d{10}$/.test(formulario.telefono)) {
      errorFormulario.value = 'El teléfono debe contener exactamente 10 dígitos.'
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

  if (estilistaEditandoId.value && !formulario.activa) {
    const estilistaActual = store.stylists.find(
      estilista => String(estilista._id || estilista.id) === String(estilistaEditandoId.value),
    )
    if (estilistaActual?.activa !== false) {
      const confirmado = await confirmAction({
        title: '¿Desactivar el horario?',
        message: `El horario de ${estilistaActual.nombre} dejará de estar disponible para nuevas reservas.`,
        confirmText: 'Desactivar horario',
      })
      if (!confirmado) return
    }
  }

  if (servicioEditandoId.value && !formulario.activo) {
    const servicioActual = store.services.find(
      servicio => String(servicio._id || servicio.id) === String(servicioEditandoId.value),
    )
    if (servicioActual?.activo !== false) {
      const confirmado = await confirmAction({
        title: '¿Desactivar el servicio?',
        message: `${servicioActual.nombre} dejará de estar disponible para nuevas reservas.`,
        confirmText: 'Desactivar servicio',
      })
      if (!confirmado) return
    }
  }

  guardando.value = true

  try {
    if (props.tipo === 'clientes') {
      const datosCliente = {
        nombre: formulario.nombre.trim(),
        apellido: formulario.apellido.trim(),
        telefono: formulario.telefono.trim(),
        correo: formulario.correo.trim().toLowerCase(),
      }
      if (clienteEditandoId.value) {
        await store.updateClient(clienteEditandoId.value, datosCliente)
      } else {
        await store.createClient(datosCliente)
      }
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

.row-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}

.stylist-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(105px, 1fr));
  min-width: 245px;
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

.services-modal {
  max-width: 620px;
}

.stylist-service-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.stylist-service-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 13px;
  border: 1px solid #f0e6e3;
  border-radius: 9px;
  background: #fcf7f5;
  color: #805061;
  font-size: 12px;
}

.stylist-service-list p {
  margin: 5px 0 0;
  color: #9b8589;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 17px;
  min-height: 0;
  padding: 0;
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