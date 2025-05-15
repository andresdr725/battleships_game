<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white"
  >
    <h1 class="text-3xl font-bold mb-4">Battleships - Prueba de Concepto</h1>

    <!-- Formulario de jugador -->
    <div v-if="!gameReady" class="mb-6 space-y-4">
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
          class="bg-green-600 px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          @click="createGame"
          :disabled="joined || !playerName"
        >
          Crear partida
        </button>
        <button
          class="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          @click="joinGame"
          :disabled="joined || !playerName || !gameCode"
        >
          Unirse
        </button>
      </div>

      <div v-if="generatedCode" class="text-center mt-2">
        Código generado:
        <span class="font-mono text-yellow-400">{{ generatedCode }}</span>
      </div>
    </div>

    <!-- Colocación de barcos -->
    <div v-if="gameReady && !shipsPlaced" class="mb-6">
      <h2 class="text-xl mb-4">Coloca tus barcos</h2>
      <div class="grid grid-cols-10 gap-1">
        <div
          v-for="(cell, index) in playerBoard"
          :key="'player-' + index"
          class="w-10 h-10 flex items-center justify-center border border-white cursor-pointer"
          :class="{
            'bg-blue-600': cell === null,
            'bg-green-600': cell === 'ship',
          }"
          @click="placeShip(index)"
        >
          <span v-if="cell === 'ship'">🚢</span>
        </div>
      </div>
      <button
        class="mt-4 bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
        @click="confirmShips"
        :disabled="shipCount < 17"
      >
        Confirmar barcos ({{ shipCount }}/17)
      </button>
    </div>

    <!-- Tableros del juego -->
    <transition name="fade">
      <div v-if="gameReady && shipsPlaced" class="flex gap-8">
        <div>
          <h2 class="text-xl mb-2">Tu tablero</h2>
          <div class="grid grid-cols-10 gap-1">
            <div
              v-for="(cell, index) in playerBoard"
              :key="'player-' + index"
              class="w-10 h-10 flex items-center justify-center border border-white"
              :class="{
                'bg-blue-600': cell === null,
                'bg-green-600': cell === 'ship',
                'bg-red-600': cell === 'hit',
                'bg-gray-600': cell === 'miss',
              }"
            >
              <span v-if="cell === 'ship'">🚢</span>
              <span v-if="cell === 'hit'">🔥</span>
              <span v-else-if="cell === 'miss'">❌</span>
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-xl mb-2">Tablero enemigo</h2>
          <div class="grid grid-cols-10 gap-1">
            <div
              v-for="(cell, index) in enemyBoard"
              :key="'enemy-' + index"
              class="w-10 h-10 flex items-center justify-center border border-white"
              :class="{
                'bg-blue-600': cell === null,
                'bg-red-600': cell === 'hit',
                'bg-gray-600': cell === 'miss',
                'cursor-pointer': isMyTurn && cell === null,
                'cursor-not-allowed': !isMyTurn || cell !== null,
              }"
              @click="fire(index)"
            >
              <span v-if="cell === 'hit'">🔥</span>
              <span v-else-if="cell === 'miss'">❌</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <p class="mt-4 text-center">{{ message }}</p>
    <button
      v-if="joined"
      class="mt- Workspace
      4 bg-red-600 px-4 py-2 rounded hover:bg-red-700"
      @click="leaveGame"
    >
      Salir de la partida
    </button>
  </div>
</template>

<script>
import { ref } from "vue";
import { useGameSocket } from "./useGameSocket";

export default {
  name: "Game",
  setup() {
    const playerName = ref("");
    const gameCode = ref("");
    const generatedCode = ref("");
    const joined = ref(false);
    const gameReady = ref(false);
    const shipsPlaced = ref(false);
    const shipCount = ref(0);
    const isMyTurn = ref(false);
    const message = ref("Ingresa tu nombre y código para comenzar");
    const playerBoard = ref(Array(100).fill(null));
    const enemyBoard = ref(Array(100).fill(null));

    const {
      createGame,
      joinGame,
      placeShip,
      confirmShips,
      fire,
      leaveGame,
    } = useGameSocket({
      playerName,
      gameCode,
      generatedCode,
      joined,
      gameReady,
      shipsPlaced,
      shipCount,
      isMyTurn,
      message,
      playerBoard,
      enemyBoard,
    });

    return {
      playerName,
      gameCode,
      generatedCode,
      joined,
      gameReady,
      shipsPlaced,
      shipCount,
      isMyTurn,
      message,
      playerBoard,
      enemyBoard,
      createGame,
      joinGame,
      placeShip,
      confirmShips,
      fire,
      leaveGame,
    };
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>