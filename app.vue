<template>
  <VitePwaManifest />
  <div class="bg-black fixed w-[calc(100%+1px)] h-full">
    <NuxtPage />
    <MainContainer />
  </div>
</template>

<script setup>
import "@/assets/css/main.css";
</script>
