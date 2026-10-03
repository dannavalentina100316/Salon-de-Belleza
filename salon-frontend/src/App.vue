<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleDollarSign,
  Clock3,
  Flower2,
  LayoutDashboard,
  Mail,
  Menu,
  Phone,
  Plus,
  Search,
  Scissors,
  Sparkles,
  UsersRound,
  X,
} from '@lucide/vue'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3200/api'
const today = new Date()
const dateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const shiftDate = (value, amount) => {
  const date = new Date(`${value}T12:00:00`)
  date.setDate(date.getDate() + amount)
  return dateKey(date)
}
const todayKey = dateKey(today)

const demoClients = [
  { _id: 'client-1', nombre: 'Valentina', apellido: 'Ríos', telefono: '+52 55 2418 6072', correo: 'valentina.rios@email.com' },
  { _id: 'client-2', nombre: 'Camila', apellido: 'Santos', telefono: '+52 55 3890 1664', correo: 'camila.santos@email.com' },
  { _id: 'client-3', nombre: 'Lucía', apellido: 'Mendoza', telefono: '+52 55 1077 4321', correo: 'lucia.mendoza@email.com' },
  { _id: 'client-4', nombre: 'Renata', apellido: 'Vega', telefono: '+52 55 6190 2284', correo: 'renata.vega@email.com' },
  { _id: 'client-5', nombre: 'Mariana', apellido: 'Luna', telefono: '+52 55 2753 9806', correo: 'mariana.luna@email.com' },
]
const demoStylists = [
  { _id: 'stylist-1', nombre: 'Sofía', apellido: 'Navarro', especialidad: 'Colorista' },
  { _id: 'stylist-2', nombre: 'Isabella', apellido: 'Cruz', especialidad: 'Corte y peinado' },
  { _id: 'stylist-3', nombre: 'Daniela', apellido: 'Reyes', especialidad: 'Nail artist' },
]
const demoServices = [
  { _id: 'service-1', nombre: 'Balayage', duracion: 150, precio: 1850, descripcion: 'Color y dimensión' },
  { _id: 'service-2', nombre: 'Corte + brushing', duracion: 60, precio: 620, descripcion: 'Corte y peinado' },
  { _id: 'service-3', nombre: 'Manicure gel', duracion: 75, precio: 480, descripcion: 'Manicure de larga duración' },
  { _id: 'service-4', nombre: 'Gloss capilar', duracion: 45, precio: 750, descripcion: 'Brillo y tono' },
]
const demoAppointments = [
  { _id: 'appt-1', cliente: demoClients[0], estilista: demoStylists[0], servicio: demoServices[0], fecha: todayKey, hora: '09:00', estado: 'confirmada' },
  { _id: 'appt-2', cliente: demoClients[1], estilista: demoStylists[1], servicio: demoServices[1], fecha: todayKey, hora: '09:30', estado: 'pendiente' },
  { _id: 'appt-3', cliente: demoClients[2], estilista: demoStylists[2], servicio: demoServices[2], fecha: todayKey, hora: '10:30', estado: 'confirmada' },
  { _id: 'appt-4', cliente: demoClients[3], estilista: demoStylists[0], servicio: demoServices[3], fecha: todayKey, hora: '11:30', estado: 'pendiente' },
  { _id: 'appt-5', cliente: demoClients[4], estilista: demoStylists[1], servicio: demoServices[1], fecha: todayKey, hora: '12:30', estado: 'confirmada' },
  { _id: 'appt-6', cliente: demoClients[0], estilista: demoStylists[2], servicio: demoServices[2], fecha: todayKey, hora: '14:00', estado: 'pendiente' },
]

const activeSection = ref('agenda')
const selectedDate = ref(todayKey)
const appointments = ref([...demoAppointments])
const clients = ref([...demoClients])
const stylists = ref([...demoStylists])
const services = ref([...demoServices])
const apiMode = ref('loading')
const searchQuery = ref('')
const statusFilter = ref('todas')
const modalOpen = ref(false)
const recordModal = ref('')
const mobileMenuOpen = ref(false)
const saving = ref(false)
const recordSaving = ref(false)
const notice = ref('')
const formError = ref('')
const recordError = ref('')
const booking = ref({ cliente: '', estilista: '', servicio: '', fecha: todayKey, hora: '09:00', observaciones: '' })
const recordForm = ref({})

const navigation = [
  { id: 'agenda', label: 'Resumen', icon: LayoutDashboard },
  { id: 'citas', label: 'Citas', icon: CalendarDays },
  { id: 'clientes', label: 'Clientes', icon: UsersRound },
  { id: 'equipo', label: 'Equipo', icon: Sparkles },
  { id: 'servicios', label: 'Servicios', icon: Scissors },
]

const sectionTitle = computed(() => ({
  agenda: 'Tu salón, en ritmo.',
  citas: 'Agenda de citas',
  clientes: 'Personas que vuelven.',
  equipo: 'Un equipo brillante.',
  servicios: 'El menú del salón.',
}[activeSection.value]))

const primaryActionLabel = computed(() => ({
  agenda: 'Nueva cita',
  citas: 'Nueva cita',
  clientes: 'Nuevo cliente',
  equipo: 'Agregar estilista',
  servicios: 'Nuevo servicio',
}[activeSection.value]))

const dateLabel = computed(() => new Intl.DateTimeFormat('es-MX', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
}).format(new Date(`${selectedDate.value}T12:00:00`)))

const shortDate = computed(() => new Intl.DateTimeFormat('es-MX', {
  day: 'numeric', month: 'short',
}).format(new Date(`${selectedDate.value}T12:00:00`)))

const filteredAppointments = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('es-MX')
  return appointments.value
    .filter((appointment) => appointment.fecha === selectedDate.value)
    .filter((appointment) => statusFilter.value === 'todas' || appointment.estado === statusFilter.value)
    .filter((appointment) => {
      if (!query) return true
      const searchable = [
        appointment.cliente?.nombre,
        appointment.cliente?.apellido,
        appointment.servicio?.nombre,
        appointment.estilista?.nombre,
      ].join(' ').toLocaleLowerCase('es-MX')
      return searchable.includes(query)
    })
    .sort((first, second) => first.hora.localeCompare(second.hora))
})

const todaysAppointments = computed(() => appointments.value.filter((appointment) => appointment.fecha === selectedDate.value))
const confirmedCount = computed(() => todaysAppointments.value.filter((appointment) => appointment.estado === 'confirmada').length)
const pendingCount = computed(() => todaysAppointments.value.filter((appointment) => appointment.estado === 'pendiente').length)
const projectedRevenue = computed(() => todaysAppointments.value
  .filter((appointment) => appointment.estado !== 'cancelada')
  .reduce((total, appointment) => total + Number(appointment.servicio?.precio || 0), 0))
const busyStylists = computed(() => stylists.value.map((stylist) => ({
  ...stylist,
  count: todaysAppointments.value.filter((appointment) => appointment.estilista?._id === stylist._id).length,
})))

const formatMoney = (value) => new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
}).format(Number(value || 0))

const initials = (person) => `${person?.nombre?.[0] || ''}${person?.apellido?.[0] || ''}`.toUpperCase()
const fullName = (person) => [person?.nombre, person?.apellido].filter(Boolean).join(' ')
const statusText = (status) => ({ confirmada: 'Confirmada', pendiente: 'Pendiente', cancelada: 'Cancelada' }[status] || 'Pendiente')

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const payload = await response.json()
  if (!response.ok || payload.ok === false) throw new Error(payload.mensaje || 'No se pudo completar la solicitud.')
  return payload
}

async function loadSalonData() {
  try {
    const [appointmentData, clientData, stylistData, serviceData] = await Promise.all([
      request('/citas'), request('/clientes'), request('/estilistas'), request('/servicios'),
    ])
    appointments.value = appointmentData.citas || []
    clients.value = clientData.clientes || []
    stylists.value = stylistData.estilistas || []
    services.value = serviceData.servicios || []
    apiMode.value = 'live'
  } catch {
    appointments.value = [...demoAppointments]
    clients.value = [...demoClients]
    stylists.value = [...demoStylists]
    services.value = [...demoServices]
    apiMode.value = 'demo'
  }
}

function changeDate(amount) {
  selectedDate.value = shiftDate(selectedDate.value, amount)
}

function showNotice(message) {
  notice.value = message
  window.setTimeout(() => { notice.value = '' }, 3200)
}

function openBooking() {
  formError.value = ''
  booking.value = {
    cliente: clients.value[0]?._id || '',
    estilista: stylists.value[0]?._id || '',
    servicio: services.value[0]?._id || '',
    fecha: selectedDate.value,
    hora: '09:00',
    observaciones: '',
  }
  modalOpen.value = true
}

function openPrimaryAction() {
  if (activeSection.value === 'agenda' || activeSection.value === 'citas') {
    openBooking()
    return
  }

  recordError.value = ''
  recordForm.value = {
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    password: '',
    especialidad: '',
    descripcion: '',
    precio: '',
    duracion: 60,
  }
  recordModal.value = activeSection.value
}

async function saveRecord() {
  recordError.value = ''
  recordSaving.value = true

  const collectionConfig = {
    clientes: { path: '/clientes', collection: clients, singular: 'Cliente' },
    equipo: { path: '/estilistas', collection: stylists, singular: 'Estilista' },
    servicios: { path: '/servicios', collection: services, singular: 'Servicio' },
  }[recordModal.value]

  if (!collectionConfig) {
    recordSaving.value = false
    return
  }

  try {
    if (apiMode.value === 'live') {
      await request(collectionConfig.path, { method: 'POST', body: JSON.stringify(recordForm.value) })
      await loadSalonData()
    } else {
      const localRecord = { ...recordForm.value, _id: `local-${Date.now()}`, estado: true }
      delete localRecord.password
      collectionConfig.collection.value = [...collectionConfig.collection.value, localRecord]
    }

    recordModal.value = ''
    showNotice(apiMode.value === 'live'
      ? `${collectionConfig.singular} registrado correctamente.`
      : `${collectionConfig.singular} agregado a la vista de demostración.`)
  } catch (error) {
    recordError.value = error.message
  } finally {
    recordSaving.value = false
  }
}

async function saveBooking() {
  formError.value = ''
  if (!booking.value.cliente || !booking.value.estilista || !booking.value.servicio) {
    formError.value = 'Agrega clientes, estilistas y servicios antes de reservar.'
    return
  }

  saving.value = true
  try {
    const selectedClient = clients.value.find((item) => item._id === booking.value.cliente)
    const selectedStylist = stylists.value.find((item) => item._id === booking.value.estilista)
    const selectedService = services.value.find((item) => item._id === booking.value.servicio)
    const appointmentPayload = { ...booking.value }

    if (apiMode.value === 'live') {
      await request('/citas', { method: 'POST', body: JSON.stringify(appointmentPayload) })
      await loadSalonData()
    } else {
      appointments.value = [...appointments.value, {
        ...appointmentPayload,
        _id: `local-${Date.now()}`,
        estado: 'pendiente',
        cliente: selectedClient,
        estilista: selectedStylist,
        servicio: selectedService,
      }]
    }

    selectedDate.value = booking.value.fecha
    modalOpen.value = false
    notice.value = apiMode.value === 'live' ? 'Cita guardada en la agenda.' : 'Cita agregada a la vista de demostración.'
    window.setTimeout(() => { notice.value = '' }, 3200)
  } catch (error) {
    formError.value = error.message
  } finally {
    saving.value = false
  }
}

onMounted(loadSalonData)
</script>

<template>
  <div class="app-shell">
    <div v-if="mobileMenuOpen" class="sidebar-scrim" @click="mobileMenuOpen = false"></div>
    <aside class="sidebar" :class="{ 'sidebar-open': mobileMenuOpen }">
      <a class="brand" href="#inicio" @click.prevent="activeSection = 'agenda'; mobileMenuOpen = false">
        <span class="brand-mark"><Flower2 :size="23" :stroke-width="1.7" /></span>
        <span class="brand-type"><strong>casa flora</strong><small>ESTUDIO DE BELLEZA</small></span>
      </a>

      <div class="workspace-switcher">
        <span class="workspace-avatar">F</span>
        <span class="workspace-copy"><strong>Casa Flora</strong><small>Roma Norte · CDMX</small></span>
        <ChevronRight class="workspace-chevron" :size="15" />
      </div>

      <div class="nav-caption">ESPACIO DE TRABAJO</div>
      <nav class="side-nav" aria-label="Navegación principal">
        <button
          v-for="item in navigation"
          :key="item.id"
          class="nav-item"
          :class="{ 'nav-item-active': activeSection === item.id }"
          :aria-current="activeSection === item.id ? 'page' : undefined"
          @click="activeSection = item.id; mobileMenuOpen = false"
        >
          <component :is="item.icon" :size="18" :stroke-width="1.8" />
          <span>{{ item.label }}</span>
          <span v-if="item.id === 'citas'" class="nav-count">{{ todaysAppointments.length }}</span>
        </button>
      </nav>

      <div class="sidebar-bottom">
        <div class="sidebar-note">
          <div class="note-icon"><Sparkles :size="16" /></div>
          <strong>Un buen día empieza aquí.</strong>
          <span>Cuida los detalles. Lo demás, fluye.</span>
        </div>
        <button class="profile-button" aria-label="Perfil de Fernanda">
          <span class="profile-avatar">FM</span>
          <span class="profile-copy"><strong>Fernanda Molina</strong><small>Administradora</small></span>
          <span class="profile-dots">···</span>
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <button class="icon-button mobile-menu" aria-label="Abrir menú" @click="mobileMenuOpen = true"><Menu :size="19" /></button>
        <div class="breadcrumb"><span>Casa Flora</span><ChevronRight :size="14" /><strong>{{ navigation.find((item) => item.id === activeSection)?.label }}</strong></div>
        <div class="topbar-actions">
          <span class="connection-pill" :class="`connection-${apiMode}`">
            <span class="connection-dot"></span>{{ apiMode === 'live' ? 'En línea' : apiMode === 'loading' ? 'Conectando' : 'Vista demo' }}
          </span>
          <button class="icon-button notification-button" aria-label="Notificaciones"><Bell :size="18" /><span></span></button>
          <span class="topbar-divider"></span>
          <span class="topbar-date">{{ new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(today) }}</span>
        </div>
      </header>

      <div class="page-wrap">
        <section class="page-heading">
          <div>
            <p class="eyebrow"><span class="eyebrow-line"></span>{{ activeSection === 'agenda' || activeSection === 'citas' ? dateLabel : 'CASA FLORA · ESTUDIO DE BELLEZA' }}</p>
            <h1>{{ sectionTitle }}</h1>
            <p class="heading-subtitle">
              {{ activeSection === 'agenda' || activeSection === 'citas' ? 'Todo lo que pasa hoy, en un solo lugar.' : 'Cada detalle hace que la experiencia sea especial.' }}
            </p>
          </div>
          <button class="primary-button" :aria-label="primaryActionLabel" @click="openPrimaryAction">
            <Plus :size="17" :stroke-width="2.2" /><span>{{ primaryActionLabel }}</span>
          </button>
        </section>

        <section v-if="activeSection === 'agenda'" class="metric-strip" aria-label="Resumen del día">
          <article class="metric-item">
            <div class="metric-top"><span>Citas de hoy</span><span class="metric-icon icon-coral"><CalendarDays :size="16" /></span></div>
            <div class="metric-value">{{ todaysAppointments.length }}<span class="metric-context">en agenda</span></div>
            <div class="metric-foot"><ArrowUpRight :size="13" /> <span>Agenda del día</span></div>
          </article>
          <article class="metric-item">
            <div class="metric-top"><span>Confirmadas</span><span class="metric-icon icon-green"><CircleCheck :size="16" /></span></div>
            <div class="metric-value">{{ confirmedCount }}<span class="metric-context">de {{ todaysAppointments.length }} citas</span></div>
            <div class="metric-foot metric-foot-green"><span class="tiny-dot"></span><span>Todo en orden</span></div>
          </article>
          <article class="metric-item">
            <div class="metric-top"><span>Por confirmar</span><span class="metric-icon icon-amber"><Clock3 :size="16" /></span></div>
            <div class="metric-value">{{ pendingCount }}<span class="metric-context">{{ pendingCount === 1 ? 'cliente' : 'clientes' }}</span></div>
            <div class="metric-foot metric-foot-amber"><ArrowDownRight :size="13" /><span>Seguimiento pendiente</span></div>
          </article>
          <article class="metric-item metric-revenue">
            <div class="metric-top"><span>Venta potencial</span><span class="metric-icon icon-blue"><CircleDollarSign :size="16" /></span></div>
            <div class="metric-value">{{ formatMoney(projectedRevenue) }}</div>
            <div class="metric-foot"><span>Según servicios agendados</span></div>
          </article>
        </section>

        <section v-if="activeSection === 'agenda' || activeSection === 'citas'" class="agenda-layout">
          <div class="appointments-panel">
            <div class="section-toolbar">
              <div class="date-control">
                <button class="date-arrow" aria-label="Día anterior" @click="changeDate(-1)"><ChevronLeft :size="17" /></button>
                <div class="date-copy"><strong>{{ selectedDate === todayKey ? 'Hoy' : dateLabel }}</strong><span>{{ dateLabel }}</span></div>
                <button class="date-arrow" aria-label="Día siguiente" @click="changeDate(1)"><ChevronRight :size="17" /></button>
                <button v-if="selectedDate !== todayKey" class="today-button" @click="selectedDate = todayKey">Hoy</button>
              </div>
              <div class="toolbar-tools">
                <label class="search-box">
                  <Search :size="16" />
                  <input v-model="searchQuery" type="search" placeholder="Buscar cita" aria-label="Buscar cita" />
                  <kbd>⌘ K</kbd>
                </label>
                <select v-model="statusFilter" class="status-select" aria-label="Filtrar citas por estado">
                  <option value="todas">Todas</option>
                  <option value="confirmada">Confirmadas</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="cancelada">Canceladas</option>
                </select>
              </div>
            </div>

            <div class="schedule-heading">
              <span>HORARIO</span><span>CLIENTE</span><span>SERVICIO</span><span>ESPECIALISTA</span><span>ESTADO</span><span></span>
            </div>

            <div v-if="filteredAppointments.length" class="appointment-list">
              <article v-for="(appointment, index) in filteredAppointments" :key="appointment._id" class="appointment-row">
                <div class="appointment-time"><strong>{{ appointment.hora }}</strong><span>{{ appointment.servicio?.duracion || 60 }} min</span></div>
                <div class="client-cell">
                  <span class="client-avatar" :class="`avatar-${index % 5}`">{{ initials(appointment.cliente) }}</span>
                  <span class="cell-copy"><strong>{{ fullName(appointment.cliente) || 'Cliente' }}</strong><small>{{ appointment.cliente?.telefono || 'Visita programada' }}</small></span>
                </div>
                <div class="service-cell"><strong>{{ appointment.servicio?.nombre || 'Servicio' }}</strong><small>{{ formatMoney(appointment.servicio?.precio) }}</small></div>
                <div class="stylist-cell"><span class="stylist-indicator" :class="`stylist-${index % 3}`"></span><span class="cell-copy"><strong>{{ appointment.estilista?.nombre || 'Por asignar' }}</strong><small>{{ appointment.estilista?.especialidad || 'Especialista' }}</small></span></div>
                <div><span class="status-badge" :class="`status-${appointment.estado || 'pendiente'}`"><span></span>{{ statusText(appointment.estado) }}</span></div>
                <button class="row-menu" :aria-label="`Ver cita de ${fullName(appointment.cliente)}`" @click="showNotice(`${fullName(appointment.cliente)} · ${appointment.servicio?.nombre || 'Cita'}`)"><span>···</span></button>
              </article>
            </div>
            <div v-else class="empty-state">
              <span class="empty-icon"><CalendarDays :size="21" /></span>
              <strong>No hay citas para este día</strong>
              <span>Prueba otra fecha o agrega una nueva cita a la agenda.</span>
              <button class="text-action" @click="openBooking"><Plus :size="15" /> Agendar una cita</button>
            </div>
            <div class="schedule-footer"><span>Mostrando {{ filteredAppointments.length }} {{ filteredAppointments.length === 1 ? 'cita' : 'citas' }}</span><button class="view-all-button" @click="activeSection = 'citas'">Ver agenda completa <ChevronRight :size="14" /></button></div>
          </div>

          <aside class="day-sidebar">
            <div class="side-section-header"><div><p class="side-eyebrow">EL EQUIPO</p><h2>En el salón</h2></div><span class="live-indicator"><span></span>Hoy</span></div>
            <div class="team-list">
              <div v-for="(stylist, index) in busyStylists.slice(0, 4)" :key="stylist._id" class="team-row">
                <span class="team-avatar" :class="`avatar-${index % 5}`">{{ initials(stylist) }}</span>
                <span class="cell-copy"><strong>{{ fullName(stylist) }}</strong><small>{{ stylist.especialidad || 'Especialista' }}</small></span>
                <span class="team-load">{{ stylist.count }} <small>{{ stylist.count === 1 ? 'cita' : 'citas' }}</small></span>
              </div>
            </div>
            <button class="outline-action" @click="activeSection = 'equipo'">Ver equipo <ChevronRight :size="14" /></button>

            <div class="day-note">
              <span class="note-spark"><Sparkles :size="16" /></span>
              <div><strong>Un detalle para hoy</strong><p>Un mensaje antes de cada visita hace toda la diferencia.</p></div>
            </div>

            <div class="weekly-summary">
              <div class="side-section-header"><div><p class="side-eyebrow">EN UN VISTAZO</p><h2>Tu semana</h2></div><ArrowUpRight :size="16" /></div>
              <div class="week-progress"><span style="width: 68%"></span></div>
              <div class="week-caption"><span>Buena energía</span><strong>68%</strong></div>
              <p class="week-footnote">de la agenda semanal está reservada</p>
            </div>
          </aside>
        </section>

        <section v-else-if="activeSection === 'clientes'" class="directory-section">
          <div class="directory-header"><div><p class="side-eyebrow">RELACIONES CON CARIÑO</p><h2>{{ clients.length }} personas en tu comunidad</h2></div><label class="search-box"><Search :size="16" /><input v-model="searchQuery" type="search" placeholder="Buscar cliente" aria-label="Buscar cliente" /></label></div>
          <div class="directory-table"><div class="directory-columns"><span>CLIENTE</span><span>CONTACTO</span><span>CORREO</span><span>PRÓXIMA VISITA</span></div>
            <div v-for="(client, index) in clients.filter((person) => `${person.nombre} ${person.apellido}`.toLocaleLowerCase('es-MX').includes(searchQuery.toLocaleLowerCase('es-MX')))" :key="client._id" class="directory-row"><span class="directory-person"><span class="client-avatar" :class="`avatar-${index % 5}`">{{ initials(client) }}</span><strong>{{ fullName(client) }}</strong></span><span>{{ client.telefono || 'Sin teléfono' }}</span><span>{{ client.correo || 'Sin correo' }}</span><span class="muted-cell">—</span></div>
          </div>
          <div v-if="!clients.length" class="empty-state"><span class="empty-icon"><UsersRound :size="21" /></span><strong>Aún no hay clientes</strong><span>La lista se llenará cuando registres clientes en el sistema.</span></div>
        </section>

        <section v-else-if="activeSection === 'equipo'" class="people-grid">
          <article v-for="(stylist, index) in stylists" :key="stylist._id" class="person-card"><span class="person-avatar" :class="`avatar-${index % 5}`">{{ initials(stylist) }}</span><span class="person-status"><span></span>Disponible hoy</span><h2>{{ fullName(stylist) }}</h2><p>{{ stylist.especialidad || 'Especialista' }}</p><div class="person-meta"><span><Phone :size="14" />{{ stylist.telefono || 'Contacto en recepción' }}</span><span><CalendarDays :size="14" />{{ busyStylists.find((item) => item._id === stylist._id)?.count || 0 }} citas hoy</span></div></article>
          <div v-if="!stylists.length" class="empty-state"><span class="empty-icon"><Sparkles :size="21" /></span><strong>Presenta a tu equipo</strong><span>Cuando registres especialistas, sus perfiles aparecerán aquí.</span></div>
        </section>

        <section v-else class="services-grid">
          <article v-for="service in services" :key="service._id" class="service-card"><span class="service-icon"><Scissors :size="18" /></span><span class="service-duration"><Clock3 :size="13" /> {{ service.duracion || 60 }} min</span><h2>{{ service.nombre }}</h2><p>{{ service.descripcion || 'Un momento para sentirte increíble.' }}</p><strong class="service-price">{{ formatMoney(service.precio) }}</strong></article>
          <div v-if="!services.length" class="empty-state"><span class="empty-icon"><Scissors :size="21" /></span><strong>Tu menú empieza aquí</strong><span>Cuando registres servicios, los verás listados en esta sección.</span></div>
        </section>

        <footer class="page-footer"><span>CASA FLORA <span class="footer-divider">/</span> HECHO CON CUIDADO</span><span>Estudio de belleza · Roma Norte</span></footer>
      </div>
    </main>

    <Teleport to="body">
      <div v-if="recordModal" class="modal-backdrop" @click.self="recordModal = ''" @keydown.esc="recordModal = ''">
        <section class="booking-modal management-modal" role="dialog" aria-modal="true" aria-labelledby="record-modal-title">
          <div class="modal-header"><div><p class="side-eyebrow">CASA FLORA · REGISTRO</p><h2 id="record-modal-title">{{ primaryActionLabel }}</h2></div><button class="icon-button close-button" aria-label="Cerrar" @click="recordModal = ''"><X :size="18" /></button></div>
          <form class="booking-form record-form" @submit.prevent="saveRecord">
            <template v-if="recordModal === 'clientes'">
              <div class="record-form-grid">
                <label class="form-field"><span>Nombre</span><input v-model.trim="recordForm.nombre" autocomplete="given-name" required /></label>
                <label class="form-field"><span>Apellido</span><input v-model.trim="recordForm.apellido" autocomplete="family-name" required /></label>
                <label class="form-field"><span>Correo electrónico</span><input v-model.trim="recordForm.correo" type="email" autocomplete="email" required /></label>
                <label class="form-field"><span>Teléfono</span><input v-model.trim="recordForm.telefono" type="tel" autocomplete="tel" required /></label>
                <label class="form-field form-field-wide"><span>Contraseña de acceso <small>MÍNIMO 6 CARACTERES</small></span><input v-model="recordForm.password" type="password" autocomplete="new-password" minlength="6" required /></label>
              </div>
            </template>
            <template v-else-if="recordModal === 'equipo'">
              <div class="record-form-grid">
                <label class="form-field"><span>Nombre</span><input v-model.trim="recordForm.nombre" autocomplete="given-name" required /></label>
                <label class="form-field"><span>Apellido</span><input v-model.trim="recordForm.apellido" autocomplete="family-name" required /></label>
                <label class="form-field"><span>Correo electrónico</span><input v-model.trim="recordForm.correo" type="email" autocomplete="email" required /></label>
                <label class="form-field"><span>Teléfono</span><input v-model.trim="recordForm.telefono" type="tel" autocomplete="tel" required /></label>
                <label class="form-field form-field-wide"><span>Especialidad</span><input v-model.trim="recordForm.especialidad" placeholder="Color, corte, manicure…" required /></label>
              </div>
            </template>
            <template v-else>
              <div class="record-form-grid">
                <label class="form-field form-field-wide"><span>Nombre del servicio</span><input v-model.trim="recordForm.nombre" placeholder="Ej. Corte y brushing" required /></label>
                <label class="form-field form-field-wide"><span>Descripción</span><textarea v-model.trim="recordForm.descripcion" rows="3" placeholder="Describe brevemente el servicio" required></textarea></label>
                <label class="form-field"><span>Precio (MXN)</span><input v-model.number="recordForm.precio" type="number" min="0" step="1" required /></label>
                <label class="form-field"><span>Duración (minutos)</span><input v-model.number="recordForm.duracion" type="number" min="15" step="15" required /></label>
              </div>
            </template>
            <p v-if="recordError" class="form-error">{{ recordError }}</p>
            <div class="modal-footer"><span><Sparkles :size="15" /> Información del salón.</span><button class="primary-button" type="submit" :disabled="recordSaving">{{ recordSaving ? 'Guardando…' : 'Guardar registro' }}<Check v-if="!recordSaving" :size="16" /></button></div>
          </form>
        </section>
      </div>
      <div v-if="modalOpen" class="modal-backdrop" @click.self="modalOpen = false" @keydown.esc="modalOpen = false">
        <section class="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
          <div class="modal-header"><div><p class="side-eyebrow">UN NUEVO MOMENTO</p><h2 id="booking-title">Agendar una cita</h2></div><button class="icon-button close-button" aria-label="Cerrar" @click="modalOpen = false"><X :size="18" /></button></div>
          <form class="booking-form" @submit.prevent="saveBooking">
            <label class="form-field"><span>Cliente</span><select v-model="booking.cliente" required><option value="" disabled>Seleccionar cliente</option><option v-for="client in clients" :key="client._id" :value="client._id">{{ fullName(client) }}</option></select></label>
            <label class="form-field"><span>Servicio</span><select v-model="booking.servicio" required><option value="" disabled>Seleccionar servicio</option><option v-for="service in services" :key="service._id" :value="service._id">{{ service.nombre }} · {{ formatMoney(service.precio) }}</option></select></label>
            <label class="form-field"><span>Especialista</span><select v-model="booking.estilista" required><option value="" disabled>Seleccionar especialista</option><option v-for="stylist in stylists" :key="stylist._id" :value="stylist._id">{{ fullName(stylist) }}</option></select></label>
            <div class="form-pair"><label class="form-field"><span>Fecha</span><input v-model="booking.fecha" type="date" required /></label><label class="form-field"><span>Hora</span><input v-model="booking.hora" type="time" required /></label></div>
            <label class="form-field"><span>Nota para el equipo <small>OPCIONAL</small></span><textarea v-model="booking.observaciones" rows="3" placeholder="Algún detalle que debamos recordar"></textarea></label>
            <p v-if="formError" class="form-error">{{ formError }}</p>
            <div class="modal-footer"><span><Sparkles :size="15" /> Un espacio hecho para ti.</span><button class="primary-button" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Confirmar cita' }}<Check v-if="!saving" :size="16" /></button></div>
          </form>
        </section>
      </div>
      <Transition name="toast"><div v-if="notice" class="toast-message"><CircleCheck :size="17" />{{ notice }}</div></Transition>
    </Teleport>
  </div>
</template>
