
import { defineStore } from 'pinia'
import { salonApi } from '../services/salon'

export const useSalonStore = defineStore('salon', {
  state: () => ({
    appointments: [],
    clients: [],
    stylists: [],
    services: [],
    loading: false,
    error: '',
  }),

  actions: {
    async loadAll() {
      this.loading = true
      this.error = ''

      try {
        const [clients, stylists, services, appointments] =
          await Promise.all([
            salonApi.getClients(),
            salonApi.getStylists(),
            salonApi.getServices(),
            salonApi.getAppointments(),
          ])

        this.clients = Array.isArray(clients)
          ? clients
          : clients.clientes || []

        this.stylists = Array.isArray(stylists)
          ? stylists
          : stylists.estilistas || []

        this.services = Array.isArray(services)
          ? services
          : services.servicios || []

        this.appointments = Array.isArray(appointments)
          ? appointments
          : appointments.citas || []
      } catch (error) {
        this.error = error.message || 'No se pudieron cargar los datos.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createClient(data) {
      const result = await salonApi.createClient(data)
      await this.loadAll()
      return result
    },

    async createStylist(data) {
      const result = await salonApi.createStylist(data)
      await this.loadAll()
      return result
    },

    async createService(data) {
      const result = await salonApi.createService(data)
      await this.loadAll()
      return result
    },

    async createAppointment(data) {
      const result = await salonApi.createAppointment(data)
      await this.loadAll()
      return result
    },
  },
  async generarCitasPrueba() {
  this.loading = true;
  this.error = '';

  try {
    const resultado = await salonApi.generarCitasPrueba();
    await this.loadAll();
    return resultado;
  } catch (error) {
    this.error = error.message || 'No se pudieron generar las citas.';
    throw error;
  } finally {
    this.loading = false;
  }
},
})