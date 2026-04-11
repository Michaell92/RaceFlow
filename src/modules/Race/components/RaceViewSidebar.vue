<template>
  <aside
    class="race-sidebar"
    :class="{ 'race-sidebar--open': isOpen }"
    aria-label="Program and results"
  >
    <RaceProgram :schedule="schedule" :current-round-index="currentRoundIndex" />
    <RaceResults :results="results" />
  </aside>

  <!-- Backdrop (small screens only) -->
  <Transition name="fade">
    <div v-if="isOpen" class="race-sidebar__backdrop" @click="isOpen = false" />
  </Transition>

  <!-- Floating toggle (small screens only) -->
  <q-btn
    class="race-sidebar__toggle"
    round
    color="primary"
    :icon="isOpen ? 'chevron_right' : 'format_list_numbered'"
    :aria-label="isOpen ? 'Close sidebar' : 'Open program and results'"
    @click="isOpen = !isOpen"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { RoundSchedule, RoundResult } from '@/modules/Race/types/race.types'
import RaceProgram from '@/modules/Race/components/RaceProgram.vue'
import RaceResults from '@/modules/Race/components/RaceResults.vue'

defineProps<{
  schedule: RoundSchedule[]
  currentRoundIndex: number
  results: RoundResult[]
}>()

const isOpen = ref(false)
</script>

<style scoped lang="scss">
.race-sidebar {
  width: 22rem;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: auto;

  @media (max-width: 78rem) {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 20rem;
    padding: 1rem;
    background: #f5f5f5;
    box-shadow: -0.125rem 0 0.5rem rgba(0, 0, 0, 0.15);
    z-index: 2000;
    overflow-y: auto;
    transform: translateX(100%);
    transition: transform 0.25s ease;

    &--open {
      transform: translateX(0);
    }
  }

  &__backdrop {
    display: none;

    @media (max-width: 78rem) {
      display: block;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 1999;
    }
  }

  &__toggle {
    display: none;

    @media (max-width: 78rem) {
      display: flex;
      position: fixed;
      right: 1rem;
      bottom: 1rem;
      z-index: 2001;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
