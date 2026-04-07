import type { Horse } from '@/modules/Horse/types/horse.types'
import type { RoundSchedule } from '@/modules/Race/types/race.types'
import { HORSES_PER_ROUND, ROUND_DISTANCES, TOTAL_ROUNDS } from '@/modules/Race/utils/raceConfig'

/**
 * Service class encapsulating race orchestration logic.
 *
 * Responsible for selecting horses for each round and
 * generating the full race schedule (6 rounds).
 */
export class RaceEngine {
  /**
   * Picks `count` unique random horses from the provided array
   * using the Fisher-Yates shuffle on a shallow copy.
   */
  selectRandomHorses(horses: Horse[], count: number): Horse[] {
    if (count > horses.length) {
      throw new Error(`Cannot select ${count} horses from a pool of ${horses.length}`)
    }

    const shuffled = [...horses]

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return shuffled.slice(0, count)
  }

  /**
   * Creates a full race schedule: one round per configured distance,
   * each with `HORSES_PER_ROUND` randomly selected horses assigned to lanes.
   */
  generateSchedule(horses: Horse[]): RoundSchedule[] {
    return ROUND_DISTANCES.slice(0, TOTAL_ROUNDS).map((distance, index) => {
      const selectedHorses = this.selectRandomHorses(horses, HORSES_PER_ROUND)

      return {
        config: {
          roundNumber: index + 1,
          distance,
        },
        entries: selectedHorses.map((horse, lane) => ({
          horse,
          lane: lane + 1,
        })),
      }
    })
  }
}
