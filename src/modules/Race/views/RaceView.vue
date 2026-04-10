<template>
  <div class="race-view">
    <div class="race-view__left">
      <HorseListTable :horses="horseStore.horses" />
    </div>
    <div class="race-view__center">
      <RaceTrack
        :entries="currentEntries"
        :horse-positions="horsePositions"
        :frame-cursor="frameCursor"
        :is-running="isRunning"
        :round-label="roundLabel"
        :distance="currentDistance"
      />
    </div>
    <div class="race-view__right">
      <RaceProgram
        :schedule="raceStore.schedule"
        :current-round-index="raceStore.currentRoundIndex"
      />
      <RaceResults :results="raceStore.results" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useHorseStore } from '@/modules/Horse/stores/horseStore'
import { useRaceStore } from '@/modules/Race/stores/raceStore'
import { useRaceAnimation } from '@/modules/Race/composables/useRaceAnimation'
import { GameStatus } from '@/modules/Race/types/race.types'
import type { RaceResult } from '@/modules/Race/types/race.types'
import HorseListTable from '@/modules/Horse/components/HorseListTable.vue'
import RaceTrack from '@/modules/Race/components/RaceTrack.vue'
import RaceProgram from '@/modules/Race/components/RaceProgram.vue'
import RaceResults from '@/modules/Race/components/RaceResults.vue'

/* === Stores === */
const horseStore = useHorseStore()
const raceStore = useRaceStore()

// Generate horses on first load
if (horseStore.horses.length === 0) {
  horseStore.generateHorses()
}

/* === Derived === */
const currentEntries = computed(() => raceStore.currentRound?.entries ?? [])
const currentDistance = computed(() => raceStore.currentRoundConfig?.distance ?? 1200)
const roundLabel = computed(() => {
  const config = raceStore.currentRoundConfig
  if (!config) return ''
  return `Round ${config.roundNumber} — ${config.distance}m`
})

/* === Animation === */
const { horsePositions, frameCursor, isRunning, start, pause, resume, stop } = useRaceAnimation(
  currentEntries,
  currentDistance,
  handleRoundComplete,
)

/* === Sync animation with store state === */
watch(
  () => raceStore.gameState,
  (status, oldStatus) => {
    if (status === GameStatus.RACING && oldStatus === GameStatus.PAUSED) {
      resume()
    } else if (status === GameStatus.RACING) {
      start()
    } else if (status === GameStatus.PAUSED) {
      pause()
    } else if (status === GameStatus.READY) {
      stop()
    }

    if (!raceStore.autoPlay) return
    if (status === GameStatus.READY || status === GameStatus.ROUND_FINISHED) {
      raceStore.startRace()
    }
  },
)

function handleRoundComplete(raceResults: RaceResult[]) {
  raceStore.completeRound(raceResults)
}
</script>

<style scoped lang="scss">
.race-view {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  flex: 1;
  min-height: 0;
  box-sizing: border-box;

  &__left {
    width: 20rem;
    flex-shrink: 0;
    overflow: auto;
  }

  &__center {
    flex: 1;
    min-width: 0;
  }

  &__right {
    width: 22rem;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
  }

  // Tablet: track on top full-width, horse list + program/results split bottom
  @media (max-width: 64rem) {
    flex-wrap: wrap;

    &__center {
      order: -1;
      flex: 1 1 100%;
      min-height: 20rem;
    }

    &__left {
      width: 0;
      flex: 1 1 40%;
    }

    &__right {
      width: 0;
      flex: 1 1 55%;
    }
  }

  // Mobile: track full-width top, horse list + program/results in 2-col bottom
  @media (max-width: 37.5rem) {
    flex-wrap: wrap;
    padding: 0.5rem;
    gap: 0.5rem;

    &__center {
      order: -1;
      flex: 1 1 100%;
      min-height: 16rem;
    }

    &__left {
      width: 0;
      flex: 1 1 45%;
      max-height: 20rem;
    }

    &__right {
      width: 0;
      flex: 1 1 50%;
      max-height: 20rem;
    }
  }
}
</style>
