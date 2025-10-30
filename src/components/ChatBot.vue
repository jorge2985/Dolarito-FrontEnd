<template>
  <div class="chatbot fixed bottom-6 right-6 w-80 bg-white shadow-lg rounded-xl overflow-hidden z-50">
    <div class="header bg-primary-600 text-white px-4 py-3 flex items-center justify-between">
      <div class="font-semibold">Dolarito Bot</div>
      <button @click="toggleOpen" class="text-white opacity-90 hover:opacity-100">{{ open ? '−' : '+' }}</button>
    </div>

    <div v-show="open" class="body h-64 flex flex-col">
      <div class="messages flex-1 p-3 overflow-auto space-y-2" ref="messagesRef">
        <div v-for="(m, idx) in messages" :key="idx" :class="['flex', m.from === 'user' ? 'justify-end' : 'justify-start']">
          <div :class="['px-3 py-2 rounded-lg max-w-[80%]', m.from === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800']">
            <div v-if="m.from === 'bot'" v-html="m.text"></div>
            <div v-else>{{ m.text }}</div>
          </div>
        </div>
      </div>

      <form @submit.prevent="sendMessage" class="p-3 border-t border-gray-100">
        <div class="flex items-center gap-2">
          <input v-model="input" type="text" placeholder="Escribí tu consulta..." class="flex-1 input-field" />
          <button type="submit" class="btn-primary px-3 py-2">Enviar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const STORAGE_KEY = 'dolarito_chat_history_v1'

const open = ref(false)
const input = ref('')
const messages = ref<Array<{ from: 'user' | 'bot'; text: string }>>([])
const messagesRef = ref<HTMLElement | null>(null)

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) messages.value = JSON.parse(saved)
  } catch (e) {}
})

watch(messages, (v) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
  } catch (e) {}
})

function toggleOpen() {
  open.value = !open.value
  // scroll to bottom when opened
  setTimeout(() => scrollToBottom(), 100)
}

function scrollToBottom() {
  if (!messagesRef.value) return
  messagesRef.value.scrollTop = messagesRef.value.scrollHeight
}

function sendMessage() {
  const text = input.value && input.value.trim()
  if (!text) return
  messages.value.push({ from: 'user', text })
  input.value = ''
  scrollToBottom()

  // Try calling backend proxy (Hugging Face). Fallback to local rule-based responder on error.
  setTimeout(async () => {
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      })
      if (resp.ok) {
        const data = await resp.json()
        const botReply = data?.reply || generateReply(text)
        messages.value.push({ from: 'bot', text: botReply })
      } else {
        // fallback
        const botReply = generateReply(text)
        messages.value.push({ from: 'bot', text: botReply })
      }
    } catch (e) {
      const botReply = generateReply(text)
      messages.value.push({ from: 'bot', text: botReply })
    }
    scrollToBottom()
  }, 300)
}

function generateReply(text: string) {
  const t = text.toLowerCase()
  if (t.includes('hola') || t.includes('buenas')) return '¡Hola! ¿En qué puedo ayudarte hoy?'
  if (t.includes('dolar') && t.includes('precio')) return 'La cotización actual la podés ver en la sección de Cambio. ¿Querés que te la muestre?' 
  if (t.includes('enviar') && t.includes('dinero')) return 'Para transferir dinero, andá a Transacciones > Nueva transferencia (si tu cuenta lo permite).'
  if (t.includes('registro') || t.includes('crear') || t.includes('cuenta')) return 'Podés crear una cuenta desde la pantalla de registro. ¿Querés que te redirija?' 
  if (t.includes('ayuda') || t.includes('soporte')) return 'Podés contactarnos en soporte@dolarito.local o usar el formulario de contacto.'
  return 'Lo siento, no entendí eso. Intentá con palabras como "saldo", "dólar" o "transferir".'
}
</script>

<style scoped>
.chatbot { width: 18rem; }
.header { height: 3rem; }
.messages { background: #fff; }
.input-field { border: 1px solid #e5e7eb; padding: .5rem; border-radius: .5rem }
.btn-primary { background-color: #2563eb; color: white; border-radius: .5rem }
</style>