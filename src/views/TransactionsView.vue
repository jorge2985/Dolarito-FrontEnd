<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Historial de Transacciones</h1>
      <p class="text-gray-600">
        Revisa todas tus transacciones y movimientos de dinero
      </p>
    </div>

    <!-- Filters -->
    <div class="card mb-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de transacción</label>
          <select
            v-model="filters.type"
            class="input-field"
          >
            <option value="">Todos los tipos</option>
            <option value="1">Ingreso de pesos</option>
            <option value="2">Retiro de pesos</option>
            <option value="3">Ingreso de dólares</option>
            <option value="4">Retiro de dólares</option>
            <option value="5">Compra de dólares</option>
            <option value="6">Venta de dólares</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
          <select
            v-model="filters.currency"
            class="input-field"
          >
            <option value="">Todas las monedas</option>
            <option value="ARS">Pesos Argentinos</option>
            <option value="USD">Dólares</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Desde</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="input-field"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="input-field"
          />
        </div>
      </div>
      <div class="mt-4 flex justify-end space-x-3">
        <button
          @click="resetFilters"
          class="btn-secondary"
        >
          Limpiar filtros
        </button>
        <button
          @click="applyFilters"
          class="btn-primary"
        >
          Aplicar filtros
        </button>
      </div>
    </div>

    <!-- Transactions List -->
    <div class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">
            Transacciones ({{ filteredTransactions.length }})
          </h2>
          <div class="flex items-center space-x-2">
            <button
              @click="refreshTransactions"
              :disabled="transactionsStore.isLoading"
              class="btn-secondary text-sm"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': transactionsStore.isLoading }" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="transactionsStore.isLoading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTransactions.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ReceiptPercentIcon class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No hay transacciones</h3>
        <p class="text-gray-600 mb-4">
          {{ hasActiveFilters ? 'No se encontraron transacciones con los filtros aplicados' : 'Tus transacciones aparecerán aquí' }}
        </p>
        <!-- No CTA for creating transactions -->
      </div>

      <!-- Transactions Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pesos (ARS)
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dólares (USD)
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="transaction in paginatedTransactions"
              :key="transaction.transaccionesId"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                    :class="transactionsStore.getTransactionTypeColor(transaction.transaccionesTipoId)"
                  >
                    <component
                      :is="getTransactionIcon(transaction.transaccionesTipoId)"
                      class="w-4 h-4"
                    />
                  </div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ transactionsStore.getTransactionTypeName(transaction.transaccionesTipoId) }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ transactionsStore.formatDate(transaction.transaccionesFecha) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span v-if="transaction.transaccionesPesos !== 0" class="font-medium">
                  {{ transactionsStore.formatAmount(transaction.transaccionesPesos, 'pesos') }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span v-if="transaction.transaccionesDolares !== 0" class="font-medium">
                  {{ transactionsStore.formatAmount(transaction.transaccionesDolares, 'dolares') }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-success-100 text-success-800">
                  Completada
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Mostrando
              <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
              a
              <span class="font-medium">{{ Math.min(currentPage * pageSize, filteredTransactions.length) }}</span>
              de
              <span class="font-medium">{{ filteredTransactions.length }}</span>
              resultados
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon class="h-5 w-5" />
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="currentPage = page"
                class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                :class="page === currentPage
                  ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'"
              >
                {{ page }}
              </button>
              <button
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon class="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTransactionsStore } from '@/stores/transactions'
import {
  ReceiptPercentIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowRightIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  CurrencyYenIcon
} from '@heroicons/vue/24/outline'
import type { Transaction } from '@/types'

const transactionsStore = useTransactionsStore()

const filters = ref({
  type: '',
  currency: '',
  startDate: '',
  endDate: ''
})

const currentPage = ref(1)
const pageSize = ref(10)

const filteredTransactions = computed(() => {
  let filtered = [...transactionsStore.transactions]

  if (filters.value.type) {
    filtered = filtered.filter(t => t.transaccionesTipoId === parseInt(filters.value.type))
  }

  if (filters.value.currency) {
    if (filters.value.currency === 'ARS') {
      filtered = filtered.filter(t => t.transaccionesPesos !== 0)
    } else if (filters.value.currency === 'USD') {
      filtered = filtered.filter(t => t.transaccionesDolares !== 0)
    }
  }

  if (filters.value.startDate) {
    filtered = filtered.filter(t => new Date(t.transaccionesFecha) >= new Date(filters.value.startDate))
  }

  if (filters.value.endDate) {
    filtered = filtered.filter(t => new Date(t.transaccionesFecha) <= new Date(filters.value.endDate))
  }

  return filtered.sort((a, b) => new Date(b.transaccionesFecha).getTime() - new Date(a.transaccionesFecha).getTime())
})

const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / pageSize.value))

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTransactions.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const hasActiveFilters = computed(() => {
  return filters.value.type || filters.value.currency || filters.value.startDate || filters.value.endDate
})

const getTransactionIcon = (typeId: number) => {
  const icons: Record<number, any> = {
    1: ArrowDownIcon, // Ingreso de pesos
    2: ArrowUpIcon,   // Retiro de pesos
    3: BanknotesIcon, // Ingreso de dólares
    4: ArrowUpIcon,   // Retiro de dólares
    5: ArrowTrendingUpIcon, // Compra de dólares
    6: ArrowTrendingUpIcon  // Venta de dólares
  }
  return icons[typeId] || ReceiptPercentIcon
}

const applyFilters = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  filters.value = {
    type: '',
    currency: '',
    startDate: '',
    endDate: ''
  }
  currentPage.value = 1
}

const refreshTransactions = async () => {
  await transactionsStore.fetchTransactions()
}

onMounted(() => {
  transactionsStore.fetchTransactions()
})
</script>
