import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar } from 'quasar'
import quasarUserOptions from '@/quasar-user-options'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Hold the Vue Plugins in an array for easy iteration in case we need to add a lot more in the future
const vuePlugins = [router, createPinia()]

vuePlugins.forEach((vuePlugin) => app.use(vuePlugin))
app.use(Quasar, quasarUserOptions)

app.mount('#app')
