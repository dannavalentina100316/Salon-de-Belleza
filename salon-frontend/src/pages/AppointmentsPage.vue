<script setup>
import { computed, ref } from 'vue'
import { CalendarDays, Plus } from '@lucide/vue'
import { useSalonStore } from '../stores/salon'

const salon = useSalonStore()
const dialogOpen = ref(false)
const saving = ref(false)
const filter = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const today = new Date()
const dateKey = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-')
const form = ref({ cliente: '', estilista: '', servicio: '', fecha: dateKey, hora: '09:00', observaciones: '' })
const columns = [
  { name: 'fecha', label: 'FECHA', field: 'fecha', align: 'left', sortable: true },
  { name: 'hora', label: 'HORA', field: 'hora', align: 'left', sortable: true },
  { name: 'cliente', label: 'CLIENTE', field: (row) => `${row.cliente?.nombre || ''} ${row.cliente?.apellido || ''}`.trim(), align: 'left' },
  { name: 'servicio', label: 'SERVICIO', field: (row) => row.servicio?.nombre || '', align: 'left' },
  { name: 'estilista', label: 'ESTILISTA', field: (row) => `${row.estilista?.nombre || ''} ${row.estilista?.apellido || ''}`.trim(), align: 'left' },
  { name: 'estado', label: 'ESTADO', field: 'estado', align: 'left' },
]
const clienteOptions = computed(() => salon.clients.map((item) => ({ label: `${item.nombre} ${item.apellido}`, value: item._id })))
const stylistOptions = computed(() => salon.stylists.map((item) => ({ label: `${item.nombre} ${item.apellido}`, value: item._id })))
const serviceOptions = computed(() => salon.services.map((item) => ({ label: `${item.nombre} · $${item.precio}`, value: item._id })))

function openDialog() {
  errorMessage.value = ''
  form.value = { cliente: '', estilista: '', servicio: '', fecha: dateKey, hora: '09:00', observaciones: '' }
  dialogOpen.value = true
}

async function submitForm() {
  saving.value = true
  errorMessage.value = ''
  try {
    await salon.createAppointment(form.value)
    successMessage.value = 'Cita guardada correctamente.'
    dialogOpen.value = false
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="page-heading"><div><p class="eyebrow">AGENDA DEL SALÓN</p><h1>Agenda de citas</h1><p class="subtitle">Organiza cada visita y cada momento.</p></div><q-btn unelevated no-caps class="primary-action" :disable="!salon.clients.length || !salon.stylists.length || !salon.services.length" @click="openDialog"><template #prepend><Plus :size="17" /></template>Nueva cita</q-btn></div>
  <q-banner v-if="successMessage" class="success-banner" rounded>{{ successMessage }}</q-banner>
  <q-banner v-if="!salon.clients.length || !salon.stylists.length || !salon.services.length" class="hint-banner" rounded><template #avatar><CalendarDays :size="18" /></template>Para agendar necesitas registrar al menos un cliente, una estilista y un servicio.</q-banner>
  <q-card flat bordered class="directory-card"><q-card-section class="directory-toolbar"><div><h2>{{ salon.appointments.length }} citas registradas</h2></div><q-input v-model="filter" dense outlined clearable placeholder="Buscar en agenda" class="search-input" /></q-card-section>
    <q-table flat :rows="salon.appointments" :columns="columns" row-key="_id" :filter="filter" :loading="salon.loading" :pagination="{ rowsPerPage: 10, sortBy: 'fecha', descending: false }" no-data-label="Todavía no hay citas. Registra los datos del salón y agenda la primera." >
      <template #body-cell-estado="props"><q-td :props="props"><q-badge rounded :class="`status-${props.value}`">{{ props.value || 'pendiente' }}</q-badge></q-td></template>
    </q-table>
  </q-card>

  <q-dialog v-model="dialogOpen"><q-card class="form-dialog"><q-card-section class="dialog-heading"><div><p class="eyebrow">UN NUEVO MOMENTO</p><h2>Nueva cita</h2></div><q-btn v-close-popup flat round dense aria-label="Cerrar"><span class="close-mark">×</span></q-btn></q-card-section>
    <q-form class="record-form" @submit.prevent="submitForm">
      <div class="record-fields">
        <q-select v-model="form.cliente" outlined dense emit-value map-options :options="clienteOptions" label="Cliente" :rules="[value => !!value || 'Selecciona un cliente']" />
        <q-select v-model="form.servicio" outlined dense emit-value map-options :options="serviceOptions" label="Servicio" :rules="[value => !!value || 'Selecciona un servicio']" />
        <q-select v-model="form.estilista" outlined dense emit-value map-options :options="stylistOptions" label="Estilista" :rules="[value => !!value || 'Selecciona una estilista']" />
        <q-input v-model="form.fecha" outlined dense type="date" label="Fecha" stack-label required />
        <q-input v-model="form.hora" outlined dense type="time" label="Hora" stack-label required />
        <q-input v-model.trim="form.observaciones" outlined dense type="textarea" rows="2" label="Nota para el equipo (opcional)" class="field-wide" />
      </div>
      <q-banner v-if="errorMessage" class="error-banner" rounded>{{ errorMessage }}</q-banner>
      <q-card-actions align="right" class="dialog-actions"><q-btn v-close-popup flat no-caps label="Cancelar" /><q-btn unelevated no-caps class="primary-action" type="submit" :loading="saving" label="Confirmar cita" /></q-card-actions>
    </q-form>
  </q-card></q-dialog>
</template>

<style scoped>
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 25px; }
.eyebrow { margin: 0 0 9px; color: #a0786a; font-size: 9px; font-weight: 700; letter-spacing: 1px; }
h1 { margin: 0 0 7px; color: #202724; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 40px; font-weight: 500; line-height: 1; }
.subtitle { margin: 0; color: #858e88; font-size: 12px; }.primary-action { min-height: 38px; padding: 0 14px; border-radius: 4px; background: #d6785e; color: white; font-size: 11px; }
.directory-card { border-color: #e7eae5; border-radius: 0; background: white; }.directory-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid #edf0ec; }.directory-toolbar h2 { margin: 0; color: #48534c; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 21px; }.search-input { width: min(260px, 48%); font-size: 11px; }
.form-dialog { width: min(560px, calc(100vw - 28px)); max-width: 560px; padding: 9px; }.dialog-heading { display: flex; align-items: flex-start; justify-content: space-between; padding: 17px 17px 8px; }.dialog-heading h2 { margin: 0; color: #303b35; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 27px; }.close-mark { font-size: 24px; line-height: 1; }.record-form { padding: 5px 17px 10px; }.record-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }.field-wide { grid-column: 1 / -1; }.dialog-actions { margin-top: 12px; padding: 12px 0 0; border-top: 1px solid #e7eae5; }.success-banner { margin-bottom: 14px; background: #edf4ee; color: #55755e; font-size: 11px; }.hint-banner { margin-bottom: 16px; background: #fbf5f1; color: #76594d; font-size: 11px; }.error-banner { margin-top: 12px; background: #fbefec; color: #a34f3e; font-size: 11px; }.status-confirmada { background: #edf4ee !important; color: #63846a !important; }.status-pendiente { background: #f8f1e5 !important; color: #a98750 !important; }.status-cancelada { background: #f5e9e6 !important; color: #b66f5b !important; }
@media (max-width: 600px) { .page-heading { align-items: flex-start; }.page-heading .primary-action { width: 39px; min-width: 39px; overflow: hidden; padding: 0; font-size: 0; }.directory-toolbar { align-items: flex-start; flex-direction: column; }.search-input { width: 100%; }.record-fields { grid-template-columns: 1fr; }.field-wide { grid-column: auto; }h1 { font-size: 33px; } }
</style>
