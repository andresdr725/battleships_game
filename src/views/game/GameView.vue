<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white"
  >
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

      <div v-if="generatedCode" class="text-center mt-2">
        Código generado:
        <span class="font-mono text-yellow-400">{{ generatedCode }}</span>
      </div>
    </div>

    <!-- Mostrar tableros si el juego está listo -->
    <div v-if="gameReady" class="flex gap-8">
      <div class="grid grid-cols-10 gap-1">
        <div
          v-for="(cell, index) in playerBoard"
          :key="'player-' + index"
          class="w-10 h-10 flex items-center justify-center border border-white cursor-pointer"
          :class="{
            'bg-blue-600': cell === null,
            'bg-red-600': cell === 'hit',
            'bg-gray-600': cell === 'miss',
          }"
          @click="fire(index, 'player')"
        >
          <span v-if="cell === 'hit'">🔥</span>
          <span v-else-if="cell === 'miss'">❌</span>
        </div>
      </div>

      <div class="grid grid-cols-10 gap-1">
        <div
          v-for="(cell, index) in enemyBoard"
          :key="'enemy-' + index"
          class="w-10 h-10 flex items-center justify-center border border-white cursor-pointer"
          :class="{
            'bg-blue-600': cell === null,
            'bg-red-600': cell === 'hit',
            'bg-gray-600': cell === 'miss',
          }"
          @click="fire(index, 'enemy')"
        >
          <span v-if="cell === 'hit'">🔥</span>
          <span v-else-if="cell === 'miss'">❌</span>
        </div>
      </div>
    </div>

    <p class="mt-4 text-center">{{ message }}</p>
  </div>
</template>

<script src="./script/game.js" />

