import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import ApprovalsPage from '@/pages/ApprovalsPage.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import CategoriesPage from '@/pages/CategoriesPage.vue'
import ContentPage from '@/pages/ContentPage.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage.vue'
import ListingsPage from '@/pages/ListingsPage.vue'
import LoginPage from '@/pages/auth/LoginPage.vue'
import MediaPage from '@/pages/MediaPage.vue'
import PaymentsPage from '@/pages/PaymentsPage.vue'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage.vue'
import RolesPage from '@/pages/RolesPage.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import SignupPage from '@/pages/auth/SignupPage.vue'
import UsersPage from '@/pages/UsersPage.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes: [
    {
      path: '/',
      name: 'admin-root',
      redirect: { name: 'login' },
    },
    {
      path: '/',
      component: AuthLayout,
      meta: {
        guest: true,
      },
      children: [
        {
          path: 'login',
          name: 'login',
          component: LoginPage,
          meta: {
            title: 'Login | Kukaqka CMS',
            guest: true,
          },
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: ForgotPasswordPage,
          meta: {
            title: 'Forgot Password | Kukaqka CMS',
            guest: true,
          },
        },
        {
          path: 'signup',
          name: 'signup',
          component: SignupPage,
          meta: {
            title: 'Signup | Kukaqka CMS',
            guest: true,
          },
        },
        {
          path: 'reset-password',
          name: 'reset-password',
          component: ResetPasswordPage,
          meta: {
            title: 'Reset Password | Kukaqka CMS',
            guest: true,
          },
        },
      ],
    },
    {
      path: '/',
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
            title: 'Dashboard | Zaidic CMS',
          },
        },
        {
          path: 'listings',
          name: 'listings',
          component: ListingsPage,
          meta: {
            title: 'Listings | Kukaqka CMS',
          },
        },
        {
          path: 'approvals',
          name: 'approvals',
          component: ApprovalsPage,
          meta: {
            title: 'Approvals | Kukaqka CMS',
          },
        },
        {
          path: 'categories',
          name: 'categories',
          component: CategoriesPage,
          meta: {
            title: 'Categories | Kukaqka CMS',
          },
        },
        {
          path: 'content',
          name: 'content',
          component: ContentPage,
          meta: {
            title: 'Content | Kukaqka CMS',
          },
        },
        {
          path: 'media',
          name: 'media',
          component: MediaPage,
          meta: {
            title: 'Media | Kukaqka CMS',
          },
        },
        {
          path: 'payments',
          name: 'payments',
          component: PaymentsPage,
          meta: {
            title: 'Payments | Kukaqka CMS',
          },
        },
        {
          path: 'users',
          name: 'users',
          component: UsersPage,
          meta: {
            title: 'Users | Kukaqka CMS',
          },
        },
        {
          path: 'roles',
          name: 'roles',
          component: RolesPage,
          meta: {
            title: 'Roles | Kukaqka CMS',
          },
        },
        {
          path: 'settings',
          name: 'settings',
          component: SettingsPage,
          meta: {
            title: 'Settings | Kukaqka CMS',
          },
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  document.title = String(to.meta.title || 'Zaidic CMS')
})

export default router
