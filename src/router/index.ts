import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Livestock from '../views/Livestock.vue'
import Breeds from '../views/Breeds.vue'
import Contacts from '../views/Contacts.vue'
import Login from '../views/Login.vue'
import { useAuthStore } from '../stores/useAuthStore'
import { watch } from 'vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/livestock', name: 'Livestock', component: Livestock, meta: { requiresAuth: true } },
  { path: '/breeds', name: 'Breeds', component: Breeds, meta: { requiresAuth: true } },
  { path: '/contacts', name: 'Contacts', component: Contacts, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ✅ Nueva versión estable de la guarda
router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore()

  // Espera a que Firebase termine de cargar el estado inicial
  if (authStore.loading) {
    await new Promise<void>((resolve) => {
      const stop = watch(
        () => authStore.loading,
        (loading) => {
          if (!loading) {
            stop()
            resolve()
          }
        }
      )
    })
  }

  // 🔐 Validaciones de autenticación
  if (to.meta.requiresAuth && !authStore.user) {
    next('/login')
  } else if (to.path === '/login' && authStore.user) {
    next('/')
  } else {
    next()
  }
})

export default router
