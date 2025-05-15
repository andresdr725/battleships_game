<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
    <h1 class="text-3xl font-bold mb-4">Battleships - Prueba de Concepto</h1>

    <!-- Formulario de jugador -->
    <div class="mb-6 space-y-4">
      <input
        v-model="playerName"
        type="text"
        placeholder="Tu nombre"
        class="px-4 py-2 rounded text-black"
      />
      <input
        v-model="gameCode"
        type="text"
        placeholder="Código de partida"
        class="px-4 py-2 rounded text-black"
        :disabled="joined"
      />

      <div class="flex gap-4 justify-center">
        <button
          class="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          @click="createGame"
          :disabled="joined"
        >
          Crear partida
        </button>
        <button
          class="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          @click="joinGame"
          :disabled="joined"
        >
          Unirse
        </button>
      </div>

      <!-- Código generado por el host -->
      <div v-if="generatedCode" class="text-center mt-2">
        Código generado: <span class="font-mono text-yellow-400">{{ generatedCode }}</span>
      </div>
    </div>

    <!-- Mostrar tablero si ya están listos -->
    <div v-if="gameReady" class="flex gap-8">
      <!-- Tablero del jugador -->
      <div class="grid grid-cols-10 gap-1">
        <div
          v-for="(cell, index) in playerBoard"
          :key="'player-' + index"
          class="w-10 h-10 flex items-center justify-center border border-white cursor-pointer"
          :class="{
            'bg-blue-600': cell === null,
            'bg-red-600': cell === 'hit',
            'bg-gray-600': cell === 'miss'
          }"
          @click="fire(index, 'player')"
        >
          <span v-if="cell === 'hit'">🔥</span>
          <span v-else-if="cell === 'miss'">❌</span>
        </div>
      </div>

      <!-- Tablero del enemigo -->
      <div class="grid grid-cols-10 gap-1">
        <div
          v-for="(cell, index) in enemyBoard"
          :key="'enemy-' + index"
          class="w-10 h-10 flex items-center justify-center border border-white cursor-pointer"
          :class="{
            'bg-blue-600': cell === null,
            'bg-red-600': cell === 'hit',
            'bg-gray-600': cell === 'miss'
          }"
          @click="fire(index, 'enemy')"
        >
          <span v-if="cell === 'hit'">🔥</span>
          <span v-else-if="cell === 'miss'">❌</span>
        </div>
      </div>
    </div>

    <!-- Mensajes -->
    <p class="mt-4 text-center">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000')

const playerName = ref('')
const gameCode = ref('')
const generatedCode = ref('')
const joined = ref(false)
const gameReady = ref(false)
const message = ref('Ingresa tu nombre y código para comenzar')

// Tableros y barcos
const playerBoard = ref<(null | 'hit' | 'miss')[]>(Array(100).fill(null))
const enemyBoard = ref<(null | 'hit' | 'miss')[]>(Array(100).fill(null))
const enemyShips = [6, 7, 12, 45, 67, 89]

// Función para disparar
function fire(index: number, boardType: 'player' | 'enemy') {
  const boardRef = boardType === 'player' ? playerBoard : enemyBoard
  if (boardRef.value[index] !== null) return

  if (boardType === 'enemy' && enemyShips.includes(index)) {
    boardRef.value[index] = 'hit'
    message.value = '¡Impacto en el enemigo!'
  } else {
    boardRef.value[index] = 'miss'
    message.value = 'Agua...'
  }
}

// Generar código aleatorio
function generateGameCode(num: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*¿?!¡-_'
  let code = ''
  for (let i = 0; i < num; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return code
}

// Crear partida
function createGame() {
  if (!playerName.value) {
    message.value = 'Por favor, ingresa tu nombre.'
    return
  }

  const code = generateGameCode(5)
  generatedCode.value = code
  gameCode.value = code

  socket.emit('createGame', {
    playerName: playerName.value,
    gameCode: code
  })
}

// Unirse a partida
function joinGame() {
  if (!playerName.value || !gameCode.value) {
    message.value = 'Nombre y código son obligatorios.'
    return
  }

  socket.emit('joinGame', {
    playerName: playerName.value,
    gameCode: gameCode.value
  })
}

// Escuchar respuestas del servidor
onMounted(() => {
  socket.on('gameCreated', ({ gameCode }) => {
    message.value = `Partida creada con código ${gameCode}`
    joined.value = true
  })

  socket.on('gameReady', ({ message: msg }) => {
    message.value = msg
    gameReady.value = true
    joined.value = true
  })

  socket.on('error', (msg: string) => {
    message.value = msg
  })
})
</script>
