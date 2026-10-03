<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { CalendarDays, Flower2, LayoutDashboard, Scissors, Sparkles, UsersRound } from '@lucide/vue'
import { useSalonStore } from '../stores/salon'

const route = useRoute()
const salon = useSalonStore()
const drawerOpen = ref(false)
const navigation = [
  { label: 'Resumen', to: '/', icon: LayoutDashboard },
  { label: 'Citas', to: '/citas', icon: CalendarDays },
  { label: 'Clientes', to: '/clientes', icon: UsersRound },
  { label: 'Equipo', to: '/equipo', icon: Sparkles },
  { label: 'Servicios', to: '/servicios', icon: Scissors },
]
const pageTitle = computed(() => route.meta.title || 'Casa Flora')
const apiOnline = computed(() => !salon.error)

onMounted(() => salon.loadAll().catch(() => {}))
</script>

<template>
  <q-layout view="hHh Lpr lFf" class="salon-layout">
    <q-header class="topbar">
      <q-toolbar class="topbar-toolbar">
        <q-btn flat round dense class="mobile-toggle" aria-label="Abrir menú" @click="drawerOpen = !drawerOpen">
          <MenuIcon />
        </q-btn>
        <div class="breadcrumb"><span>Casa Flora</span><span class="breadcrumb-slash">/</span><strong>{{ pageTitle }}</strong></div>
        <q-space />
        <div class="api-indicator" :class="{ 'api-indicator-offline': !apiOnline }">
          <span></span>{{ salon.loading ? 'Conectando' : apiOnline ? 'En línea' : 'Sin conexión' }}
        </div>
        <q-btn flat round dense aria-label="Recargar datos" :loading="salon.loading" @click="salon.loadAll().catch(() => {})">
          <RefreshIcon />
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawerOpen" show-if-above :breakpoint="800" :width="248" class="sidebar">
      <div class="brand-lockup">
        <span class="brand-mark"><Flower2 :size="22" /></span>
        <span><strong>casa flora</strong><small>ESTUDIO DE BELLEZA</small></span>
      </div>
      <div class="workspace-switcher"><span class="workspace-avatar">F</span><span><strong>Casa Flora</strong><small>Roma Norte · CDMX</small></span></div>
      <div class="nav-caption">ESPACIO DE TRABAJO</div>
      <q-list class="side-nav">
        <q-item v-for="item in navigation" :key="item.to" clickable v-ripple :to="item.to" exact class="nav-item" active-class="nav-item-active" @click="drawerOpen = false">
          <q-item-section avatar><component :is="item.icon" :size="18" /></q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
          <q-item-section v-if="item.to === '/citas'" side><span class="nav-count">{{ salon.appointments.length }}</span></q-item-section>
        </q-item>
      </q-list>
      <div class="sidebar-bottom">
        <div class="sidebar-note"><Sparkles :size="16" /><strong>Un buen día empieza aquí.</strong><span>Cuida los detalles. Lo demás, fluye.</span></div>
        <div class="profile-row"><span class="profile-avatar">FM</span><span><strong>Administración</strong><small>Casa Flora</small></span></div>
      </div>
    </q-drawer>

    <q-page-container>
      <q-page class="page-container">
        <q-banner v-if="salon.error" class="connection-banner" rounded>
          <template #avatar><span class="banner-dot"></span></template>
          No se pudieron cargar los datos. Comprueba que el backend esté activo.
          <template #action><q-btn flat label="Reintentar" @click="salon.loadAll().catch(() => {})" /></template>
        </q-banner>
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { Menu as MenuIcon, RefreshCw as RefreshIcon } from '@lucide/vue'
export default { components: { MenuIcon, RefreshIcon } }
</script>

<style scoped>
.topbar { background: rgba(255, 255, 255, .96); color: #303b35; border-bottom: 1px solid #e7eae5; }
.topbar-toolbar { min-height: 62px; padding: 0 34px; }
.mobile-toggle { display: none; }
.breadcrumb { display: flex; align-items: center; gap: 10px; color: #929b95; font-size: 11px; }
.breadcrumb strong { color: #404b44; font-weight: 600; }
.breadcrumb-slash { color: #d28b74; }
.api-indicator { display: flex; align-items: center; gap: 7px; margin-right: 14px; color: #647269; font-size: 10px; }
.api-indicator span { width: 7px; height: 7px; border-radius: 50%; background: #79a27f; }
.api-indicator-offline span { background: #c77761; }
.sidebar { background: #202c28; color: #f8faf8; }
.brand-lockup { display: flex; align-items: center; gap: 11px; padding: 28px 24px 0; }
.brand-mark { display: grid; width: 38px; height: 38px; place-items: center; border: 1px solid #52625b; border-radius: 50%; color: #e0a08b; }
.brand-lockup strong { display: block; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 25px; font-weight: 600; line-height: 1; }
.brand-lockup small { display: block; margin-top: 3px; color: #a9b5ae; font-size: 8px; font-weight: 700; letter-spacing: 1.1px; }
.workspace-switcher { display: flex; align-items: center; gap: 10px; margin: 37px 17px 31px; padding: 12px 10px; border: 1px solid #394640; border-radius: 6px; background: #293630; }
.workspace-avatar { display: grid; width: 33px; height: 33px; place-items: center; border-radius: 5px; background: #d9866d; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; }
.workspace-switcher strong, .profile-row strong { display: block; font-size: 12px; font-weight: 600; }
.workspace-switcher small, .profile-row small { display: block; margin-top: 3px; color: #a9b5ae; font-size: 10px; }
.nav-caption { padding: 0 27px 11px; color: #96a49c; font-size: 9px; font-weight: 700; letter-spacing: 1.25px; }
.side-nav { padding: 0 17px; }
.nav-item { min-height: 43px; margin: 3px 0; border-radius: 5px; color: #b6c0ba; font-size: 12px; }
.nav-item :deep(.q-item__section--avatar) { min-width: 32px; color: inherit; }
.nav-item:hover { background: #2b3832; color: white; }
.nav-item-active { background: #34443c !important; color: white !important; }
.nav-item-active :deep(svg) { color: #e8a18b; }
.nav-count { padding: 3px 7px; border-radius: 12px; background: #46564e; color: #e5ede8; font-size: 10px; }
.sidebar-bottom { position: absolute; right: 17px; bottom: 16px; left: 17px; }
.sidebar-note { display: grid; gap: 7px; margin: 0 4px 17px; padding: 14px 13px; border: 1px solid #3a4942; border-radius: 6px; background: #293630; color: #e0a08b; }
.sidebar-note strong { color: #f5f7f5; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 16px; }
.sidebar-note span { color: #aab6af; font-size: 10px; }
.profile-row { display: flex; align-items: center; gap: 10px; padding: 13px 6px 0; border-top: 1px solid #394640; }
.profile-avatar { display: grid; width: 33px; height: 33px; place-items: center; border-radius: 50%; background: #d9c5a7; color: #4d4336; font-size: 10px; font-weight: 700; }
.page-container { min-height: calc(100vh - 62px); padding: 34px clamp(18px, 3vw, 44px) 24px; background: #f5f6f3; }
.connection-banner { margin-bottom: 20px; border: 1px solid #eddfd7; background: #fbf5f1; color: #76594d; font-size: 12px; }
.banner-dot { display: block; width: 8px; height: 8px; border-radius: 50%; background: #c77761; }
@media (max-width: 800px) {
  .topbar-toolbar { min-height: 56px; padding: 0 12px; }
  .mobile-toggle { display: grid; margin-right: 8px; }
  .page-container { padding: 24px 14px 18px; }
  .sidebar-bottom { position: static; margin: auto 17px 16px; }
}
</style>
