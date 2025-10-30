<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Retirar {{ currency }}</h2>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleWithdraw">
          <div class="space-y-6">
            <!-- Amount -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Cantidad a retirar
              </label>
              <div class="relative">
                <input
                  v-model="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  :max="getCurrentBalance()"
                  required
                  class="input-field pr-16"
                  placeholder="0.00"
                  :disabled="isLoading"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span class="text-gray-500 text-sm font-medium">{{ currency }}</span>
                </div>
              </div>
              <div class="mt-2 flex justify-between text-sm text-gray-600">
                <span>Disponible: {{ formatCurrency(getCurrentBalance(), currency) }}</span>
                <button
                  type="button"
                  @click="setMaxAmount"
                  class="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Usar todo
                </button>
              </div>
            </div>

            <!-- Withdrawal Method -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Método de retiro
              </label>
              <select
                v-model="withdrawalMethod"
                required
                class="input-field"
                :disabled="isLoading"
              >
                <option value="">Selecciona un método</option>
                <option value="bank_transfer">Transferencia bancaria</option>
                <option value="cash_pickup">Retiro en efectivo</option>
                <option value="atm">Cajero automático</option>
              </select>
            </div>

            <!-- Bank Account (if applicable) -->
            <div v-if="withdrawalMethod === 'bank_transfer'">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Alias o CBU
              </label>
              <input
                v-model="bankAccount"
                type="text"
                class="input-field"
                placeholder="Alias o CBU destino"
                :disabled="isLoading"
                required
              />
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
                placeholder="Agrega una descripción para este retiro..."
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

            <!-- Insufficient Balance Warning -->
            <div v-if="!hasSufficientBalance" class="p-4 bg-red-50 rounded-lg border border-red-200">
              <div class="flex">
                <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">Saldo insuficiente</h3>
                  <p class="mt-1 text-sm text-red-700">
                    No tienes suficiente saldo para realizar este retiro.
                  </p>
                </div>
              </div>
            </div>

            <!-- Withdrawal Preview -->
            <div v-if="amount && hasSufficientBalance" class="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 class="text-sm font-medium text-orange-900 mb-2">Resumen del retiro</h3>
              <div class="text-sm text-orange-800 space-y-1">
                <div class="flex justify-between">
                  <span>Retirar:</span>
                  <span class="font-medium">{{ formatCurrency(parseFloat(amount) || 0, currency) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Saldo actual:</span>
                  <span class="font-medium">{{ formatCurrency(getCurrentBalance(), currency) }}</span>
                </div>
                <div class="flex justify-between border-t border-orange-200 pt-1 mt-2">
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
                :disabled="isLoading || !canWithdraw"
                class="btn-danger"
              >
                <div v-if="isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {{ isLoading ? 'Procesando...' : 'Retirar' }}
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
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

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
const withdrawalMethod = ref('')
const bankAccount = ref('')
const description = ref('')

const getCurrentBalance = (): number => {
  if (props.currency === 'ARS') return authStore.user?.userPesos || 0
  if (props.currency === 'USD') return authStore.user?.userDolares || 0
  return 0
}

const getNewBalance = (): number => {
  return getCurrentBalance() - (parseFloat(amount.value) || 0)
}

const hasSufficientBalance = computed(() => {
  const withdrawAmount = parseFloat(amount.value) || 0
  return withdrawAmount <= getCurrentBalance()
})

const canWithdraw = computed(() => {
  return (
    amount.value &&
    parseFloat(amount.value) > 0 &&
    withdrawalMethod.value &&
    hasSufficientBalance.value &&
    (withdrawalMethod.value !== 'bank_transfer' || (bankAccount.value && bankAccount.value.trim().length > 5))
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

const setMaxAmount = () => {
  amount.value = getCurrentBalance().toString()
}

const handleWithdraw = async () => {
  if (!canWithdraw.value) return

  try {
    isLoading.value = true

    const withdrawAmount = parseFloat(amount.value)
    
    const transactionData : any = {
      userId: authStore.user?.userId || '',
      transaccionesPesos: props.currency === 'ARS' ? -withdrawAmount : 0,
      transaccionesDolares: props.currency === 'USD' ? -withdrawAmount : 0,
      transaccionesTipoId: 2, // Withdrawal type
      transaccionesFecha: new Date().toISOString(),
      destinoAliasOCBU: withdrawalMethod.value === 'bank_transfer' ? bankAccount.value : undefined
    }

    const success : any = await transactionsStore.createTransaction(transactionData)
    
    if (success) {
      toast.success(`Retiro de ${formatCurrency(withdrawAmount, props.currency)} realizado exitosamente`)
      emit('success')
      emit('close')
    }
  } catch (error) {
    console.error('Withdraw error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
