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
      { path: '', name: 'dashboard', component: DashboardPage, meta: { title: 'Resumen' } },
      { path: 'citas', name: 'appointments', component: AppointmentsPage, meta: { title: 'Citas' } },
      { path: 'clientes', name: 'clients', component: DirectoryPage, props: { resource: 'clients' }, meta: { title: 'Clientes' } },
      { path: 'equipo', name: 'stylists', component: DirectoryPage, props: { resource: 'stylists' }, meta: { title: 'Equipo' } },
      { path: 'servicios', name: 'services', component: DirectoryPage, props: { resource: 'services' }, meta: { title: 'Servicios' } },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: { name: 'dashboard' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
