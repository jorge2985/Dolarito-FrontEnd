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
        <h2 class="text-3xl font-bold text-gray-900">Crear cuenta en Dolarito</h2>
        <p class="mt-2 text-gray-600">Únete a la billetera virtual más confiable</p>
      </div>

      <!-- Register Form -->
      <form @submit.prevent="handleRegister" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label for="userName" class="block text-sm font-medium text-gray-700 mb-2">
              Nombre de usuario
            </label>
            <input
              id="userName"
              v-model="form.userName"
              type="text"
              required
              class="input-field"
              placeholder="Ingresa tu nombre de usuario"
              :disabled="isLoading"
            />
          </div>

          <div>
            <label for="userEmail" class="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              id="userEmail"
              v-model="form.userEmail"
              type="email"
              required
              class="input-field"
              placeholder="Ingresa tu correo electrónico"
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
                placeholder="Crea una contraseña segura"
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
            <p class="mt-1 text-xs text-gray-600">
              Mínimo 8 caracteres, incluye números y letras
            </p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              class="input-field"
              placeholder="Confirma tu contraseña"
              :disabled="isLoading"
            />
            <p v-if="form.confirmPassword && !passwordsMatch" class="mt-1 text-xs text-red-600">
              Las contraseñas no coinciden
            </p>
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="terms"
              v-model="acceptedTerms"
              type="checkbox"
              required
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              :disabled="isLoading"
            />
          </div>
          <div class="ml-3 text-sm">
            <label for="terms" class="text-gray-700">
              Acepto los 
              <a href="#" class="text-primary-600 hover:text-primary-500">términos y condiciones</a>
              y la 
              <a href="#" class="text-primary-600 hover:text-primary-500">política de privacidad</a>
            </label>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading || !canSubmit"
          class="w-full btn-primary flex items-center justify-center py-3 text-base font-medium"
        >
          <div v-if="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          {{ isLoading ? 'Creando cuenta...' : 'Crear Cuenta' }}
        </button>

        <!-- Login Link -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            ¿Ya tienes una cuenta?
            <router-link to="/login" class="text-primary-600 hover:text-primary-500 font-medium">
              Inicia sesión aquí
            </router-link>
          </p>
        </div>
      </form>

      <!-- Security Info -->
      <div class="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
        <h3 class="text-sm font-medium text-green-900 mb-2">🔒 Tu seguridad es importante</h3>
        <ul class="text-sm text-green-800 space-y-1">
          <li>• Encriptación de extremo a extremo</li>
          <li>• Verificación de dos factores</li>
          <li>• Monitoreo de transacciones 24/7</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import type { RegisterForm, AuthRequest } from '@/types'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const toast = useToast()

const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const acceptedTerms = ref(false)

const form = ref<RegisterForm>({
  userName: '',
  userEmail: '',
  userPass: '',
  confirmPassword: ''
})

const passwordsMatch = computed(() => {
  return form.value.userPass === form.value.confirmPassword
})

const canSubmit = computed(() => {
  return (
    form.value.userName &&
    form.value.userEmail &&
    form.value.userPass &&
    form.value.confirmPassword &&
    passwordsMatch.value &&
    acceptedTerms.value &&
    form.value.userPass.length >= 8
  )
})

const handleRegister = async () => {
  if (!canSubmit.value) return
  const authStore = useAuthStore()

  try {
    isLoading.value = true

    const registerPayload = {
      userName: form.value.userName,
      userEmail: form.value.userEmail,
      userPass: form.value.userPass
    }

    // Directly attempt to create the user (avoid pre-check that can silently fail)
    // Debug logs to ensure handler runs and payload is correct
    // eslint-disable-next-line no-console
    console.debug('[RegisterView] Calling createUser with payload', registerPayload)
    const res: any = await api.createUser(registerPayload)
    // eslint-disable-next-line no-console
    console.debug('[RegisterView] createUser response', res)

    // Backend may return an ApiResponse wrapper
    const success = res?.success ?? true
    if (success) {
      toast.success('¡Cuenta creada exitosamente! Iniciando sesión...')

      // Intentar iniciar sesión automático
      const loginPayload: AuthRequest = {
        userEmail: form.value.userEmail,
        userPass: form.value.userPass
      }

      const loginSuccess = await authStore.login(loginPayload)
      if (loginSuccess) {
        router.push('/')
      } else {
        router.push('/login')
      }
    } else {
      const message = res?.message || 'Error al crear la cuenta'
      toast.error(message)
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    // Try to extract backend message from various shapes
    const backendData = error?.response?.data || error?.detail || null
    const msg = backendData?.message || backendData?.error || backendData || error.message || 'Error al crear la cuenta. Intenta nuevamente.'
    toast.error(String(msg))
  } finally {
    isLoading.value = false
  }
}
</script>
