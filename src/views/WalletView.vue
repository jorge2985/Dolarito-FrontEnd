<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Mi Billetera</h1>
      <p class="text-gray-600">
        Gestiona tus fondos en pesos argentinos y dólares estadounidenses
      </p>
    </div>

    <!-- Wallet Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Pesos Card -->
      <div class="card bg-gradient-to-br from-blue-500 to-blue-700 text-white">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-semibold text-white/90">Pesos Argentinos</h3>
            <p class="text-white/70 text-sm">ARS</p>
          </div>
          <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <CurrencyDollarIcon class="w-6 h-6 text-white" />
          </div>
        </div>
        <div class="text-3xl font-bold mb-4">
          {{ formatCurrency(authStore.user?.userPesos || 0, 'ARS') }}
        </div>
        <div class="flex space-x-3">
          <button
            @click="showDepositModal = true; selectedCurrency = 'ARS'"
            class="flex-1 bg-white/20 hover:bg-white/30 text-white text-center py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            Depositar
          </button>
          <button
            @click="showWithdrawModal = true; selectedCurrency = 'ARS'"
            class="flex-1 bg-white/20 hover:bg-white/30 text-white text-center py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            Retirar
          </button>
        </div>
      </div>

      <!-- Dollars Card -->
      <div class="card bg-gradient-to-br from-green-500 to-green-700 text-white">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-semibold text-white/90">Dólares Estadounidenses</h3>
            <p class="text-white/70 text-sm">USD</p>
          </div>
          <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <BanknotesIcon class="w-6 h-6 text-white" />
          </div>
        </div>
        <div class="text-3xl font-bold mb-4">
          {{ formatCurrency(authStore.user?.userDolares || 0, 'USD') }}
        </div>
        <div class="flex space-x-3">
          <button
            @click="showDepositModal = true; selectedCurrency = 'USD'"
            class="flex-1 bg-white/20 hover:bg-white/30 text-white text-center py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            Depositar
          </button>
          <button
            @click="showWithdrawModal = true; selectedCurrency = 'USD'"
            class="flex-1 bg-white/20 hover:bg-white/30 text-white text-center py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            Retirar
          </button>
        </div>
      </div>
    </div>

    <!-- Exchange Rate Info -->
    <div class="card mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Tipo de Cambio</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900">1 USD</div>
          <div class="text-gray-600">= {{ exchangeRate }} ARS</div>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900">1 ARS</div>
          <div class="text-gray-600">= {{ (1 / exchangeRate).toFixed(4) }} USD</div>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900">Total</div>
          <div class="text-gray-600">{{ formatCurrency(getTotalInUSD(), 'USD') }}</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Enviar Dinero action removed -->

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

      <button
        @click="showDepositModal = true"
        class="card hover:shadow-md transition-shadow duration-200 group cursor-pointer"
      >
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center group-hover:bg-warning-200 transition-colors">
            <ArrowDownIcon class="w-6 h-6 text-warning-600" />
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Depositar</h3>
            <p class="text-sm text-gray-600">Agregar fondos</p>
          </div>
        </div>
      </button>

      <button
        @click="showWithdrawModal = true"
        class="card hover:shadow-md transition-shadow duration-200 group cursor-pointer"
      >
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center group-hover:bg-danger-200 transition-colors">
            <ArrowUpIcon class="w-6 h-6 text-danger-600" />
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Retirar</h3>
            <p class="text-sm text-gray-600">Sacar fondos</p>
          </div>
        </div>
      </button>
    </div>

    <!-- Deposit Modal -->
    <DepositModal
      v-if="showDepositModal"
      :currency="selectedCurrency"
      @close="showDepositModal = false"
      @success="handleTransactionSuccess"
    />

    <!-- Withdraw Modal -->
    <WithdrawModal
      v-if="showWithdrawModal"
      :currency="selectedCurrency"
      @close="showWithdrawModal = false"
      @success="handleTransactionSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  PaperAirplaneIcon,
  ArrowsRightLeftIcon,
  ArrowDownIcon,
  ArrowUpIcon
} from '@heroicons/vue/24/outline'
import DepositModal from '@/components/DepositModal.vue'
import WithdrawModal from '@/components/WithdrawModal.vue'

const authStore = useAuthStore()

const showDepositModal = ref(false)
const showWithdrawModal = ref(false)
const selectedCurrency = ref<'ARS' | 'USD'>('ARS')

// Mock exchange rate (in a real app, this would come from an API)
const exchangeRate = 1000

const getTotalInUSD = (): number => {
  const pesos = authStore.user?.userPesos || 0
  const dolares = authStore.user?.userDolares || 0
  return dolares + (pesos / exchangeRate)
}

const formatCurrency = (amount: number, currency: 'ARS' | 'USD'): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

const handleTransactionSuccess = () => {
  // Refresh user data or update balance
  // In a real app, you might want to refetch user data
  console.log('Transaction successful')
}
</script>
