import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import PublicLayout from '@/layouts/PublicLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AboutPage from '@/pages/AboutPage.vue'
import HomePage from '@/pages/HomePage.vue'
import ListingsPage from '@/pages/ListingsPage.vue'
import LegacyRoutePage from '@/pages/LegacyRoutePage.vue'
import LoginPage from '@/pages/auth/LoginPage.vue'
import RegisterPage from '@/pages/auth/RegisterPage.vue'
import BlogPage from '@/pages/BlogPage.vue'
import BlogDetailPage from '@/pages/BlogDetailPage.vue'

// Phase 1: Vue Migration - All remaining pages (lazy loaded)
const ContactPage = () => import('@/pages/ContactPage.vue')
const ServicesPage = () => import('@/pages/ServicesPage.vue')
const PricingPage = () => import('@/pages/PricingPage.vue')
const CitiesIndexPage = () => import('@/pages/CitiesIndexPage.vue')
const ListingsIndexPage = () => import('@/pages/ListingsIndexPage.vue')
const BlogsIndexPage = () => import('@/pages/BlogsIndexPage.vue')
const AddListingPage = () => import('@/pages/AddListingPage.vue')
const SearchPage = () => import('@/pages/SearchPage.vue')
const SubmitListingPage = () => import('@/pages/SubmitListingPage.vue')
// Detail pages still handled by legacyRoutes - will be migrated in Phase 1B+
// const ListingDetailPage = () => import('@/pages/details/ListingDetailPage.vue')
// const CityDetailPage = () => import('@/pages/details/CityDetailPage.vue')
// const TeamDetailPage = () => import('@/pages/details/TeamDetailPage.vue')
// const CategoryDetailPage = () => import('@/pages/details/CategoryDetailPage.vue')
import AdminDashboardPage from '@/pages/admin/DashboardPage.vue'
import AdminListingsPage from '@/pages/admin/ListingsPage.vue'
import AdminUsersPage from '@/pages/admin/UsersPage.vue'
import AdminActivityPage from '@/pages/admin/ActivityPage.vue'
import AdminSettingsPage from '@/pages/admin/SettingsPage.vue'
import AdminSubmissionsPage from '@/pages/admin/SubmissionsPage.vue'
import AdminMediaPage from '@/pages/admin/MediaPage.vue'
import UserDashboardPage from '@/pages/DashboardPage.vue'

const legacyRoutes = [
  {
    path: 'city-categories/:slug',
    name: 'city-category-detail',
    title: 'City Category | Zaidic',
    legacyPath: '/legacy/detail_city-categories.html',
    loadingLabel: 'Loading City Category...',
  },
  {
    path: 'cities/:slug',
    name: 'city-detail',
    title: 'City | Zaidic',
    legacyPath: '/legacy/detail_cities.html',
    loadingLabel: 'Loading City...',
  },
  {
    path: 'listings/:slug',
    name: 'listing-detail',
    title: 'Listing | Zaidic',
    legacyPath: '/legacy/detail_listings.html',
    loadingLabel: 'Loading Listing...',
  },
  {
    path: 'team/:slug',
    name: 'team-detail',
    title: 'Team | Zaidic',
    legacyPath: '/legacy/detail_team.html',
    loadingLabel: 'Loading Team Member...',
  },
  {
    path: 'contact',
    name: 'contact',
    title: 'Contact Us | Zaidic',
    legacyPath: '/legacy/template-pages/contact-us.html',
    loadingLabel: 'Loading Contact...',
  },
  {
    path: 'pricing',
    name: 'pricing',
    title: 'Pricing | Zaidic',
    legacyPath: '/legacy/template-pages/pricing.html',
    loadingLabel: 'Loading Pricing...',
  },
  {
    path: 'services',
    name: 'services',
    title: 'Services | Zaidic',
    legacyPath: '/legacy/template-pages/services.html',
    loadingLabel: 'Loading Services...',
  },
  {
    path: 'cities',
    name: 'cities',
    title: 'Cities | Zaidic',
    legacyPath: '/legacy/template-pages/cities.html',
    loadingLabel: 'Loading Cities...',
  },
  {
    path: 'add-listing',
    name: 'add-listing',
    title: 'Add Listing | Zaidic',
    legacyPath: '/legacy/template-pages/add-listing.html',
    loadingLabel: 'Loading Add Listing...',
  },
  {
    path: 'search',
    name: 'search',
    title: 'Search | Zaidic',
    legacyPath: '/legacy/search.html',
    loadingLabel: 'Loading Search...',
  },
]

function routeParam(value: unknown) {
  return Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')
}

const legacyRedirects = [
  { path: '/index.html', redirect: '/' },
  { path: '/backup/home-v1.html', redirect: '/' },
  {
    path: '/city-categories/:slug',
    redirect: (to: { params: Record<string, unknown> }) => ({
      path: '/listings',
      query: { category: routeParam(to.params.slug) },
    }),
  },
  {
    path: '/cities/:slug',
    redirect: (to: { params: Record<string, unknown> }) => ({
      path: '/listings',
      query: { city: routeParam(to.params.slug) },
    }),
  },
  { path: '/template-pages/about-us.html', redirect: '/about' },
  { path: '/template-pages/listings.html', redirect: '/listings' },
  { path: '/template-pages/contact-us.html', redirect: '/contact' },
  { path: '/template-pages/pricing.html', redirect: '/pricing' },
  { path: '/template-pages/services.html', redirect: '/services' },
  { path: '/template-pages/cities.html', redirect: '/listings' },
  { path: '/template-pages/add-listing.html', redirect: '/add-listing' },
  { path: '/search.html', redirect: '/search' },
  { path: '/detail_city-categories.html', redirect: '/listings?category=arts-and-culture' },
  { path: '/detail_cities.html', redirect: '/cities/vlore-al' },
  { path: '/detail_listings.html', redirect: '/listings/bursa-modern-art-museum' },
  { path: '/detail_team.html', redirect: '/team/alexandra-rodriguez' },
]

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    ...legacyRedirects,
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: {
        title: 'Login | Zaidic',
      },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage,
      meta: {
        title: 'Sign Up | Zaidic',
      },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: UserDashboardPage,
      meta: {
        title: 'Dashboard | Zaidic',
        requiresAuth: true,
      },
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: {
        requiresAdmin: true,
      },
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: AdminDashboardPage,
          meta: {
            title: 'Dashboard | Admin',
            requiresAdmin: true,
          },
        },
        {
          path: 'listings',
          name: 'admin-listings',
          component: AdminListingsPage,
          meta: {
            title: 'Listings | Admin',
            requiresAdmin: true,
          },
        },
        {
          path: 'users',
          name: 'admin-users',
          component: AdminUsersPage,
          meta: {
            title: 'Users | Admin',
            requiresAdmin: true,
          },
        },
        {
          path: 'activity',
          name: 'admin-activity',
          component: AdminActivityPage,
          meta: {
            title: 'Activity | Admin',
            requiresAdmin: true,
          },
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: AdminSettingsPage,
          meta: {
            title: 'Settings | Admin',
            requiresAdmin: true,
          },
        },
        {
          path: 'submissions',
          name: 'admin-submissions',
          component: AdminSubmissionsPage,
          meta: {
            title: 'Submissions | Admin',
            requiresAdmin: true,
          },
        },
        {
          path: 'media',
          name: 'admin-media',
          component: AdminMediaPage,
          meta: {
            title: 'Media | Admin',
            requiresAdmin: true,
          },
        },
      ],
    },
    {
      path: '/',
      component: PublicLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomePage,
          meta: {
            title: 'Home | Zaidic',
            legacyFullPage: true,
          },
        },
        {
          path: 'about',
          name: 'about',
          component: AboutPage,
          meta: {
            title: 'About Us | Zaidic',
            legacyFullPage: true,
          },
        },
        {
          path: 'listings',
          name: 'listings',
          component: ListingsPage,
          meta: {
            title: 'Listings | Zaidic',
          },
        },
        {
          path: 'blogs',
          name: 'blogs',
          component: BlogPage,
          meta: {
            title: 'Blog | Zaidic',
          },
        },
        {
          path: 'blogs/:slug',
          name: 'blog-detail',
          component: BlogDetailPage,
          meta: {
            title: 'Blog Post | Zaidic',
          },
        },
        {
          path: 'contact',
          name: 'contact',
          component: ContactPage,
          meta: {
            title: 'Contact Us | Zaidic',
          },
        },
        {
          path: 'services',
          name: 'services',
          component: ServicesPage,
          meta: {
            title: 'Services | Zaidic',
          },
        },
        {
          path: 'pricing',
          name: 'pricing',
          component: PricingPage,
          meta: {
            title: 'Pricing | Zaidic',
          },
        },
        {
          path: 'cities',
          name: 'cities',
          component: CitiesIndexPage,
          meta: {
            title: 'Cities | Zaidic',
          },
        },
        {
          path: 'listings-index',
          name: 'listings-index',
          component: ListingsIndexPage,
          meta: {
            title: 'Listings | Zaidic',
          },
        },
        {
          path: 'blogs-index',
          name: 'blogs-index',
          component: BlogsIndexPage,
          meta: {
            title: 'Blogs | Zaidic',
          },
        },
        {
          path: 'add-listing',
          name: 'add-listing',
          component: AddListingPage,
          meta: {
            title: 'Add Listing | Zaidic',
          },
        },
        {
          path: 'search',
          name: 'search',
          component: SearchPage,
          meta: {
            title: 'Search Results | Zaidic',
          },
        },
        {
          path: 'submit',
          name: 'submit-listing',
          component: SubmitListingPage,
          meta: {
            title: 'Submit Listing | Zaidic',
          },
        },
        ...legacyRoutes.map((route) => ({
          path: route.path,
          name: route.name,
          component: LegacyRoutePage,
          meta: {
            title: route.title,
            legacyPath: route.legacyPath,
            loadingLabel: route.loadingLabel,
            legacyFullPage: true,
          },
        })),
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  document.title = String(to.meta.title || 'Zaidic')

  const authStore = useAuthStore()
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser()
  }

  // Check authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Check admin access
  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
    if (!authStore.isAdmin) {
      return { name: 'home' }
    }
  }
})

export default router
