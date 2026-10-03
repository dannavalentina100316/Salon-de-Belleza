import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({ density: 'comfortable' }),
  actions: {
    setDensity(value) {
      this.density = value
    },
  },
  persist: {
    pick: ['density'],
  },
})
