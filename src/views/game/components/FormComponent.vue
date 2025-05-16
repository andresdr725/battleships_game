<template>
  <section
    v-if="!gameReady"
    class="w-fit py-4 px-2 text-white rounded-md flex gap-2"
  >
    <input
      v-model="playerName"
      type="text"
      placeholder="Nombre"
      class="px-4 py-2 rounded-md border border-white focus:outline-none focus:ring-0"
    />
    <input
      v-model="gameCode"
      type="text"
      placeholder="Código de Juego"
      class="px-4 py-2 rounded-md border border-white focus:outline-none focus:ring-0"
      :disabled="joined"
    />
  </section>
  <section class="flex gap-4 justify-center font-extrabold">
    <button
      class="bg-green-600 px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition duration-300 ease-in-out cursor-pointer"
      @click="createGame"
      :disabled="joined || !playerName"
    >
      Crear partida
    </button>
    <button
      class="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition duration-300 ease-in-out cursor-pointer"
    >
      Unirse
    </button>
  </section>
</template>
