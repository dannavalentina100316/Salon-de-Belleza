import api from './api'

export const salonApi = {
  getAppointments: () => api.get('/citas'),
  createAppointment: (data) => api.post('/citas', data),
  getClients: () => api.get('/clientes'),
  createClient: (data) => api.post('/clientes', data),
  getStylists: () => api.get('/estilistas'),
  createStylist: (data) => api.post('/estilistas', data),
  getServices: () => api.get('/servicios'),
  createService: (data) => api.post('/servicios', data),
}
