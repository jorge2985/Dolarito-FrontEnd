<template>
  <div class="botito-chat left">
    <div class="chat-avatar minimized" @click="toggleChat">
      <img :src="avatar" alt="Botito Avatar" />
    </div>

    <div v-if="isChatOpen" class="chat-window">
      <div class="chat-header">
        <h3>Botito el chat-bot de Dolarito</h3>
        <button @click="toggleChat">Cerrar</button>
      </div>

      <div ref="messagesContainer" class="chat-messages">
        <div v-for="(message, index) in messages" :key="index" class="message">
          <p>{{ message }}</p>
        </div>
      </div>

      <div class="chat-input">
        <input v-model="userInput" @input="onInput" @keyup.enter="sendMessage" placeholder="Escribí algo..." />
        <button @click="sendMessage">Enviar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import botitoPng from '@/assets/botito.png';
import botitoAvatar from '@/assets/botito-avatar.png';
const avatar = botitoPng || botitoAvatar;

const isChatOpen = ref(false);
const messages = ref([]);
const userInput = ref("");
const messagesContainer = ref(null);
const presented = ref(false);
const phrases = [
  "Traé tus pesitos y llevate dolaritos, ¡que no se devalúen tus sueñitos! 💭",
  "Si juntás moneditas, yo te doy verdecitos 🌱",
  "¡No guardes los pesitos en el colchoncito, que se te achican solitos! 🛏️",
  "¡Haceme casito y vas a tener tu bolsillito llenito! 🤑",
  "¡Yo te ayudo con tus dolaritos, pero vos traé la buena ondita! 🌈",
  "¡Tu billeterita va a estar más gordita con mis dolaritos! 🐷",
  "¡Guardá tus verdecitos que te van a dar tranquilitos! 💤",
  "¡Metele ganitas, que los dolaritos no se consiguen solitos! 💪",
  "¡Traé tus billetitos que yo los vuelvo fuertitos 💪💵",
  "¡Traé tus pesitos flaquitos y los volvemos dolaritos gorditos! 🐷",
  "¡Con Botito, tus pesitos pasan de humilditos a internacionalitos! 🌍",
  "¡Traé tus ahorritos chiquititos, que yo los hago crecer grandecitos! 🌱📈",
];
const phraseIndex = ref(0);
const getNextPhrase = () => {
  if (!phrases || phrases.length === 0) return '';
  const p = phrases[phraseIndex.value % phrases.length];
  phraseIndex.value = (phraseIndex.value + 1) % phrases.length;
  return p;
};


const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
  // when opening the chat, present Botito if not yet presented
  if (isChatOpen.value) {
    if (!presented.value) {
      pushBot(presentationMessage);
      presented.value = true;
    }
  } else {
    // when closing, do nothing (no auto phrases)
  }
};

const sendMessage = () => {
  if (userInput.value.trim() !== "") {
    // user message
    messages.value.push(userInput.value.trim());
    userInput.value = "";
    // Botito replies with the next phrase from the provided list (sequential)
    const reply = getNextPhrase();
    messages.value.push(reply);
    // ensure scroll
    scrollToBottom();
  }
};

// legacy random function removed; using sequential getNextPhrase() instead

// No automatic phrases: Botito only replies when the user sends a message.

function pushBot(text) {
  messages.value.push(text);
  scrollToBottom();
}

function onInput() {
  // autoscroll as user types so the last messages are visible
  scrollToBottom();
}

const presentationMessage = '¡Holaaa! Soy tu amiguito Botito, el chat-bot de Dolarito 🤖✨💸';

function scrollToBottom() {
  nextTick(() => {
    const el = messagesContainer.value;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  });
}
</script>

<style scoped>
.botito-chat {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: auto;
  z-index: 1000;
}

.chat-avatar {
  cursor: pointer;
}

.chat-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.chat-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  background: transparent;
  padding: 0;
}

.chat-window {
  width: 300px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.chat-window {
  width: 320px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  position: absolute;
  bottom: 70px; /* appear above the avatar */
  left: 0;
}

.chat-header {
  background: #f4f4f4;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ccc;
}

.chat-messages {
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
}

.message {
  margin-bottom: 10px;
}

.chat-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #ccc;
}

.chat-input input {
  flex: 1;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.chat-input button {
  margin-left: 5px;
  padding: 5px 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>