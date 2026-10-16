
import api from './api'

export const salonApi = {
  // CLIENTES
  getClients() {
    return api.get('/clientes')
  },

  createClient(data) {
    return api.post('/clientes', data)
  },

  // ESTILISTAS
  getStylists() {
    return api.get('/estilistas')
  },

  createStylist(data) {
    return api.post('/estilistas', data)
  },

  updateStylist(id, data) {
    return api.put(`/estilistas/${id}`, data)
  },

  toggleStylistStatus(id) {
    return api.patch(`/estilistas/${id}/estado`)
  },

  deleteStylist(id) {
    return api.delete(`/estilistas/${id}`)
  },

  // SERVICIOS
  getServices() {
    return api.get('/servicios')
  },

  createService(data) {
    return api.post('/servicios', data)
  },

  updateService(id, data) {
    return api.put(`/servicios/${id}`, data)
  },

  // CITAS
  getAppointments() {
    return api.get('/citas')
  },

  createAppointment(data) {
    return api.post('/citas', data)
  },

  updateAppointmentStatus(id, estado) {
    return api.patch(`/citas/${id}/estado`, { estado })
  },
  generarCitasPrueba() {
    return api.post('/citas/generar-prueba', undefined, { timeout: 120000 })
  },
}
