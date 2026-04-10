import { describe, it, expect } from 'vitest'
import { RaceEngine } from '@/modules/Race/services/RaceEngine'
import { generateHorses } from '@/modules/Horse/utils/horseGenerator'
import { HORSES_PER_ROUND, ROUND_DISTANCES, TOTAL_ROUNDS } from '@/modules/Race/utils/raceConfig'

describe('RaceEngine', () => {
  const engine = new RaceEngine()
  const horses = generateHorses()

  describe('selectRandomHorses', () => {
    it('returns the correct number of horses', () => {
      const selected = engine.selectRandomHorses(horses, 10)
      expect(selected).toHaveLength(10)
    })

    it('returns no duplicate horses', () => {
      const selected = engine.selectRandomHorses(horses, 10)
      const ids = selected.map((h) => h.id)
      expect(new Set(ids).size).toBe(10)
    })

    it('only returns horses from the original pool', () => {
      const selected = engine.selectRandomHorses(horses, 10)
      const allIds = new Set(horses.map((h) => h.id))
      selected.forEach((horse) => {
        expect(allIds.has(horse.id)).toBe(true)
      })
    })

    it('throws when requesting more horses than available', () => {
      expect(() => engine.selectRandomHorses(horses, 21)).toThrow(
        'Cannot select 21 horses from a pool of 20',
      )
    })

    it('returns all horses when count equals pool size', () => {
      const selected = engine.selectRandomHorses(horses, 20)
      expect(selected).toHaveLength(20)
    })

    it('produces varied selections across calls (randomness)', () => {
      const first = engine.selectRandomHorses(horses, 10).map((h) => h.id)
      const second = engine.selectRandomHorses(horses, 10).map((h) => h.id)
      const allMatch = first.every((id, i) => id === second[i])
      expect(allMatch).toBe(false)
    })
  })

  describe('generateSchedule', () => {
    const schedule = engine.generateSchedule(horses)

    it('creates exactly 6 rounds', () => {
      expect(schedule).toHaveLength(TOTAL_ROUNDS)
    })

    it('assigns correct round numbers sequentially', () => {
      schedule.forEach((round, index) => {
        expect(round.config.roundNumber).toBe(index + 1)
      })
    })

    it('assigns correct distances matching ROUND_DISTANCES', () => {
      schedule.forEach((round, index) => {
        expect(round.config.distance).toBe(ROUND_DISTANCES[index])
      })
    })

    it('has 10 horses per round', () => {
      schedule.forEach((round) => {
        expect(round.entries).toHaveLength(HORSES_PER_ROUND)
      })
    })

    it('assigns lanes 1 through 10 in each round', () => {
      schedule.forEach((round) => {
        const lanes = round.entries.map((e) => e.lane)
        expect(lanes).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      })
    })

    it('has no duplicate horses within a single round', () => {
      schedule.forEach((round) => {
        const ids = round.entries.map((e) => e.horse.id)
        expect(new Set(ids).size).toBe(HORSES_PER_ROUND)
      })
    })
  })
})
