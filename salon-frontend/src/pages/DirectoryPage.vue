<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Search } from '@lucide/vue'
import { useSalonStore } from '../stores/salon'

const props = defineProps({ resource: { type: String, required: true } })
const route = useRoute()
const salon = useSalonStore()
const dialogOpen = ref(false)
const saving = ref(false)
const filter = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const form = ref({})
const config = computed(() => ({
  clients: {
    title: 'Personas que vuelven.', subtitle: 'Cuida cada relación con tus clientes.', action: 'Nuevo cliente', singular: 'Cliente', countLabel: 'personas en tu comunidad',
    rows: salon.clients, create: salon.createClient,
    columns: [
      { name: 'nombreCompleto', label: 'CLIENTE', field: (row) => `${row.nombre} ${row.apellido}`, align: 'left', sortable: true },
      { name: 'telefono', label: 'TELÉFONO', field: 'telefono', align: 'left' },
      { name: 'correo', label: 'CORREO', field: 'correo', align: 'left' },
    ],
    fields: [
      { key: 'nombre', label: 'Nombre', required: true, autocomplete: 'given-name' },
      { key: 'apellido', label: 'Apellido', required: true, autocomplete: 'family-name' },
      { key: 'correo', label: 'Correo electrónico', type: 'email', required: true, autocomplete: 'email' },
      { key: 'telefono', label: 'Teléfono', type: 'tel', required: true, autocomplete: 'tel' },
      { key: 'password', label: 'Contraseña de acceso (mínimo 6 caracteres)', type: 'password', required: true, minlength: 6, autocomplete: 'new-password' },
    ],
    payload: () => ({ ...form.value }),
  },
  stylists: {
    title: 'Un equipo brillante.', subtitle: 'Presenta a las personas detrás de cada servicio.', action: 'Agregar estilista', singular: 'Estilista', countLabel: 'especialistas en el equipo',
    rows: salon.stylists, create: salon.createStylist,
    columns: [
      { name: 'nombreCompleto', label: 'ESPECIALISTA', field: (row) => `${row.nombre} ${row.apellido}`, align: 'left', sortable: true },
      { name: 'especialidad', label: 'ESPECIALIDAD', field: 'especialidad', align: 'left' },
      { name: 'telefono', label: 'TELÉFONO', field: 'telefono', align: 'left' },
      { name: 'correo', label: 'CORREO', field: 'correo', align: 'left' },
    ],
    fields: [
      { key: 'nombre', label: 'Nombre', required: true, autocomplete: 'given-name' },
      { key: 'apellido', label: 'Apellido', required: true, autocomplete: 'family-name' },
      { key: 'correo', label: 'Correo electrónico', type: 'email', required: true, autocomplete: 'email' },
      { key: 'telefono', label: 'Teléfono', type: 'tel', required: true, autocomplete: 'tel' },
      { key: 'especialidad', label: 'Especialidad', required: true, placeholder: 'Color, corte, manicure…' },
    ],
    payload: () => ({ ...form.value }),
  },
  services: {
    title: 'El menú del salón.', subtitle: 'Servicios pensados para sentirse bien.', action: 'Nuevo servicio', singular: 'Servicio', countLabel: 'servicios disponibles',
    rows: salon.services, create: salon.createService,
    columns: [
      { name: 'nombre', label: 'SERVICIO', field: 'nombre', align: 'left', sortable: true },
      { name: 'descripcion', label: 'DESCRIPCIÓN', field: 'descripcion', align: 'left' },
      { name: 'duracion', label: 'DURACIÓN', field: (row) => `${row.duracion} min`, align: 'left' },
      { name: 'precio', label: 'PRECIO', field: (row) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(row.precio), align: 'left' },
    ],
    fields: [
      { key: 'nombre', label: 'Nombre del servicio', required: true, placeholder: 'Corte y brushing' },
      { key: 'descripcion', label: 'Descripción', type: 'textarea', required: true },
      { key: 'precio', label: 'Precio (MXN)', type: 'number', min: 0, required: true },
      { key: 'duracion', label: 'Duración (minutos)', type: 'number', min: 15, step: 15, required: true },
    ],
    payload: () => ({ ...form.value, precio: Number(form.value.precio), duracion: Number(form.value.duracion) }),
  },
}[props.resource]))
const pageTitle = computed(() => route.meta.title)
const visibleRows = computed(() => config.value.rows)

function openCreateDialog() {
  form.value = Object.fromEntries(config.value.fields.map((field) => [field.key, field.key === 'duracion' ? 60 : '']))
  errorMessage.value = ''
  successMessage.value = ''
  dialogOpen.value = true
}

async function submitForm() {
  saving.value = true
  errorMessage.value = ''
  try {
    await config.value.create(config.value.payload())
    successMessage.value = `${config.value.singular} guardado correctamente.`
    dialogOpen.value = false
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="page-heading">
    <div><p class="eyebrow">CASA FLORA · ESTUDIO DE BELLEZA</p><h1>{{ config.title }}</h1><p class="subtitle">{{ config.subtitle }}</p></div>
    <q-btn unelevated no-caps class="primary-action" @click="openCreateDialog"><template #prepend><Plus :size="17" /></template>{{ config.action }}</q-btn>
  </div>
  <q-banner v-if="successMessage" class="success-banner" rounded>{{ successMessage }}</q-banner>
  <q-card flat bordered class="directory-card">
    <q-card-section class="directory-toolbar"><div><h2>{{ config.rows.length }} {{ config.countLabel }}</h2></div><q-input v-model="filter" dense outlined clearable placeholder="Buscar" class="search-input"><template #prepend><Search :size="16" /></template></q-input></q-card-section>
    <q-table flat :rows="visibleRows" :columns="config.columns" row-key="_id" :filter="filter" :loading="salon.loading" :pagination="{ rowsPerPage: 10 }" :no-data-label="`Aún no hay registros. Usa “${config.action}” para agregar el primero.`" />
  </q-card>

  <q-dialog v-model="dialogOpen">
    <q-card class="form-dialog">
      <q-card-section class="dialog-heading"><div><p class="eyebrow">CASA FLORA · REGISTRO</p><h2>{{ config.action }}</h2></div><q-btn v-close-popup flat round dense aria-label="Cerrar"><span class="close-mark">×</span></q-btn></q-card-section>
      <q-form class="record-form" @submit.prevent="submitForm">
        <div class="record-fields">
          <q-input v-for="field in config.fields" :key="field.key" v-model="form[field.key]" outlined dense :label="field.label" :type="field.type || 'text'" :autocomplete="field.autocomplete" :placeholder="field.placeholder" :min="field.min" :step="field.step" :rules="field.required ? [value => (value !== '' && value !== null && value !== undefined) || 'Este campo es obligatorio', ...(field.minlength ? [value => String(value).length >= field.minlength || 'Escribe al menos 6 caracteres'] : [])] : []" lazy-rules :class="{ 'field-wide': field.type === 'textarea' || field.key === 'password' }" />
        </div>
        <q-banner v-if="errorMessage" class="error-banner" rounded>{{ errorMessage }}</q-banner>
        <q-card-actions align="right" class="dialog-actions"><q-btn v-close-popup flat no-caps label="Cancelar" /><q-btn unelevated no-caps class="primary-action" type="submit" :loading="saving" label="Guardar registro" /></q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 25px; }
.eyebrow { margin: 0 0 9px; color: #a0786a; font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
h1 { margin: 0 0 7px; color: #202724; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 40px; font-weight: 500; line-height: 1; }
.subtitle { margin: 0; color: #858e88; font-size: 12px; }
.primary-action { min-height: 38px; padding: 0 14px; border-radius: 4px; background: #d6785e; color: white; font-size: 11px; }
.directory-card { border-color: #e7eae5; border-radius: 0; background: white; }
.directory-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid #edf0ec; }
.directory-toolbar h2 { margin: 0; color: #48534c; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 21px; font-weight: 600; }
.search-input { width: min(240px, 48%); font-size: 11px; }
.form-dialog { width: min(520px, calc(100vw - 28px)); max-width: 520px; padding: 9px; }
.dialog-heading { display: flex; align-items: flex-start; justify-content: space-between; padding: 17px 17px 8px; }
.dialog-heading h2 { margin: 0; color: #303b35; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 27px; font-weight: 600; }
.close-mark { font-size: 24px; line-height: 1; }
.record-form { padding: 5px 17px 10px; }
.record-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.field-wide { grid-column: 1 / -1; }
.dialog-actions { margin-top: 12px; padding: 12px 0 0; border-top: 1px solid #e7eae5; }
.success-banner { margin-bottom: 14px; background: #edf4ee; color: #55755e; font-size: 11px; }
.error-banner { margin-top: 12px; background: #fbefec; color: #a34f3e; font-size: 11px; }
@media (max-width: 600px) { .page-heading { align-items: flex-start; }.page-heading .primary-action { width: 39px; min-width: 39px; overflow: hidden; padding: 0; font-size: 0; }.page-heading .primary-action :deep(.q-btn__content) { gap: 0; }.page-heading .primary-action :deep(.q-btn__content span) { display: none; }.directory-toolbar { align-items: flex-start; flex-direction: column; }.search-input { width: 100%; }.record-fields { grid-template-columns: 1fr; }.field-wide { grid-column: auto; }h1 { font-size: 33px; } }
</style>
