<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
    <header class="max-w-7xl mx-auto p-6 flex items-center justify-between">
    </header>

    <!-- Carousel promotional section -->
    <div class="max-w-6xl mx-auto px-6">
      <div class="mt-8 text-center">
        <h2 class="text-2xl font-bold mb-2">Gente exitosa confía en Dolarito</h2>
        <p class="text-gray-700 mb-6">Mira cómo clientes con grandes patrimonios mueven su dinero con facilidad. Nuestra
          plataforma ofrece conversión, seguridad y rapidez para transacciones de alto valor.</p>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="p-6 bg-white rounded shadow text-center">
            <img
              src="https://bancodecomercio.com.ar/_next/image?url=%2Fimages%2Finversiones%2Fhero%2Fhero-2.png&w=3840&q=75"
              class="w-full h-40 object-cover rounded mb-4" alt="cliente 1">
            <h4 class="font-semibold">Inversores</h4>
            <p class="text-sm text-gray-600">Convierte tus activos con tarifas competitivas.</p>
          </div>
          <div class="p-6 bg-white rounded shadow text-center">
            <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=60&auto=format&fit=crop"
              class="w-full h-40 object-cover rounded mb-4" alt="cliente 2">
            <h4 class="font-semibold">Empresarios</h4>
            <p class="text-sm text-gray-600">Gestiona pagos internacionales sin complicaciones.</p>
          </div>
          <div class="p-6 bg-white rounded shadow text-center">
            <img src="https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=800&q=60&auto=format&fit=crop"
              class="w-full h-40 object-cover rounded mb-4" alt="cliente 3" />
            <h4 class="font-semibold">Coleccionistas</h4>
            <p class="text-sm text-gray-600">Protege tu patrimonio y accede a liquidez en segundos.</p>
          </div>
        </div>
      </div>
    </div>

    <main class="max-w-5xl mx-auto p-6 space-y-12">
      <header class="max-w-7xl mx-auto p-6 flex items-center justify-between">
    </header>
      <section class="text-center">
        <h2 class="text-3xl font-bold mb-4">Qué hacemos</h2>
        <p class="text-gray-700">Facilitamos el cambio y envío de dinero entre pesos y dólares, con seguridad y
          transparencia. Consulta las cotizaciones en tiempo real y administra tu saldo desde una interfaz sencilla.</p>
      </section>

      <section class="grid md:grid-cols-3 gap-6">
        <div class="p-6 bg-white rounded shadow">
          <h3 class="font-semibold mb-2">Cambio de moneda</h3>
          <p class="text-sm text-gray-600">Convierte entre pesos y dólares con las cotizaciones más actualizadas.</p>
        </div>
        <div class="p-6 bg-white rounded shadow">
          <h3 class="font-semibold mb-2">Envíos rápidos</h3>
          <p class="text-sm text-gray-600">Envía dinero a otros usuarios de Dolarito de forma inmediata.</p>
        </div>
        <div class="p-6 bg-white rounded shadow">
          <h3 class="font-semibold mb-2">Seguridad</h3>
          <p class="text-sm text-gray-600">Tus fondos y datos protegidos con estándares de seguridad modernos.</p>
        </div>
      </section>
<header class="max-w-7xl mx-auto p-6 flex items-center justify-between">
    </header>
      <!-- Carousel promotional section -->
      <div class="max-w-6xl mx-auto px-6">
        <div class="mt-6 bg-white rounded shadow overflow-hidden">
          <div class="relative">
            <img :src="carouselImages[current].src" :alt="carouselImages[current].alt" class="w-full h-64 object-cover">
            <div class="absolute bottom-4 left-4 bg-black bg-opacity-40 text-white px-4 py-2 rounded">
              <h3 class="font-semibold text-lg">{{ carouselImages[current].title }}</h3>
              <p class="text-sm">{{ carouselImages[current].caption }}</p>
            </div>
          </div>
          <div class="flex items-center justify-center gap-2 p-3 bg-gray-50">
            <button v-for="(img, idx) in carouselImages" :key="idx" @click="current = idx"
              :class="{ 'bg-primary-600': current === idx, 'bg-gray-300': current !== idx }"
              class="w-3 h-3 rounded-full"></button>
          </div>
        </div>
      </div>
<header class="max-w-7xl mx-auto p-6 flex items-center justify-between">
    </header>
      <section class="text-center">
        <router-link to="/login" class="btn-primary px-8 py-3">Acceder a Dolarito (Profesional)</router-link>
      </section>

    <header class="max-w-7xl mx-auto p-6 flex items-center justify-between">
    </header>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Simple carousel state
const carouselImages = [
  {
    src: 'https://images.unsplash.com/photo-1503264116251-35a269479413?w=1400&q=80&auto=format&fit=crop',
    alt: 'Luxury 1',
    title: 'Viajes de lujo',
    caption: 'Clientes que convierten grandes montos para sus viajes de placer.'
  },
  {
    src: 'https://images.unsplash.com/photo-1484980972926-edee96e0960d?w=1400&q=80&auto=format&fit=crop',
    alt: 'Luxury 2',
    title: 'Colecciones exclusivas',
    caption: 'Compras en el extranjero sin fricciones.'
  },
  {
    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400&q=80&auto=format&fit=crop',
    alt: 'Luxury 3',
    title: 'Negocios globales',
    caption: 'Transferencias y conversiones para operaciones empresariales.'
  }
]

const current = ref(0)
let intervalId

onMounted(() => {
  intervalId = window.setInterval(() => {
    current.value = (current.value + 1) % carouselImages.length
  }, 4000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.btn-primary {
  background-color: #0f172a;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem
}

.btn-outline {
  border: 1px solid #0f172a;
  padding: 0.4rem 0.9rem;
  border-radius: 0.375rem
}
</style>
