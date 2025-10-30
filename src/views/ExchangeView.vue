<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Cambio de Moneda</h1>
      <p class="text-gray-600">
        Convierte entre pesos argentinos y dólares estadounidenses al tipo de cambio actual
      </p>
    </div>

    <!-- Exchange Rate Info -->
    <div class="card mb-8">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Tipo de Cambio Actual</h3>
        <button
          @click="refreshExchangeRate"
          :disabled="isLoadingRate"
          class="btn-secondary text-sm"
        >
          <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': isLoadingRate }" />
          Actualizar
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <div class="text-2xl font-bold text-blue-900">1 USD</div>
          <div class="text-blue-700">= {{ exchangeRate }} ARS</div>
        </div>
          <div class="p-4 bg-green-50 rounded-lg">
            <label class="block text-sm font-medium text-gray-700 mb-2">Fuente de cotización</label>
            <select v-model="selectedRate" class="input-field">
              <option value="auto">Automático</option>
              <option v-for="r in availableRates" :key="r.nombre" :value="r.nombre">{{ r.nombre }} ({{ ((r.compra + r.venta)/2).toFixed(2) }})</option>
            </select>
          </div>
        <div class="text-center p-4 bg-green-50 rounded-lg">
          <div class="text-2xl font-bold text-green-900">1 ARS</div>
          <div class="text-green-700">= {{ (1 / exchangeRate).toFixed(4) }} USD</div>
        </div>
      </div>
    </div>

    <!-- Exchange Form -->
    <div class="card">
      <form @submit.prevent="handleExchange">
        <!-- From Currency -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Convertir desde
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <select
                v-model="form.fromCurrency"
                class="input-field"
                @change="clearAmounts"
              >
                <option value="ARS">Pesos Argentinos (ARS)</option>
                <option value="USD">Dólares Estadounidenses (USD)</option>
              </select>
            </div>
            <div>
              <div class="relative">
                <input
                  v-model="form.fromAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  :max="getMaxAmount(form.fromCurrency)"
                  class="input-field pr-16"
                  placeholder="0.00"
                  @input="calculateToAmount"
                  :disabled="isLoading"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span class="text-gray-500 text-sm font-medium">{{ form.fromCurrency }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-2 flex justify-between text-sm text-gray-600">
            <span>Disponible: {{ formatCurrency(getAvailableAmount(form.fromCurrency), form.fromCurrency as "ARS" | "USD") }}</span>
            <button
              type="button"
              @click="setMaxAmount"
              class="text-primary-600 hover:text-primary-700 font-medium"
            >
              Usar todo
            </button>
          </div>
        </div>

        <!-- Exchange Arrow -->
        <div class="flex justify-center mb-6">
          <button
            type="button"
            @click="swapCurrencies"
            class="w-12 h-12 bg-primary-100 hover:bg-primary-200 rounded-full flex items-center justify-center transition-colors"
          >
            <ArrowsRightLeftIcon class="w-6 h-6 text-primary-600" />
          </button>
        </div>

        <!-- To Currency -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Convertir a
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <select
                v-model="form.toCurrency"
                class="input-field"
                @change="clearAmounts"
              >
                <option value="USD">Dólares Estadounidenses (USD)</option>
                <option value="ARS">Pesos Argentinos (ARS)</option>
              </select>
            </div>
            <div>
              <div class="relative">
                <input
                  v-model="form.toAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  class="input-field pr-16"
                  placeholder="0.00"
                  @input="calculateFromAmount"
                  :disabled="isLoading"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span class="text-gray-500 text-sm font-medium">{{ form.toCurrency }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Exchange Preview -->
        <div v-if="form.fromAmount && form.toAmount" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 class="text-sm font-medium text-gray-900 mb-2">Resumen del cambio</h4>
          <div class="text-sm text-gray-700 space-y-1">
            <div class="flex justify-between">
              <span>Convertir:</span>
              <span class="font-medium">{{ formatCurrency(parseFloat(form.fromAmount), form.fromCurrency as "ARS" | "USD") }}</span>
            </div>
            <div class="flex justify-between">
              <span>Recibir:</span>
              <span class="font-medium">{{ formatCurrency(parseFloat(form.toAmount), form.toCurrency as "ARS" | "USD") }}</span>
            </div>
            <div class="flex justify-between border-t border-gray-200 pt-1 mt-2">
              <span>Tipo de cambio:</span>
              <span class="font-medium">{{ getExchangeRateText() }}</span>
            </div>
          </div>
        </div>

        <!-- Current Balance -->
        <div class="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 class="text-sm font-medium text-blue-900 mb-2">Tu saldo actual</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-blue-700">Pesos:</span>
              <span class="font-medium ml-2 text-blue-900">{{ formatCurrency(authStore.user?.userPesos || 0, 'ARS') }}</span>
            </div>
            <div>
              <span class="text-blue-700">Dólares:</span>
              <span class="font-medium ml-2 text-blue-900">{{ formatCurrency(authStore.user?.userDolares || 0, 'USD') }}</span>
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
            :disabled="isLoading || !canExchange"
            class="btn-primary"
          >
            <div v-if="isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {{ isLoading ? 'Procesando...' : 'Realizar Cambio' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Exchange History -->
    <div v-if="exchangeTransactions.length > 0" class="mt-8">
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Historial de cambios</h3>
        <div class="space-y-3">
          <div
            v-for="transaction in exchangeTransactions.slice(0, 5)"
            :key="transaction.transaccionesId"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center">
                <ArrowsRightLeftIcon class="w-4 h-4 text-warning-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Cambio de moneda</p>
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
  ArrowsRightLeftIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'
import dolarApi, { getLatestUSDARS } from '@/services/dolarApi'

const router = useRouter()
const authStore = useAuthStore()
const transactionsStore = useTransactionsStore()
const toast = useToast()

const isLoading = ref(false)
const isLoadingRate = ref(false)

const form = ref({
  fromCurrency: 'ARS',
  toCurrency: 'USD',
  fromAmount: '',
  toAmount: ''
})

// Exchange rate fetched from dolarapi
const exchangeRate = ref(0)
const availableRates = ref<Array<{ nombre: string; compra: number; venta: number }>>([])
const selectedRate = ref('auto') // 'auto' uses dolarApi.getConversionRate()

const exchangeTransactions = computed(() => {
  return transactionsStore.transactions.filter(t => t.transaccionesTipoId === 4)
})

const getAvailableAmount = (currency: string): number => {
  if (currency === 'ARS') return authStore.user?.userPesos || 0
  if (currency === 'USD') return authStore.user?.userDolares || 0
  return 0
}

const getMaxAmount = (currency: string): number => {
  return getAvailableAmount(currency)
}

const canExchange = computed(() => {
  const fromAmount = parseFloat(form.value.fromAmount) || 0
  return fromAmount > 0 && fromAmount <= getMaxAmount(form.value.fromCurrency)
})

const formatCurrency = (amount: number, currency: 'ARS' | 'USD'): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

const calculateToAmount = () => {
  const fromAmount = parseFloat(form.value.fromAmount) || 0
  if (fromAmount === 0) {
    form.value.toAmount = ''
    return
  }

  if (form.value.fromCurrency === 'ARS' && form.value.toCurrency === 'USD') {
    form.value.toAmount = (fromAmount / exchangeRate.value).toFixed(2)
  } else if (form.value.fromCurrency === 'USD' && form.value.toCurrency === 'ARS') {
    form.value.toAmount = (fromAmount * exchangeRate.value).toFixed(2)
  }
}

const calculateFromAmount = () => {
  const toAmount = parseFloat(form.value.toAmount) || 0
  if (toAmount === 0) {
    form.value.fromAmount = ''
    return
  }

  if (form.value.fromCurrency === 'ARS' && form.value.toCurrency === 'USD') {
    form.value.fromAmount = (toAmount * exchangeRate.value).toFixed(2)
  } else if (form.value.fromCurrency === 'USD' && form.value.toCurrency === 'ARS') {
    form.value.fromAmount = (toAmount / exchangeRate.value).toFixed(2)
  }
}

const swapCurrencies = () => {
  const temp = form.value.fromCurrency
  form.value.fromCurrency = form.value.toCurrency
  form.value.toCurrency = temp
  clearAmounts()
}

const clearAmounts = () => {
  form.value.fromAmount = ''
  form.value.toAmount = ''
}

const setMaxAmount = () => {
  const maxAmount = getMaxAmount(form.value.fromCurrency)
  form.value.fromAmount = maxAmount.toString()
  calculateToAmount()
}

const getExchangeRateText = (): string => {
  if (form.value.fromCurrency === 'ARS' && form.value.toCurrency === 'USD') {
    return `1 ARS = ${(1 / exchangeRate.value).toFixed(4)} USD`
  } else if (form.value.fromCurrency === 'USD' && form.value.toCurrency === 'ARS') {
    return `1 USD = ${exchangeRate.value} ARS`
  }
  return ''
}

const refreshExchangeRate = async () => {
  isLoadingRate.value = true
  try {
    // refresh list and pick rate
    const rates = await dolarApi.getAllRates()
    // filter out tarjeta
    availableRates.value = rates.filter(r => !/tarjeta/i.test(r.nombre))

    if (selectedRate.value === 'auto') {
      const rate = await getLatestUSDARS()
      exchangeRate.value = rate || exchangeRate.value
    } else {
      const picked = availableRates.value.find(r => r.nombre.toLowerCase() === selectedRate.value.toLowerCase())
      if (picked) exchangeRate.value = (picked.compra + picked.venta) / 2
      else {
        const rate = await getLatestUSDARS()
        exchangeRate.value = rate || exchangeRate.value
      }
    }
  } catch (e) {
    console.error('Error fetching exchange rate:', e)
  } finally {
    isLoadingRate.value = false
  }
}

onMounted(() => {
  refreshExchangeRate()
})

// When user changes selectedRate, update exchangeRate accordingly
watch(selectedRate, async (val) => {
  if (val === 'auto') {
    const rate = await getLatestUSDARS()
    exchangeRate.value = rate || exchangeRate.value
  } else {
    const picked = availableRates.value.find(r => r.nombre.toLowerCase() === val.toLowerCase())
    if (picked) exchangeRate.value = (picked.compra + picked.venta) / 2
  }
})

// Persist selection to localStorage
watch(selectedRate, (val) => {
  try {
    localStorage.setItem('selectedRate', val)
  } catch (e) {}
})

// Load persisted selection on mount
onMounted(() => {
  const saved = localStorage.getItem('selectedRate')
  if (saved) selectedRate.value = saved
})

const handleExchange = async () => {
  if (!canExchange.value) return

  try {
    isLoading.value = true

    const fromAmount = parseFloat(form.value.fromAmount)
    const toAmount = parseFloat(form.value.toAmount)

    // Create exchange transaction
    // Build transaction depending on direction
    let transactionData: any = {
      transaccionesUsuarioId: authStore.user?.userId || '',
      transaccionesPesos: 0,
      transaccionesDolares: 0,
      transaccionesTipoId: 4,
      transaccionesFecha: new Date().toISOString(),
      transaccionesDescripcion: `Cambio ${form.value.fromAmount} ${form.value.fromCurrency} → ${form.value.toAmount} ${form.value.toCurrency}`
    }

    if (form.value.fromCurrency === 'ARS' && form.value.toCurrency === 'USD') {
      // Compra de dólares: user gives pesos (negative), receives dollars (positive)
      transactionData.transaccionesPesos = -fromAmount
      transactionData.transaccionesDolares = toAmount
      transactionData.transaccionesTipoId = 5 // Compra de dólares
    } else if (form.value.fromCurrency === 'USD' && form.value.toCurrency === 'ARS') {
      // Venta de dólares: user gives dollars (negative), receives pesos (positive)
      transactionData.transaccionesDolares = -fromAmount
      transactionData.transaccionesPesos = toAmount
      transactionData.transaccionesTipoId = 6 // Venta de dólares
    }

    const success = await transactionsStore.createTransaction(transactionData)
    
    if (success) {
      toast.success('Cambio de moneda realizado exitosamente')
      clearAmounts()
      router.push('/transactions')
    }
  } catch (error) {
    console.error('Exchange error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
