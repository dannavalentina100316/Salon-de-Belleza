import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { Quasar } from 'quasar'
import 'quasar/src/css/index.sass'
import './style.css'
import App from './App.vue'
import router from './router'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App)
	.use(Quasar, {})
	.use(pinia)
	.use(router)
	.mount('#app')
