import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar } from 'quasar'
import quasarUserOptions from '@/quasar-user-options'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Hold the Vue apps in an array for easy iteration
const vueApps = [router, createPinia()]

vueApps.forEach((vueApp) => app.use(vueApp))
app.use(Quasar, quasarUserOptions)

app.mount('#app')
