<template>
  <section class="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
    <h1 class="text-4xl font-bold mb-4 text-center leading-7">
      Battleships <br />game
    </h1>
    <FormComponent />
  </section>
</template>

<script setup lang="ts">
import FormComponent from "@/views/game/components/FormComponent.vue";
</script>
