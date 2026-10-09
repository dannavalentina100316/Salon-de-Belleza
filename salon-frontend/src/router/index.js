
import { createRouter, createWebHistory } from 'vue-router'

import MainLayout from '../layouts/MainLayout.vue'
import DashboardPage from '../pages/DashboardPage.vue'
import AppointmentsPage from '../pages/AppointmentsPage.vue'
import DirectoryPage from '../pages/DirectoryPage.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'inicio',
        component: DashboardPage,
      },
      {
        path: 'citas',
        name: 'citas',
        component: AppointmentsPage,
      },
      {
        path: 'clientes',
        name: 'clientes',
        component: DirectoryPage,
        props: { tipo: 'clientes' },
      },
      {
        path: 'estilistas',
        name: 'estilistas',
        component: DirectoryPage,
        props: { tipo: 'estilistas' },
      },
      {
        path: 'servicios',
        name: 'servicios',
        component: DirectoryPage,
        props: { tipo: 'servicios' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router