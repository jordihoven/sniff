import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// TODO: move icons import to it's own file...
import { Search } from 'lucide-vue-next'

const app = createApp(App)

// icons to use in the app...
app.component('LucideSearch', Search)

app.use(createPinia())
app.use(router)

app.mount('#app')
