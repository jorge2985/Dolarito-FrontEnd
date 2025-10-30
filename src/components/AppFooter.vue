<template>
  <footer class="bg-white border-t border-gray-200 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand Section -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center space-x-2 mb-4">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">₿</span>
            </div>
            <span class="text-xl font-bold text-gray-900">Dolarito</span>
          </div>
          <p class="text-gray-600 text-sm max-w-md">
            Tu billetera virtual segura para manejar pesos argentinos y dólares estadounidenses. 
            Transfiere, cambia y gestiona tu dinero de forma fácil y rápida.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Enlaces Rápidos</h3>
          <ul class="space-y-2">
            <li>
              <router-link to="/wallet" class="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                Mi Billetera
              </router-link>
            </li>
            <li>
              <router-link to="/transactions" class="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                Transacciones
              </router-link>
            </li>
            <!-- Enviar Dinero removed -->
            <li>
              <router-link to="/exchange" class="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                Cambio de Moneda
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Soporte</h3>
          <ul class="space-y-2">
            <li>
              <a href="#" class="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                Centro de Ayuda
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                Contacto
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                Términos y Condiciones
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                Política de Privacidad
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="border-t border-gray-200 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
        <div class="text-sm text-gray-600">
          © {{ currentYear }} Dolarito. Todos los derechos reservados.
        </div>
        <div class="flex items-center space-x-4 mt-4 sm:mt-0">
          <span class="text-sm text-gray-600">Versión 1.0.0</span>
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-success-500 rounded-full"></div>
            <span class="text-sm text-success-600">Sistema Operativo</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>