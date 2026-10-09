
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

  // SERVICIOS
  getServices() {
    return api.get('/servicios')
  },

  createService(data) {
    return api.post('/servicios', data)
  },

  // CITAS
  getAppointments() {
    return api.get('/citas')
  },

  createAppointment(data) {
    return api.post('/citas', data)
  },
  generarCitasPrueba() {
  return api.post('/citas/generar-prueba');
},
}
