<template>
  <header class="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and Brand -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">₿</span>
            </div>
            <span class="text-xl font-bold text-gray-900">Dolarito</span>
          </router-link>
        </div>

        <!-- Desktop Navigation / User Menu (show only if authenticated) -->
        <div v-if="authStore.isAuthenticated" class="flex items-center space-x-4">
          <nav class="hidden md:flex items-center space-x-8">
            <router-link
              v-for="item in navigationItems"
              :key="item.name"
              :to="item.href"
              class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-primary-600 bg-primary-50': $route.name === item.routeName }"
            >
              {{ item.name }}
            </router-link>
          </nav>

          <!-- Balance Display -->
          <div class="hidden lg:flex items-center space-x-4 text-sm">
            <div class="text-right">
              <div class="text-gray-600">Pesos</div>
              <div class="font-semibold">{{ formatCurrency(authStore.user?.userPesos || 0, 'ARS') }}</div>
            </div>
            <div class="text-right">
              <div class="text-gray-600">Dólares</div>
              <div class="font-semibold">{{ formatCurrency(authStore.user?.userDolares || 0, 'USD') }}</div>
            </div>
          </div>

          <!-- User Dropdown -->
          <div class="relative" ref="dropdownRef">
            <button
              @click="toggleDropdown"
              class="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-2"
            >
              <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-primary-600 font-medium text-sm">
                  {{ getUserInitials() }}
                </span>
              </div>
              <span class="hidden sm:block text-sm font-medium">{{ authStore.user?.userName }}</span>
              <ChevronDownIcon class="w-4 h-4" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-show="isDropdownOpen"
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
            >
              <router-link
                to="/profile"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="closeDropdown"
              >
                Mi Perfil
              </router-link>
              <router-link
                to="/transactions"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="closeDropdown"
              >
                Transacciones
              </router-link>
              <hr class="my-1">
              <button
                @click="handleLogout"
                class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          <!-- Mobile menu button -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Bars3Icon v-if="!isMobileMenuOpen" class="w-6 h-6" />
            <XMarkIcon v-else class="w-6 h-6" />
          </button>
        </div>

        <!-- If not authenticated, show Login / Register buttons -->
        <div v-else class="flex items-center space-x-3">
          <router-link to="/login" class="btn-outline">Login</router-link>
          <router-link to="/register" class="btn-primary">Crear cuenta</router-link>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div v-show="isMobileMenuOpen" class="md:hidden border-t border-gray-200 py-4">
        <div class="space-y-2">
          <template v-if="authStore.isAuthenticated">
            <router-link
              v-for="item in navigationItems"
              :key="item.name"
              :to="item.href"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50"
              :class="{ 'text-primary-600 bg-primary-50': $route.name === item.routeName }"
              @click="closeMobileMenu"
            >
              {{ item.name }}
            </router-link>
          </template>
          <template v-else>
            <router-link to="/login" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50" @click="closeMobileMenu">Login</router-link>
            <router-link to="/register" class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50" @click="closeMobileMenu">Crear cuenta</router-link>
          </template>
        </div>

        <!-- Mobile Balance (only when authenticated) -->
        <div v-if="authStore.isAuthenticated" class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-600">Pesos</span>
            <span class="font-semibold">{{ formatCurrency(authStore.user?.userPesos || 0, 'ARS') }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Dólares</span>
            <span class="font-semibold">{{ formatCurrency(authStore.user?.userDolares || 0, 'USD') }}</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const isDropdownOpen = ref(false)
const isMobileMenuOpen = ref(false)
const dropdownRef = ref<HTMLElement>()

const navigationItems = [
  { name: 'Home Banking', href: '/', routeName: 'home' },
  { name: 'Billetera', href: '/wallet', routeName: 'wallet' },
  { name: 'Cambio', href: '/exchange', routeName: 'exchange' }
]

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const getUserInitials = (): string => {
  const name = authStore.user?.userName || 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatCurrency = (amount: number, currency: 'ARS' | 'USD'): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

const handleLogout = () => {
  authStore.logout()
  router.push('/landing')
  closeDropdown()
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
