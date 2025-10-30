<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">Recuperar contraseña</h2>
        <p class="mt-2 text-gray-600">Ingresa tu correo y te enviaremos las instrucciones para recuperar tu contraseña.</p>
      </div>

      <form @submit.prevent="handleRecover" class="mt-8 space-y-6">
        <div>
          <label for="userEmail" class="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
          <input
            id="userEmail"
            v-model="email"
            type="email"
            required
            class="input-field"
            placeholder="Ingresa tu correo electrónico"
            :disabled="isLoading"
          />
        </div>

        <div>
          <button type="submit" :disabled="isLoading || !email" class="w-full btn-primary py-3">
            <div v-if="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            {{ isLoading ? 'Enviando...' : 'Enviar instrucciones' }}
          </button>
        </div>

        <div class="text-center">
          <router-link to="/login" class="text-primary-600 hover:text-primary-500 font-medium">Volver al inicio de sesión</router-link>
        </div>
      </form>

      <div v-if="message" class="mt-4 p-3 rounded bg-blue-50 text-blue-800">{{ message }}</div>
      <div v-if="error" class="mt-4 p-3 rounded bg-red-50 text-red-800">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'

const email = ref('')
const isLoading = ref(false)
const message = ref('')
const error = ref('')

const toast = useToast()

const handleRecover = async () => {
  if (!email.value) return

  try {
    isLoading.value = true
    message.value = ''
    error.value = ''

    const res: any = await api.recuperarPassword({ userEmail: email.value })
    const success = res?.success ?? true
    if (success) {
      message.value = res?.message || 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña.'
      toast.success(message.value)
    } else {
      error.value = res?.message || 'No se pudo procesar la solicitud.'
      toast.error(error.value)
    }
  } catch (err: any) {
    console.error('Recover error:', err)
    // Show backend response when available for easier debugging
    const backendMsg = err.response?.data?.message || err.response?.data || null
    error.value = backendMsg || err.message || 'Error al enviar el correo de recuperación.'
    toast.error(error.value)
  } finally {
    isLoading.value = false
  }
}
</script>

<!-- Using global Tailwind classes, no component-scoped styles needed -->
