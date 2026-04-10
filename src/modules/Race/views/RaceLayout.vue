<template>
  <div class="race-layout">
    <AppToolbar
      :game-status="raceStore.gameState"
      v-model:auto-play="raceStore.autoPlay"
      @generate="raceStore.generateProgram()"
      @toggle-race="raceStore.toggleRace()"
    />
    <main class="race-layout__main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppToolbar from '@/shared/components/AppToolbar.vue'
import { useRaceStore } from '@/modules/Race/stores/raceStore'

const raceStore = useRaceStore()
</script>

<style scoped lang="scss">
.race-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;

  &__main {
    flex: 1;
    min-height: 0;
    display: flex;
  }
}
</style>
