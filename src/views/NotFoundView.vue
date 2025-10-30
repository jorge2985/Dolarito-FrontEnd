<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <div class="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ExclamationTriangleIcon class="w-12 h-12 text-primary-600" />
        </div>
        <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Página no encontrada</h2>
        <p class="text-gray-600 mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
      </div>

      <div class="space-y-4">
        <router-link to="/" class="btn-primary w-full">
          Volver al inicio
        </router-link>
        <button
          @click="$router.go(-1)"
          class="btn-secondary w-full"
        >
          Página anterior
        </button>
      </div>

      <!-- Quick Links -->
      <div class="mt-12">
        <h3 class="text-sm font-medium text-gray-700 mb-4">Enlaces útiles</h3>
        <div class="grid grid-cols-2 gap-4">
          <router-link
            to="/wallet"
            class="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Mi Billetera
          </router-link>
          <router-link
            to="/transactions"
            class="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Transacciones
          </router-link>
          <!-- Enviar Dinero removed -->
          <router-link
            to="/exchange"
            class="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Cambio de Moneda
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
</script>
