<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Depositar {{ currency }}</h2>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleDeposit">
          <div class="space-y-6">
            <!-- Amount -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Cantidad a depositar
              </label>
              <div class="relative">
                <input
                  v-model="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="input-field pr-16"
                  placeholder="0.00"
                  :disabled="isLoading"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span class="text-gray-500 text-sm font-medium">{{ currency }}</span>
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Método de pago
              </label>
              <select
                v-model="paymentMethod"
                required
                class="input-field"
                :disabled="isLoading"
              >
                <option value="">Selecciona un método</option>
                <option value="bank_transfer">Transferencia bancaria</option>
                <option value="credit_card">Tarjeta de crédito</option>
                <option value="debit_card">Tarjeta de débito</option>
                <option value="cash">Efectivo</option>
              </select>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                v-model="description"
                rows="3"
                class="input-field"
                placeholder="Agrega una descripción para este depósito..."
                :disabled="isLoading"
              ></textarea>
            </div>

            <!-- Current Balance -->
            <div class="p-4 bg-gray-50 rounded-lg">
              <h3 class="text-sm font-medium text-gray-900 mb-2">Tu saldo actual</h3>
              <div class="text-lg font-semibold text-gray-900">
                {{ formatCurrency(getCurrentBalance(), currency) }}
              </div>
            </div>

            <!-- Deposit Preview -->
            <div v-if="amount" class="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 class="text-sm font-medium text-blue-900 mb-2">Resumen del depósito</h3>
              <div class="text-sm text-blue-800 space-y-1">
                <div class="flex justify-between">
                  <span>Depositar:</span>
                  <span class="font-medium">{{ formatCurrency(parseFloat(amount) || 0, currency) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Saldo actual:</span>
                  <span class="font-medium">{{ formatCurrency(getCurrentBalance(), currency) }}</span>
                </div>
                <div class="flex justify-between border-t border-blue-200 pt-1 mt-2">
                  <span>Nuevo saldo:</span>
                  <span class="font-medium">{{ formatCurrency(getNewBalance(), currency) }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                @click="$emit('close')"
                class="btn-secondary"
                :disabled="isLoading"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isLoading || !canDeposit"
                class="btn-success"
              >
                <div v-if="isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {{ isLoading ? 'Procesando...' : 'Depositar' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTransactionsStore } from '@/stores/transactions'
import { useToast } from 'vue-toastification'
import { XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  currency: 'ARS' | 'USD'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  success: []
}>()

const authStore = useAuthStore()
const transactionsStore = useTransactionsStore()
const toast = useToast()

const isLoading = ref(false)
const amount = ref('')
const paymentMethod = ref('')
const description = ref('')

const getCurrentBalance = (): number => {
  if (props.currency === 'ARS') return authStore.user?.userPesos || 0
  if (props.currency === 'USD') return authStore.user?.userDolares || 0
  return 0
}

const getNewBalance = (): number => {
  return getCurrentBalance() + (parseFloat(amount.value) || 0)
}

const canDeposit = computed(() => {
  return amount.value && parseFloat(amount.value) > 0 && paymentMethod.value
})

const formatCurrency = (amount: number, currency: 'ARS' | 'USD'): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

const handleDeposit = async () => {
  if (!canDeposit.value) return

  try {
    isLoading.value = true

    const depositAmount = parseFloat(amount.value)

    // Simulate external confirmation (fake wait)
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const transactionData : any = {
      userId: authStore.user?.userId || '',
      transaccionesPesos: props.currency === 'ARS' ? depositAmount : 0,
      transaccionesDolares: props.currency === 'USD' ? depositAmount : 0,
      transaccionesTipoId: 1, // Deposit type
      transaccionesFecha: new Date().toISOString()
    }

    const success : any = await transactionsStore.createTransaction(transactionData)

    if (success) {
      // Update local authStore balances via provided action
      const currentPesos = authStore.user?.userPesos || 0
      const currentDolares = authStore.user?.userDolares || 0
      if (props.currency === 'ARS') {
        authStore.updateUserBalance(currentPesos + depositAmount, currentDolares)
      } else if (props.currency === 'USD') {
        authStore.updateUserBalance(currentPesos, currentDolares + depositAmount)
      }

      toast.success(`Depósito de ${formatCurrency(depositAmount, props.currency)} realizado exitosamente`)
      emit('success')
      emit('close')
    }
  } catch (error) {
    console.error('Deposit error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
