import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AdminLoginPage from '../pages/auth/AdminLoginPage.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import DashboardPage from '../pages/DashboardPage.vue'

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes: [
    {
      path: 'login',
      name: 'login',
      component: AdminLoginPage,
      meta: {
        title: 'Admin Login | Zaidic',
      },
    },
    {
      path: '',
      component: AdminLayout,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardPage,
          meta: {
            title: 'Dashboard | Admin',
          },
        },
        {
          path: '',
          redirect: { name: 'dashboard' },
        },
      ],
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  document.title = String(to.meta.title || 'Admin | Zaidic')

  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { returnUrl: to.fullPath } })
    return
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }

  if (authStore.token && !authStore.user) {
    await authStore.fetchUser()
  }

  next()
})

export default router
