import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import PublicLayout from '@/layouts/PublicLayout.vue'
import AboutPage from '@/pages/AboutPage.vue'
import HomePage from '@/pages/HomePage.vue'
import ListingsPage from '@/pages/ListingsPage.vue'
import LegacyRoutePage from '@/pages/LegacyRoutePage.vue'
import LoginPage from '@/pages/auth/LoginPage.vue'
import RegisterPage from '@/pages/auth/RegisterPage.vue'
import BlogPage from '@/pages/BlogPage.vue'
import BlogDetailPage from '@/pages/BlogDetailPage.vue'

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
})

export default router
