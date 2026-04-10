import { describe, it, expect } from 'vitest'
import { generateHorses } from '@/modules/Horse/utils/horseGenerator'

describe('generateHorses', () => {
  it('generates exactly 20 horses', () => {
    const horses = generateHorses()
    expect(horses).toHaveLength(20)
  })

  it('assigns sequential ids starting from 1', () => {
    const horses = generateHorses()
    horses.forEach((horse, index) => {
      expect(horse.id).toBe(index + 1)
    })
  })

  it('has all unique names', () => {
    const horses = generateHorses()
    const names = horses.map((h) => h.name)
    expect(new Set(names).size).toBe(20)
  })

  it('has all unique colors', () => {
    const horses = generateHorses()
    const colors = horses.map((h) => h.color)
    expect(new Set(colors).size).toBe(20)
  })

  it('assigns conditions between 1 and 100', () => {
    const horses = generateHorses()
    horses.forEach((horse) => {
      expect(horse.condition).toBeGreaterThanOrEqual(1)
      expect(horse.condition).toBeLessThanOrEqual(100)
      expect(Number.isInteger(horse.condition)).toBe(true)
    })
  })

  it('generates different conditions across calls (randomness)', () => {
    const first = generateHorses().map((h) => h.condition)
    const second = generateHorses().map((h) => h.condition)
    // Extremely unlikely that all 20 conditions match across two calls
    const allMatch = first.every((c, i) => c === second[i])
    expect(allMatch).toBe(false)
  })
})
