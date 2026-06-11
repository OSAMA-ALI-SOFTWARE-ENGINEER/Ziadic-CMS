import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AdminLoginPage from '@/pages/auth/AdminLoginPage.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import ContentLibraryPage from '@/pages/content/ContentLibraryPage.vue'
import PageContentEditorPage from '@/pages/content/PageContentEditorPage.vue'
import BlogWorkflowPage from '@/pages/content/BlogWorkflowPage.vue'

const routes = [
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLoginPage,
    meta: { public: true },
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: DashboardPage,
      },
      {
        path: 'content/library',
        name: 'ContentLibrary',
        component: ContentLibraryPage,
      },
      {
        path: 'content/pages/:slug',
        name: 'PageEditor',
        component: PageContentEditorPage,
      },
      {
        path: 'blog-workflow',
        name: 'BlogWorkflow',
        component: BlogWorkflowPage,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const isPublic = to.matched.some((record) => record.meta.public)

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/admin/login')
  } else if (isPublic && authStore.isAuthenticated) {
    next('/admin')
  } else {
    next()
  }
})

export default router
