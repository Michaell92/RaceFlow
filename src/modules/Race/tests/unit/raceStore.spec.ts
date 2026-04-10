import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRaceStore } from '@/modules/Race/stores/raceStore'
import { useHorseStore } from '@/modules/Horse/stores/horseStore'
import { GameStatus } from '@/modules/Race/types/race.types'
import type { RaceResult } from '@/modules/Race/types/race.types'
import { HORSES_PER_ROUND, ROUND_DISTANCES, TOTAL_ROUNDS } from '@/modules/Race/utils/raceConfig'

function createMockResults(count: number): RaceResult[] {
  return Array.from({ length: count }, (_, i) => ({
    position: i + 1,
    horse: { id: i + 1, name: `Horse ${i + 1}`, color: '#000', condition: 50 },
    finishTimeMs: 10000 + i * 500,
  }))
}

describe('raceStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts in IDLE state with empty data', () => {
    const raceStore = useRaceStore()
    expect(raceStore.gameState).toBe(GameStatus.IDLE)
    expect(raceStore.schedule).toHaveLength(0)
    expect(raceStore.results).toHaveLength(0)
    expect(raceStore.currentRoundIndex).toBe(0)
  })

  describe('generateProgram', () => {
    it('transitions from IDLE to READY', () => {
      const horseStore = useHorseStore()
      horseStore.generateHorses()
      const raceStore = useRaceStore()
      raceStore.generateProgram()
      expect(raceStore.gameState).toBe(GameStatus.READY)
    })

    it('creates 6 rounds with correct distances', () => {
      const horseStore = useHorseStore()
      horseStore.generateHorses()
      const raceStore = useRaceStore()
      raceStore.generateProgram()

      expect(raceStore.schedule).toHaveLength(TOTAL_ROUNDS)
      raceStore.schedule.forEach((round, i) => {
        expect(round.config.distance).toBe(ROUND_DISTANCES[i])
        expect(round.config.roundNumber).toBe(i + 1)
      })
    })

    it('assigns 10 horses per round', () => {
      const horseStore = useHorseStore()
      horseStore.generateHorses()
      const raceStore = useRaceStore()
      raceStore.generateProgram()

      raceStore.schedule.forEach((round) => {
        expect(round.entries).toHaveLength(HORSES_PER_ROUND)
      })
    })

    it('resets results and currentRoundIndex on re-generate', () => {
      const horseStore = useHorseStore()
      horseStore.generateHorses()
      const raceStore = useRaceStore()
      raceStore.generateProgram()
      raceStore.startRace()
      raceStore.completeRound(createMockResults(HORSES_PER_ROUND))

      raceStore.generateProgram()
      expect(raceStore.results).toHaveLength(0)
      expect(raceStore.currentRoundIndex).toBe(0)
      expect(raceStore.gameState).toBe(GameStatus.READY)
    })
  })

  describe('state transitions', () => {
    it('READY → RACING on startRace', () => {
      const horseStore = useHorseStore()
      horseStore.generateHorses()
      const raceStore = useRaceStore()
      raceStore.generateProgram()
      raceStore.startRace()
      expect(raceStore.gameState).toBe(GameStatus.RACING)
    })

    it('RACING → PAUSED on pauseRace', () => {
      const horseStore = useHorseStore()
      horseStore.generateHorses()
      const raceStore = useRaceStore()
      raceStore.generateProgram()
      raceStore.startRace()
      raceStore.pauseRace()
      expect(raceStore.gameState).toBe(GameStatus.PAUSED)
    })

    it('PAUSED → RACING on resumeRace', () => {
      const horseStore = useHorseStore()
      horseStore.generateHorses()
      const raceStore = useRaceStore()
      raceStore.generateProgram()
      raceStore.startRace()
      raceStore.pauseRace()
      raceStore.resumeRace()
      expect(raceStore.gameState).toBe(GameStatus.RACING)
    })
  })

  describe('completeRound', () => {
    it('stores results and transitions to ROUND_FINISHED', () => {
      const horseStore = useHorseStore()
      horseStore.generateHorses()
      const raceStore = useRaceStore()
      raceStore.generateProgram()
      raceStore.startRace()

      const mockResults = createMockResults(HORSES_PER_ROUND)
      raceStore.completeRound(mockResults)

      expect(raceStore.results).toHaveLength(1)
      expect(raceStore.results[0]?.roundNumber).toBe(1)
      expect(raceStore.results[0]?.results).toEqual(mockResults)
      expect(raceStore.gameState).toBe(GameStatus.ROUND_FINISHED)
    })

    it('advances currentRoundIndex after completing a round', () => {
      const horseStore = useHorseStore()
      horseStore.generateHorses()
      const raceStore = useRaceStore()
      raceStore.generateProgram()
      raceStore.startRace()
      raceStore.completeRound(createMockResults(HORSES_PER_ROUND))
      expect(raceStore.currentRoundIndex).toBe(1)
    })

    it('transitions to FINISHED after the last round', () => {
      const horseStore = useHorseStore()
      horseStore.generateHorses()
      const raceStore = useRaceStore()
      raceStore.generateProgram()

      for (let i = 0; i < TOTAL_ROUNDS; i++) {
        raceStore.startRace()
        raceStore.completeRound(createMockResults(HORSES_PER_ROUND))
      }

      expect(raceStore.gameState).toBe(GameStatus.FINISHED)
      expect(raceStore.results).toHaveLength(TOTAL_ROUNDS)
    })
  })

  describe('getters', () => {
    it('currentRound returns the current round schedule', () => {
      const horseStore = useHorseStore()
      horseStore.generateHorses()
      const raceStore = useRaceStore()
      raceStore.generateProgram()

      expect(raceStore.currentRound).toBe(raceStore.schedule[0])
    })

    it('currentRoundConfig returns the config of the current round', () => {
      const horseStore = useHorseStore()
      horseStore.generateHorses()
      const raceStore = useRaceStore()
      raceStore.generateProgram()

      expect(raceStore.currentRoundConfig).toEqual(raceStore.schedule[0]?.config)
    })

    it('isLastRound is false at the start', () => {
      const horseStore = useHorseStore()
      horseStore.generateHorses()
      const raceStore = useRaceStore()
      raceStore.generateProgram()
      expect(raceStore.isLastRound).toBe(false)
    })

    it('isLastRound is true on the final round', () => {
      const horseStore = useHorseStore()
      horseStore.generateHorses()
      const raceStore = useRaceStore()
      raceStore.generateProgram()

      for (let i = 0; i < TOTAL_ROUNDS - 1; i++) {
        raceStore.startRace()
        raceStore.completeRound(createMockResults(HORSES_PER_ROUND))
      }

      expect(raceStore.isLastRound).toBe(true)
    })

    it('completedResults reflects all stored results', () => {
      const horseStore = useHorseStore()
      horseStore.generateHorses()
      const raceStore = useRaceStore()
      raceStore.generateProgram()
      raceStore.startRace()
      raceStore.completeRound(createMockResults(HORSES_PER_ROUND))

      expect(raceStore.completedResults).toHaveLength(1)
    })
  })

  describe('reset', () => {
    it('resets everything back to IDLE', () => {
      const horseStore = useHorseStore()
      horseStore.generateHorses()
      const raceStore = useRaceStore()
      raceStore.generateProgram()
      raceStore.startRace()
      raceStore.completeRound(createMockResults(HORSES_PER_ROUND))

      raceStore.reset()
      expect(raceStore.gameState).toBe(GameStatus.IDLE)
      expect(raceStore.schedule).toHaveLength(0)
      expect(raceStore.results).toHaveLength(0)
      expect(raceStore.currentRoundIndex).toBe(0)
    })
  })
})
