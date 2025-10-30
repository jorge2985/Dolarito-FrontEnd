<template>
  <div class="wallet-card">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-white/90">Mi Billetera</h3>
        <p class="text-white/70 text-sm">Balance total</p>
      </div>
      <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
        <WalletIcon class="w-6 h-6 text-white" />
      </div>
    </div>

    <!-- Balance Display -->
    <div class="space-y-4">
      <div class="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-white/80 text-sm">Pesos Argentinos</span>
          <span class="text-white text-xs">ARS</span>
        </div>
        <div class="text-2xl font-bold text-white">
          {{ formatCurrency(pesos, 'ARS') }}
        </div>
      </div>

      <div class="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-white/80 text-sm">Dólares Estadounidenses</span>
          <span class="text-white text-xs">USD</span>
        </div>
        <div class="text-2xl font-bold text-white">
          {{ formatCurrency(dolares, 'USD') }}
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-6 flex space-x-3">
      <router-link
        to="/exchange"
        class="flex-1 bg-white/20 hover:bg-white/30 text-white text-center py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium"
      >
        Cambiar
      </router-link>
    </div>

    <!-- Last Update -->
    <div class="mt-4 text-center">
      <span class="text-white/60 text-xs">
        Última actualización: {{ formatLastUpdate() }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WalletIcon } from '@heroicons/vue/24/outline'

interface Props {
  pesos: number
  dolares: number
  lastUpdate?: string
}

const props = withDefaults(defineProps<Props>(), {
  lastUpdate: () => new Date().toISOString()
})

const formatCurrency = (amount: number, currency: 'ARS' | 'USD'): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatLastUpdate = (): string => {
  const date = new Date(props.lastUpdate)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) {
    return 'Hace un momento'
  } else if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} min`
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    return `Hace ${hours}h`
  } else {
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
}
</script>
