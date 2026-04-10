import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  GameStatus,
  type RaceResult,
  type RoundResult,
  type RoundSchedule,
} from '@/modules/Race/types/race.types'
import { RaceEngine } from '@/modules/Race/services/RaceEngine'
import { TOTAL_ROUNDS } from '@/modules/Race/utils/raceConfig'
import { useHorseStore } from '@/modules/Horse/stores/horseStore'

const engine = new RaceEngine()

export const useRaceStore = defineStore('race', () => {
  /* === State === */
  const schedule = ref<RoundSchedule[]>([])
  const results = ref<RoundResult[]>([])
  const currentRoundIndex = ref(0)
  const gameState = ref<GameStatus>(GameStatus.IDLE)
  const autoPlay = ref(false)

  /* === Getters === */
  const currentRound = computed(() => schedule.value[currentRoundIndex.value])

  const currentRoundConfig = computed(() => currentRound.value?.config)

  const isLastRound = computed(() => currentRoundIndex.value === TOTAL_ROUNDS - 1)

  const completedResults = computed(() => results.value)

  /* === Actions === */
  function generateProgram(): void {
    const horseStore = useHorseStore()

    schedule.value = engine.generateSchedule(horseStore.horses)
    results.value = []
    currentRoundIndex.value = 0
    gameState.value = GameStatus.READY
  }

  function startRace(): void {
    gameState.value = GameStatus.RACING
  }

  function pauseRace(): void {
    gameState.value = GameStatus.PAUSED
  }

  function resumeRace(): void {
    gameState.value = GameStatus.RACING
  }

  function completeRound(roundResults: RaceResult[]): void {
    results.value.push({
      roundNumber: currentRoundIndex.value + 1,
      results: roundResults,
    })

    if (isLastRound.value) {
      gameState.value = GameStatus.FINISHED
    } else {
      currentRoundIndex.value++
      gameState.value = GameStatus.ROUND_FINISHED
    }
  }

  function toggleRace(): void {
    if (gameState.value === GameStatus.READY || gameState.value === GameStatus.ROUND_FINISHED) {
      startRace()
    } else if (gameState.value === GameStatus.RACING) {
      pauseRace()
    } else if (gameState.value === GameStatus.PAUSED) {
      resumeRace()
    }
  }

  function reset(): void {
    schedule.value = []
    results.value = []
    currentRoundIndex.value = 0
    gameState.value = GameStatus.IDLE
  }

  return {
    schedule,
    results,
    currentRoundIndex,
    gameState,
    autoPlay,
    currentRound,
    currentRoundConfig,
    isLastRound,
    completedResults,
    generateProgram,
    startRace,
    pauseRace,
    resumeRace,
    toggleRace,
    completeRound,
    reset,
  }
})
