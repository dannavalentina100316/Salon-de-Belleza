
<template>
  <div class="dashboard">
    <section class="welcome-card">
      <div class="welcome-text">
        <span class="eyebrow">BIENVENIDA A TU ESPACIO</span>
        <h2>La belleza está<br />en cada detalle.</h2>
        <p>Organiza tu salón y brinda una experiencia especial a cada cliente.</p>

        <RouterLink to="/citas" class="welcome-button">
          Ver agenda <span>→</span>
        </RouterLink>
      </div>

      <div class="welcome-art" aria-hidden="true">
        <div class="art-circle">
          <span class="art-flower">✿</span>
          <span class="art-leaf">❧</span>
        </div>
        <span class="art-star star-one">✧</span>
        <span class="art-star star-two">✦</span>
      </div>
    </section>

    <div class="section-heading">
      <div>
        <span class="eyebrow">RESUMEN DEL SALÓN</span>
        <h2>Tu espacio de trabajo</h2>
      </div>

      <button class="refresh-button" @click="cargarDatos" :disabled="store.loading">
        ↻ Actualizar
      </button>
    </div>

    <p v-if="store.error" class="error-message">
      {{ store.error }}
    </p>

    <section class="stats-grid">
      <article class="stat-card">
        <div class="stat-icon pink">▦</div>
        <div>
          <p>Citas registradas</p>
          <h3>{{ store.appointments.length }}</h3>
          <span>En el sistema</span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon cream">♡</div>
        <div>
          <p>Clientes</p>
          <h3>{{ store.clients.length }}</h3>
          <span>Personas registradas</span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon green">✿</div>
        <div>
          <p>Estilistas</p>
          <h3>{{ store.stylists.length }}</h3>
          <span>Equipo del salón</span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon lilac">✧</div>
        <div>
          <p>Servicios</p>
          <h3>{{ store.services.length }}</h3>
          <span>Disponibles en el salón</span>
        </div>
      </article>
    </section>

    <section class="bottom-grid">
      <article class="appointments-card">
        <div class="card-heading">
          <div>
            <span class="eyebrow">ORGANIZACIÓN</span>
            <h2>Últimas citas</h2>
          </div>
          <RouterLink to="/citas" class="text-link">Ver agenda →</RouterLink>
        </div>

        <div v-if="store.loading" class="empty-state">
          Cargando información...
        </div>

        <div v-else-if="ultimasCitas.length" class="appointment-list">
          <div
            v-for="(cita, index) in ultimasCitas"
            :key="cita._id || cita.id || index"
            class="appointment-row"
          >
            <div class="appointment-date">
              <span>{{ obtenerDia(cita) }}</span>
              <small>{{ obtenerMes(cita) }}</small>
            </div>

            <div class="appointment-info">
              <strong>{{ nombreCliente(cita) }}</strong>
              <span>{{ nombreServicio(cita) }}</span>
            </div>

            <span class="appointment-time">{{ obtenerHora(cita) }}</span>
          </div>
        </div>

        <div v-else class="empty-state">
          <span class="empty-flower">✿</span>
          <strong>Aún no hay citas</strong>
          <p>Cuando registres una cita, aparecerá aquí.</p>
          <RouterLink to="/citas" class="text-link">Registrar una cita →</RouterLink>
        </div>
      </article>

      <article class="quick-card">
        <span class="eyebrow">ACCESOS RÁPIDOS</span>
        <h2>¿Qué necesitas hacer?</h2>

        <RouterLink to="/citas" class="quick-link">
          <span class="quick-icon">＋</span>
          <span>
            <strong>Gestionar citas</strong>
            <small>Organiza los horarios del salón</small>
          </span>
          <span class="quick-arrow">→</span>
        </RouterLink>

        <RouterLink to="/clientes" class="quick-link">
          <span class="quick-icon">♡</span>
          <span>
            <strong>Ver clientes</strong>
            <small>Consulta el directorio</small>
          </span>
          <span class="quick-arrow">→</span>
        </RouterLink>

        <RouterLink to="/servicios" class="quick-link">
          <span class="quick-icon">✿</span>
          <span>
            <strong>Ver servicios</strong>
            <small>Consulta los tratamientos</small>
          </span>
          <span class="quick-arrow">→</span>
        </RouterLink>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useSalonStore } from '../stores/salon'

const store = useSalonStore()

const ultimasCitas = computed(() => {
  return [...store.appointments]
    .sort((a, b) => {
      return new Date(b.fecha || b.fechaHora || 0) -
        new Date(a.fecha || a.fechaHora || 0)
    })
    .slice(0, 4)
})

function cargarDatos() {
  store.loadAll().catch(() => {})
}

function obtenerDia(cita) {
  const fecha = cita.fecha || cita.fechaHora

  if (!fecha) return '--'

  const fechaValida = new Date(fecha)
  if (Number.isNaN(fechaValida.getTime())) return '--'

  return fechaValida.getDate()
}

function obtenerMes(cita) {
  const fecha = cita.fecha || cita.fechaHora

  if (!fecha) return 'Sin fecha'

  const fechaValida = new Date(fecha)
  if (Number.isNaN(fechaValida.getTime())) return 'Sin fecha'

  return fechaValida.toLocaleDateString('es-CO', { month: 'short' })
}

function nombreCliente(cita) {
  const cliente = cita.cliente

  if (cliente && typeof cliente === 'object') {
    return `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() || 'Cliente'
  }

  return cita.nombreCliente || 'Cliente'
}

function nombreServicio(cita) {
  const servicio = cita.servicio

  if (servicio && typeof servicio === 'object') {
    return servicio.nombre || 'Servicio reservado'
  }

  return cita.nombreServicio || 'Servicio reservado'
}

function obtenerHora(cita) {
  if (cita.hora) return cita.hora

  const fecha = cita.fecha || cita.fechaHora
  if (!fecha) return '--:--'

  const fechaValida = new Date(fecha)
  if (Number.isNaN(fechaValida.getTime())) return '--:--'

  return fechaValida.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(cargarDatos)
</script>

<style scoped>
.dashboard {
  max-width: 1500px;
  margin: 0 auto;
}

.welcome-card {
  min-height: 250px;
  padding: 34px 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(115deg, #f3dfe0, #f9eeea 70%, #f5e5df);
  border: 1px solid #f0dedd;
  border-radius: 18px;
}

.eyebrow {
  color: #a26778;
  font-size: 10px;
  letter-spacing: 1.8px;
  font-weight: 600;
}

.welcome-text {
  max-width: 430px;
}

.welcome-text h2 {
  margin: 13px 0 10px;
  color: #693c4b;
  font-family: Georgia, serif;
  font-size: clamp(30px, 4vw, 43px);
  font-weight: normal;
  line-height: 1.12;
}

.welcome-text p {
  max-width: 370px;
  color: #80656a;
  font-size: 13px;
  line-height: 1.8;
}

.welcome-button {
  display: inline-flex;
  align-items: center;
  gap: 20px;
  margin-top: 10px;
  padding: 12px 18px;
  border-radius: 8px;
  background: #82485b;
  color: white;
  text-decoration: none;
  font-size: 12px;
  transition: background 0.2s;
}

.welcome-button:hover {
  background: #663748;
}

.welcome-button span {
  font-size: 17px;
}

.welcome-art {
  position: relative;
  width: 230px;
  height: 190px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
}

.art-circle {
  width: 155px;
  height: 155px;
  display: grid;
  place-items: center;
  border: 1px solid #d5aab0;
  border-radius: 50%;
  background: #f8e8e5;
  box-shadow: 0 0 0 15px #ffffff35;
}

.art-flower {
  color: #a8667a;
  font-size: 90px;
}

.art-leaf {
  position: absolute;
  right: 28px;
  bottom: 14px;
  color: #9b9274;
  font-size: 60px;
  transform: rotate(-25deg);
}

.art-star {
  position: absolute;
  color: #a96f7c;
}

.star-one {
  top: 8px;
  right: 32px;
  font-size: 34px;
}

.star-two {
  bottom: 10px;
  left: 15px;
  font-size: 23px;
}

.section-heading {
  margin: 32px 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.section-heading h2,
.card-heading h2,
.quick-card h2 {
  margin: 7px 0 0;
  color: #503a40;
  font-family: Georgia, serif;
  font-size: 23px;
  font-weight: normal;
}

.refresh-button {
  padding: 10px 14px;
  border: 1px solid #eadbdc;
  border-radius: 8px;
  background: #fffdfb;
  color: #805061;
  cursor: pointer;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.error-message {
  padding: 12px 15px;
  border-radius: 8px;
  background: #fff0ed;
  color: #a13e36;
  font-size: 13px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  min-width: 0;
  padding: 22px 17px;
  display: flex;
  align-items: flex-start;
  gap: 13px;
  background: #fffdfb;
  border: 1px solid #f0e6e3;
  border-radius: 13px;
}

.stat-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 11px;
  font-size: 23px;
}

.pink {
  background: #f8e7eb;
  color: #a35f77;
}

.cream {
  background: #f8efdf;
  color: #a78b5e;
}

.green {
  background: #e9eee3;
  color: #748363;
}

.lilac {
  background: #eee8f5;
  color: #8773a0;
}

.stat-card p {
  margin: 2px 0 10px;
  color: #8d777c;
  font-size: 12px;
}

.stat-card h3 {
  margin: 0;
  color: #503a40;
  font-family: Georgia, serif;
  font-size: 28px;
  font-weight: normal;
}

.stat-card span {
  display: block;
  margin-top: 7px;
  color: #aa999b;
  font-size: 10px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(260px, 0.9fr);
  gap: 18px;
  margin-top: 22px;
}

.appointments-card,
.quick-card {
  padding: 24px;
  border: 1px solid #f0e6e3;
  border-radius: 13px;
  background: #fffdfb;
}

.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.card-heading h2 {
  font-size: 21px;
}

.text-link {
  color: #945b6e;
  font-size: 12px;
  text-decoration: none;
}

.text-link:hover {
  text-decoration: underline;
}

.appointment-list {
  display: flex;
  flex-direction: column;
}

.appointment-row {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 14px 0;
  border-top: 1px solid #f3eae7;
}

.appointment-date {
  width: 43px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f8e9e9;
  color: #82485b;
}

.appointment-date span {
  font-size: 18px;
  font-weight: 600;
}

.appointment-date small {
  font-size: 10px;
  text-transform: capitalize;
}

.appointment-info {
  min-width: 0;
  flex: 1;
}

.appointment-info strong,
.appointment-info span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.appointment-info strong {
  color: #59444a;
  font-size: 13px;
}

.appointment-info span {
  margin-top: 6px;
  color: #a18a8e;
  font-size: 11px;
}

.appointment-time {
  color: #815266;
  font-size: 12px;
  white-space: nowrap;
}

.empty-state {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: #927b80;
  text-align: center;
  font-size: 12px;
}

.empty-state p {
  margin: 0;
}

.empty-state strong {
  color: #63464f;
  font-size: 14px;
}

.empty-flower {
  color: #b27688;
  font-size: 32px;
}

.quick-card h2 {
  margin-bottom: 20px;
  font-size: 21px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 0;
  border-top: 1px solid #f3eae7;
  color: inherit;
  text-decoration: none;
}

.quick-link:hover strong {
  color: #9a5c70;
}

.quick-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #f8e9e9;
  color: #98576b;
  font-size: 21px;
}

.quick-link > span:nth-child(2) {
  min-width: 0;
  flex: 1;
}

.quick-link strong,
.quick-link small {
  display: block;
}

.quick-link strong {
  color: #62464e;
  font-size: 12px;
}

.quick-link small {
  margin-top: 5px;
  color: #a18a8e;
  font-size: 10px;
}

.quick-arrow {
  color: #ad8791;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .welcome-card {
    padding: 25px;
  }

  .welcome-art {
    display: none;
  }

  .stats-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .appointments-card,
  .quick-card {
    padding: 18px;
  }

  .section-heading h2 {
    font-size: 20px;
  }
}
</style>