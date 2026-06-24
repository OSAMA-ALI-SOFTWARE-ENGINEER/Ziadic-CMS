import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import LoginPage from '@/pages/auth/LoginPage.vue'
import { useAuthStore } from '@/stores/auth'

// Lazy load pages to reduce main bundle
const ApprovalsPage = () => import(
  /* webpackChunkName: "approvals" */ '@/pages/ApprovalsPage.vue'
)
const BlogArticlesPage = () => import(
  /* webpackChunkName: "blog-articles" */ '@/pages/BlogArticlesPage.vue'
)
const CategoriesPage = () => import(
  /* webpackChunkName: "categories" */ '@/pages/CategoriesPage.vue'
)
const LocationManagementPage = () => import(
  /* webpackChunkName: "locations" */ '@/pages/LocationManagementPage.vue'
)
const ForgotPasswordPage = () => import(
  /* webpackChunkName: "forgot-password" */ '@/pages/auth/ForgotPasswordPage.vue'
)
const ListingsPage = () => import(
  /* webpackChunkName: "listings" */ '@/pages/ListingsPage.vue'
)
const MediaPage = () => import(
  /* webpackChunkName: "media" */ '@/pages/MediaPage.vue'
)
const PaymentsPage = () => import(
  /* webpackChunkName: "payments" */ '@/pages/PaymentsPage.vue'
)
const ProfilePage = () => import(
  /* webpackChunkName: "profile" */ '@/pages/ProfilePage.vue'
)
const ResetPasswordPage = () => import(
  /* webpackChunkName: "reset-password" */ '@/pages/auth/ResetPasswordPage.vue'
)
const RolesPage = () => import(
  /* webpackChunkName: "roles" */ '@/pages/RolesPage.vue'
)
const SettingsPage = () => import(
  /* webpackChunkName: "settings" */ '@/pages/SettingsPage.vue'
)
const SignupPage = () => import(
  /* webpackChunkName: "signup" */ '@/pages/auth/SignupPage.vue'
)
const SubscriptionsPage = () => import(
  /* webpackChunkName: "subscriptions" */ '@/pages/SubscriptionsPage.vue'
)
const UsersPage = () => import(
  /* webpackChunkName: "users" */ '@/pages/UsersPage.vue'
)

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      component: AuthLayout,
      meta: {
        guest: true,
      },
      redirect: '/login',
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
            title: 'Dashboard | Kukaqka CMS',
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
          path: 'add-listing',
          redirect: { name: 'listings' },
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
          path: 'submissions',
          name: 'submissions',
          component: () => import('@/pages/SubmissionsPage.vue'),
          meta: {
            title: 'Submissions | Kukaqka CMS',
          },
        },
        {
          path: 'activity-logs',
          name: 'activity-logs',
          component: () => import('@/pages/ActivityLogsPage.vue'),
          meta: {
            title: 'Activity Logs | Kukaqka CMS',
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
          path: 'location-management',
          name: 'location-management',
          component: LocationManagementPage,
          meta: {
            title: 'Location Management | Kukaqka CMS',
          },
        },
        // Content - Hidden for now
        // {
        //   path: 'content',
        //   name: 'content',
        //   component: ContentPage,
        //   meta: {
        //     title: 'Content | Kukaqka CMS',
        //   },
        // },
        {
          path: 'blog-articles',
          name: 'blog-articles',
          component: BlogArticlesPage,
          meta: {
            title: 'Blog Articles | Kukaqka CMS',
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
          path: 'subscriptions',
          name: 'subscriptions',
          component: SubscriptionsPage,
          meta: {
            title: 'Subscriptions | Kukaqka CMS',
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
          path: 'profile',
          name: 'profile',
          component: ProfilePage,
          meta: {
            title: 'Profile Settings | Kukaqka CMS',
          },
        },
        {
          path: 'settings',
          name: 'settings',
          component: SettingsPage,
          meta: {
            title: 'System Settings | Kukaqka CMS',
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

  document.title = String(to.meta.title || 'Kukaqka CMS')
})

export default router
