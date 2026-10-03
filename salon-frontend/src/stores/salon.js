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
        const [appointments, clients, stylists, services] = await Promise.all([
          salonApi.getAppointments(),
          salonApi.getClients(),
          salonApi.getStylists(),
          salonApi.getServices(),
        ])
        this.appointments = appointments.citas || []
        this.clients = clients.clientes || []
        this.stylists = stylists.estilistas || []
        this.services = services.servicios || []
      } catch (error) {
        this.error = error.message
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
})
