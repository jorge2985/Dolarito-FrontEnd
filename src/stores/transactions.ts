import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { useAuthStore } from './auth'
import type { Transaction, TransactionCreateRequest } from '@/types'
import { useToast } from 'vue-toastification'

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([])
  const isLoading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)

  const toast = useToast()
  const authStore = useAuthStore()

  const totalTransactions = computed(() => transactions.value.length)
  
  const recentTransactions = computed(() => 
    transactions.value
      .sort((a, b) => new Date(b.transaccionesFecha).getTime() - new Date(a.transaccionesFecha).getTime())
      .slice(0, 5)
  )

  const transactionsByType = computed(() => {
    const grouped: Record<number, Transaction[]> = {}
    transactions.value.forEach(transaction => {
      if (!grouped[transaction.transaccionesTipoId]) {
        grouped[transaction.transaccionesTipoId] = []
      }
      grouped[transaction.transaccionesTipoId].push(transaction)
    })
    return grouped
  })

  const totalPesos = computed(() => transactions.value.reduce((sum, t) => sum + (t.transaccionesPesos || 0), 0))
  const totalDolares = computed(() => transactions.value.reduce((sum, t) => sum + (t.transaccionesDolares || 0), 0))

  const totalsByType = computed(() => {
    const totals: Record<number, { pesos: number; dolares: number }> = {}
    transactions.value.forEach(t => {
      if (!totals[t.transaccionesTipoId]) {
        totals[t.transaccionesTipoId] = { pesos: 0, dolares: 0 }
      }
      totals[t.transaccionesTipoId].pesos += (t.transaccionesPesos || 0)
      totals[t.transaccionesTipoId].dolares += (t.transaccionesDolares || 0)
    })
    return totals
  })

  const fetchTransactions = async (userId?: string) => {
    try {
      isLoading.value = true
      const targetUserId = userId || authStore.user?.userId
      
      if (!targetUserId) {
        throw new Error('Usuario no identificado')
      }

      // Mock data para desarrollo - eliminar cuando el backend esté funcionando
      if (targetUserId === 'mock-user-id') {
        const mockTransactions: Transaction[] = [
          {
            transaccionesId: 1,
            transaccionesUsuarioId: 'mock-user-id',
            transaccionesTipoId: 1,
            transaccionesPesos: 50000,
            transaccionesDolares: 0,
            transaccionesFecha: new Date(Date.now() - 86400000).toISOString(),
            transaccionesDescripcion: 'Depósito inicial'
          },
          {
            transaccionesId: 2,
            transaccionesUsuarioId: 'mock-user-id',
            transaccionesTipoId: 4,
            transaccionesPesos: -25000,
            transaccionesDolares: 25,
            transaccionesFecha: new Date(Date.now() - 172800000).toISOString(),
            transaccionesDescripcion: 'Cambio de moneda'
          },
          {
            transaccionesId: 3,
            transaccionesUsuarioId: 'mock-user-id',
            transaccionesTipoId: 3,
            transaccionesPesos: 0,
            transaccionesDolares: -10,
            transaccionesFecha: new Date(Date.now() - 259200000).toISOString(),
            transaccionesDescripcion: 'Transferencia'
          }
        ]
        transactions.value = mockTransactions
        return
      }

      const data = await api.getTransactionsByUser(targetUserId)
      transactions.value = Array.isArray(data) ? data : []
    } catch (error: any) {
      console.error('Error fetching transactions:', error)
      toast.error('Error al cargar las transacciones')
      transactions.value = []
    } finally {
      isLoading.value = false
    }
  }

  const createTransaction = async (transactionData: TransactionCreateRequest): Promise<boolean> => {
    try {
      isLoading.value = true
      
      // Mock para desarrollo - eliminar cuando el backend esté funcionando
      if (authStore.user?.userId === 'mock-user-id') {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Crear nueva transacción mock
        const newTransaction: Transaction = {
          transaccionesId: Date.now(), // ID único temporal
          transaccionesUsuarioId: 'mock-user-id',
          transaccionesTipoId: transactionData.transaccionesTipoId,
          transaccionesPesos: transactionData.transaccionesPesos,
          transaccionesDolares: transactionData.transaccionesDolares,
          transaccionesFecha: new Date().toISOString(),
          transaccionesDescripcion: transactionData.transaccionesDescripcion || 'Transacción mock'
        }
        
        // Agregar a la lista de transacciones
        transactions.value.unshift(newTransaction)
        
        // Update user balance in auth store
        if (authStore.user) {
          const newPesos = authStore.user.userPesos + transactionData.transaccionesPesos
          const newDolares = authStore.user.userDolares + transactionData.transaccionesDolares
          authStore.updateUserBalance(newPesos, newDolares)
        }
        
        toast.success('Transacción creada exitosamente')
        return true
      }
      
      const response : any  = await api.createTransaction(transactionData)

      // API may return { success: boolean, data } or direct object; handle common patterns
      const successFlag = response && (response.success === true || response === true || response.status === 200 || response.ok === true)
      if (successFlag) {
        toast.success('Transacción creada exitosamente')

        // Refresh transactions list
        await fetchTransactions()

        // Update user balance in auth store
        if (authStore.user) {
          const newPesos = authStore.user.userPesos + transactionData.transaccionesPesos
          const newDolares = authStore.user.userDolares + transactionData.transaccionesDolares
          authStore.updateUserBalance(newPesos, newDolares)
        }

        return true
      } else {
        // Try to show backend error message if present
        const msg = response?.message || response?.data?.message || response?.msg || 'Error al crear transacción'
        toast.error(msg)
        return false
      }
    } catch (error: any) {
      console.error('Error creating transaction:', error)
      toast.error(error.response?.data?.message || 'Error al crear transacción')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const getTransactionTypeName = (typeId: number): string => {
    const typeNames: Record<number, string> = {
        1: 'Ingreso de pesos',
        2: 'Retiro de pesos',
        3: 'Ingreso de dólares',
        4: 'Retiro de dólares',
        5: 'Compra de dólares',
        6: 'Venta de dólares'
    }
    return typeNames[typeId] || 'Tipo desconocido'
  }

  const getTransactionTypeColor = (typeId: number): string => {
    const colors: Record<number, string> = {
        1: 'text-success-600 bg-success-100', // ingreso pesos
        2: 'text-danger-600 bg-danger-100',   // retiro pesos
        3: 'text-success-600 bg-success-100', // ingreso dolares
        4: 'text-danger-600 bg-danger-100',   // retiro dolares
        5: 'text-warning-600 bg-warning-100', // compra de dolares
        6: 'text-warning-600 bg-warning-100'  // venta de dolares
    }
    return colors[typeId] || 'text-gray-600 bg-gray-100'
  }

  const formatAmount = (amount: number, currency: 'pesos' | 'dolares'): string => {
    if (currency === 'pesos') {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
      }).format(amount)
    } else {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)
    }
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return {
    transactions: computed(() => transactions.value),
    isLoading: computed(() => isLoading.value),
    totalTransactions,
    totalPesos,
    totalDolares,
    recentTransactions,
    transactionsByType,
    totalsByType,
    currentPage,
    pageSize,
    fetchTransactions,
    createTransaction,
    getTransactionTypeName,
    getTransactionTypeColor,
    formatAmount,
    formatDate
  }
})
