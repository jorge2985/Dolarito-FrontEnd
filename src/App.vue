<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <AppHeader v-if="showHeader" />
    
    <main class="transition-all duration-300" :class="mainClasses">
      <router-view />
    </main>
    
    <AppFooter v-if="showFooter" />
  <BotitoChat />
    
    <!-- Loading overlay -->
    <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 flex items-center space-x-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span class="text-gray-700">Cargando...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import BotitoChat from '@/components/BotitoChat.vue'

const route = useRoute()
const authStore = useAuthStore()

const showHeader = computed(() => {
  const hideHeaderRoutes = ['login', 'register']
  return !hideHeaderRoutes.includes(route.name as string)
})

const showFooter = computed(() => {
  const hideFooterRoutes = ['login', 'register']
  return !hideFooterRoutes.includes(route.name as string)
})

const isLoading = computed(() => authStore.isLoading)

const mainClasses = computed(() => {
  const paddingClasses = showHeader.value ? 'pt-16' : ''
  return `${paddingClasses} min-h-screen`
})
</script>
