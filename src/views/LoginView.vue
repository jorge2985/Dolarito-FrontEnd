<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center">
            <span class="text-white font-bold text-2xl">₿</span>
          </div>
        </div>
        <h2 class="text-3xl font-bold text-gray-900">Bienvenido a Dolarito</h2>
        <p class="mt-2 text-gray-600">Inicia sesión en tu billetera virtual</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label for="userEmail" class="block text-sm font-medium text-gray-700 mb-2">
              Ingresa tu email
            </label>
            <input
              id="userEmail"
              v-model="form.userEmail"
              type="text"
              required
              class="input-field"
              placeholder="Ingresa tu email"
              :disabled="isLoading"
            />
          </div>

          <div>
            <label for="userPass" class="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div class="relative">
              <input
                id="userPass"
                v-model="form.userPass"
                :type="showPassword ? 'text' : 'password'"
                required
                class="input-field pr-10"
                placeholder="Ingresa tu contraseña"
                :disabled="isLoading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        <!-- Remember me and forgot password -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="rememberMe"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              :disabled="isLoading"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-700">
              Recordarme
            </label>
          </div>
          <router-link to="/forgot-password" class="text-sm text-primary-600 hover:text-primary-500">
            ¿Olvidaste tu contraseña?
          </router-link>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full btn-primary flex items-center justify-center py-3 text-base font-medium"
        >
          <div v-if="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>

        <!-- Register Link -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            ¿No tienes una cuenta?
            <router-link to="/register" class="text-primary-600 hover:text-primary-500 font-medium">
              Regístrate aquí
            </router-link>
          </p>
        </div>
      </form>
        
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import type { LoginForm } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const form = ref<LoginForm>({
  userName: '',
  userEmail: '',
  userPass: ''
})

const showPassword = ref(false)
const rememberMe = ref(false)

const isLoading = computed(() => authStore.isLoading)

const validateEmail = (email: string) => {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i
  return re.test(email)
}

const handleLogin = async () => {
  if (!validateEmail(form.value.userEmail)) {
    // eslint-disable-next-line no-console
    console.warn('Invalid email format')
    return
  }

  try {
    const success = await authStore.login(form.value)
    if (success) {
      router.push('/')
    }
  } catch (error) {
    console.error('Login error:', error)
  }
}
</script>
