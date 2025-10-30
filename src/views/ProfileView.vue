<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
      <p class="text-gray-600">
        Gestiona tu información personal y configuración de cuenta
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Profile Info -->
      <div class="lg:col-span-2">
        <div class="card">
          <div class="card-header">
            <h2 class="text-xl font-semibold text-gray-900">Información Personal</h2>
          </div>

          <form @submit.prevent="handleUpdateProfile">
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de usuario
                  </label>
                  <input
                    v-model="profileForm.userName"
                    type="text"
                    required
                    class="input-field"
                    :disabled="isLoading"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    v-model="profileForm.userEmail"
                    type="email"
                    required
                    class="input-field"
                    :disabled="isLoading"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ID de usuario
                </label>
                <input
                  :value="authStore.user?.userId"
                  type="text"
                  disabled
                  class="input-field bg-gray-50 text-gray-500"
                />
                <p class="mt-1 text-sm text-gray-600">
                  Este ID es único y no se puede cambiar
                </p>
              </div>

              <div class="flex justify-end space-x-4">
                <button
                  type="button"
                  @click="resetForm"
                  class="btn-secondary"
                  :disabled="isLoading"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  :disabled="isLoading || !hasChanges"
                  class="btn-primary"
                >
                  <div v-if="isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {{ isLoading ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Change Password -->
        <div class="card mt-8">
          <div class="card-header">
            <h2 class="text-xl font-semibold text-gray-900">Cambiar Contraseña</h2>
          </div>

          <form @submit.prevent="handleChangePassword">
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña actual
                </label>
                <div class="relative">
                  <input
                    v-model="passwordForm.currentPassword"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    required
                    class="input-field pr-10"
                    :disabled="isChangingPassword"
                  />
                  <button
                    type="button"
                    @click="showCurrentPassword = !showCurrentPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <EyeIcon v-if="!showCurrentPassword" class="h-5 w-5 text-gray-400" />
                    <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nueva contraseña
                  </label>
                  <div class="relative">
                    <input
                      v-model="passwordForm.newPassword"
                      :type="showNewPassword ? 'text' : 'password'"
                      required
                      class="input-field pr-10"
                      :disabled="isChangingPassword"
                    />
                    <button
                      type="button"
                      @click="showNewPassword = !showNewPassword"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <EyeIcon v-if="!showNewPassword" class="h-5 w-5 text-gray-400" />
                      <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    v-model="passwordForm.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    required
                    class="input-field"
                    :disabled="isChangingPassword"
                  />
                  <p v-if="passwordForm.confirmPassword && !passwordsMatch" class="mt-1 text-xs text-red-600">
                    Las contraseñas no coinciden
                  </p>
                </div>
              </div>

              <div class="flex justify-end space-x-4">
                <button
                  type="button"
                  @click="resetPasswordForm"
                  class="btn-secondary"
                  :disabled="isChangingPassword"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  :disabled="isChangingPassword || !canChangePassword"
                  class="btn-primary"
                >
                  <div v-if="isChangingPassword" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {{ isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-8">
        <!-- Account Summary -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Resumen de Cuenta</h3>
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <UserIcon class="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ authStore.user?.userName }}</p>
                <p class="text-xs text-gray-600">Usuario desde {{ formatJoinDate() }}</p>
              </div>
            </div>
            
            <div class="pt-4 border-t border-gray-200">
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

        <!-- Quick Stats -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Total de transacciones</span>
              <span class="font-semibold">{{ transactionsStore.totalTransactions }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Última actividad</span>
              <span class="font-semibold text-sm">{{ formatLastActivity() }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Estado de cuenta</span>
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-success-100 text-success-800">
                Activa
              </span>
            </div>
          </div>
        </div>

        <!-- Security -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Seguridad</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Autenticación de dos factores</span>
              <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Activar
              </button>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Notificaciones</span>
              <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Configurar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTransactionsStore } from '@/stores/transactions'
import { useToast } from 'vue-toastification'
import { UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import api from '@/services/api'

const authStore = useAuthStore()
const transactionsStore = useTransactionsStore()
const toast = useToast()

const isLoading = ref(false)
const isChangingPassword = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const profileForm = ref({
  userName: '',
  userEmail: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const originalProfile = ref({
  userName: '',
  userEmail: ''
})

const hasChanges = computed(() => {
  return (
    profileForm.value.userName !== originalProfile.value.userName ||
    profileForm.value.userEmail !== originalProfile.value.userEmail
  )
})

const passwordsMatch = computed(() => {
  return passwordForm.value.newPassword === passwordForm.value.confirmPassword
})

const canChangePassword = computed(() => {
  return (
    passwordForm.value.currentPassword &&
    passwordForm.value.newPassword &&
    passwordForm.value.confirmPassword &&
    passwordsMatch.value &&
    passwordForm.value.newPassword.length >= 8
  )
})

const formatCurrency = (amount: number, currency: 'ARS' | 'USD'): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatJoinDate = (): string => {
  const date = new Date(authStore.user?.userLastUpdate || Date.now())
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long'
  })
}

const formatLastActivity = (): string => {
  const date = new Date(authStore.user?.userLastUpdate || Date.now())
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Hoy'
  if (diffInDays === 1) return 'Ayer'
  if (diffInDays < 7) return `Hace ${diffInDays} días`
  return date.toLocaleDateString('es-AR')
}

const initializeForm = () => {
  if (authStore.user) {
    profileForm.value = {
      userName: authStore.user.userName,
      userEmail: authStore.user.userEmail
    }
    originalProfile.value = { ...profileForm.value }
  }
}

const resetForm = () => {
  initializeForm()
}

const resetPasswordForm = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

const handleUpdateProfile = async () => {
  try {
    isLoading.value = true
    const currentUser = authStore.user
    if (!currentUser) {
      toast.error('No se encontró usuario autenticado')
      return
    }

    // Build a full payload based on the user stored in localStorage (authStore.user)
    const storedUser: any = authStore.user || {}

    const payload: any = {
      UserId: storedUser.userId || currentUser.userId,
      UserName: profileForm.value.userName,
      UserEmail: profileForm.value.userEmail,
      UserPass: (authStore as any).userPass || storedUser.userPass || '',
      UserEstadoId: storedUser.userEstadoId ?? 1,
      UserSeleccionable: storedUser.userSeleccionable ?? true
    }
    // If email changed, check whether the new email already exists in the system
    if (profileForm.value.userEmail !== originalProfile.value.userEmail) {
      try {
        const existing = await api.getUserByEmail(profileForm.value.userEmail)
        // api.getUserByEmail may return ApiResponse or User or throw
        let existingUser: any = null
        if (existing) {
          if (typeof existing === 'object') {
            if ('data' in existing && existing.data) existingUser = existing.data
            else existingUser = existing
          }
        }

        if (existingUser && existingUser.userId && existingUser.userId !== currentUser.userId) {
          toast.error('El correo ya está en uso por otro usuario. No se puede cambiar.')
          return
        }
      } catch (err: any) {
        // If a 404 is returned or no user found, we can proceed. Any other error should be shown.
        if (err?.response?.status && err.response.status !== 404) {
          toast.error(err?.response?.data?.message || 'Error verificando el email')
          return
        }
      }
    }

  const res = await api.updateUser(currentUser.userId, payload)
    // assume backend returns success or wrapped response
    if (res && (res.success === false || res.resultado === false)) {
      const msg = res.message || res.msg || 'Error al actualizar perfil'
      toast.error(msg)
    } else {
      toast.success('Perfil actualizado exitosamente')
  // refresh user from API and update store/localStorage
  await (authStore as any).refreshUser(profileForm.value.userEmail)
      originalProfile.value = { ...profileForm.value }
    }
  } catch (error: any) {
    console.error('Profile update error:', error)
    toast.error(error?.response?.data?.message || 'Error al actualizar el perfil')
  } finally {
    isLoading.value = false
  }
}

const handleChangePassword = async () => {
  try {
    isChangingPassword.value = true
    const currentUser = authStore.user
    if (!currentUser) {
      toast.error('No se encontró usuario autenticado')
      return
    }

    // Before attempting change, verify the provided current password matches the one saved in localStorage
    const storedPassCheck = localStorage.getItem('userPass')
    if (!storedPassCheck || storedPassCheck !== passwordForm.value.currentPassword) {
      toast.error('La contraseña actual no coincide con la guardada')
      return
    }

    // Use updateUser to change password: build full payload from stored user + password fields
    const storedUserForPass: any = authStore.user || {}
    const payloadForPass: any = {
      UserId: storedUserForPass.userId || currentUser.userId,
      UserName: storedUserForPass.userName || currentUser.userName,
      UserEmail: storedUserForPass.userEmail || currentUser.userEmail,
      // ensure we use the supplied new password
      UserPass: passwordForm.value.newPassword,
      UserEstadoId: storedUserForPass.userEstadoId ?? 1,
      UserSeleccionable: storedUserForPass.userSeleccionable ?? true,
      // include current password for backend validation if required
      CurrentPassword: passwordForm.value.currentPassword
    }

    const res = await api.updateUser(currentUser.userId, payloadForPass)
    if (res && (res.success === false || res.resultado === false)) {
      const msg = res.message || res.msg || 'Error al cambiar la contraseña'
      toast.error(msg)
    } else {
      toast.success('Contraseña cambiada exitosamente')
      resetPasswordForm()
      // update stored password so future profile updates can include it
      try {
        ;(authStore as any).setUserPass(passwordForm.value.newPassword)
      } catch (e) {}
      // refresh user data in case backend updated last update
      await (authStore as any).refreshUser()
    }
  } catch (error: any) {
    console.error('Password change error:', error)
    toast.error(error?.response?.data?.message || 'Error al cambiar la contraseña')
  } finally {
    isChangingPassword.value = false
  }
}

onMounted(() => {
  initializeForm()
  transactionsStore.fetchTransactions()
})
</script>
