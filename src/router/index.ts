import { createRouter, createWebHistory } from 'vue-router'
import torrentDownloader from '@/views/torrentSniffer.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'torrentDownloader',
      component: torrentDownloader
    }
  ]
})

export default router
