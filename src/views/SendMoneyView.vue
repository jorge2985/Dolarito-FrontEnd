<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Enviar Dinero</h1>
      <p class="text-gray-600">
        Transfiere dinero a otro usuario de Dolarito de forma rápida y segura
      </p>
    </div>

    <!-- Form -->
    <div class="card">
      <form @submit.prevent="handleSubmit">
        <!-- Recipient -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Destinatario
          </label>
          <div class="relative">
            <input
              v-model="form.recipientEmail"
              type="email"
              required
              class="input-field pr-10"
              placeholder="Ingresa el email del destinatario"
              :disabled="isLoading"
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <AtSymbolIcon class="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <p class="mt-1 text-sm text-gray-600">
            El destinatario debe tener una cuenta en Dolarito
          </p>
        </div>

        <!-- Amount -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Cantidad a enviar
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="relative">
                <input
                  v-model="form.pesosAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  class="input-field pr-16"
                  placeholder="0.00"
                  :disabled="isLoading"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span class="text-gray-500 text-sm font-medium">ARS</span>
                </div>
              </div>
            </div>
            <div>
              <div class="relative">
                <input
                  v-model="form.dollarsAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  class="input-field pr-16"
                  placeholder="0.00"
                  :disabled="isLoading"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span class="text-gray-500 text-sm font-medium">USD</span>
                </div>
              </div>
            </div>
          </div>
          <p class="mt-1 text-sm text-gray-600">
            Puedes enviar en pesos argentinos, dólares, o ambos
          </p>
        </div>

        <!-- Exchange Rate Info -->
  <div v-if="parseFloat(form.pesosAmount) > 0 || parseFloat(form.dollarsAmount) > 0" class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 class="text-sm font-medium text-blue-900 mb-2">Información de conversión</h3>
          <div class="text-sm text-blue-800 space-y-1">
            <div v-if="parseFloat(form.pesosAmount) > 0">
              <strong>{{ formatCurrency(parseFloat(form.pesosAmount) || 0, 'ARS') }}</strong>
              ≈ {{ formatCurrency((parseFloat(form.pesosAmount) || 0) / exchangeRate, 'USD') }}
            </div>
            <div v-if="parseFloat(form.dollarsAmount) > 0">
              <strong>{{ formatCurrency(parseFloat(form.dollarsAmount) || 0, 'USD') }}</strong>
              ≈ {{ formatCurrency((parseFloat(form.dollarsAmount) || 0) * exchangeRate, 'ARS') }}
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Descripción (opcional)
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            class="input-field"
            placeholder="Agrega una descripción para esta transferencia..."
            :disabled="isLoading"
          ></textarea>
        </div>

        <!-- Balance Check -->
        <div v-if="!hasSufficientBalance" class="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <div class="flex">
            <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Saldo insuficiente</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>No tienes suficiente saldo para realizar esta transferencia:</p>
                <ul class="list-disc list-inside mt-1">
                  <li v-if="pesosNeeded > 0">
                    Necesitas {{ formatCurrency(pesosNeeded, 'ARS') }} adicionales en pesos
                  </li>
                  <li v-if="dollarsNeeded > 0">
                    Necesitas {{ formatCurrency(dollarsNeeded, 'USD') }} adicionales en dólares
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Balance -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-sm font-medium text-gray-900 mb-2">Tu saldo actual</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Pesos:</span>
              <span class="font-medium ml-2">{{ formatCurrency(authStore.user?.userPesos || 0, 'ARS') }}</span>
            </div>
            <div>
              <span class="text-gray-600">Dólares:</span>
              <span class="font-medium ml-2">{{ formatCurrency(authStore.user?.userDolares || 0, 'USD') }}</span>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end space-x-4">
          <router-link to="/" class="btn-secondary">
            Cancelar
          </router-link>
          <button
            type="submit"
            :disabled="isLoading || !hasSufficientBalance || !canSubmit"
            class="btn-primary"
          >
            <div v-if="isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {{ isLoading ? 'Enviando...' : 'Enviar Dinero' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Recent Transfers -->
    <div v-if="transactionsStore.recentTransactions.length > 0" class="mt-8">
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Transferencias recientes</h3>
        <div class="space-y-3">
          <div
            v-for="transaction in transactionsStore.recentTransactions.slice(0, 3)"
            :key="transaction.transaccionesId"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <ArrowRightIcon class="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Transferencia</p>
                <p class="text-xs text-gray-600">{{ transactionsStore.formatDate(transaction.transaccionesFecha) }}</p>
              </div>
            </div>
            <div class="text-right">
              <div v-if="transaction.transaccionesPesos !== 0" class="text-sm font-medium text-gray-900">
                {{ transactionsStore.formatAmount(transaction.transaccionesPesos, 'pesos') }}
              </div>
              <div v-if="transaction.transaccionesDolares !== 0" class="text-sm font-medium text-gray-900">
                {{ transactionsStore.formatAmount(transaction.transaccionesDolares, 'dolares') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTransactionsStore } from '@/stores/transactions'
import { useToast } from 'vue-toastification'
import {
  AtSymbolIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/vue/24/outline'
import dolarApi from '@/services/dolarApi'

const router = useRouter()
const authStore = useAuthStore()
const transactionsStore = useTransactionsStore()
const toast = useToast()

const isLoading = ref(false)

const form = ref({
  recipientEmail: '',
  pesosAmount: '',
  dollarsAmount: '',
  description: ''
})

const exchangeRate = ref(0)
const availableRates = ref<Array<{ nombre: string; compra: number; venta: number }>>([])
const selectedRate = ref('auto')

const refreshExchangeRate = async () => {
  try {
    const rates = await dolarApi.getAllRates()
    availableRates.value = rates.filter(r => !/tarjeta/i.test(r.nombre))
    const rate = await dolarApi.getConversionRate()
    exchangeRate.value = rate || exchangeRate.value
  } catch (e) {
    console.error('Error fetching exchange rate:', e)
  }
}

onMounted(() => {
  refreshExchangeRate()
})

// watch selection
watch(selectedRate, async (val: string) => {
  if (val === 'auto') {
    const rate = await dolarApi.getConversionRate()
    exchangeRate.value = rate || exchangeRate.value
  } else {
    const picked = availableRates.value.find(r => r.nombre.toLowerCase() === val.toLowerCase())
    if (picked) exchangeRate.value = (picked.compra + picked.venta) / 2
  }
})

// persist selection
watch(selectedRate, (val) => {
  try { localStorage.setItem('selectedRate', val) } catch (e) {}
})

onMounted(() => {
  const saved = localStorage.getItem('selectedRate')
  if (saved) selectedRate.value = saved
})

const pesosNeeded = computed(() => {
  const required = parseFloat(form.value.pesosAmount) || 0
  const available = authStore.user?.userPesos || 0
  return Math.max(0, required - available)
})

const dollarsNeeded = computed(() => {
  const required = parseFloat(form.value.dollarsAmount) || 0
  const available = authStore.user?.userDolares || 0
  return Math.max(0, required - available)
})

const hasSufficientBalance = computed(() => {
  return pesosNeeded.value === 0 && dollarsNeeded.value === 0
})

const canSubmit = computed(() => {
  return form.value.recipientEmail && (parseFloat(form.value.pesosAmount) > 0 || parseFloat(form.value.dollarsAmount) > 0)
})

const formatCurrency = (amount: number, currency: 'ARS' | 'USD'): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

const handleSubmit = async () => {
  if (!hasSufficientBalance.value || !canSubmit.value) return

  try {
    isLoading.value = true

    const transactionData = {
      transaccionesUsuarioId: authStore.user?.userId || '',
      transaccionesPesos: parseFloat(form.value.pesosAmount) || 0,
      transaccionesDolares: parseFloat(form.value.dollarsAmount) || 0,
      transaccionesTipoId: 3, // Transfer type
      transaccionesFecha: new Date().toISOString()
    }

    const success = await transactionsStore.createTransaction(transactionData)
    
    if (success) {
      toast.success('Transferencia enviada exitosamente')
      router.push('/transactions')
    }
  } catch (error) {
    console.error('Transfer error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
