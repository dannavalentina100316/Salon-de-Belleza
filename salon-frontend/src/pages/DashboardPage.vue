<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { CalendarDays, CircleCheck, CircleDollarSign, Clock3, Plus } from '@lucide/vue'
import { useSalonStore } from '../stores/salon'

const salon = useSalonStore()
const router = useRouter()
const today = new Date()
const localDate = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-')
const dayAppointments = computed(() => salon.appointments.filter((appointment) => appointment.fecha === localDate).sort((a, b) => a.hora.localeCompare(b.hora)))
const confirmed = computed(() => dayAppointments.value.filter((item) => item.estado === 'confirmada').length)
const pending = computed(() => dayAppointments.value.filter((item) => item.estado === 'pendiente').length)
const revenue = computed(() => dayAppointments.value.reduce((total, item) => total + Number(item.servicio?.precio || 0), 0))
const dateLabel = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(today)
const formatMoney = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value)
const fullName = (person) => [person?.nombre, person?.apellido].filter(Boolean).join(' ')
const initials = (person) => `${person?.nombre?.[0] || ''}${person?.apellido?.[0] || ''}`.toUpperCase()
const columns = [
  { name: 'hora', label: 'HORA', field: 'hora', align: 'left', sortable: true },
  { name: 'cliente', label: 'CLIENTE', field: (row) => fullName(row.cliente), align: 'left' },
  { name: 'servicio', label: 'SERVICIO', field: (row) => row.servicio?.nombre, align: 'left' },
  { name: 'estilista', label: 'ESPECIALISTA', field: (row) => fullName(row.estilista), align: 'left' },
  { name: 'estado', label: 'ESTADO', field: 'estado', align: 'left' },
]
</script>

<template>
  <div class="page-heading">
    <div><p class="eyebrow">{{ dateLabel }}</p><h1>Tu salón, en ritmo.</h1><p class="subtitle">Todo lo que pasa hoy, en un solo lugar.</p></div>
    <q-btn unelevated no-caps class="primary-action" label="Nueva cita" @click="router.push('/citas')"><template #prepend><Plus :size="17" /></template></q-btn>
  </div>

  <section class="stats-grid">
    <q-card flat bordered class="stat-card"><q-card-section><div class="stat-heading">Citas de hoy <span class="stat-icon coral"><CalendarDays :size="17" /></span></div><div class="stat-value">{{ dayAppointments.length }}</div><div class="stat-foot">En agenda</div></q-card-section></q-card>
    <q-card flat bordered class="stat-card"><q-card-section><div class="stat-heading">Confirmadas <span class="stat-icon green"><CircleCheck :size="17" /></span></div><div class="stat-value">{{ confirmed }}</div><div class="stat-foot">De {{ dayAppointments.length }} citas</div></q-card-section></q-card>
    <q-card flat bordered class="stat-card"><q-card-section><div class="stat-heading">Por confirmar <span class="stat-icon amber"><Clock3 :size="17" /></span></div><div class="stat-value">{{ pending }}</div><div class="stat-foot">Seguimientos pendientes</div></q-card-section></q-card>
    <q-card flat bordered class="stat-card"><q-card-section><div class="stat-heading">Venta potencial <span class="stat-icon blue"><CircleDollarSign :size="17" /></span></div><div class="stat-value money">{{ formatMoney(revenue) }}</div><div class="stat-foot">Servicios agendados hoy</div></q-card-section></q-card>
  </section>

  <q-card flat bordered class="content-card">
    <q-card-section class="panel-heading"><div><h2>Agenda de hoy</h2><p>{{ dayAppointments.length }} citas programadas</p></div><q-btn flat no-caps class="secondary-action" label="Ver todas" to="/citas" /></q-card-section>
    <q-table flat :rows="dayAppointments" :columns="columns" row-key="_id" :loading="salon.loading" :pagination="{ rowsPerPage: 8 }" no-data-label="Todavía no hay citas agendadas.">
      <template #body-cell-cliente="props"><q-td :props="props"><div class="person-cell"><span class="person-initials">{{ initials(props.row.cliente) }}</span><strong>{{ fullName(props.row.cliente) }}</strong></div></q-td></template>
      <template #body-cell-estado="props"><q-td :props="props"><q-badge rounded :class="`status-${props.value}`">{{ props.value || 'pendiente' }}</q-badge></q-td></template>
    </q-table>
  </q-card>
</template>

<style scoped>
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 27px; }
.eyebrow { margin: 0 0 10px; color: #a0786a; font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
h1 { margin: 0 0 7px; color: #202724; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 40px; font-weight: 500; line-height: 1; }
.subtitle { margin: 0; color: #858e88; font-size: 12px; }
.primary-action { min-height: 39px; padding: 0 15px; border-radius: 4px; background: #d6785e; color: #fff; font-size: 11px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1px; margin-bottom: 25px; border: 1px solid #e7eae5; background: #e7eae5; }
.stat-card { border: 0; border-radius: 0; background: #fff; }
.stat-card :deep(.q-card__section) { padding: 16px 18px; }
.stat-heading { display: flex; align-items: center; justify-content: space-between; color: #7d8781; font-size: 10px; }
.stat-icon { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 50%; }
.coral { background: #faeeea; color: #c6755b; }.green { background: #edf4ee; color: #688c70; }.amber { background: #f8f2e8; color: #bd9456; }.blue { background: #edf2f2; color: #648384; }
.stat-value { margin-top: 3px; color: #26312b; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 29px; font-weight: 600; line-height: 1.1; }
.stat-value.money { font-size: 26px; }
.stat-foot { margin-top: 5px; color: #9aa19d; font-size: 9px; }
.content-card { border-color: #e7eae5; border-radius: 0; background: #fff; }
.panel-heading { display: flex; align-items: center; justify-content: space-between; padding: 17px 19px; border-bottom: 1px solid #edf0ec; }
.panel-heading h2 { margin: 0 0 4px; color: #303b35; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; font-weight: 600; }
.panel-heading p { margin: 0; color: #929b95; font-size: 10px; }
.secondary-action { color: #9a6b5c; font-size: 10px; }
.person-cell { display: flex; align-items: center; gap: 9px; }
.person-initials { display: grid; width: 29px; height: 29px; place-items: center; border-radius: 50%; background: #f5e5df; color: #aa6c59; font-size: 9px; font-weight: 700; }
.status-confirmada { background: #edf4ee !important; color: #63846a !important; }.status-pendiente { background: #f8f1e5 !important; color: #a98750 !important; }.status-cancelada { background: #f5e9e6 !important; color: #b66f5b !important; }
@media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .page-heading { align-items: flex-start; } h1 { font-size: 32px; }.stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.stat-card :deep(.q-card__section) { padding: 13px 11px; } }
</style>
