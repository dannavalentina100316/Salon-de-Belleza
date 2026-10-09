
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { Quasar } from 'quasar'

import 'quasar/src/css/index.sass'
import './style.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Configuración del almacén de datos compartidos
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// Conexión de las tecnologías de la aplicación
app.use(pinia)
app.use(router)
app.use(Quasar, {})

// Inicio de la aplicación
app.mount('#app')