<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

       <!-- Welcome Section -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        ¡Hola, {{ authStore.user?.userName }}! 👋
      </h1>
      <p class="text-gray-600">
        Bienvenido al Home Banking de Dolarito. Aquí puedes ver tu balance y las últimas transacciones.
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon class="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Pesos Argentinos</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatCurrency(authStore.user?.userPesos || 0, 'ARS') }}
            </p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
              <BanknotesIcon class="w-5 h-5 text-success-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Dólares USD</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatCurrency(authStore.user?.userDolares || 0, 'USD') }}
            </p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
              <ArrowTrendingUpIcon class="w-5 h-5 text-warning-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total en ARS</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatCurrency(getTotalInARS(), 'ARS') }}
            </p>
            <p class="text-xs text-gray-500 mt-1">Cotización usada: {{ currentRateDisplay }}</p>
            <p class="text-sm text-gray-600 mt-1">Equivalente USD: {{ formatCurrency(getTotalInUSD(), 'USD') }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon class="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Transacciones</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ transactionsStore.totalTransactions }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Totals & Refresh -->
    <div class="mb-6 flex items-center justify-between gap-4">
      <div class="flex items-center gap-6">
        <div class="p-4 bg-white rounded shadow">
          <p class="text-sm text-gray-600">Total Pesos (movs)</p>
          <p class="text-2xl font-bold">{{ transactionsStore.formatAmount(transactionsStore.totalPesos, 'pesos') }}</p>
        </div>
        <div class="p-4 bg-white rounded shadow">
          <p class="text-sm text-gray-600">Total Dólares (movs)</p>
          <p class="text-2xl font-bold">{{ transactionsStore.formatAmount(transactionsStore.totalDolares, 'dolares') }}</p>
        </div>
      </div>
      <div>
        <button @click="transactionsStore.fetchTransactions()" :disabled="transactionsStore.isLoading" class="btn-primary">
          <span v-if="transactionsStore.isLoading">Actualizando...</span>
          <span v-else>Refrescar transacciones</span>
        </button>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Wallet Card -->
      <div class="lg:col-span-1">
        <WalletCard
          :pesos="authStore.user?.userPesos || 0"
          :dolares="authStore.user?.userDolares || 0"
          :last-update="authStore.user?.userLastUpdate"
        />
      </div>

      <!-- Recent Transactions -->
      <div class="lg:col-span-2">
        <div class="card">
          <div class="card-header">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900">Transacciones Recientes</h2>
              <router-link
                to="/transactions"
                class="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Ver todas
              </router-link>
            </div>
          </div>

          <div v-if="transactionsStore.isLoading" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>

          <div v-else-if="transactionsStore.recentTransactions.length === 0" class="text-center py-8">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ReceiptPercentIcon class="w-8 h-8 text-gray-400" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No hay transacciones</h3>
            <p class="text-gray-600 mb-4">Tus transacciones aparecerán aquí</p>
            <router-link to="/exchange" class="btn-primary">
              Consultar cotizaciones y cambiar saldo
            </router-link>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="transaction in transactionsStore.recentTransactions"
              :key="transaction.transaccionesId"
              class="transaction-card"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center"
                    :class="getTransactionIconClass(transaction.transaccionesTipoId)"
                  >
                    <component
                      :is="getTransactionIcon(transaction.transaccionesTipoId)"
                      class="w-5 h-5"
                    />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">
                      {{ transactionsStore.getTransactionTypeName(transaction.transaccionesTipoId) }}
                    </p>
                    <p class="text-sm text-gray-600">
                      {{ transactionsStore.formatDate(transaction.transaccionesFecha) }}
                    </p>
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
    </div>

    <!-- Quick Actions -->
    <div class="mt-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-6">Acciones Rápidas</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Send money feature removed from dashboard quick actions -->

        <router-link
          to="/exchange"
          class="card hover:shadow-md transition-shadow duration-200 group cursor-pointer"
        >
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center group-hover:bg-success-200 transition-colors">
              <ArrowsRightLeftIcon class="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Cambio de Moneda</h3>
              <p class="text-sm text-gray-600">Pesos ↔ Dólares</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/transactions"
          class="card hover:shadow-md transition-shadow duration-200 group cursor-pointer"
        >
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center group-hover:bg-warning-200 transition-colors">
              <ReceiptPercentIcon class="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Historial</h3>
              <p class="text-sm text-gray-600">Ver todas las transacciones</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/profile"
          class="card hover:shadow-md transition-shadow duration-200 group cursor-pointer"
        >
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <UserIcon class="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Mi Perfil</h3>
              <p class="text-sm text-gray-600">Configurar cuenta</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTransactionsStore } from '@/stores/transactions'
import WalletCard from '@/components/WalletCard.vue'
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ReceiptPercentIcon,
  PaperAirplaneIcon,
  ArrowsRightLeftIcon,
  UserIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowRightIcon,
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const transactionsStore = useTransactionsStore()

const showAuthBanner = ref(true)

import dolarApi, { getLatestUSDARS } from '@/services/dolarApi'

const currentRate = ref<number | null>(null)

const getTotalInUSD = (): number => {
  const pesos = authStore.user?.userPesos || 0
  const dolares = authStore.user?.userDolares || 0
  const rate = currentRate.value ?? 1000
  return dolares + (pesos / rate)
}

const getTotalInARS = (): number => {
  const pesos = authStore.user?.userPesos || 0
  const dolares = authStore.user?.userDolares || 0
  const rate = currentRate.value ?? 1000
  return pesos + (dolares * rate)
}

const currentRateDisplay = computed(() => {
  if (!currentRate.value) return 'n/d'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(currentRate.value)
})

// Recalculate rate on mount and when user or transactions change
const loadRate = async () => {
  try {
    currentRate.value = await getLatestUSDARS()
  } catch (e) {
    console.warn('No se pudo obtener la cotización, usando fallback', e)
    currentRate.value = 1000
  }
}

const formatCurrency = (amount: number, currency: 'ARS' | 'USD'): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

const getTransactionIcon = (typeId: number) => {
  const icons: Record<number, any> = {
    1: ArrowDownIcon, // Ingreso de pesos
    2: ArrowUpIcon,   // Retiro de pesos
    3: BanknotesIcon, // Ingreso de dólares
    4: ArrowUpIcon,   // Retiro de dólares (use up icon to indicate outflow in USD)
    5: ArrowTrendingUpIcon, // Compra de dólares
    6: ArrowTrendingUpIcon  // Venta de dólares (same icon, different label)
  }
  return icons[typeId] || ReceiptPercentIcon
}

const getTransactionIconClass = (typeId: number): string => {
  const classes: Record<number, string> = {
    1: 'bg-success-100 text-success-600', // ingreso pesos
    2: 'bg-danger-100 text-danger-600',   // retiro pesos
    3: 'bg-success-100 text-success-600', // ingreso dolares
    4: 'bg-danger-100 text-danger-600',   // retiro dolares
    5: 'bg-warning-100 text-warning-600', // compra dolares
    6: 'bg-warning-100 text-warning-600'  // venta dolares
  }
  return classes[typeId] || 'bg-gray-100 text-gray-600'
}

onMounted(() => {
  // Ensure auth initialized (reads localStorage) and then fetch transactions
  authStore.initializeAuth()
  if (authStore.user?.userId) {
    transactionsStore.fetchTransactions()
  }
  loadRate()
})

// Re-load conversion rate when user balances or transactions change
watch(() => authStore.user && [authStore.user.userPesos, authStore.user.userDolares], () => {
  loadRate()
})

watch(() => transactionsStore.totalPesos, () => {
  // totals changed — recalc exchange rate to ensure total in USD is up to date
  loadRate()
})
</script>
