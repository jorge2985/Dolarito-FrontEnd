import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => {
        // If a token exists in localStorage, assume user is authenticated and go to /home
        const token = localStorage.getItem('token')
        if (token) return { name: 'home' }
        return { name: 'landing' }
      }
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/landing',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/wallet',
      name: 'wallet',
      component: () => import('@/views/WalletView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('@/views/TransactionsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    // '/send-money' view removed; keep a redirect to avoid 404s from old links
    {
      path: '/exchange',
      name: 'exchange',
      component: () => import('@/views/ExchangeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/send-money',
      redirect: { name: 'transactions' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth if not already done
  if (!authStore.isAuthenticated) {
    authStore.initializeAuth()
  }
  // If user is authenticated, keep them inside the banking app (home) when they try to access landing
  if ((to.name === 'landing') && authStore.isAuthenticated) {
    return next({ name: 'home' })
  }

  // If route requires auth and user is not authenticated, redirect to landing when requesting home
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    if (to.name === 'home') {
      return next({ name: 'landing' })
    }
    return next({ name: 'login' })
  }

  // Prevent logged-in users from visiting login/register
  if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    return next({ name: 'home' })
  }

  return next()
})

export default router
